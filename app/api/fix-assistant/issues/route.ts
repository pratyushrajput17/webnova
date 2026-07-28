import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";
import { generateAllFixes } from "@/lib/fix-assistant";

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const user = await getOrCreateUser(clerkUserId);
    const { searchParams } = new URL(request.url);
    const auditId = searchParams.get("auditId");
    const websiteUrl = searchParams.get("websiteUrl");

    if (!auditId && !websiteUrl) {
      return NextResponse.json(
        { error: "Provide auditId or websiteUrl." },
        { status: 400 }
      );
    }

    const fixes = await prisma.sEOIssueFix.findMany({
      where: {
        userId: user.id,
        ...(auditId ? { auditId } : {}),
        ...(websiteUrl ? { url: websiteUrl } : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ fixes });
  } catch (error) {
    console.error("[FIX_ASSISTANT] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch fix suggestions." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const user = await getOrCreateUser(clerkUserId);
    const body = await request.json();
    const { auditId, websiteUrl } = body;

    if (!auditId) {
      return NextResponse.json(
        { error: "auditId is required." },
        { status: 400 }
      );
    }

    const audit = await prisma.audit.findUnique({ where: { id: auditId } });
    if (!audit || audit.userId !== user.id) {
      return NextResponse.json({ error: "Audit not found." }, { status: 404 });
    }

    const fixes = generateAllFixes({
      pageTitle: audit.pageTitle ?? "",
      titleLength: audit.titleLength ?? 0,
      metaDescription: audit.metaDescription ?? "",
      metaDescriptionLength: audit.metaDescriptionLength ?? 0,
      h1Count: audit.h1Count ?? 0,
      h1Tags: (audit.h1Tags ?? []) as string[],
      missingAltImages: (audit.missingAltImages ?? []) as { src: string }[],
      canonicalUrl: audit.canonicalUrl ?? undefined,
    });

    const created = [];
    for (const fix of fixes) {
      try {
        const existing = await prisma.sEOIssueFix.findUnique({
          where: {
            auditId_issueType_issueKey: {
              auditId,
              issueType: fix.issueType,
              issueKey: fix.issueKey,
            },
          },
        });
        if (existing) {
          created.push(existing);
          continue;
        }
        const record = await prisma.sEOIssueFix.create({
          data: {
            auditId,
            userId: user.id,
            issueType: fix.issueType,
            issueKey: fix.issueKey,
            url: websiteUrl || audit.websiteUrl,
            summary: fix.summary,
            suggestion: fix.suggestion,
            codeSnippet: fix.codeSnippet,
          },
        });
        created.push(record);
      } catch {
        continue;
      }
    }

    return NextResponse.json({ fixes: created });
  } catch (error) {
    console.error("[FIX_ASSISTANT] POST error:", error);
    return NextResponse.json(
      { error: "Failed to generate fix suggestions." },
      { status: 500 }
    );
  }
}
