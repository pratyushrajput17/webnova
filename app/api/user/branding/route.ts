import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const user = await getOrCreateUser(clerkUserId);

    const branding = await prisma.reportBranding.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json(branding || null);
  } catch (error) {
    console.error("Branding fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch branding." },
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

    const { companyName, logoUrl, preparedBy, websiteUrl, supportEmail } = body;

    const branding = await prisma.reportBranding.upsert({
      where: { userId: user.id },
      update: {
        companyName: companyName ?? null,
        logoUrl: logoUrl ?? null,
        preparedBy: preparedBy ?? null,
        websiteUrl: websiteUrl ?? null,
        supportEmail: supportEmail ?? null,
      },
      create: {
        userId: user.id,
        companyName: companyName ?? null,
        logoUrl: logoUrl ?? null,
        preparedBy: preparedBy ?? null,
        websiteUrl: websiteUrl ?? null,
        supportEmail: supportEmail ?? null,
      },
    });

    return NextResponse.json(branding);
  } catch (error) {
    console.error("Branding update error:", error);
    return NextResponse.json(
      { error: "Failed to update branding." },
      { status: 500 }
    );
  }
}
