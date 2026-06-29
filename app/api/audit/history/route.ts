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

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
    const skip = (page - 1) * limit;

    let audits: unknown[] = [];
    let total = 0;

    try {
      const user = await getOrCreateUser(clerkUserId);

      const result = await Promise.all([
        prisma.audit.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          take: limit,
          skip,
        }),
        prisma.audit.count({ where: { userId: user.id } }),
      ]);
      audits = result[0];
      total = result[1];
    } catch (dbError) {
      console.error("DB unavailable, returning empty history:", dbError);
    }

    return NextResponse.json({
      audits,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("History fetch error:", error);
    return NextResponse.json({
      audits: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    });
  }
}
