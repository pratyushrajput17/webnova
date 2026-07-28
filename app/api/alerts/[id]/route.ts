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

    const alert = await prisma.sEOAlert.findUnique({ where: { id } });
    if (!alert || alert.userId !== user.id) {
      return NextResponse.json({ error: "Alert not found." }, { status: 404 });
    }

    const body = await request.json();
    const data: Record<string, unknown> = {};

    if (body.read !== undefined) {
      data.readAt = body.read ? new Date() : null;
    }

    const updated = await prisma.sEOAlert.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[ALERTS] PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update alert." },
      { status: 500 }
    );
  }
}
