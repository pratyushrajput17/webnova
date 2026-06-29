import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;

    let user;
    try {
      user = await getOrCreateUser(clerkUserId);
    } catch {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const audit = await prisma.audit.findUnique({ where: { id } });

    if (!audit) {
      return NextResponse.json(
        { error: "Audit not found." },
        { status: 404 }
      );
    }

    if (audit.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    return NextResponse.json(audit);
  } catch (error) {
    console.error("Audit fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;

    let user;
    try {
      user = await getOrCreateUser(clerkUserId);
    } catch {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const audit = await prisma.audit.findUnique({ where: { id } });

    if (!audit) {
      return NextResponse.json(
        { error: "Audit not found." },
        { status: 404 }
      );
    }

    if (audit.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    await prisma.audit.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Audit delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete audit." },
      { status: 500 }
    );
  }
}
