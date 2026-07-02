import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const codes = await prisma.redeemCode.findMany({
      where: { isUsed: true, usedByUserId: { not: null } },
      orderBy: { usedAt: "desc" },
      take: 200,
      include: {
        usedBy: {
          select: { id: true, email: true, name: true },
        },
      },
    });

    const history = codes.map((code) => ({
      id: code.id,
      code: code.code,
      plan: code.plan,
      redeemedAt: code.usedAt,
      user: code.usedBy,
    }));

    return NextResponse.json({ history });
  } catch (error) {
    console.error("Redeem history error:", error);
    return NextResponse.json(
      { error: "Failed to fetch redeem history." },
      { status: 500 }
    );
  }
}
