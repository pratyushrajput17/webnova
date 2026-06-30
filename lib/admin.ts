import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function requireAdmin() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return { error: NextResponse.json({ error: "Unauthorized." }, { status: 401 }), user: null };
  }

  let user = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });

  if (!user) {
    let email = `${clerkUserId}@placeholder.com`;
    let name: string | undefined;
    const role = "FREE";

    try {
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(clerkUserId);
      const primaryEmail = clerkUser.emailAddresses.find(
        (e) => e.id === clerkUser.primaryEmailAddressId
      );
      if (primaryEmail?.emailAddress) {
        email = primaryEmail.emailAddress;
      }
      if (clerkUser.firstName || clerkUser.lastName) {
        name = [clerkUser.firstName, clerkUser.lastName]
          .filter(Boolean)
          .join(" ");
      }
    } catch {}

    user = await prisma.user.create({
      data: { clerkId: clerkUserId, email, name, role },
    });
  }

  if (user.role !== "ADMIN") {
    return { error: NextResponse.json({ error: "Forbidden." }, { status: 403 }), user: null };
  }

  return { error: null, user };
}
