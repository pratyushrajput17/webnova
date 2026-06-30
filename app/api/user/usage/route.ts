import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";
import { checkQuota, needsReset } from "@/lib/quota";

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    let user;
    try {
      user = await getOrCreateUser(clerkUserId);
    } catch {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const { plan } = user;
    let { monthlyAuditCount, lastResetDate } = user;

    if (needsReset(lastResetDate)) {
      monthlyAuditCount = 0;
      lastResetDate = new Date();
      await prisma.user.update({
        where: { id: user.id },
        data: { monthlyAuditCount: 0, lastResetDate },
      });
    }

    const quota = checkQuota(plan, monthlyAuditCount);

    return NextResponse.json({
      plan,
      used: quota.used,
      limit: quota.limit,
      remaining: quota.remaining,
      isUnlimited: quota.isUnlimited,
      withinQuota: quota.withinQuota,
    });
  } catch (error) {
    console.error("Usage fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage." },
      { status: 500 }
    );
  }
}
