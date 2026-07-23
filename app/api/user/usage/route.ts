import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";
import {
  checkAuditQuota,
  checkCompetitorQuota,
  needsReset,
  getAuditResetDays,
} from "@/lib/quota";

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    let user;
    try {
      user = await getOrCreateUser(clerkUserId);
    } catch (err) {
      console.error(`[USAGE] Failed to verify user for clerkId=${clerkUserId}:`, err);
      return NextResponse.json(
        {
          error: "Failed to verify user account. Please try again.",
          code: "USER_VERIFY_FAILED",
          details: err instanceof Error ? err.message : String(err),
        },
        { status: 500 }
      );
    }

    let auditCount = user.monthlyAuditCount;
    let auditReset = user.lastResetDate;
    const auditResetDays = getAuditResetDays(user.plan);

    if (needsReset(auditReset, auditResetDays)) {
      auditCount = 0;
      auditReset = new Date();
      await prisma.user.update({
        where: { id: user.id },
        data: { monthlyAuditCount: 0, lastResetDate: auditReset },
      });
    }

    let compCount = user.competitorCount;
    let compReset = user.competitorLastReset;

    if (needsReset(compReset, 30)) {
      compCount = 0;
      compReset = new Date();
      await prisma.user.update({
        where: { id: user.id },
        data: { competitorCount: 0, competitorLastReset: compReset },
      });
    }

    const auditQuota = checkAuditQuota(user.plan, auditCount);
    const compQuota = checkCompetitorQuota(user.plan, compCount);

    return NextResponse.json({
      plan: user.plan,
      audit: {
        used: auditQuota.used,
        limit: auditQuota.limit,
        remaining: auditQuota.remaining,
        isUnlimited: auditQuota.isUnlimited,
        withinQuota: auditQuota.withinQuota,
      },
      competitor: {
        used: compQuota.used,
        limit: compQuota.limit,
        remaining: compQuota.remaining,
        isUnlimited: compQuota.isUnlimited,
        withinQuota: compQuota.withinQuota,
      },
    });
  } catch (error) {
    console.error("Usage fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage." },
      { status: 500 }
    );
  }
}
