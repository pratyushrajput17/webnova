import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

const VALID_PLANS = ["FREE", "STARTER", "PRO", "LIFETIME", "ENTERPRISE"];

function getSubscriptionEndsAt(plan: string): Date | null {
  if (plan === "FREE") return null;
  const now = new Date();
  if (plan === "LIFETIME") {
    const d = new Date(now);
    d.setFullYear(d.getFullYear() + 5);
    return d;
  }
  const d = new Date(now);
  d.setFullYear(d.getFullYear() + 1);
  return d;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;

    let body: { plan?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const plan = body.plan?.toUpperCase();
    if (!plan || !VALID_PLANS.includes(plan)) {
      return NextResponse.json(
        {
          error:
            "Invalid plan. Must be FREE, STARTER, PRO, LIFETIME, or ENTERPRISE.",
        },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        plan,
        subscriptionEndsAt: getSubscriptionEndsAt(plan),
        monthlyAuditCount: 0,
        lastResetDate: new Date(),
        competitorCount: 0,
        competitorLastReset: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        subscriptionEndsAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error("Update user plan error:", error);
    return NextResponse.json(
      { error: "Failed to update user plan." },
      { status: 500 }
    );
  }
}
