import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";
import { computeProgress } from "@/lib/fix-assistant";

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const user = await getOrCreateUser(clerkUserId);
    const { searchParams } = new URL(request.url);
    const websiteUrl = searchParams.get("websiteUrl");

    const fixes = await prisma.sEOIssueFix.findMany({
      where: {
        userId: user.id,
        ...(websiteUrl ? { url: websiteUrl } : {}),
      },
      select: { status: true, issueType: true },
    });

    const progress = computeProgress(fixes);

    return NextResponse.json({ progress });
  } catch (error) {
    console.error("[FIX_ASSISTANT] PROGRESS error:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress." },
      { status: 500 }
    );
  }
}
