import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getRazorpayInstance, getAmount, getReceipt } from "@/lib/razorpay";

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const planKey = body.plan?.toUpperCase();

    if (!planKey || !["STARTER", "PRO", "LIFETIME"].includes(planKey)) {
      return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
    }

    const amount = getAmount(planKey);
    if (amount <= 0) {
      return NextResponse.json({ error: "Invalid plan amount." }, { status: 400 });
    }

    const razorpay = getRazorpayInstance();

    const order = await razorpay.orders.create({
      amount,
      currency: "USD",
      receipt: getReceipt(planKey),
      notes: { plan: planKey, clerkUserId },
    });

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Create order error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create payment order.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
