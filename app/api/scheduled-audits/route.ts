import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";
import { validateUrl, normalizeUrl } from "@/lib/audit";
import {
  calculateNextRunAt,
  validateScheduleFrequency,
} from "@/lib/scheduled-audit";
import type { ScheduleFrequency } from "@/lib/scheduled-audit";

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const user = await getOrCreateUser(clerkUserId);

    const schedules = await prisma.scheduledAudit.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    // Enrich with latest audit data for each schedule
    const enriched = await Promise.all(
      schedules.map(async (schedule) => {
        const latestAudit = await prisma.audit.findFirst({
          where: {
            userId: user.id,
            websiteUrl: normalizeUrl(schedule.websiteUrl),
          },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            seoScore: true,
            createdAt: true,
          },
        });

        return {
          ...schedule,
          latestAuditId: latestAudit?.id ?? null,
          currentSeoScore: latestAudit?.seoScore ?? null,
          lastAuditAt: latestAudit?.createdAt ?? null,
        };
      })
    );

    return NextResponse.json({ schedules: enriched });
  } catch (error) {
    console.error("[SCHEDULED_AUDITS] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedules." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    let body: { url?: string; frequency?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const validationError = validateUrl(body.url ?? "");
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    if (!validateScheduleFrequency(body.frequency ?? "")) {
      return NextResponse.json(
        { error: "Frequency must be 'weekly' or 'monthly'." },
        { status: 400 }
      );
    }

    const user = await getOrCreateUser(clerkUserId);
    const targetUrl = normalizeUrl(body.url ?? "");
    const frequency = body.frequency as ScheduleFrequency;

    // Check if user already has a schedule for this URL
    const existing = await prisma.scheduledAudit.findFirst({
      where: {
        userId: user.id,
        websiteUrl: targetUrl,
        status: { notIn: ["FAILED"] },
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          error: "This website is already being monitored.",
          existingScheduleId: existing.id,
        },
        { status: 409 }
      );
    }

    const nextRunAt = calculateNextRunAt(frequency, new Date());

    const schedule = await prisma.scheduledAudit.create({
      data: {
        userId: user.id,
        websiteUrl: targetUrl,
        frequency,
        status: "ACTIVE",
        nextRunAt,
      },
    });

    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    console.error("[SCHEDULED_AUDITS] POST error:", error);
    return NextResponse.json(
      { error: "Failed to create schedule." },
      { status: 500 }
    );
  }
}
