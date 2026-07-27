import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";

function normalizeDomain(url: string): string {
  try {
    let hostname = url.trim().toLowerCase();
    if (!/^https?:\/\//i.test(hostname)) hostname = "https://" + hostname;
    const parsed = new URL(hostname);
    hostname = parsed.hostname;
    hostname = hostname.replace(/^www\./, "");
    hostname = hostname.replace(/\/+$/, "");
    return hostname;
  } catch {
    return url.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/+$/, "").split("/")[0];
  }
}

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
      domain: string;
      audits: typeof audits;
      latestScore: number;
      previousScore: number | null;
      scoreChange: number | null;
    }>();

    for (const audit of audits) {
      const domain = normalizeDomain(audit.websiteUrl);
      const existing = websiteMap.get(domain);
      if (existing) {
        existing.audits.push(audit);
      } else {
        websiteMap.set(domain, {
          domain,
          audits: [audit],
          latestScore: audit.seoScore,
          previousScore: null,
          scoreChange: null,
        });
      }
    }

    for (const [, group] of websiteMap) {
      const sorted = group.audits;
      if (sorted.length >= 2) {
        group.previousScore = sorted[1].seoScore;
        group.scoreChange = sorted[0].seoScore - sorted[1].seoScore;
      }
    }

    const websites = Array.from(websiteMap.values())
      .map((g) => ({
        domain: g.domain,
        latestAuditId: g.audits[0].id,
        latestScore: g.latestScore,
        previousScore: g.previousScore,
        scoreChange: g.scoreChange,
        totalAudits: g.audits.length,
        lastAuditedAt: g.audits[0].createdAt,
        latestPerformanceScore: g.audits[0].performanceScore,
        latestAccessibilityScore: g.audits[0].accessibilityScore,
      }))
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
