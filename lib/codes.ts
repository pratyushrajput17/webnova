import { randomBytes } from "crypto";

const CODE_PREFIXES: Record<string, string> = {
  STARTER: "WEB-ST",
  PRO: "WEB-PRO",
  LIFETIME: "WEB-LIFE",
  ENTERPRISE: "ENT",
};

const PLAN_DURATIONS: Record<string, number> = {
  STARTER: 365,
  PRO: 365,
  LIFETIME: 1825,
  ENTERPRISE: 30,
};

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function randomCode(length: number): string {
  let result = "";
  const bytes = randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += CHARS[bytes[i] % CHARS.length];
  }
  return result;
}

export function generateCode(plan: string): string {
  const prefix = CODE_PREFIXES[plan];
  if (!prefix) throw new Error(`Unknown plan: ${plan}`);
  const suffix = randomCode(8);
  return `${prefix}-${suffix}`;
}

export function generateBulkCodes(
  plan: string,
  count: number
): { code: string; plan: string; duration: number }[] {
  const codes: { code: string; plan: string; duration: number }[] = [];
  const seen = new Set<string>();
  const duration = PLAN_DURATIONS[plan] ?? 365;

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

  if (parts.length >= 3) {
    const fullPrefix = `${parts[0]}-${parts[1]}`;
    const matchingPlan = Object.entries(CODE_PREFIXES).find(
      ([, p]) => p === fullPrefix
    );
    if (matchingPlan) {
      return { plan: matchingPlan[0], raw };
    }
  }

  if (parts.length >= 2) {
    const matchingPlan = Object.entries(CODE_PREFIXES).find(
      ([, p]) => p === parts[0]
    );
    if (matchingPlan) {
      return { plan: matchingPlan[0], raw };
    }
  }

  return { raw };
}

export function getDurationForPlan(plan: string): number {
  return PLAN_DURATIONS[plan] ?? 365;
}

export const VALID_PLANS = ["STARTER", "PRO", "LIFETIME", "ENTERPRISE"];
