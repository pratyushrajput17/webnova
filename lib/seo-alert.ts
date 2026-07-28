import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import {
  detectChanges,
  findPreviousAudit,
  getDefaultThresholds,
  type SEOChange,
} from "@/lib/change-detection";
import type { Prisma } from "@/lib/generated/prisma/client";

interface AlertResult {
  alertCreated: boolean;
  emailSent: boolean;
  changes: SEOChange[];
}

const UNIQUE_CONSTRAINT_ERROR = "P2002";

export async function processAlertForAudit(
  userId: string,
  currentAuditId: string,
  websiteUrl: string
): Promise<AlertResult> {
  const previousAuditId = await findPreviousAudit(
    userId,
    websiteUrl,
    currentAuditId
  );

  if (!previousAuditId) {
    return { alertCreated: false, emailSent: false, changes: [] };
  }

  const preference = await prisma.alertPreference.findUnique({
    where: { userId_websiteUrl: { userId, websiteUrl } },
  });

  const thresholds = (preference?.thresholds as Record<string, number>) || getDefaultThresholds();

  const detection = await detectChanges(
    currentAuditId,
    previousAuditId,
    websiteUrl,
    thresholds
  );

  if (!detection.hasChanges) {
    return { alertCreated: false, emailSent: false, changes: [] };
  }

  let emailSent = false;

  for (const change of detection.changes) {
    const shouldEmailChange =
      change.severity === "CRITICAL" ||
      change.severity === "WARNING" ||
      (change.severity === "IMPROVEMENT" && preference?.improvementAlerts);

    try {
      await prisma.sEOAlert.create({
        data: {
          userId,
          websiteUrl,
          previousAuditId,
          currentAuditId,
          severity: change.severity,
          changeType: change.changeType,
          summary: change.summary,
          metadata: change.metadata as Prisma.InputJsonValue,
          emailStatus: shouldEmailChange ? "PENDING" : "SENT",
        },
      });
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "code" in err &&
        (err as { code: string }).code === UNIQUE_CONSTRAINT_ERROR
      ) {
        continue;
      }
      console.error(
        `[SEO_ALERT] Failed to create alert for audit=${currentAuditId}:`,
        err
      );
    }
  }

  if (detection.shouldEmail) {
    const emailDelivered = await sendAlertEmail(
      userId,
      websiteUrl,
      detection,
      preference
    );

    if (emailDelivered) {
      await prisma.sEOAlert.updateMany({
        where: {
          userId,
          currentAuditId,
          emailStatus: "PENDING",
        },
        data: {
          emailStatus: "SENT",
          emailSentAt: new Date(),
        },
      });
      emailSent = true;
    } else {
      await prisma.sEOAlert.updateMany({
        where: {
          userId,
          currentAuditId,
          emailStatus: "PENDING",
        },
        data: { emailStatus: "FAILED" },
      });
    }
  }

  return {
    alertCreated: detection.changes.length > 0,
    emailSent,
    changes: detection.changes,
  };
}

async function sendAlertEmail(
  userId: string,
  websiteUrl: string,
  detection: {
    changes: SEOChange[];
    scoreChange: number;
    previousScore: number;
    currentScore: number;
    shouldEmail: boolean;
  },
  preference: {
    emailAlerts: boolean;
    improvementAlerts: boolean;
    notificationEmail: string | null;
    email?: string;
  } | null
): Promise<boolean> {
  if (!detection.shouldEmail) return false;

  if (preference && !preference.emailAlerts) return false;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return false;

  const hasImprovements = detection.changes.some(
    (c) => c.severity === "IMPROVEMENT"
  );

  if (hasImprovements && (!preference || !preference.improvementAlerts))
    return false;

  const toEmail =
    preference?.notificationEmail || user.email;

  if (!toEmail) return false;

  const { default: SEOAlertEmail } = await import("@/emails/SEOAlertEmail");

  const isImprovement =
    detection.scoreChange > 0 &&
    !detection.changes.some((c) => c.severity === "CRITICAL" || c.severity === "WARNING");

  const domain = websiteUrl.replace(/^https?:\/\//, "").replace(/\/.*$/, "");

  const subject = isImprovement
    ? `SEO Improvement: ${domain} gained ${Math.abs(detection.scoreChange)} points`
    : `SEO Alert: New issues detected on ${domain}`;

  const latestAlert = await prisma.sEOAlert.findFirst({
    where: { userId, currentAuditId: detection.changes[0]?.metadata?.currentAuditId as string | undefined },
    orderBy: { createdAt: "desc" },
  });

  const reportUrl = latestAlert
    ? `https://webnova.business/dashboard/alerts?id=${latestAlert.id}`
    : `https://webnova.business/dashboard/history`;

  const settingsUrl = `https://webnova.business/dashboard/monitoring`;

  const result = await sendEmail({
    to: toEmail,
    subject,
    react: SEOAlertEmail({
      websiteUrl,
      previousScore: detection.previousScore,
      currentScore: detection.currentScore,
      scoreChange: detection.scoreChange,
      changes: detection.changes,
      isImprovement,
      reportUrl,
      settingsUrl,
      userName: user.name ?? undefined,
    }),
  });

  return result;
}
