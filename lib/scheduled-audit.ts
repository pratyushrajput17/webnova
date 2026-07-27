import { prisma } from "@/lib/prisma";
import { analyzeWebsite, normalizeUrl } from "@/lib/audit";
import {
  checkAuditQuota,
  needsReset,
  getAuditResetDays,
} from "@/lib/quota";
import { logUsage } from "@/lib/usage";
import { createNotification } from "@/lib/notifications";
import type { Prisma } from "@/lib/generated/prisma/client";

export type ScheduleFrequency = "weekly" | "monthly";
export type ScheduleStatus = "ACTIVE" | "PAUSED" | "FAILED" | "LIMIT_REACHED";
export type RunStatus = "SUCCESS" | "FAILED" | "LIMIT_REACHED";

const BATCH_LIMIT = 10;
const IDEMPOTENCY_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

export function calculateNextRunAt(
  frequency: ScheduleFrequency,
  from: Date = new Date()
): Date {
  const next = new Date(from);
  if (frequency === "weekly") {
    next.setDate(next.getDate() + 7);
  } else {
    next.setDate(next.getDate() + 30);
  }
  return next;
}

export async function executeScheduledAudit(scheduleId: string): Promise<{
  success: boolean;
  auditId?: string;
  error?: string;
  status: RunStatus;
}> {
  const schedule = await prisma.scheduledAudit.findUnique({
    where: { id: scheduleId },
    include: { user: true },
  });

  if (!schedule) {
    return { success: false, error: "Schedule not found.", status: "FAILED" };
  }

  if (schedule.status !== "ACTIVE") {
    return {
      success: false,
      error: "Schedule is not active.",
      status: "FAILED",
    };
  }

  const now = new Date();

  // Idempotency check: if last attempt was within window, skip
  if (
    schedule.lastAttemptAt &&
    now.getTime() - schedule.lastAttemptAt.getTime() < IDEMPOTENCY_WINDOW_MS &&
    schedule.lastRunStatus === "SUCCESS"
  ) {
    return {
      success: false,
      error: "Recently completed, skipping.",
      status: "SUCCESS",
    };
  }

  const user = schedule.user;

  // Plan enforcement
  let currentCount = user.monthlyAuditCount;
  const resetDays = getAuditResetDays(user.plan);

  if (needsReset(user.lastResetDate, resetDays)) {
    currentCount = 0;
    await prisma.user.update({
      where: { id: user.id },
      data: { monthlyAuditCount: 0, lastResetDate: now },
    });
  }

  const quota = checkAuditQuota(user.plan, currentCount);
  if (!quota.withinQuota) {
    await prisma.scheduledAudit.update({
      where: { id: scheduleId },
      data: {
        lastAttemptAt: now,
        lastRunStatus: "LIMIT_REACHED",
        lastError: "Audit limit reached for current billing period.",
        status: "LIMIT_REACHED",
      },
    });
    return {
      success: false,
      error: "Audit limit reached.",
      status: "LIMIT_REACHED",
    };
  }

  // Run the real audit engine
  const targetUrl = normalizeUrl(schedule.websiteUrl);
  let auditResult;
  try {
    auditResult = await analyzeWebsite(targetUrl);
  } catch (err) {
    const errorMsg =
      err instanceof Error ? err.message : "Audit execution failed.";

    await prisma.scheduledAudit.update({
      where: { id: scheduleId },
      data: {
        lastAttemptAt: now,
        lastRunStatus: "FAILED",
        lastError: "Scheduled audit failed. You can retry with Run Now.",
      },
    });

    console.error(
      `[SCHEDULED_AUDIT] Execution failed for scheduleId=${scheduleId}:`,
      errorMsg
    );

    return { success: false, error: errorMsg, status: "FAILED" };
  }

  // Create the audit record
  let audit;
  try {
    const createData = {
      userId: user.id,
      websiteUrl: targetUrl,
      pageTitle: auditResult.pageTitle,
      metaDescription: auditResult.metaDescription || null,
      seoScore: auditResult.seoScore,
      performanceScore: auditResult.performanceScore,
      accessibilityScore: auditResult.accessibilityScore,
      h1Count: auditResult.h1Count,
      h1Tags: auditResult.h1Tags as unknown as Prisma.InputJsonValue,
      h2Tags: auditResult.h2Tags as unknown as Prisma.InputJsonValue,
      h3Tags: auditResult.h3Tags as unknown as Prisma.InputJsonValue,
      canonicalUrl: auditResult.canonicalUrl || null,
      imageCount: auditResult.imageCount,
      missingAltCount: auditResult.missingAltCount,
      imagesData: auditResult.imagesData as unknown as Prisma.InputJsonValue,
      missingAltImages: auditResult.missingAltImages as unknown as Prisma.InputJsonValue,
      internalLinks: auditResult.internalLinks,
      internalLinksData: auditResult.internalLinksData as unknown as Prisma.InputJsonValue,
      externalLinks: auditResult.externalLinks,
      externalLinksData: auditResult.externalLinksData as unknown as Prisma.InputJsonValue,
      titleLength: auditResult.titleLength,
      metaDescriptionLength: auditResult.metaDescriptionLength,
      aiRecommendations: auditResult.aiRecommendations as unknown as Prisma.InputJsonValue,
      auditType: "scheduled",
    };
    audit = await prisma.audit.create({ data: createData });
  } catch (dbError) {
    console.error(
      `[SCHEDULED_AUDIT] DB save failed for scheduleId=${scheduleId}:`,
      dbError
    );
    await prisma.scheduledAudit.update({
      where: { id: scheduleId },
      data: {
        lastAttemptAt: now,
        lastRunStatus: "FAILED",
        lastError: "Failed to save audit results.",
      },
    });
    return { success: false, error: "Failed to save audit.", status: "FAILED" };
  }

  // Update user audit count
  await prisma.user.update({
    where: { id: user.id },
    data: { monthlyAuditCount: { increment: 1 } },
  });

  // Update schedule
  const nextRunAt = calculateNextRunAt(
    schedule.frequency as ScheduleFrequency,
    now
  );

  await prisma.scheduledAudit.update({
    where: { id: scheduleId },
    data: {
      lastRunAt: now,
      lastAttemptAt: now,
      lastRunStatus: "SUCCESS",
      lastError: null,
      nextRunAt,
      status: "ACTIVE",
    },
  });

  // Fire-and-forget: usage log, notification
  logUsage(user.id, "scheduled_audit", targetUrl).catch((err) => {
    console.error(
      `[SCHEDULED_AUDIT] Usage logging failed for userId=${user.id}:`,
      err
    );
  });

  createNotification(
    user.id,
    "Scheduled Audit Completed",
    `SEO score: ${auditResult.seoScore} — ${targetUrl}`,
    "audit_completed",
    `/dashboard/history/${audit.id}`
  ).catch((err) => {
    console.error(
      `[SCHEDULED_AUDIT] Notification failed for userId=${user.id}:`,
      err
    );
  });

  return { success: true, auditId: audit.id, status: "SUCCESS" };
}

export async function processDueSchedules(): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
  limitReached: number;
  skipped: number;
}> {
  const now = new Date();

  const dueSchedules = await prisma.scheduledAudit.findMany({
    where: {
      status: "ACTIVE",
      nextRunAt: { lte: now },
    },
    orderBy: { nextRunAt: "asc" },
    take: BATCH_LIMIT,
  });

  let succeeded = 0;
  let failed = 0;
  let limitReached = 0;

  for (const schedule of dueSchedules) {
    try {
      const result = await executeScheduledAudit(schedule.id);
      if (result.status === "SUCCESS") succeeded++;
      else if (result.status === "LIMIT_REACHED") limitReached++;
      else failed++;
    } catch (err) {
      console.error(
        `[SCHEDULED_AUDIT] Unhandled error for scheduleId=${schedule.id}:`,
        err
      );
      failed++;
    }
  }

  return {
    processed: dueSchedules.length,
    succeeded,
    failed,
    limitReached,
    skipped: 0,
  };
}

export function validateScheduleFrequency(
  frequency: string
): frequency is ScheduleFrequency {
  return frequency === "weekly" || frequency === "monthly";
}
