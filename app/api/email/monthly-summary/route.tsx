import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { checkQuota } from "@/lib/quota";
import type { ReactElement } from "react";

export const dynamic = "force-dynamic";

export async function POST() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        monthlyAuditCount: true,
        createdAt: true,
      },
    });

    const month = new Date().toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    let sent = 0;
    let skipped = 0;

    for (const user of users) {
      if (!user.email || user.email.endsWith("@placeholder.com")) {
        skipped++;
        continue;
      }

      const totalAuditsAllTime = await prisma.audit.count({
        where: { userId: user.id },
      });

      const quota = checkQuota(user.plan, user.monthlyAuditCount);

      const [mod, Email] = await Promise.all([
        import("@/lib/email"),
        import("@/emails/MonthlySummaryEmail"),
      ]);

      const success = await mod.sendEmail({
        to: user.email,
        subject: `Your WebNova ${month} Usage Summary`,
        react: (
          <Email.default
            name={user.name ?? ""}
            plan={user.plan}
            month={month}
            auditCount={user.monthlyAuditCount}
            totalAuditsAllTime={totalAuditsAllTime}
            remainingAudits={quota.remaining}
            isUnlimited={quota.isUnlimited}
          />
        ) as ReactElement,
      });

      if (success) sent++;
      else skipped++;
    }

    return NextResponse.json({
      success: true,
      sent,
      skipped,
      total: users.length,
    });
  } catch (error) {
    console.error("Monthly summary error:", error);
    return NextResponse.json(
      { error: "Failed to send monthly summary." },
      { status: 500 }
    );
  }
}
