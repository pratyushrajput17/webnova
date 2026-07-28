import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const user = await getOrCreateUser(clerkUserId);
    const { id } = await params;
    const { status } = await request.json();

    if (!["OPEN", "ADDRESSED", "VERIFIED_FIXED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Use OPEN, ADDRESSED, or VERIFIED_FIXED." },
        { status: 400 }
      );
    }

    const existing = await prisma.sEOIssueFix.findUnique({ where: { id } });
    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ error: "Fix not found." }, { status: 404 });
    }

    const updateData: Record<string, unknown> = { status };
    if (status === "VERIFIED_FIXED") {
      updateData.verifiedAt = new Date();
    }

    const updated = await prisma.sEOIssueFix.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ fix: updated });
  } catch (error) {
    console.error("[FIX_ASSISTANT] PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update fix status." },
      { status: 500 }
    );
  }
}
