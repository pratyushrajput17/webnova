import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function getOrCreateUser(clerkUserId: string) {
  let user = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
  });

  if (user) return user;

  console.log(`[getOrCreateUser] No user found for clerkId=${clerkUserId}, creating new user...`);

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
  } catch (err) {
    console.warn(`[getOrCreateUser] Clerk API error for clerkId=${clerkUserId}:`, err);
  }

  try {
    user = await prisma.user.create({
      data: {
        clerkId: clerkUserId,
        email,
        name,
      },
    });
    console.log(`[getOrCreateUser] Created user id=${user.id} email=${email}`);
  } catch (err) {
    console.error(`[getOrCreateUser] DB create failed for clerkId=${clerkUserId}:`, err);
    throw err;
  }

  if (email && !email.endsWith("@placeholder.com")) {
    import("@/lib/email").then(({ sendEmail }) => {
      import("@/emails/WelcomeEmail").then(({ default: WelcomeEmail }) => {
        sendEmail({
          to: email,
          subject: "Welcome to WebNova!",
          react: <WelcomeEmail name={name ?? ""} />,
        });
      });
    }).catch((err) => {
      console.error(`[getOrCreateUser] Welcome email failed for ${email}:`, err);
    });
  }

  return user;
}
