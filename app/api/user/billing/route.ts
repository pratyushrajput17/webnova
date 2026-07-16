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
import { getUserUsage } from "@/lib/usage";
import { PLANS, PLAN_DISPLAY } from "@/lib/pricing";

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const user = await getOrCreateUser(clerkUserId);

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

    const planConfig = PLANS.find((p) => p.key === user.plan);
    const planDisplay = PLAN_DISPLAY[user.plan] ?? PLAN_DISPLAY.FREE;

    const [usage, activeSubscription, redeemHistory] = await Promise.all([
      getUserUsage(user.id),
      prisma.userSubscription.findFirst({
        where: { userId: user.id, status: "active" },
        orderBy: { createdAt: "desc" },
      }),
      prisma.redeemHistory.findMany({
        where: { userId: user.id },
        orderBy: { usedAt: "desc" },
        select: {
          code: true,
          plan: true,
          usedAt: true,
          expiresAt: true,
        },
      }),
    ]);

    const status =
      user.plan === "FREE"
        ? "Active"
        : user.subscriptionEndsAt &&
            new Date(user.subscriptionEndsAt) < new Date()
          ? "Expired"
          : "Active";

    const subscriptionStart = activeSubscription
      ? activeSubscription.startsAt.toISOString()
      : user.createdAt.toISOString();

    return NextResponse.json({
      plan: user.plan,
      planName: planDisplay.label,
      planPrice: planConfig ? planConfig.price : null,
      planPeriod: planConfig ? planConfig.period : null,
      status,
      subscriptionStart,
      subscriptionEndsAt: user.subscriptionEndsAt?.toISOString() ?? null,
      isLifetime: user.plan === "LIFETIME",
      audit: {
        used: auditQuota.used,
        limit: auditQuota.limit,
        remaining: auditQuota.remaining,
        isUnlimited: auditQuota.isUnlimited,
        resetDays: auditResetDays,
      },
      competitor: {
        used: compQuota.used,
        limit: compQuota.limit,
        remaining: compQuota.remaining,
        isUnlimited: compQuota.isUnlimited,
      },
      totalAudits: usage.totalAudits,
      auditsThisMonth: usage.auditsThisMonth,
      competitorsTracked: usage.competitorAnalysesUsed,
      redeemHistory,
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