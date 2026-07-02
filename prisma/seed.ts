import "dotenv/config";
import { randomBytes } from "crypto";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const PLANS = ["STARTER", "PRO", "LIFETIME"] as const;
const CODES_PER_PLAN = 1000;
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const PLAN_PREFIXES: Record<string, string> = {
  STARTER: "WEB-ST",
  PRO: "WEB-PRO",
  LIFETIME: "WEB-LIFE",
};

const PLAN_DURATIONS: Record<string, number> = {
  STARTER: 365,
  PRO: 365,
  LIFETIME: 1825,
};

function randomCode(length: number): string {
  let result = "";
  const bytes = randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += CHARS[bytes[i] % CHARS.length];
  }
  return result;
}

function generateUniqueCodes(plan: string, count: number): string[] {
  const codes: string[] = [];
  const seen = new Set<string>();
  const prefix = PLAN_PREFIXES[plan];

  while (codes.length < count) {
    const suffix = randomCode(8);
    const code = `${prefix}-${suffix}`;
    if (!seen.has(code)) {
      seen.add(code);
      codes.push(code);
    }
  }

  return codes;
}

async function main() {
  console.log("🧹 Clearing existing unused codes...");
  await prisma.redeemCode.deleteMany({ where: { isUsed: false } });

  console.log("🔍 Checking for existing used codes...");
  const usedCount = await prisma.redeemCode.count({ where: { isUsed: true } });
  console.log(`   ${usedCount} used codes found (keeping them)`);

  for (const plan of PLANS) {
    console.log(`\n📋 Generating ${CODES_PER_PLAN} codes for ${plan}...`);

    const existingCodes = await prisma.redeemCode.findMany({
      where: { plan, isUsed: false },
      select: { code: true },
    });
    const existingSet = new Set(existingCodes.map((c) => c.code));

    const newCodes = generateUniqueCodes(plan, CODES_PER_PLAN).filter(
      (code) => !existingSet.has(code)
    );

    const duration = PLAN_DURATIONS[plan];
    const data = newCodes.map((code) => ({
      code,
      plan,
      duration,
    }));

    for (let i = 0; i < data.length; i += 100) {
      const batch = data.slice(i, i + 100);
      await prisma.redeemCode.createMany({ data: batch, skipDuplicates: true });
      console.log(`   ✅ Inserted ${Math.min(i + 100, data.length)}/${data.length} codes...`);
    }
  }

  const results = await Promise.all([
    prisma.redeemCode.count(),
    ...PLANS.map((p) =>
      prisma.redeemCode.count({ where: { plan: p } }).then((c) => ({ plan: p, count: c }))
    ),
  ]);

  const total = results[0] as number;
  const byPlan = results.slice(1) as { plan: string; count: number }[];

  console.log("\n═══════════════════════════════════");
  console.log("✅ Seed complete!");
  console.log(`   Total codes in database: ${total}`);
  for (const { plan, count } of byPlan) {
    console.log(`   ${plan}: ${count} codes`);
  }
  console.log("═══════════════════════════════════");

  await prisma.$disconnect();
  pool.end();
}

main().catch((e) => {
  console.error("❌ Seed failed:", e);
  process.exit(1);
});
