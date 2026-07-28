import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";
import { normalizeDomain, getWebsiteHealth } from "@/lib/website-health";

interface IssueItem {
  type: string;
  severity: "critical" | "warning" | "info";
  summary: string;
  resource?: string;
  fixSuggestion?: string | null;
  fixStatus?: string;
}

function extractIssues(audit: {
  pageTitle: string;
  titleLength: number;
  metaDescription: string | null;
  metaDescriptionLength: number;
  h1Count: number;
  h1Tags: unknown;
  missingAltCount: number;
  missingAltImages: unknown;
  canonicalUrl: string | null;
  seoScore: number;
}): IssueItem[] {
  const issues: IssueItem[] = [];

  if (!audit.pageTitle) {
    issues.push({ type: "MISSING_TITLE", severity: "critical", summary: "Missing page title tag" });
  } else if (audit.titleLength < 30) {
    issues.push({ type: "TITLE_TOO_SHORT", severity: "warning", summary: `Title too short (${audit.titleLength} chars)` });
  } else if (audit.titleLength > 60) {
    issues.push({ type: "TITLE_TOO_LONG", severity: "warning", summary: `Title too long (${audit.titleLength} chars)` });
  }

  if (!audit.metaDescription) {
    issues.push({ type: "MISSING_META_DESC", severity: "critical", summary: "Missing meta description" });
  } else if (audit.metaDescriptionLength < 50) {
    issues.push({ type: "META_DESC_TOO_SHORT", severity: "warning", summary: `Meta description too short (${audit.metaDescriptionLength} chars)` });
  } else if (audit.metaDescriptionLength > 160) {
    issues.push({ type: "META_DESC_TOO_LONG", severity: "warning", summary: `Meta description too long (${audit.metaDescriptionLength} chars)` });
  }

  if (audit.h1Count === 0) {
    issues.push({ type: "MISSING_H1", severity: "critical", summary: "No H1 heading found" });
  } else if (audit.h1Count > 1) {
    issues.push({ type: "MULTIPLE_H1", severity: "warning", summary: `${audit.h1Count} H1 tags found (should be 1)` });
  }

  if (audit.missingAltCount > 0) {
    const severity = audit.missingAltCount > 5 ? "critical" as const : "warning" as const;
    issues.push({ type: "MISSING_ALT", severity, summary: `${audit.missingAltCount} images missing alt text` });
  }

  if (audit.seoScore < 50) {
    issues.push({ type: "LOW_SCORE", severity: "critical", summary: `SEO score is critically low (${audit.seoScore})` });
  } else if (audit.seoScore < 70) {
    issues.push({ type: "LOW_SCORE", severity: "warning", summary: `SEO score needs improvement (${audit.seoScore})` });
  }

  return issues;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ domain: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const user = await getOrCreateUser(clerkUserId);
    const { domain } = await params;
    const decodedDomain = decodeURIComponent(domain);

    const allAudits = await prisma.audit.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        websiteUrl: true,
        seoScore: true,
        performanceScore: true,
        accessibilityScore: true,
        h1Count: true,
        h1Tags: true,
        h2Tags: true,
        h3Tags: true,
        imageCount: true,
        missingAltCount: true,
        internalLinks: true,
        externalLinks: true,
        titleLength: true,
        metaDescriptionLength: true,
        canonicalUrl: true,
        pageTitle: true,
        metaDescription: true,
        aiRecommendations: true,
        imagesData: true,
        missingAltImages: true,
        internalLinksData: true,
        externalLinksData: true,
        createdAt: true,
        auditType: true,
      },
    });

    const websiteAudits = allAudits.filter(
      (a) => normalizeDomain(a.websiteUrl) === decodedDomain
    );

    if (websiteAudits.length === 0) {
      return NextResponse.json({ error: "No audits found for this website." }, { status: 404 });
    }

    const latest = websiteAudits[0];
    const previous = websiteAudits[1] ?? null;

    const scoreHistory = websiteAudits
      .map((a) => ({
        date: a.createdAt.toISOString(),
        seoScore: a.seoScore,
        performanceScore: a.performanceScore,
        accessibilityScore: a.accessibilityScore,
        id: a.id,
      }))
      .reverse();

    const comparison = previous
      ? {
          seoScore: { current: latest.seoScore, previous: previous.seoScore, change: latest.seoScore - previous.seoScore },
          performanceScore: { current: latest.performanceScore, previous: previous.performanceScore, change: latest.performanceScore - previous.performanceScore },
          accessibilityScore: { current: latest.accessibilityScore, previous: previous.accessibilityScore, change: latest.accessibilityScore - previous.accessibilityScore },
        }
      : null;

    const issues = extractIssues(latest);

    const [schedules, fixIssues, alerts] = await Promise.all([
      prisma.scheduledAudit.findMany({
        where: { userId: user.id },
        select: { websiteUrl: true, status: true, frequency: true, nextRunAt: true, lastRunAt: true, lastRunStatus: true, id: true },
      }),
      prisma.sEOIssueFix.findMany({
        where: { userId: user.id, url: { contains: decodedDomain } },
        select: { id: true, issueType: true, issueKey: true, summary: true, suggestion: true, codeSnippet: true, status: true },
      }),
      prisma.sEOAlert.findMany({
        where: { userId: user.id, websiteUrl: { contains: decodedDomain } },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, severity: true, changeType: true, summary: true, createdAt: true, readAt: true },
      }),
    ]);

    const schedule = schedules.find((s) => normalizeDomain(s.websiteUrl) === decodedDomain) ?? null;

    const fixStatusCounts = {
      open: fixIssues.filter((f) => f.status === "OPEN").length,
      addressed: fixIssues.filter((f) => f.status === "ADDRESSED" || f.status === "VERIFIED_FIXED").length,
      total: fixIssues.length,
    };

    const openIssuesCount = fixStatusCounts.open + issues.filter((i) => i.severity === "critical" || i.severity === "warning").length;

    const health = getWebsiteHealth(latest.seoScore, openIssuesCount, alerts.filter((a) => a.severity === "CRITICAL").length);

    const timeline = websiteAudits.map((a, idx) => {
      const prevAudit = idx < websiteAudits.length - 1 ? websiteAudits[idx + 1] : null;
      return {
        id: a.id,
        seoScore: a.seoScore,
        performanceScore: a.performanceScore,
        accessibilityScore: a.accessibilityScore,
        createdAt: a.createdAt.toISOString(),
        websiteUrl: a.websiteUrl,
        scoreChange: prevAudit ? a.seoScore - prevAudit.seoScore : null,
      };
    });

    return NextResponse.json({
      domain: decodedDomain,
      totalAudits: websiteAudits.length,
      firstAuditAt: websiteAudits[websiteAudits.length - 1].createdAt.toISOString(),
      lastAuditAt: websiteAudits[0].createdAt.toISOString(),
      latestAuditId: latest.id,
      latestScores: {
        seo: latest.seoScore,
        performance: latest.performanceScore,
        accessibility: latest.accessibilityScore,
        previousSeo: previous?.seoScore ?? null,
        scoreChange: previous ? latest.seoScore - previous.seoScore : null,
        previousPerformance: previous?.performanceScore ?? null,
        previousAccessibility: previous?.accessibilityScore ?? null,
      },
      health,
      scoreHistory,
      comparison,
      issues,
      fixIssues: {
        items: fixIssues,
        counts: fixStatusCounts,
      },
      alerts: alerts.map((a) => ({
        ...a,
        createdAt: a.createdAt.toISOString(),
        readAt: a.readAt?.toISOString() ?? null,
      })),
      monitoring: schedule
        ? {
            id: schedule.id,
            status: schedule.status,
            frequency: schedule.frequency,
            nextRunAt: schedule.nextRunAt,
            lastRunAt: schedule.lastRunAt,
            lastRunStatus: schedule.lastRunStatus,
          }
        : null,
      timeline,
    });
  } catch (error) {
    console.error("[WEBSITE OVERVIEW] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch website overview." },
      { status: 500 }
    );
  }
}
