import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [users, audits, usersByPlan] = await Promise.all([
      prisma.user.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.audit.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.user.groupBy({
        by: ["plan"],
        _count: true,
      }),
    ]);

    const days: string[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().slice(0, 10));
    }

    const newUsers = days.map((day) => ({
      date: day,
      count: users.filter(
        (u) => u.createdAt.toISOString().slice(0, 10) === day
      ).length,
    }));

    const auditsPerDay = days.map((day) => ({
      date: day,
      count: audits.filter(
        (a) => a.createdAt.toISOString().slice(0, 10) === day
      ).length,
    }));

    const planDistribution = usersByPlan.map((g) => ({
      name: g.plan,
      value: g._count,
    }));

    return NextResponse.json({ newUsers, auditsPerDay, planDistribution });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics." },
      { status: 500 }
    );
  }
}
