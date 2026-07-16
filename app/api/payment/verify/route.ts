import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";
import { getPlanDuration } from "@/lib/razorpay";

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !plan) {
      return NextResponse.json({ error: "Missing payment details." }, { status: 400 });
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_secret) {
      return NextResponse.json({ error: "Payment not configured." }, { status: 500 });
    }

    const expectedSign = crypto
      .createHmac("sha256", key_secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSign !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature." }, { status: 400 });
    }

    const user = await getOrCreateUser(clerkUserId);

    const duration = getPlanDuration(plan);
    const endsAt = duration ? new Date(Date.now() + duration * 86400000) : null;

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          plan,
          subscriptionEndsAt: endsAt,
        },
      }),
      prisma.userSubscription.create({
        data: {
          userId: user.id,
          plan,
          status: "active",
          endsAt,
          isLifetime: plan === "LIFETIME",
        },
      }),
    ]);

    return NextResponse.json({ success: true, plan });
  } catch (error) {
    console.error("Payment verify error:", error);
    return NextResponse.json(
      { error: "Failed to verify payment." },
      { status: 500 }
    );
  }
}
