import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { generateBulkCodes, VALID_PLANS, getDurationForPlan } from "@/lib/codes";

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    let body: { plan?: string; count?: number };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const plan = body.plan?.toUpperCase();
    if (!plan || !VALID_PLANS.includes(plan)) {
      return NextResponse.json(
        { error: "Invalid plan. Must be STARTER, PRO, or ENTERPRISE." },
        { status: 400 }
      );
    }

    const count = Math.min(Math.max(1, body.count ?? 1), 1000);
    const duration = getDurationForPlan(plan);

    const generated = generateBulkCodes(plan, count);

    await prisma.redeemCode.createMany({
      data: generated.map((g) => ({
        code: g.code,
        plan: g.plan,
        duration: g.duration,
      })),
    });

    return NextResponse.json({
      success: true,
      count: generated.length,
      plan,
      duration,
      codes: generated.map((g) => g.code),
    });
  } catch (error) {
    console.error("Code generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate codes." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format");

    const codes = await prisma.redeemCode.findMany({
      orderBy: { createdAt: "desc" },
      take: 1000,
    });

    if (format === "csv") {
      const header = "code,plan,duration,isUsed,usedAt,expiresAt,createdAt\n";
      const rows = codes
        .map((c) =>
          [
            c.code,
            c.plan,
            c.duration,
            c.isUsed,
            c.usedAt?.toISOString() ?? "",
            c.expiresAt?.toISOString() ?? "",
            c.createdAt.toISOString(),
          ].join(",")
        )
        .join("\n");

      return new NextResponse(header + rows, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition":
            `attachment; filename="redeem-codes-${Date.now()}.csv"`,
        },
      });
    }

    return NextResponse.json({ codes });
  } catch (error) {
    console.error("Code list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch codes." },
      { status: 500 }
    );
  }
}
