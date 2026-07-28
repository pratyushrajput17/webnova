import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";
import { getDefaultThresholds } from "@/lib/change-detection";
import type { Prisma } from "@/lib/generated/prisma/client";

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const user = await getOrCreateUser(clerkUserId);

    const preferences = await prisma.alertPreference.findMany({
      where: { userId: user.id },
    });

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error("[ALERT_PREFERENCES] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch alert preferences." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const user = await getOrCreateUser(clerkUserId);

    const body = await request.json();
    const {
      websiteUrl,
      emailAlerts,
      improvementAlerts,
      notificationEmail,
      thresholds,
    } = body;

    if (!websiteUrl) {
      return NextResponse.json(
        { error: "Website URL is required." },
        { status: 400 }
      );
    }

    const existing = await prisma.alertPreference.findUnique({
      where: { userId_websiteUrl: { userId: user.id, websiteUrl } },
    });

    const data: Prisma.AlertPreferenceUpdateInput = {};

    if (emailAlerts !== undefined) data.emailAlerts = emailAlerts;
    if (improvementAlerts !== undefined) data.improvementAlerts = improvementAlerts;
    if (notificationEmail !== undefined) {
      if (notificationEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(notificationEmail)) {
        return NextResponse.json(
          { error: "Invalid email address." },
          { status: 400 }
        );
      }
      data.notificationEmail = notificationEmail || null;
    }
    if (thresholds !== undefined) {
      const merged = { ...getDefaultThresholds(), ...thresholds };
      data.thresholds = merged as Prisma.InputJsonValue;
    }

    let preference;
    if (existing) {
      preference = await prisma.alertPreference.update({
        where: { id: existing.id },
        data,
      });
    } else {
      const thresholdsData = {
        ...getDefaultThresholds(),
        ...(thresholds || {}),
      };
      preference = await prisma.alertPreference.create({
        data: {
          userId: user.id,
          websiteUrl,
          emailAlerts: emailAlerts ?? true,
          improvementAlerts: improvementAlerts ?? false,
          notificationEmail: notificationEmail ?? null,
          thresholds: thresholdsData as Prisma.InputJsonValue,
        },
      });
    }

    return NextResponse.json(preference);
  } catch (error) {
    console.error("[ALERT_PREFERENCES] PUT error:", error);
    return NextResponse.json(
      { error: "Failed to save alert preferences." },
      { status: 500 }
    );
  }
}
