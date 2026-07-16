"use client";

import { Suspense, useMemo, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Check,
  ArrowLeft,
  Search,
  GitCompare,
  FileText,
  FileDown,
  Clock,
  Headphones,
  Users,
  Sparkles,
  Package,
  Brain,
  Code2,
  UserCheck,
  Rocket,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { PLANS } from "@/lib/pricing";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const iconMap: Record<string, typeof Search> = {
  Search,
  GitCompare,
  FileText,
  FileDown,
  Clock,
  Headphones,
  Users,
  Sparkles,
  Package,
  Brain,
  Code2,
  UserCheck,
  Rocket,
};

function FeatureIcon({ name }: { name: string }) {
  const Icon = iconMap[name];
  if (!Icon) return null;
  return <Icon className="h-4 w-4 text-zinc-400" />;
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const planKey = searchParams.get("plan")?.toUpperCase() ?? "";

  const plan = useMemo(
    () => PLANS.find((p) => p.key === planKey),
    [planKey],
  );

  const handlePayment = useCallback(async () => {
    if (!plan) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: plan.key }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create order.");
      }

      const order = await res.json();

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        const options = {
          key: order.key_id,
          amount: order.amount,
          currency: order.currency,
          name: "WebNova",
          description: `${plan.name} Plan`,
          order_id: order.id,
          prefill: { contact: "", email: "" },
          theme: { color: "#18181b" },
          modal: {
            ondismiss: () => setLoading(false),
          },
          handler: async (response: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
          }) => {
            try {
              const verifyRes = await fetch("/api/payment/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  plan: plan.key,
                }),
              });

              if (!verifyRes.ok) {
                const errData = await verifyRes.json();
                throw new Error(errData.error || "Payment verification failed.");
              }

              router.push("/dashboard/billing?payment=success");
            } catch (err) {
              setError(
                err instanceof Error ? err.message : "Payment verification failed."
              );
              setLoading(false);
            }
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      };
      script.onerror = () => {
        setError("Failed to load payment gateway. Please try again.");
        setLoading(false);
      };
      document.body.appendChild(script);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
      setLoading(false);
    }
  }, [plan, router]);

  if (!plan) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-zinc-800">Plan not found</h2>
          <p className="mt-2 text-zinc-500">
            The plan you selected does not exist.
          </p>
          <button
            onClick={() => router.push("/#pricing")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-zinc-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Pricing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-4xl px-6 py-12 md:px-10 md:py-20">
        <button
          onClick={() => router.push("/#pricing")}
          className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Pricing
        </button>

        <div className="grid gap-10 lg:grid-cols-5">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-3"
          >
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 md:p-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">
                    Selected Plan
                  </p>
                  <h1 className="mt-2 text-3xl font-bold text-zinc-900">
                    {plan.name}
                  </h1>
                </div>
                {plan.badge && (
                  <span
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
                      plan.popular
                        ? "bg-zinc-900 text-white"
                        : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                    }`}
                  >
                    {plan.badge}
                  </span>
                )}
              </div>

              <div className="mt-8 flex items-baseline gap-2">
                <span className="text-5xl font-extrabold tracking-tight text-zinc-900">
                  {plan.price}
                </span>
                <span className="text-lg text-zinc-400">{plan.period}</span>
              </div>

              {plan.savings && (
                <span
                  className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                    plan.popular
                      ? "bg-zinc-100 text-zinc-700"
                      : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {plan.savings}
                </span>
              )}

              <div className="mt-8 h-px w-full bg-zinc-100" />

              <ul className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature.text} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-100">
                      <Check className="h-3 w-3 text-zinc-700" />
                    </span>
                    <span className="flex items-center gap-2 text-sm text-zinc-600">
                      <FeatureIcon name={feature.icon} />
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="lg:col-span-2"
          >
            <div className="rounded-2xl border border-zinc-200 bg-white p-8">
              <h2 className="text-lg font-semibold text-zinc-800">
                Complete Your Purchase
              </h2>
              <p className="mt-2 text-sm text-zinc-500">
                You are about to subscribe to the{" "}
                <span className="font-medium text-zinc-800">{plan.name}</span>{" "}
                plan.
              </p>

              <div className="mt-8 space-y-4">
                <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500">Plan</span>
                    <span className="font-medium text-zinc-800">
                      {plan.name}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-zinc-500">Price</span>
                    <span className="font-medium text-zinc-800">
                      {plan.price}
                      <span className="text-xs text-zinc-400">
                        {" "}
                        {plan.period}
                      </span>
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-zinc-900/20 transition-all hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {loading ? "Processing..." : "Proceed to Payment"}
                </button>

                <p className="text-center text-xs text-zinc-400">
                  Secure checkout powered by Razorpay
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6">
              <h3 className="text-sm font-semibold text-zinc-800">
                Need help deciding?
              </h3>
              <p className="mt-1 text-xs text-zinc-500">
                Contact our sales team for a personalized recommendation.
              </p>
              <a
                href="mailto:dev.webnovaseo@gmail.com?subject=WebNova%20Support%20Request"
                className="mt-4 flex w-full items-center justify-center rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
              >
                Contact Sales
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
