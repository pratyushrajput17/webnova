import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";
import { executeScheduledAudit } from "@/lib/scheduled-audit";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    const user = await getOrCreateUser(clerkUserId);

    const schedule = await prisma.scheduledAudit.findUnique({
      where: { id },
    });

    if (!schedule || schedule.userId !== user.id) {
      return NextResponse.json(
        { error: "Schedule not found." },
        { status: 404 }
      );
    }

    if (schedule.status === "PAUSED") {
      return NextResponse.json(
        { error: "Cannot run a paused schedule. Resume it first." },
        { status: 400 }
      );
    }

    const result = await executeScheduledAudit(schedule.id);

    if (result.success) {
      return NextResponse.json({
        success: true,
        auditId: result.auditId,
        message: "Audit completed successfully.",
      });
    }

    const statusCode =
      result.status === "LIMIT_REACHED"
        ? 403
        : result.status === "FAILED"
          ? 500
          : 400;

    return NextResponse.json(
      {
        success: false,
        error: result.error,
        status: result.status,
      },
      { status: statusCode }
    );
  } catch (error) {
    console.error("[SCHEDULED_AUDIT] RUN error:", error);
    return NextResponse.json(
      { error: "Failed to run audit." },
      { status: 500 }
    );
  }
}
