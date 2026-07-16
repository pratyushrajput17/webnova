import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";

function normalizeJsonField(val: unknown) {
  if (val === null || val === undefined) return [];
  if (Array.isArray(val)) return val;
  try {
    const parsed = typeof val === "string" ? JSON.parse(val) : val;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;

    let user;
    try {
      user = await getOrCreateUser(clerkUserId);
    } catch {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const audit = await prisma.audit.findUnique({ where: { id } });

    if (!audit) {
      return NextResponse.json(
        { error: "Audit not found." },
        { status: 404 }
      );
    }

    if (audit.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const result = {
      ...audit,
      h1Tags: normalizeJsonField(audit.h1Tags),
      h2Tags: normalizeJsonField(audit.h2Tags),
      h3Tags: normalizeJsonField(audit.h3Tags),
      imagesData: normalizeJsonField(audit.imagesData),
      missingAltImages: normalizeJsonField(audit.missingAltImages),
      internalLinksData: normalizeJsonField(audit.internalLinksData),
      externalLinksData: normalizeJsonField(audit.externalLinksData),
      aiRecommendations: normalizeJsonField(audit.aiRecommendations),
    };

    const checks = [
      { metric: "h1Count", count: result.h1Count, actual: result.h1Tags?.length ?? 0 },
      { metric: "imageCount", count: result.imageCount, actual: result.imagesData?.length ?? 0 },
      { metric: "missingAltCount", count: result.missingAltCount, actual: result.missingAltImages?.length ?? 0 },
      { metric: "internalLinks", count: result.internalLinks, actual: result.internalLinksData?.length ?? 0 },
      { metric: "externalLinks", count: result.externalLinks, actual: result.externalLinksData?.length ?? 0 },
    ];

    const mismatches = checks.filter((c) => {
      const hasDetailData = c.actual > 0;
      return hasDetailData && c.count !== c.actual;
    });

    if (mismatches.length > 0) {
      console.warn("[AUDIT INTEGRITY] Retrieval mismatches for", id, ":", mismatches);
    } else if (checks.some((c) => c.actual > 0)) {
      console.log("[AUDIT INTEGRITY] All counts match for", id);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Audit fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;

    let user;
    try {
      user = await getOrCreateUser(clerkUserId);
    } catch {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const audit = await prisma.audit.findUnique({ where: { id } });

    if (!audit) {
      return NextResponse.json(
        { error: "Audit not found." },
        { status: 404 }
      );
    }

    if (audit.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    await prisma.audit.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Audit delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete audit." },
      { status: 500 }
    );
  }
}
