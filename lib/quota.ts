export const PLAN_LIMITS: Record<string, number> = {
  FREE: 3,
  STARTER: 25,
  PRO: -1,
  LIFETIME: -1,
  ENTERPRISE: -1,
};

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export interface QuotaResult {
  withinQuota: boolean;
  limit: number;
  used: number;
  remaining: number;
  isUnlimited: boolean;
}

export function getPlanLimit(plan: string): number {
  return PLAN_LIMITS[plan] ?? 3;
}

export function isUnlimited(plan: string): boolean {
  return PLAN_LIMITS[plan] === -1;
}

export function needsReset(lastResetDate: Date | null): boolean {
  if (!lastResetDate) return true;
  return Date.now() - lastResetDate.getTime() >= THIRTY_DAYS_MS;
}

export function checkQuota(
  plan: string,
  monthlyAuditCount: number,
): QuotaResult {
  const limit = getPlanLimit(plan);
  const unlimited = limit === -1;

  return {
    withinQuota: unlimited || monthlyAuditCount < limit,
    limit,
    used: monthlyAuditCount,
    remaining: unlimited ? -1 : Math.max(0, limit - monthlyAuditCount),
    isUnlimited: unlimited,
  };
}
