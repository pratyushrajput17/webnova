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
      imagesData: normalizeJsonField(audit.imagesData),
      missingAltImages: normalizeJsonField(audit.missingAltImages),
      internalLinksData: normalizeJsonField(audit.internalLinksData),
      externalLinksData: normalizeJsonField(audit.externalLinksData),
      aiRecommendations: normalizeJsonField(audit.aiRecommendations),
    };

    console.log("[AUDIT GET] ID:", id);
    console.log("[AUDIT GET] Raw DB h1Tags:", JSON.stringify(audit.h1Tags));
    console.log("[AUDIT GET] Raw DB internalLinksData type:", typeof audit.internalLinksData, "isArray:", Array.isArray(audit.internalLinksData));
    console.log("[AUDIT GET] internalLinks count:", result.internalLinks, "internalLinksData length:", result.internalLinksData?.length ?? 0);
    console.log("[AUDIT GET] h1Count:", result.h1Count, "h1Tags length:", result.h1Tags?.length ?? 0);
    console.log("[AUDIT GET] externalLinks count:", result.externalLinks, "externalLinksData length:", result.externalLinksData?.length ?? 0);

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
