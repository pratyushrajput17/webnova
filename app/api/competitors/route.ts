import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";
import { logUsage } from "@/lib/usage";
import { validateUrl, normalizeUrl, analyzeWebsite } from "@/lib/audit";
import { checkCompetitorQuota, needsReset } from "@/lib/quota";

interface ComparisonMetric {
  label: string;
  key: string;
  yourValue: number | string;
  competitorValue: number | string;
  yourWins: boolean;
  competitorWins: boolean;
  higherIsBetter: boolean;
}

function generateSummary(
  your: ComparisonMetric[],
  competitor: ComparisonMetric[],
  yourSite: string,
  competitorSite: string
): string {
  const yourWins = your.filter((m) => m.yourWins).length;
  const compWins = competitor.filter((m) => m.competitorWins).length;

  const parts: string[] = [];

  if (yourWins > compWins) {
    parts.push(
      `${yourSite} outperforms ${competitorSite} in ${yourWins} of ${your.length} categories.`
    );
  } else if (compWins > yourWins) {
    parts.push(
      `${competitorSite} leads in ${compWins} of ${your.length} categories compared to ${yourSite}.`
    );
  } else {
    parts.push(
      `Both sites are evenly matched with ${yourWins} categories each.`
    );
  }

  const weakAreas = your.filter((m) => m.competitorWins && m.label !== "SEO Score");
  if (weakAreas.length > 0) {
    const topWeakness = weakAreas[0];
    parts.push(
      `Focus on improving "${topWeakness.label}" to close the gap with your competitor.`
    );
  }

  const strongAreas = your.filter((m) => m.yourWins);
  if (strongAreas.length > 0) {
    parts.push(
      `Your strengths in "${strongAreas.map((m) => m.label).slice(0, 2).join('" and "')}" give you a competitive advantage.`
    );
  }

  return parts.join(" ");
}

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    let body: { yourSite?: string; competitorSite?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    if (!body.yourSite || !body.competitorSite) {
      return NextResponse.json(
        { error: "Both your website and competitor website URLs are required." },
        { status: 400 }
      );
    }

    const yourValidation = validateUrl(body.yourSite);
    if (yourValidation) {
      return NextResponse.json(
        { error: `Your site: ${yourValidation}` },
        { status: 400 }
      );
    }

    const compValidation = validateUrl(body.competitorSite);
    if (compValidation) {
      return NextResponse.json(
        { error: `Competitor site: ${compValidation}` },
        { status: 400 }
      );
    }

    const yourUrl = normalizeUrl(body.yourSite);
    const compUrl = normalizeUrl(body.competitorSite);

    let user;
    try {
      user = await getOrCreateUser(clerkUserId);
    } catch (err) {
      console.error(`[COMPETITORS] Failed to verify user for clerkId=${clerkUserId}:`, err);
      return NextResponse.json(
        {
          error: "Failed to verify user account. Please try again.",
          code: "USER_VERIFY_FAILED",
          details: err instanceof Error ? err.message : String(err),
        },
        { status: 500 }
      );
    }

    let compCount = user.competitorCount;
    let compReset = user.competitorLastReset;

    if (needsReset(compReset, 30)) {
      compCount = 0;
      compReset = new Date();
      await prisma.user.update({
        where: { id: user.id },
        data: { competitorCount: 0, competitorLastReset: compReset },
      });
    }

    const compQuota = checkCompetitorQuota(user.plan, compCount);
    if (!compQuota.withinQuota) {
      return NextResponse.json(
        {
          error: "You have reached your monthly competitor analysis limit.",
          code: "COMPETITOR_QUOTA_EXCEEDED",
          limit: compQuota.limit,
          used: compQuota.used,
          plan: user.plan,
        },
        { status: 403 }
      );
    }

    let yourResult;
    let compResult;

    try {
      yourResult = await analyzeWebsite(yourUrl);
    } catch (error) {
      return NextResponse.json(
        {
          error:
            `Failed to analyze your site: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
        },
        { status: 502 }
      );
    }

    try {
      compResult = await analyzeWebsite(compUrl);
    } catch (error) {
      return NextResponse.json(
        {
          error:
            `Failed to analyze competitor site: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
        },
        { status: 502 }
      );
    }

    const metrics: ComparisonMetric[] = [
      {
        label: "SEO Score",
        key: "seoScore",
        yourValue: yourResult.seoScore,
        competitorValue: compResult.seoScore,
        yourWins: yourResult.seoScore > compResult.seoScore,
        competitorWins: compResult.seoScore > yourResult.seoScore,
        higherIsBetter: true,
      },
      {
        label: "H1 Count",
        key: "h1Count",
        yourValue: yourResult.h1Count,
        competitorValue: compResult.h1Count,
        yourWins:
          yourResult.h1Count >= 1 &&
          yourResult.h1Count <= compResult.h1Count,
        competitorWins:
          compResult.h1Count >= 1 &&
          compResult.h1Count < yourResult.h1Count,
        higherIsBetter: false,
      },
      {
        label: "Total Images",
        key: "imageCount",
        yourValue: yourResult.imageCount,
        competitorValue: compResult.imageCount,
        yourWins: yourResult.imageCount < compResult.imageCount,
        competitorWins: compResult.imageCount < yourResult.imageCount,
        higherIsBetter: false,
      },
      {
        label: "Missing Alt Tags",
        key: "missingAltCount",
        yourValue: yourResult.missingAltCount,
        competitorValue: compResult.missingAltCount,
        yourWins:
          yourResult.missingAltCount < compResult.missingAltCount,
        competitorWins:
          compResult.missingAltCount < yourResult.missingAltCount,
        higherIsBetter: false,
      },
      {
        label: "Internal Links",
        key: "internalLinks",
        yourValue: yourResult.internalLinks,
        competitorValue: compResult.internalLinks,
        yourWins: yourResult.internalLinks > compResult.internalLinks,
        competitorWins:
          compResult.internalLinks > yourResult.internalLinks,
        higherIsBetter: true,
      },
      {
        label: "External Links",
        key: "externalLinks",
        yourValue: yourResult.externalLinks,
        competitorValue: compResult.externalLinks,
        yourWins: yourResult.externalLinks < compResult.externalLinks,
        competitorWins:
          compResult.externalLinks < yourResult.externalLinks,
        higherIsBetter: false,
      },
    ];

    const summary = generateSummary(
      metrics,
      metrics,
      yourResult.pageTitle || yourUrl,
      compResult.pageTitle || compUrl
    );

    const comparisonData = {
      yourData: yourResult,
      competitorData: compResult,
      metrics,
      summary,
    };

    await prisma.competitorComparison.create({
      data: {
        userId: user.id,
        yourSite: yourUrl,
        competitorSite: compUrl,
        yourData: yourResult as unknown as Prisma.InputJsonValue,
        competitorData: compResult as unknown as Prisma.InputJsonValue,
        comparison: metrics as unknown as Prisma.InputJsonValue,
        summary,
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { competitorCount: { increment: 1 } },
    });

    logUsage(user.id, "competitor_analysis", yourUrl).catch(() => {});

    return NextResponse.json(comparisonData);
  } catch (error) {
    console.error("Competitor analysis error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    let user;
    try {
      user = await getOrCreateUser(clerkUserId);
    } catch (err) {
      console.error(`[COMPETITORS] Failed to verify user for clerkId=${clerkUserId}:`, err);
      return NextResponse.json(
        {
          error: "Failed to verify user account. Please try again.",
          code: "USER_VERIFY_FAILED",
          details: err instanceof Error ? err.message : String(err),
        },
        { status: 500 }
      );
    }

    const comparisons = await prisma.competitorComparison.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ comparisons });
  } catch (error) {
    console.error("Competitor history error:", error);
    return NextResponse.json(
      { error: "Failed to fetch comparisons." },
      { status: 500 }
    );
  }
}
