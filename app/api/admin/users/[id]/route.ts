import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.audit.deleteMany({ where: { userId: id } }),
      prisma.competitorComparison.deleteMany({ where: { userId: id } }),
      prisma.user.delete({ where: { id } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: "Failed to delete user." },
      { status: 500 }
    );
  }
}
