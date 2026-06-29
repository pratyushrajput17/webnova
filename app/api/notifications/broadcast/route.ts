import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { createNotificationForAllUsers } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    let body: { title?: string; message?: string; link?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    if (!body.title || !body.message) {
      return NextResponse.json(
        { error: "Title and message are required." },
        { status: 400 }
      );
    }

    const count = await createNotificationForAllUsers(
      body.title,
      body.message,
      "admin_announcement",
      body.link
    );

    return NextResponse.json({ success: true, sentTo: count });
  } catch (err) {
    console.error("Broadcast error:", err);
    return NextResponse.json(
      { error: "Failed to send broadcast." },
      { status: 500 }
    );
  }
}
