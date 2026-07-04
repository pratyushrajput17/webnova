import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";
import { checkQuota, needsReset, getPlanLimit } from "@/lib/quota";
import { PLANS, PLAN_DISPLAY } from "@/lib/pricing";

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const user = await getOrCreateUser(clerkUserId);

    if (needsReset(user.lastResetDate)) {
      user.monthlyAuditCount = 0;
      user.lastResetDate = new Date();
      await prisma.user.update({
        where: { id: user.id },
        data: { monthlyAuditCount: 0, lastResetDate: user.lastResetDate },
      });
    }

    const planConfig = PLANS.find((p) => p.key === user.plan);
    const planDisplay = PLAN_DISPLAY[user.plan] ?? PLAN_DISPLAY.FREE;
    const auditQuota = checkQuota(user.plan, user.monthlyAuditCount);

    const [totalAudits, competitorCount] = await Promise.all([
      prisma.audit.count({ where: { userId: user.id } }),
      prisma.competitorComparison.count({ where: { userId: user.id } }),
    ]);

    const redeemedCode =
      Array.isArray(user.redeemedCodes) && user.redeemedCodes.length > 0
        ? user.redeemedCodes[0]
        : null;

    const status =
      user.plan === "FREE"
        ? "Active"
        : user.subscriptionEndsAt && new Date(user.subscriptionEndsAt) < new Date()
          ? "Expired"
          : "Active";

    return NextResponse.json({
      plan: user.plan,
      planName: planDisplay.label,
      planPrice: planConfig ? planConfig.price : null,
      planPeriod: planConfig ? planConfig.period : null,
      status,
      subscriptionStart: user.createdAt.toISOString(),
      subscriptionEndsAt: user.subscriptionEndsAt?.toISOString() ?? null,
      isLifetime: user.plan === "LIFETIME",
      redeemedCode: redeemedCode ? String(redeemedCode) : null,
      usage: {
        auditsUsed: user.monthlyAuditCount,
        auditsLimit: auditQuota.limit,
        auditsRemaining: auditQuota.remaining,
        auditsIsUnlimited: auditQuota.isUnlimited,
        totalAudits,
        competitorsTracked: competitorCount,
        reportsGenerated: totalAudits,
      },
      paymentMethod: null,
    });
  } catch (error) {
    console.error("Billing fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch billing information." },
      { status: 500 }
    );
  }
}
