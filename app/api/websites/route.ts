import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";
import { normalizeDomain, getWebsiteHealth } from "@/lib/website-health";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const user = await getOrCreateUser(clerkUserId);

    const audits = await prisma.audit.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        websiteUrl: true,
        seoScore: true,
        performanceScore: true,
        accessibilityScore: true,
        createdAt: true,
      },
    });

    if (audits.length === 0) {
      return NextResponse.json({ websites: [], totalAudits: 0 });
    }

    const websiteMap = new Map<string, {
      audits: typeof audits;
    }>();

    for (const audit of audits) {
      const domain = normalizeDomain(audit.websiteUrl);
      const existing = websiteMap.get(domain);
      if (existing) {
        existing.audits.push(audit);
      } else {
        websiteMap.set(domain, { audits: [audit] });
      }
    }

    const [schedules, fixCounts, alertCounts] = await Promise.all([
      prisma.scheduledAudit.findMany({
        where: { userId: user.id },
        select: { websiteUrl: true, status: true, nextRunAt: true, lastRunAt: true, frequency: true },
      }),
      prisma.sEOIssueFix.groupBy({
        by: ["url"],
        where: { userId: user.id, status: "OPEN" },
        _count: true,
      }),
      prisma.sEOAlert.groupBy({
        by: ["websiteUrl"],
        where: { userId: user.id, severity: "CRITICAL" },
        _count: true,
      }),
    ]);

    const scheduleMap = new Map<string, typeof schedules[0]>();
    for (const s of schedules) {
      const d = normalizeDomain(s.websiteUrl);
      if (!scheduleMap.has(d)) scheduleMap.set(d, s);
    }

    const fixMap = new Map<string, number>();
    for (const f of fixCounts) {
      if (f.url) {
        const d = normalizeDomain(f.url);
        fixMap.set(d, (fixMap.get(d) || 0) + f._count);
      }
    }

    const alertMap = new Map<string, number>();
    for (const a of alertCounts) {
      const d = normalizeDomain(a.websiteUrl);
      alertMap.set(d, (alertMap.get(d) || 0) + a._count);
    }

    const websites = Array.from(websiteMap.entries())
      .map(([domain, group]) => {
        const sorted = group.audits;
        const latest = sorted[0];
        const prev = sorted[1];
        const scoreChange = prev ? latest.seoScore - prev.seoScore : null;
        const schedule = scheduleMap.get(domain);
        const openIssues = fixMap.get(domain) || 0;
        const criticalAlerts = alertMap.get(domain) || 0;
        const health = getWebsiteHealth(latest.seoScore, openIssues, criticalAlerts);

        return {
          domain,
          latestAuditId: latest.id,
          latestScore: latest.seoScore,
          previousScore: prev?.seoScore ?? null,
          scoreChange,
          latestPerformanceScore: latest.performanceScore,
          latestAccessibilityScore: latest.accessibilityScore,
          totalAudits: group.audits.length,
          lastAuditedAt: latest.createdAt,
          openIssues,
          criticalAlerts,
          health,
          monitoring: schedule
            ? {
                status: schedule.status,
                frequency: schedule.frequency,
                nextRunAt: schedule.nextRunAt,
                lastRunAt: schedule.lastRunAt,
              }
            : null,
        };
      })
      .sort((a, b) => new Date(b.lastAuditedAt).getTime() - new Date(a.lastAuditedAt).getTime());

    return NextResponse.json({
      websites,
      totalAudits: audits.length,
    });
  } catch (error) {
    console.error("[WEBSITES] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch websites." },
      { status: 500 }
    );
  }
}
