import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";
import { normalizeUrl } from "@/lib/audit";
import { calculateNextRunAt } from "@/lib/scheduled-audit";
import type { ScheduleFrequency } from "@/lib/scheduled-audit";

export async function GET(
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

    // Get recent audits for this URL
    const recentAudits = await prisma.audit.findMany({
      where: {
        userId: user.id,
        websiteUrl: normalizeUrl(schedule.websiteUrl),
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        seoScore: true,
        performanceScore: true,
        accessibilityScore: true,
        auditType: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ schedule, recentAudits });
  } catch (error) {
    console.error("[SCHEDULED_AUDIT] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedule." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
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

    let body: { frequency?: string; status?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const updateData: {
      frequency?: string;
      status?: string;
      nextRunAt?: Date;
    } = {};

    if (body.frequency) {
      if (body.frequency !== "weekly" && body.frequency !== "monthly") {
        return NextResponse.json(
          { error: "Frequency must be 'weekly' or 'monthly'." },
          { status: 400 }
        );
      }
      updateData.frequency = body.frequency;
      // Recalculate next run from now
      updateData.nextRunAt = calculateNextRunAt(
        body.frequency as ScheduleFrequency,
        new Date()
      );
    }

    if (body.status) {
      if (!["ACTIVE", "PAUSED"].includes(body.status)) {
        return NextResponse.json(
          { error: "Status must be 'ACTIVE' or 'PAUSED'." },
          { status: 400 }
        );
      }
      updateData.status = body.status;

      // When resuming, recalculate nextRunAt from now (don't run missed audits)
      if (body.status === "ACTIVE") {
        const freq = (updateData.frequency ?? schedule.frequency) as ScheduleFrequency;
        updateData.nextRunAt = calculateNextRunAt(freq, new Date());
      }
    }

    const updated = await prisma.scheduledAudit.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[SCHEDULED_AUDIT] PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update schedule." },
      { status: 500 }
    );
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

    // Delete only the schedule — audit history is preserved
    await prisma.scheduledAudit.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[SCHEDULED_AUDIT] DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete schedule." },
      { status: 500 }
    );
  }
}
