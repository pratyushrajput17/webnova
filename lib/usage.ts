import { prisma } from "@/lib/prisma";
import {
  getAuditLimit,
  getCompetitorLimit,
  getAuditResetDays,
  needsReset,
  checkAuditQuota,
  checkCompetitorQuota,
} from "@/lib/quota";

export interface UserUsage {
  totalAudits: number;
  auditsThisMonth: number;
  auditsThisYear: number;
  reportsGenerated: number;
  competitorAnalysesUsed: number;
}

export interface RemainingAudits {
  remaining: number;
  limit: number;
  isUnlimited: boolean;
}

export interface RemainingCompetitors {
  remaining: number;
  limit: number;
  isUnlimited: boolean;
}

export interface PlanLimits {
  auditLimit: number;
  competitorLimit: number;
  auditResetDays: number;
}

export async function getUserUsage(userId: string): Promise<UserUsage> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [totalAudits, auditsThisMonth, auditsThisYear, competitorAnalysesUsed] =
    await Promise.all([
      prisma.audit.count({ where: { userId } }),
      prisma.audit.count({
        where: { userId, createdAt: { gte: startOfMonth } },
      }),
      prisma.audit.count({
        where: { userId, createdAt: { gte: startOfYear } },
      }),
      prisma.competitorComparison.count({ where: { userId } }),
    ]);

  return {
    totalAudits,
    auditsThisMonth,
    auditsThisYear,
    reportsGenerated: totalAudits,
    competitorAnalysesUsed,
  };
}

export async function getRemainingAudits(
  userId: string
): Promise<RemainingAudits> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return { remaining: 0, limit: 0, isUnlimited: false };
  }

  let auditCount = user.monthlyAuditCount;
  let auditReset = user.lastResetDate;
  const auditResetDays = getAuditResetDays(user.plan);

  if (needsReset(auditReset, auditResetDays)) {
    auditCount = 0;
  }

  const quota = checkAuditQuota(user.plan, auditCount);
  return {
    remaining: quota.remaining,
    limit: quota.limit,
    isUnlimited: quota.isUnlimited,
  };
}

export async function getRemainingCompetitors(
  userId: string
): Promise<RemainingCompetitors> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return { remaining: 0, limit: 0, isUnlimited: false };
  }

  let compCount = user.competitorCount;
  let compReset = user.competitorLastReset;

  if (needsReset(compReset, 30)) {
    compCount = 0;
  }

  const quota = checkCompetitorQuota(user.plan, compCount);
  return {
    remaining: quota.remaining,
    limit: quota.limit,
    isUnlimited: quota.isUnlimited,
  };
}

export function getPlanLimits(plan: string): PlanLimits {
  return {
    auditLimit: getAuditLimit(plan),
    competitorLimit: getCompetitorLimit(plan),
    auditResetDays: getAuditResetDays(plan),
  };
}

export async function logUsage(
  userId: string,
  actionType: string,
  websiteUrl?: string,
  resultData?: unknown
): Promise<void> {
  await prisma.usageHistory.create({
    data: {
      userId,
      actionType,
      websiteUrl: websiteUrl ?? null,
      resultData: resultData ?? undefined,
    },
  });
}
