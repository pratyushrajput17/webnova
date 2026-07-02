import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { generateBulkCodes, VALID_PLANS, getDurationForPlan } from "@/lib/codes";
import type { RedeemCodeWhereInput } from "@/lib/generated/prisma/models/RedeemCode";

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
        { error: "Invalid plan. Must be STARTER, PRO, LIFETIME, or ENTERPRISE." },
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
      skipDuplicates: true,
    });

    const inserted = await prisma.redeemCode.findMany({
      where: { code: { in: generated.map((g) => g.code) } },
    });

    return NextResponse.json({
      success: true,
      count: inserted.length,
      plan,
      duration,
      codes: inserted.map((g) => g.code),
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
    const plan = searchParams.get("plan");
    const isUsed = searchParams.get("isUsed");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "50");

    const where: RedeemCodeWhereInput = {};

    if (plan) {
      where.plan = plan.toUpperCase();
    }

    if (isUsed === "true") {
      where.isUsed = true;
    } else if (isUsed === "false") {
      where.isUsed = false;
    }

    if (search) {
      where.code = { contains: search.toUpperCase() };
    }

    const [total, codes] = await Promise.all([
      prisma.redeemCode.count({ where }),
      prisma.redeemCode.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          usedBy: {
            select: { id: true, email: true, name: true },
          },
        },
      }),
    ]);

    const [totalAll, usedCount] = await Promise.all([
      prisma.redeemCode.count(),
      prisma.redeemCode.count({ where: { isUsed: true } }),
    ]);

    const planBreakdown: Record<string, number> = {};
    for (const p of ["STARTER", "PRO", "LIFETIME", "ENTERPRISE"]) {
      planBreakdown[p] = await prisma.redeemCode.count({ where: { plan: p } });
    }

    if (format === "csv") {
      const allCodes = await prisma.redeemCode.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          usedBy: {
            select: { email: true, name: true },
          },
        },
      });

      const header = "code,plan,duration,isUsed,usedByEmail,usedByName,usedAt,expiresAt,createdAt\n";
      const rows = allCodes
        .map((c) =>
          [
            c.code,
            c.plan,
            c.duration,
            c.isUsed ? "Yes" : "No",
            c.usedBy?.email ?? "",
            c.usedBy?.name ?? "",
            c.usedAt?.toISOString() ?? "",
            c.expiresAt?.toISOString() ?? "",
            c.createdAt.toISOString(),
          ]
            .map((v) => `"${v}"`)
            .join(",")
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

    return NextResponse.json({
      codes: codes.map((c) => ({
        ...c,
        usedBy: c.usedBy
          ? { id: c.usedBy.id, email: c.usedBy.email, name: c.usedBy.name }
          : null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        total: totalAll,
        used: usedCount,
        remaining: totalAll - usedCount,
        planBreakdown,
      },
    });
  } catch (error) {
    console.error("Code list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch codes." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const plan = searchParams.get("plan");

    if (plan) {
      await prisma.redeemCode.deleteMany({
        where: {
          plan: plan.toUpperCase(),
          isUsed: false,
        },
      });
    } else {
      await prisma.redeemCode.deleteMany({
        where: { isUsed: false },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Code delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete codes." },
      { status: 500 }
    );
  }
}
