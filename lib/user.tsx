import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function getOrCreateUser(clerkUserId: string) {
  let user = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
  });

  if (user) return user;

  let email = `${clerkUserId}@placeholder.com`;
  let name: string | undefined;

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
  } catch {
    // fallback to placeholder email when Clerk API is unavailable
  }

  user = await prisma.user.create({
    data: {
      clerkId: clerkUserId,
      email,
      name,
    },
  });

  if (email && !email.endsWith("@placeholder.com")) {
    import("@/lib/email").then(({ sendEmail }) => {
      import("@/emails/WelcomeEmail").then(({ default: WelcomeEmail }) => {
        sendEmail({
          to: email,
          subject: "Welcome to WebNova!",
          react: <WelcomeEmail name={name ?? ""} />,
        });
      });
    }).catch(() => {});
  }

  return user;
}
