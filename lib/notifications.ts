import { prisma } from "@/lib/prisma";

type NotificationType = "audit_completed" | "plan_upgraded" | "redeem_success" | "admin_announcement" | "monthly_report";

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: NotificationType,
  link?: string
) {
  try {
    return await prisma.notification.create({
      data: { userId, title, message, type, link },
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
}

export async function createNotificationForAllUsers(
  title: string,
  message: string,
  type: NotificationType,
  link?: string
) {
  try {
    const users = await prisma.user.findMany({
      select: { id: true },
    });

    await prisma.notification.createMany({
      data: users.map((u) => ({
        userId: u.id,
        title,
        message,
        type,
        link,
      })),
    });

    return users.length;
  } catch (error) {
    console.error("Failed to broadcast notification:", error);
    return 0;
  }
}
