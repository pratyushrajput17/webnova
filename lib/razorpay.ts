import Razorpay from "razorpay";

function getAmount(planKey: string): number {
  const prices: Record<string, number> = {
    STARTER: 1000,
    PRO: 2900,
    LIFETIME: 8300,
  };
  return prices[planKey] ?? 0;
}

function getReceipt(planKey: string): string {
  return `${planKey.toLowerCase()}_${Date.now()}`;
}

export function getPlanDuration(planKey: string): number | null {
  if (planKey === "LIFETIME") return null;
  return 365;
}

export { getAmount, getReceipt };

export function getRazorpayInstance() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error("Razorpay keys not configured");
  }

  return new Razorpay({ key_id, key_secret });
}
