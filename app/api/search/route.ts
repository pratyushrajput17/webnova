import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const user = await getOrCreateUser(clerkUserId);
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();

    if (!q || q.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const isAdmin = user.role === "ADMIN";

    const [audits, competitors, redeemedCodes, users] = await Promise.all([
      prisma.audit.findMany({
        where: {
          userId: user.id,
          OR: [
            { websiteUrl: { contains: q, mode: "insensitive" } },
            { pageTitle: { contains: q, mode: "insensitive" } },
          ],
        },
        select: { id: true, websiteUrl: true, pageTitle: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.competitorComparison.findMany({
        where: {
          userId: user.id,
          OR: [
            { yourSite: { contains: q, mode: "insensitive" } },
            { competitorSite: { contains: q, mode: "insensitive" } },
          ],
        },
        select: { id: true, yourSite: true, competitorSite: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.redeemCode.findMany({
        where: {
          isUsed: true,
          usedBy: user.id,
          code: { contains: q, mode: "insensitive" },
        },
        select: { code: true, plan: true, usedAt: true },
        orderBy: { usedAt: "desc" },
        take: 5,
      }),
      isAdmin
        ? prisma.user.findMany({
            where: {
              OR: [
                { email: { contains: q, mode: "insensitive" } },
                { name: { contains: q, mode: "insensitive" } },
              ],
            },
            select: { id: true, email: true, name: true, role: true },
            take: 5,
          })
        : Promise.resolve([]),
    ]);

    const results: {
      id: string;
      label: string;
      description: string;
      href: string;
      badge?: string;
    }[] = [];

    audits.forEach((a) => {
      results.push({
        id: a.id,
        label: a.pageTitle || a.websiteUrl,
        description: a.websiteUrl,
        href: `/dashboard/history/${a.id}`,
        badge: "Audit",
      });
    });

    competitors.forEach((c) => {
      results.push({
        id: c.id,
        label: `${c.yourSite} vs ${c.competitorSite}`,
        description: new Date(c.createdAt).toLocaleDateString(),
        href: `/dashboard/competitors`,
        badge: "Competitor",
      });
    });

    redeemedCodes.forEach((r) => {
      results.push({
        id: r.code,
        label: r.code,
        description: `${r.plan} — ${r.usedAt ? new Date(r.usedAt).toLocaleDateString() : ""}`,
        href: `/dashboard/redeem`,
        badge: r.plan,
      });
    });

    users.forEach((u) => {
      results.push({
        id: u.id,
        label: u.name || u.email,
        description: u.email,
        href: `/admin/users`,
        badge: "User",
      });
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ results: [] });
  }
}
