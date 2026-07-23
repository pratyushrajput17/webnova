import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";
import { parseCode } from "@/lib/codes";
import type { ReactElement } from "react";

function getSubscriptionEndsAt(plan: string, durationDays: number): Date | null {
  if (plan === "FREE") return null;
  const d = new Date();
  if (plan === "LIFETIME") {
    d.setFullYear(d.getFullYear() + 5);
    return d;
  }
  d.setDate(d.getDate() + durationDays);
  return d;
}

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    let body: { code?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const rawCode = body.code?.trim().toUpperCase();
    if (!rawCode) {
      return NextResponse.json(
        { error: "Please enter a redeem code." },
        { status: 400 }
      );
    }

    const parsed = parseCode(rawCode);
    if (!parsed.plan) {
      return NextResponse.json(
        { error: "Invalid code format." },
        { status: 400 }
      );
    }

    const redeemCode = await prisma.redeemCode.findUnique({
      where: { code: rawCode },
    });

    if (!redeemCode) {
      return NextResponse.json(
        { error: "Invalid code. Please check and try again." },
        { status: 404 }
      );
    }

    if (redeemCode.isUsed) {
      return NextResponse.json(
        { error: "This code has already been redeemed." },
        { status: 409 }
      );
    }

    if (redeemCode.expiresAt && new Date() > redeemCode.expiresAt) {
      return NextResponse.json(
        { error: "This code has expired." },
        { status: 410 }
      );
    }

    let user;
    try {
      user = await getOrCreateUser(clerkUserId);
    } catch (err) {
      console.error(`[REDEEM] Failed to verify user for clerkId=${clerkUserId}:`, err);
      return NextResponse.json(
        {
          error: "Failed to verify user account. Please try again.",
          code: "USER_VERIFY_FAILED",
          details: err instanceof Error ? err.message : String(err),
        },
        { status: 500 }
      );
    }

    const subscriptionEndsAt = getSubscriptionEndsAt(redeemCode.plan, redeemCode.duration);

    await prisma.$transaction([
      prisma.redeemCode.update({
        where: { id: redeemCode.id },
        data: {
          isUsed: true,
          usedByUserId: user.id,
          usedAt: new Date(),
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: {
          plan: redeemCode.plan,
          monthlyAuditCount: 0,
          lastResetDate: new Date(),
          competitorCount: 0,
          competitorLastReset: new Date(),
          subscriptionEndsAt,
        },
      }),
      prisma.userSubscription.create({
        data: {
          userId: user.id,
          plan: redeemCode.plan,
          status: "active",
          startsAt: new Date(),
          endsAt: subscriptionEndsAt,
          isLifetime: redeemCode.plan === "LIFETIME",
        },
      }),
      prisma.redeemHistory.create({
        data: {
          userId: user.id,
          code: rawCode,
          plan: redeemCode.plan,
          usedAt: new Date(),
          expiresAt: subscriptionEndsAt,
          codeId: redeemCode.id,
        },
      }),
    ]);

    import("@/lib/notifications").then(({ createNotification }) => {
      createNotification(
        user.id,
        "Plan Upgraded",
        `You're now on the ${redeemCode.plan} plan!`,
        "plan_upgraded",
        "/dashboard/billing"
      );
    }).catch((err) => {
      console.error(`[REDEEM] Notification creation failed for userId=${user.id}:`, err);
    });

    if (user.email && !user.email.endsWith("@placeholder.com")) {
      (async () => {
        try {
          const [mod, Email] = await Promise.all([
            import("@/lib/email"),
            import("@/emails/PlanUpgradeEmail"),
          ]);
          await mod.sendEmail({
            to: user.email,
            subject: `You're now on ${redeemCode.plan}!`,
            react: (
              <Email.default
                name={user.name ?? ""}
                plan={redeemCode.plan}
                duration={redeemCode.duration}
                subscriptionEndsAt={subscriptionEndsAt?.toISOString() ?? ""}
              />
            ) as ReactElement,
          });
        } catch (err) {
          console.error(`[REDEEM] Upgrade email failed for ${user.email}:`, err);
        }
      })();
    }

    return NextResponse.json({
      success: true,
      plan: redeemCode.plan,
      duration: redeemCode.duration,
      subscriptionEndsAt,
    });
  } catch (error) {
    console.error("Redeem error:", error);
    return NextResponse.json(
      { error: "Failed to redeem code. Please try again." },
      { status: 500 }
    );
  }
}
