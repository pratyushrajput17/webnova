import { randomBytes } from "crypto";

const CODE_PREFIXES: Record<string, string> = {
  STARTER: "STARTER",
  PRO: "PRO",
  ENTERPRISE: "ENT",
};

const PLAN_DURATIONS: Record<string, number> = {
  STARTER: 30,
  PRO: 30,
  ENTERPRISE: 30,
};

export function generateCode(plan: string): string {
  const prefix = CODE_PREFIXES[plan];
  if (!prefix) throw new Error(`Unknown plan: ${plan}`);
  const suffix = randomBytes(3)
    .toString("hex")
    .toUpperCase()
    .slice(0, 6);
  return `${prefix}-${suffix}`;
}

export function generateBulkCodes(
  plan: string,
  count: number
): { code: string; plan: string; duration: number }[] {
  const codes: { code: string; plan: string; duration: number }[] = [];
  const seen = new Set<string>();
  const duration = PLAN_DURATIONS[plan] ?? 30;

  while (codes.length < count) {
    const code = generateCode(plan);
    if (!seen.has(code)) {
      seen.add(code);
      codes.push({ code, plan, duration });
    }
  }

  return codes;
}

export function parseCode(input: string): {
  plan?: string;
  raw: string;
} {
  const raw = input.trim().toUpperCase();
  const parts = raw.split("-");

  if (parts.length >= 2) {
    const prefix = parts[0];
    const matchingPlan = Object.entries(CODE_PREFIXES).find(
      ([_, p]) => p === prefix
    );
    if (matchingPlan) {
      return { plan: matchingPlan[0], raw };
    }
  }

  return { raw };
}

export function getDurationForPlan(plan: string): number {
  return PLAN_DURATIONS[plan] ?? 30;
}

export function seedTestCodes(): {
  code: string;
  plan: string;
  duration: number;
}[] {
  return [
    { code: "STARTER-TEST123", plan: "STARTER", duration: 30 },
    { code: "PRO-TEST123", plan: "PRO", duration: 30 },
    { code: "ENT-TEST123", plan: "ENTERPRISE", duration: 30 },
  ];
}

export const VALID_PLANS = ["STARTER", "PRO", "ENTERPRISE"];
