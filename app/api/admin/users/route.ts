import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { error, user } = await requireAdmin();
  if (error || !user) return error;

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20")));
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          clerkId: true,
          email: true,
          name: true,
          role: true,
          plan: true,
          monthlyAuditCount: true,
          createdAt: true,
          subscriptionEndsAt: true,
        },
      }),
      prisma.user.count(),
    ]);

    return NextResponse.json({
      users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Admin users error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users." },
      { status: 500 }
    );
  }
}
