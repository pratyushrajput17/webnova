import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import axios from "axios";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";
import {
  validateUrl,
  normalizeUrl,
  analyzeWebsite,
} from "@/lib/audit";
import { checkAuditQuota, needsReset, getAuditResetDays } from "@/lib/quota";

function normalizeJsonField(val: unknown) {
  if (val === null || val === undefined) return [];
  if (Array.isArray(val)) return val;
  try {
    const parsed = typeof val === "string" ? JSON.parse(val) : val;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
import type { Prisma } from "@/lib/generated/prisma/client";
import type { ReactElement } from "react";

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    let body: { url?: string };
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

    const targetUrl = normalizeUrl(body.url ?? "");

    let user;
    try {
      user = await getOrCreateUser(clerkUserId);
    } catch {
      return NextResponse.json(
        { error: "Failed to verify user." },
        { status: 500 }
      );
    }

    let currentCount = user.monthlyAuditCount;
    let currentReset = user.lastResetDate;
    const resetDays = getAuditResetDays(user.plan);

    if (needsReset(currentReset, resetDays)) {
      currentCount = 0;
      currentReset = new Date();
      await prisma.user.update({
        where: { id: user.id },
        data: { monthlyAuditCount: 0, lastResetDate: currentReset },
      });
    }

    const quota = checkAuditQuota(user.plan, currentCount);
    if (!quota.withinQuota) {
      const periodLabel = resetDays >= 365 ? "yearly" : "monthly";
      return NextResponse.json(
        {
          error: `You have reached your ${periodLabel} audit limit.`,
          code: "QUOTA_EXCEEDED",
          limit: quota.limit,
          used: quota.used,
          plan: user.plan,
        },
        { status: 403 }
      );
    }

    let auditResult;
    try {
      auditResult = await analyzeWebsite(targetUrl);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNABORTED") {
          return NextResponse.json(
            { error: "Website took too long to respond. Please try again." },
            { status: 504 }
          );
        }
        if (error.code === "ENOTFOUND" || error.code === "EAI_AGAIN") {
          return NextResponse.json(
            {
              error:
                "Website could not be found. Check the URL and try again.",
            },
            { status: 404 }
          );
        }
        if (error.response) {
          return NextResponse.json(
            {
              error: `Website returned status ${error.response.status}. Try a different URL.`,
            },
            { status: 502 }
          );
        }
      }
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Website could not be analyzed. Please try again.",
        },
        { status: 500 }
      );
    }

    console.log("[AUDIT CREATE] Extracted data:", JSON.stringify({
      h1Count: auditResult.h1Count,
      h1TagsCount: auditResult.h1Tags?.length ?? 0,
      internalLinks: auditResult.internalLinks,
      internalLinksDataCount: auditResult.internalLinksData?.length ?? 0,
      externalLinks: auditResult.externalLinks,
      externalLinksDataCount: auditResult.externalLinksData?.length ?? 0,
      imageCount: auditResult.imageCount,
      imagesDataCount: auditResult.imagesData?.length ?? 0,
      missingAltCount: auditResult.missingAltCount,
      missingAltImagesCount: auditResult.missingAltImages?.length ?? 0,
      titleLength: auditResult.titleLength,
      metaDescriptionLength: auditResult.metaDescriptionLength,
    }));

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
      };
      console.log("[AUDIT CREATE] Saving to DB:", JSON.stringify({
        h1TagsLength: Array.isArray(auditResult.h1Tags) ? auditResult.h1Tags.length : 0,
        internalLinksDataLength: Array.isArray(auditResult.internalLinksData) ? auditResult.internalLinksData.length : 0,
        externalLinksDataLength: Array.isArray(auditResult.externalLinksData) ? auditResult.externalLinksData.length : 0,
        imagesDataLength: Array.isArray(auditResult.imagesData) ? auditResult.imagesData.length : 0,
        missingAltImagesLength: Array.isArray(auditResult.missingAltImages) ? auditResult.missingAltImages.length : 0,
      }));
      audit = await prisma.audit.create({ data: createData });
      console.log("[AUDIT CREATE] Saved successfully, ID:", audit.id);

      const savedH1Tags = normalizeJsonField(audit.h1Tags);
      const savedImagesData = normalizeJsonField(audit.imagesData);
      const savedMissingAlt = normalizeJsonField(audit.missingAltImages);
      const savedInternalLinks = normalizeJsonField(audit.internalLinksData);
      const savedExternalLinks = normalizeJsonField(audit.externalLinksData);

      const checks = [
        { metric: "h1Count", count: audit.h1Count, actual: savedH1Tags.length },
        { metric: "imageCount", count: audit.imageCount, actual: savedImagesData.length },
        { metric: "missingAltCount", count: audit.missingAltCount, actual: savedMissingAlt.length },
        { metric: "internalLinks", count: audit.internalLinks, actual: savedInternalLinks.length },
        { metric: "externalLinks", count: audit.externalLinks, actual: savedExternalLinks.length },
      ];

      const mismatches = checks.filter((c) => c.count !== c.actual);
      if (mismatches.length > 0) {
        console.warn("[AUDIT INTEGRITY] Mismatches found:", mismatches);
      } else {
        console.log("[AUDIT INTEGRITY] All summary counts match detail array lengths");
      }
    } catch (dbError) {
      console.error("Audit save failed:", dbError);
      return NextResponse.json(auditResult);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { monthlyAuditCount: { increment: 1 } },
    });

    import("@/lib/notifications").then(({ createNotification }) => {
      createNotification(
        user.id,
        "Audit Completed",
        `SEO score: ${auditResult.seoScore} — ${targetUrl}`,
        "audit_completed",
        `/dashboard/history/${audit.id}`
      );
    }).catch(() => {});

    if (user.email && !user.email.endsWith("@placeholder.com")) {
      const auditUrl = `https://webnova.dev/dashboard/history/${audit.id}`;
      (async () => {
        try {
          const [mod, Email] = await Promise.all([
            import("@/lib/email"),
            import("@/emails/AuditCompletedEmail"),
          ]);
          await mod.sendEmail({
            to: user.email,
            subject: `Audit complete for ${targetUrl}`,
            react: (
              <Email.default
                name={user.name ?? ""}
                websiteUrl={targetUrl}
                seoScore={auditResult.seoScore}
                performanceScore={auditResult.performanceScore}
                accessibilityScore={auditResult.accessibilityScore}
                reportUrl={auditUrl}
              />
            ) as ReactElement,
          });
        } catch {}
      })();
    }

    return NextResponse.json(audit);
  } catch (error) {
    console.error("Audit error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
