export const AUDIT_LIMITS: Record<string, number> = {
  FREE: 3,
  STARTER: 100,
  PRO: -1,
  LIFETIME: -1,
  ENTERPRISE: -1,
};

export const COMPETITOR_LIMITS: Record<string, number> = {
  FREE: 3,
  STARTER: 10,
  PRO: -1,
  LIFETIME: -1,
  ENTERPRISE: -1,
};

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export interface QuotaResult {
  withinQuota: boolean;
  limit: number;
  used: number;
  remaining: number;
  isUnlimited: boolean;
}

export function getAuditLimit(plan: string): number {
  return AUDIT_LIMITS[plan] ?? 3;
}

export function getCompetitorLimit(plan: string): number {
  return COMPETITOR_LIMITS[plan] ?? 3;
}

export function isUnlimited(limit: number): boolean {
  return limit === -1;
}

export function getAuditResetDays(plan: string): number {
  if (plan === "STARTER") return 365;
  return 30;
}

export function needsReset(
  lastResetDate: Date | null,
  periodDays = 30
): boolean {
  if (!lastResetDate) return true;
  const periodMs = periodDays * 24 * 60 * 60 * 1000;
  return Date.now() - lastResetDate.getTime() >= periodMs;
}

export function checkAuditQuota(
  plan: string,
  count: number
): QuotaResult {
  const limit = getAuditLimit(plan);
  const unlimited = limit === -1;

  return {
    withinQuota: unlimited || count < limit,
    limit,
    used: count,
    remaining: unlimited ? -1 : Math.max(0, limit - count),
    isUnlimited: unlimited,
  };
}

export function checkCompetitorQuota(
  plan: string,
  count: number
): QuotaResult {
  const limit = getCompetitorLimit(plan);
  const unlimited = limit === -1;

  return {
    withinQuota: unlimited || count < limit,
    limit,
    used: count,
    remaining: unlimited ? -1 : Math.max(0, limit - count),
    isUnlimited: unlimited,
  };
}
