import { NextRequest, NextResponse } from "next/server";
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

interface AuditData {
  id: string;
  websiteUrl: string;
  seoScore: number;
  performanceScore: number;
  accessibilityScore: number;
  h1Count: number;
  h1Tags: unknown;
  h2Tags: unknown;
  h3Tags: unknown;
  imageCount: number;
  missingAltCount: number;
  internalLinks: number;
  externalLinks: number;
  titleLength: number;
  metaDescriptionLength: number;
  canonicalUrl: string | null;
  pageTitle: string;
  metaDescription: string | null;
  aiRecommendations: unknown;
  imagesData: unknown;
  missingAltImages: unknown;
  internalLinksData: unknown;
  externalLinksData: unknown;
  createdAt: Date;
}

interface ComparisonResult {
  seoScore: { current: number; previous: number; change: number };
  performanceScore: { current: number; previous: number; change: number };
  accessibilityScore: { current: number; previous: number; change: number };
  h1Count: { current: number; previous: number; change: number };
  imageCount: { current: number; previous: number; change: number };
  missingAltCount: { current: number; previous: number; change: number };
  internalLinks: { current: number; previous: number; change: number };
  externalLinks: { current: number; previous: number; change: number };
  titleLength: { current: number; previous: number; change: number };
  metaDescriptionLength: { current: number; previous: number; change: number };
  fixedIssues: string[];
  newIssues: string[];
  persistentIssues: string[];
}

function compareAudits(current: AuditData, previous: AuditData): ComparisonResult {
  const metric = (key: keyof AuditData) => {
    const c = Number(current[key]) || 0;
    const p = Number(previous[key]) || 0;
    return { current: c, previous: p, change: c - p };
  };

  const fixedIssues: string[] = [];
  const newIssues: string[] = [];
  const persistentIssues: string[] = [];

  if (!previous.pageTitle && current.pageTitle) {
    fixedIssues.push("Meta title added");
  } else if (previous.pageTitle && !current.pageTitle) {
    newIssues.push("Meta title is missing");
  } else if (previous.pageTitle && current.pageTitle && previous.pageTitle !== current.pageTitle) {
    fixedIssues.push("Meta title updated");
  }

  if (!previous.metaDescription && current.metaDescription) {
    fixedIssues.push("Meta description added");
  } else if (previous.metaDescription && !current.metaDescription) {
    newIssues.push("Meta description missing");
  } else if (previous.metaDescription && current.metaDescription && previous.metaDescription !== current.metaDescription) {
    fixedIssues.push("Meta description updated");
  }

  if (previous.h1Count === 0 && current.h1Count > 0) {
    fixedIssues.push("H1 heading added");
  } else if (previous.h1Count > 0 && current.h1Count === 0) {
    newIssues.push("H1 heading is missing");
  } else if (previous.h1Count > 1 && current.h1Count <= 1) {
    fixedIssues.push("Multiple H1 tags resolved (now single H1)");
  } else if (previous.h1Count <= 1 && current.h1Count > 1) {
    newIssues.push(`${current.h1Count} H1 tags found (should be 1)`);
  }

  if (previous.missingAltCount > 0 && current.missingAltCount === 0) {
    fixedIssues.push(`All ${previous.missingAltCount} missing alt attributes fixed`);
  } else if (previous.missingAltCount > current.missingAltCount) {
    const diff = previous.missingAltCount - current.missingAltCount;
    fixedIssues.push(`${diff} missing alt attribute${diff > 1 ? "s" : ""} fixed`);
  } else if (current.missingAltCount > previous.missingAltCount) {
    const diff = current.missingAltCount - previous.missingAltCount;
    newIssues.push(`${diff} new image${diff > 1 ? "s" : ""} without alt text`);
  }

  if (previous.externalLinks > current.externalLinks) {
    const diff = previous.externalLinks - current.externalLinks;
    fixedIssues.push(`${diff} external link${diff > 1 ? "s" : ""} removed/resolved`);
  } else if (current.externalLinks > previous.externalLinks) {
    const diff = current.externalLinks - previous.externalLinks;
    newIssues.push(`${diff} new external link${diff > 1 ? "s" : ""} added`);
  }

  if (current.seoScore > previous.seoScore) {
    fixedIssues.push(`SEO score improved from ${previous.seoScore} to ${current.seoScore}`);
  } else if (current.seoScore < previous.seoScore) {
    newIssues.push(`SEO score decreased from ${previous.seoScore} to ${current.seoScore}`);
  }

  if (current.performanceScore > previous.performanceScore) {
    fixedIssues.push(`Performance score improved from ${previous.performanceScore} to ${current.performanceScore}`);
  } else if (current.performanceScore < previous.performanceScore) {
    newIssues.push(`Performance score decreased from ${previous.performanceScore} to ${current.performanceScore}`);
  }

  if (current.accessibilityScore > previous.accessibilityScore) {
    fixedIssues.push(`Accessibility score improved from ${previous.accessibilityScore} to ${current.accessibilityScore}`);
  } else if (current.accessibilityScore < previous.accessibilityScore) {
    newIssues.push(`Accessibility score decreased from ${previous.accessibilityScore} to ${current.accessibilityScore}`);
  }

  if (previous.canonicalUrl && !current.canonicalUrl) {
    newIssues.push("Canonical URL was removed");
  } else if (!previous.canonicalUrl && current.canonicalUrl) {
    fixedIssues.push("Canonical URL added");
  }

  if (current.missingAltCount > 0 && previous.missingAltCount > 0 && current.missingAltCount === previous.missingAltCount) {
    persistentIssues.push(`${current.missingAltCount} images still missing alt text`);
  } else if (current.missingAltCount > 0 && previous.missingAltCount > 0 && current.missingAltCount !== previous.missingAltCount) {
    persistentIssues.push(`${current.missingAltCount} images missing alt text`);
  }

  if (current.h1Count === 0) {
    persistentIssues.push("No H1 heading present");
  }

  if (!current.pageTitle) {
    persistentIssues.push("Missing page title");
  }

  if (!current.metaDescription) {
    persistentIssues.push("Missing meta description");
  }

  if (!current.canonicalUrl) {
    persistentIssues.push("Missing canonical URL");
  }

  return {
    seoScore: metric("seoScore"),
    performanceScore: metric("performanceScore"),
    accessibilityScore: metric("accessibilityScore"),
    h1Count: metric("h1Count"),
    imageCount: metric("imageCount"),
    missingAltCount: metric("missingAltCount"),
    internalLinks: metric("internalLinks"),
    externalLinks: metric("externalLinks"),
    titleLength: metric("titleLength"),
    metaDescriptionLength: metric("metaDescriptionLength"),
    fixedIssues,
    newIssues,
    persistentIssues,
  };
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
      },
    });

    const websiteAudits = allAudits.filter(
      (a) => normalizeDomain(a.websiteUrl) === decodedDomain
    );

    if (websiteAudits.length === 0) {
      return NextResponse.json({ error: "No audits found for this website." }, { status: 404 });
    }

    const scoreHistory = websiteAudits
      .map((a) => ({
        date: a.createdAt.toISOString(),
        seoScore: a.seoScore,
        performanceScore: a.performanceScore,
        accessibilityScore: a.accessibilityScore,
        id: a.id,
      }))
      .reverse();

    let comparison: ComparisonResult | null = null;
    if (websiteAudits.length >= 2) {
      comparison = compareAudits(websiteAudits[0] as AuditData, websiteAudits[1] as AuditData);
    }

    const timeline = websiteAudits.map((a, idx) => {
      const prev = idx < websiteAudits.length - 1 ? websiteAudits[idx + 1] : null;
      return {
        id: a.id,
        seoScore: a.seoScore,
        performanceScore: a.performanceScore,
        accessibilityScore: a.accessibilityScore,
        createdAt: a.createdAt.toISOString(),
        websiteUrl: a.websiteUrl,
        scoreChange: prev ? a.seoScore - prev.seoScore : null,
      };
    });

    return NextResponse.json({
      domain: decodedDomain,
      totalAudits: websiteAudits.length,
      firstAuditAt: websiteAudits[websiteAudits.length - 1].createdAt.toISOString(),
      lastAuditAt: websiteAudits[0].createdAt.toISOString(),
      scoreHistory,
      comparison,
      timeline,
    });
  } catch (error) {
    console.error("[WEBSITE HISTORY] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch website history." },
      { status: 500 }
    );
  }
}
