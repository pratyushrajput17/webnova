import { prisma } from "@/lib/prisma";

export type Severity = "CRITICAL" | "WARNING" | "IMPROVEMENT" | "INFORMATIONAL";

export interface SEOChange {
  severity: Severity;
  changeType: string;
  summary: string;
  metadata: Record<string, unknown>;
}

export interface DetectionResult {
  hasChanges: boolean;
  shouldEmail: boolean;
  changes: SEOChange[];
  scoreChange: number;
  previousScore: number;
  currentScore: number;
}

interface Thresholds {
  seoScoreDrop?: number;
  seoScoreGain?: number;
  performanceDrop?: number;
  accessibilityDrop?: number;
  newBrokenLinks?: number;
  brokenLinksFixed?: number;
  newMissingAlt?: number;
  missingAltFixed?: number;
}

const DEFAULT_THRESHOLDS: Thresholds = {
  seoScoreDrop: 5,
  seoScoreGain: 5,
  performanceDrop: 10,
  accessibilityDrop: 10,
  newBrokenLinks: 1,
  brokenLinksFixed: 1,
  newMissingAlt: 5,
  missingAltFixed: 5,
};

export function getDefaultThresholds(): Thresholds {
  return { ...DEFAULT_THRESHOLDS };
}

async function checkLinkHealth(urls: string[]): Promise<string[]> {
  const broken: string[] = [];
  const toCheck = urls.slice(0, 10);
  for (const url of toCheck) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(url, {
        method: "HEAD",
        signal: controller.signal,
        redirect: "follow",
      });
      clearTimeout(timeout);
      if (res.status >= 400) {
        broken.push(url);
      }
    } catch {
      broken.push(url);
    }
  }
  return broken;
}

export async function detectChanges(
  currentAuditId: string,
  previousAuditId: string | null,
  websiteUrl: string,
  thresholds: Thresholds = DEFAULT_THRESHOLDS
): Promise<DetectionResult> {
  const currentAudit = await prisma.audit.findUnique({
    where: { id: currentAuditId },
  });

  if (!currentAudit) {
    return {
      hasChanges: false,
      shouldEmail: false,
      changes: [],
      scoreChange: 0,
      previousScore: 0,
      currentScore: 0,
    };
  }

  if (!previousAuditId) {
    return {
      hasChanges: false,
      shouldEmail: false,
      changes: [],
      scoreChange: 0,
      previousScore: 0,
      currentScore: currentAudit.seoScore,
    };
  }

  const previousAudit = await prisma.audit.findUnique({
    where: { id: previousAuditId },
  });

  if (!previousAudit) {
    return {
      hasChanges: false,
      shouldEmail: false,
      changes: [],
      scoreChange: 0,
      previousScore: 0,
      currentScore: currentAudit.seoScore,
    };
  }

  const changes: SEOChange[] = [];
  let shouldEmail = false;

  const prev = previousAudit;
  const curr = currentAudit;

  const seoScoreDrop = prev.seoScore - curr.seoScore;
  const seoScoreGain = curr.seoScore - prev.seoScore;

  if (seoScoreDrop >= (thresholds.seoScoreDrop ?? DEFAULT_THRESHOLDS.seoScoreDrop!)) {
    changes.push({
      severity: "WARNING",
      changeType: "SEO_SCORE_DROP",
      summary: `SEO score dropped ${seoScoreDrop} points (${prev.seoScore} → ${curr.seoScore})`,
      metadata: { from: prev.seoScore, to: curr.seoScore, diff: seoScoreDrop },
    });
    shouldEmail = true;
  } else if (seoScoreGain >= (thresholds.seoScoreGain ?? DEFAULT_THRESHOLDS.seoScoreGain!)) {
    changes.push({
      severity: "IMPROVEMENT",
      changeType: "SEO_SCORE_GAIN",
      summary: `SEO score improved ${seoScoreGain} points (${prev.seoScore} → ${curr.seoScore})`,
      metadata: { from: prev.seoScore, to: curr.seoScore, diff: seoScoreGain },
    });
  }

  const perfDrop = prev.performanceScore - curr.performanceScore;
  if (perfDrop >= (thresholds.performanceDrop ?? DEFAULT_THRESHOLDS.performanceDrop!)) {
    changes.push({
      severity: "WARNING",
      changeType: "PERFORMANCE_DROP",
      summary: `Performance score dropped ${perfDrop} points (${prev.performanceScore} → ${curr.performanceScore})`,
      metadata: { from: prev.performanceScore, to: curr.performanceScore, diff: perfDrop },
    });
    shouldEmail = true;
  }

  const a11yDrop = prev.accessibilityScore - curr.accessibilityScore;
  if (a11yDrop >= (thresholds.accessibilityDrop ?? DEFAULT_THRESHOLDS.accessibilityDrop!)) {
    changes.push({
      severity: "WARNING",
      changeType: "ACCESSIBILITY_DROP",
      summary: `Accessibility score dropped ${a11yDrop} points (${prev.accessibilityScore} → ${curr.accessibilityScore})`,
      metadata: { from: prev.accessibilityScore, to: curr.accessibilityScore, diff: a11yDrop },
    });
    shouldEmail = true;
  }

  const newMissingAlt = curr.missingAltCount - prev.missingAltCount;
  const fixedMissingAlt = prev.missingAltCount - curr.missingAltCount;
  const altThreshold = thresholds.newMissingAlt ?? DEFAULT_THRESHOLDS.newMissingAlt!;
  const altFixedThreshold = thresholds.missingAltFixed ?? DEFAULT_THRESHOLDS.missingAltFixed!;

  if (newMissingAlt > 0 && newMissingAlt >= altThreshold) {
    const missingImages = (curr.missingAltImages as Array<{ src: string }>).slice(0, 3);
    changes.push({
      severity: newMissingAlt > 10 ? "CRITICAL" : "WARNING",
      changeType: "NEW_MISSING_ALT",
      summary: `${newMissingAlt} new images missing alt text`,
      metadata: {
        count: newMissingAlt,
        previousCount: prev.missingAltCount,
        currentCount: curr.missingAltCount,
        samples: missingImages.map((i) => i.src),
      },
    });
    shouldEmail = true;
  }

  if (fixedMissingAlt > 0 && fixedMissingAlt >= altFixedThreshold) {
    changes.push({
      severity: "IMPROVEMENT",
      changeType: "MISSING_ALT_FIXED",
      summary: `${fixedMissingAlt} missing alt tags fixed`,
      metadata: {
        count: fixedMissingAlt,
        previousCount: prev.missingAltCount,
        currentCount: curr.missingAltCount,
      },
    });
  }

  const titleProblems: string[] = [];
  const metaProblems: string[] = [];

  if (prev.pageTitle && !curr.pageTitle) {
    titleProblems.push("Title tag was removed");
  } else if (curr.pageTitle) {
    if (curr.titleLength < 30 || curr.titleLength > 60) {
      titleProblems.push(`Title length (${curr.titleLength} chars) is outside optimal range (30-60)`);
    }
  }

  if (prev.metaDescription && !curr.metaDescription) {
    metaProblems.push("Meta description was removed");
  } else if (curr.metaDescription) {
    if (curr.metaDescriptionLength < 50 || curr.metaDescriptionLength > 160) {
      metaProblems.push(`Meta description length (${curr.metaDescriptionLength} chars) is outside optimal range (50-160)`);
    }
  }

  if (titleProblems.length > 0) {
    changes.push({
      severity: "WARNING",
      changeType: "TITLE_ISSUES",
      summary: titleProblems.join("; "),
      metadata: { issues: titleProblems, previousTitle: prev.pageTitle, currentTitle: curr.pageTitle },
    });
    shouldEmail = true;
  }

  if (metaProblems.length > 0) {
    changes.push({
      severity: "WARNING",
      changeType: "META_ISSUES",
      summary: metaProblems.join("; "),
      metadata: { issues: metaProblems, previousMeta: prev.metaDescription, currentMeta: curr.metaDescription },
    });
    shouldEmail = true;
  }

  if (prev.h1Count === 1 && curr.h1Count === 0) {
    changes.push({
      severity: "CRITICAL",
      changeType: "H1_REMOVED",
      summary: "H1 heading was removed",
      metadata: { previousH1Count: prev.h1Count, currentH1Count: curr.h1Count },
    });
    shouldEmail = true;
  } else if (prev.h1Count <= 1 && curr.h1Count > 1) {
    changes.push({
      severity: "WARNING",
      changeType: "MULTIPLE_H1",
      summary: `Multiple H1 tags detected (${curr.h1Count})`,
      metadata: { previousH1Count: prev.h1Count, currentH1Count: curr.h1Count },
    });
    shouldEmail = true;
  }

  const newLinks: string[] = [];
  const currExtData = (curr.externalLinksData as Array<{ href: string; text: string }>);
  const prevExtData = (prev.externalLinksData as Array<{ href: string; text: string }>);

  const prevUrls = new Set(prevExtData.map((l) => l.href));
  for (const link of currExtData) {
    if (!prevUrls.has(link.href)) {
      newLinks.push(link.href);
    }
  }

  if (newLinks.length > 0) {
    const brokenNew = await checkLinkHealth(newLinks);
    if (brokenNew.length > 0) {
      changes.push({
        severity: brokenNew.length > 3 ? "CRITICAL" : "WARNING",
        changeType: "NEW_BROKEN_LINKS",
        summary: `${brokenNew.length} new broken link${brokenNew.length > 1 ? "s" : ""} detected`,
        metadata: { count: brokenNew.length, links: brokenNew },
      });
      shouldEmail = true;
    }
  }

  const removedLinks: string[] = [];
  const currUrls = new Set(currExtData.map((l) => l.href));
  for (const link of prevExtData) {
    if (!currUrls.has(link.href)) {
      removedLinks.push(link.href);
    }
  }

  if (removedLinks.length > 0) {
    changes.push({
      severity: "IMPROVEMENT",
      changeType: "BROKEN_LINKS_FIXED",
      summary: `${removedLinks.length} link${removedLinks.length > 1 ? "s" : ""} removed or fixed`,
      metadata: { count: removedLinks.length, links: removedLinks },
    });
  }

  const hasCritical = changes.some((c) => c.severity === "CRITICAL");
  const hasWarning = changes.some((c) => c.severity === "WARNING");

  return {
    hasChanges: changes.length > 0,
    shouldEmail: shouldEmail || hasCritical || hasWarning,
    changes,
    scoreChange: seoScoreGain - seoScoreDrop,
    previousScore: prev.seoScore,
    currentScore: curr.seoScore,
  };
}

export async function findPreviousAudit(
  userId: string,
  websiteUrl: string,
  currentAuditId: string
): Promise<string | null> {
  const prev = await prisma.audit.findFirst({
    where: {
      userId,
      websiteUrl,
      id: { not: currentAuditId },
    },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
  return prev?.id ?? null;
}
