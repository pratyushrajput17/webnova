import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";
import { parseCode, seedTestCodes } from "@/lib/codes";
import type { ReactElement } from "react";

async function ensureTestCodes() {
  const existing = await prisma.redeemCode.findFirst({
    where: { code: { in: ["WEB-ST-TEST1234", "WEB-PRO-TEST1234", "WEB-LIFE-TEST1234"] } },
  });
  if (existing) return;

  const testCodes = seedTestCodes().map((c) => ({
    code: c.code,
    plan: c.plan,
    duration: c.duration,
  }));

  await prisma.redeemCode.createMany({ data: testCodes });
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

    await ensureTestCodes();

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
    } catch {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const subscriptionEndsAt = new Date();
    subscriptionEndsAt.setDate(
      subscriptionEndsAt.getDate() + redeemCode.duration
    );

    const redeemedCodes: string[] = [
      ...((user.redeemedCodes as string[]) ?? []),
      rawCode,
    ];

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
          subscriptionEndsAt,
          redeemedCodes,
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
    }).catch(() => {});

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
                subscriptionEndsAt={subscriptionEndsAt.toISOString()}
              />
            ) as ReactElement,
          });
        } catch {}
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
