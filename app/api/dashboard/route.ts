import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const user = await getOrCreateUser(clerkUserId);

    const [audits, competitorCount] = await Promise.all([
      prisma.audit.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 200,
        select: {
          id: true,
          websiteUrl: true,
          seoScore: true,
          missingAltCount: true,
          createdAt: true,
        },
      }),
      prisma.competitorComparison.count({ where: { userId: user.id } }),
    ]);

    const totalAudits = audits.length;
    const averageSeoScore = totalAudits > 0
      ? Math.round(audits.reduce((sum, a) => sum + a.seoScore, 0) / totalAudits)
      : 0;
    const competitorsTracked = competitorCount;
    const issuesFound = audits.reduce((sum, a) => sum + a.missingAltCount, 0);

    const monthMap = new Map<string, { total: number; count: number }>();
    for (const audit of audits) {
      const d = new Date(audit.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const existing = monthMap.get(key) ?? { total: 0, count: 0 };
      existing.total += audit.seoScore;
      existing.count += 1;
      monthMap.set(key, existing);
    }

    const chartData = Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => {
        const monthIdx = parseInt(key.split("-")[1], 10);
        return {
          month: MONTH_NAMES[monthIdx],
          score: Math.round(value.total / value.count),
        };
      });

    const recentActivity = audits.slice(0, 10).map((a) => {
      const diffMs = Date.now() - new Date(a.createdAt).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffHours / 24);
      let time: string;
      if (diffMins < 1) time = "Just now";
      else if (diffMins < 60) time = `${diffMins}m ago`;
      else if (diffHours < 24) time = `${diffHours}h ago`;
      else if (diffDays === 1) time = "Yesterday";
      else if (diffDays < 7) time = `${diffDays} days ago`;
      else time = new Date(a.createdAt).toLocaleDateString();
      return { text: `Audit completed for ${a.websiteUrl}`, time };
    });

    const upcomingTasks: { text: string; completed: boolean }[] = [];
    if (totalAudits === 0) {
      upcomingTasks.push({ text: "Run your first website audit", completed: false });
    }
    if (competitorCount === 0) {
      upcomingTasks.push({ text: "Analyze a competitor", completed: false });
    }
    if (totalAudits > 0 && audits.some((a) => a.seoScore < 80)) {
      upcomingTasks.push({ text: "Fix SEO warnings", completed: false });
    }
    if (upcomingTasks.length === 0) {
      upcomingTasks.push({ text: "Everything looks great!", completed: true });
    }

    const recentAudits = audits.slice(0, 5).map((a) => ({
      id: a.id,
      websiteUrl: a.websiteUrl,
      seoScore: a.seoScore,
      createdAt: a.createdAt.toISOString(),
    }));

    return NextResponse.json({
      totalAudits,
      averageSeoScore,
      competitorsTracked,
      reportsGenerated: totalAudits,
      issuesFound,
      chartData,
      recentAudits,
      recentActivity,
      upcomingTasks,
    });
  } catch (error) {
    console.error("Dashboard fetch error:", error);
    return NextResponse.json(
      {
        totalAudits: 0,
        averageSeoScore: 0,
        competitorsTracked: 0,
        issuesFound: 0,
        chartData: [],
        recentAudits: [],
        recentActivity: [],
        upcomingTasks: [{ text: "Everything looks great!", completed: true }],
      },
      { status: 200 }
    );
  }
}
