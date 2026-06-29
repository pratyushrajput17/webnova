import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error, user } = await requireAdmin();
  if (error || !user) return error;

  try {
    const [totalUsers, totalAudits, totalRedeemed, usersByPlan] =
      await Promise.all([
        prisma.user.count(),
        prisma.audit.count(),
        prisma.redeemCode.count({ where: { isUsed: true } }),
        prisma.user.groupBy({
          by: ["plan"],
          _count: true,
        }),
      ]);

    const activeSubscriptions = usersByPlan
      .filter((g) => g.plan !== "FREE")
      .reduce((sum, g) => sum + g._count, 0);

    return NextResponse.json({
      totalUsers,
      totalAudits,
      totalRedeemed,
      activeSubscriptions,
      totalRevenue: activeSubscriptions * 29,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats." },
      { status: 500 }
    );
  }
}
