import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const user = await getOrCreateUser(clerkUserId);
    const { id } = await params;

    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification || notification.userId !== user.id) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mark read error:", error);
    return NextResponse.json({ error: "Failed to mark as read." }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const user = await getOrCreateUser(clerkUserId);
    const { id } = await params;

    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification || notification.userId !== user.id) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    await prisma.notification.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete notification error:", error);
    return NextResponse.json({ error: "Failed to delete notification." }, { status: 500 });
  }
}
