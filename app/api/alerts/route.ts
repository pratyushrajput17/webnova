import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const user = await getOrCreateUser(clerkUserId);

    const { searchParams } = new URL(request.url);
    const websiteUrl = searchParams.get("websiteUrl");
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 100);
    const offset = parseInt(searchParams.get("offset") ?? "0");

    const where: Record<string, unknown> = { userId: user.id };
    if (websiteUrl) {
      where.websiteUrl = websiteUrl;
    }

    const [alerts, total] = await Promise.all([
      prisma.sEOAlert.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.sEOAlert.count({ where }),
    ]);

    return NextResponse.json({ alerts, total });
  } catch (error) {
    console.error("[ALERTS] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch alerts." },
      { status: 500 }
    );
  }
}
