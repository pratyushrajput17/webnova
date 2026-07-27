import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";

function normalizeJsonField(val: unknown): unknown[] {
  if (val === null || val === undefined) return [];
  if (Array.isArray(val)) return val;
  try {
    const parsed = typeof val === "string" ? JSON.parse(val) : val;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const user = await getOrCreateUser(clerkUserId);
    const { searchParams } = new URL(request.url);
    const auditAId = searchParams.get("auditA");
    const auditBId = searchParams.get("auditB");

    if (!auditAId || !auditBId) {
      return NextResponse.json(
        { error: "Both auditA and auditB query parameters are required." },
        { status: 400 }
      );
    }

    if (auditAId === auditBId) {
      return NextResponse.json(
        { error: "Cannot compare an audit with itself." },
        { status: 400 }
      );
    }

    const [auditARaw, auditBRaw] = await Promise.all([
      prisma.audit.findUnique({ where: { id: auditAId } }),
      prisma.audit.findUnique({ where: { id: auditBId } }),
    ]);

    if (!auditARaw || !auditBRaw) {
      return NextResponse.json(
        { error: "One or both audits not found." },
        { status: 404 }
      );
    }

    if (auditARaw.userId !== user.id || auditBRaw.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const auditA = {
      ...auditARaw,
      h1Tags: normalizeJsonField(auditARaw.h1Tags) as string[],
      h2Tags: normalizeJsonField(auditARaw.h2Tags) as string[],
      h3Tags: normalizeJsonField(auditARaw.h3Tags) as string[],
      imagesData: normalizeJsonField(auditARaw.imagesData),
      missingAltImages: normalizeJsonField(auditARaw.missingAltImages),
      internalLinksData: normalizeJsonField(auditARaw.internalLinksData),
      externalLinksData: normalizeJsonField(auditARaw.externalLinksData),
      aiRecommendations: normalizeJsonField(auditARaw.aiRecommendations) as string[],
    };

    const auditB = {
      ...auditBRaw,
      h1Tags: normalizeJsonField(auditBRaw.h1Tags) as string[],
      h2Tags: normalizeJsonField(auditBRaw.h2Tags) as string[],
      h3Tags: normalizeJsonField(auditBRaw.h3Tags) as string[],
      imagesData: normalizeJsonField(auditBRaw.imagesData),
      missingAltImages: normalizeJsonField(auditBRaw.missingAltImages),
      internalLinksData: normalizeJsonField(auditBRaw.internalLinksData),
      externalLinksData: normalizeJsonField(auditBRaw.externalLinksData),
      aiRecommendations: normalizeJsonField(auditBRaw.aiRecommendations) as string[],
    };

    const older = new Date(auditA.createdAt) < new Date(auditB.createdAt) ? auditA : auditB;
    const newer = older === auditA ? auditB : auditA;

    const metric = (label: string, key: string, higherIsBetter = true) => {
      const c = Number((newer as Record<string, unknown>)[key]) || 0;
      const p = Number((older as Record<string, unknown>)[key]) || 0;
      const change = c - p;
      const improved = higherIsBetter ? change > 0 : change < 0;
      const degraded = higherIsBetter ? change < 0 : change > 0;
      return { label, current: c, previous: p, change, improved, degraded };
    };

    const fixedIssues: string[] = [];
    const newIssues: string[] = [];
    const persistentIssues: string[] = [];

    if (!older.pageTitle && newer.pageTitle) fixedIssues.push("Meta title added");
    else if (older.pageTitle && !newer.pageTitle) newIssues.push("Meta title missing");
    else if (older.pageTitle && newer.pageTitle && older.pageTitle !== newer.pageTitle) fixedIssues.push("Meta title updated");

    if (!older.metaDescription && newer.metaDescription) fixedIssues.push("Meta description added");
    else if (older.metaDescription && !newer.metaDescription) newIssues.push("Meta description missing");

    if (older.h1Count === 0 && newer.h1Count > 0) fixedIssues.push("H1 heading added");
    else if (older.h1Count > 0 && newer.h1Count === 0) newIssues.push("H1 heading missing");
    else if (older.h1Count > 1 && newer.h1Count <= 1) fixedIssues.push("Multiple H1 tags resolved");

    if (older.missingAltCount > newer.missingAltCount) {
      const diff = older.missingAltCount - newer.missingAltCount;
      fixedIssues.push(`${diff} missing alt attribute${diff > 1 ? "s" : ""} fixed`);
    } else if (newer.missingAltCount > older.missingAltCount) {
      const diff = newer.missingAltCount - older.missingAltCount;
      newIssues.push(`${diff} new image${diff > 1 ? "s" : ""} without alt text`);
    }

    if (newer.missingAltCount > 0) persistentIssues.push(`${newer.missingAltCount} images missing alt text`);
    if (newer.h1Count === 0) persistentIssues.push("No H1 heading present");
    if (!newer.pageTitle) persistentIssues.push("Missing page title");
    if (!newer.metaDescription) persistentIssues.push("Missing meta description");
    if (!newer.canonicalUrl) persistentIssues.push("Missing canonical URL");

    const metrics = [
      metric("SEO Score", "seoScore"),
      metric("Performance Score", "performanceScore"),
      metric("Accessibility Score", "accessibilityScore"),
      metric("H1 Tags", "h1Count"),
      metric("Images", "imageCount"),
      metric("Missing Alt Tags", "missingAltCount", false),
      metric("Internal Links", "internalLinks"),
      metric("External Links", "externalLinks", false),
      metric("Title Length", "titleLength"),
      metric("Meta Description Length", "metaDescriptionLength"),
    ];

    return NextResponse.json({
      older: {
        id: older.id,
        websiteUrl: older.websiteUrl,
        seoScore: older.seoScore,
        createdAt: older.createdAt.toISOString(),
      },
      newer: {
        id: newer.id,
        websiteUrl: newer.websiteUrl,
        seoScore: newer.seoScore,
        createdAt: newer.createdAt.toISOString(),
      },
      metrics,
      fixedIssues,
      newIssues,
      persistentIssues,
    });
  } catch (error) {
    console.error("[COMPARE] Error:", error);
    return NextResponse.json(
      { error: "Failed to compare audits." },
      { status: 500 }
    );
  }
}
