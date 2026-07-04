"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  CreditCard,
  CheckCircle2,
  ArrowUpRight,
  Zap,
  Globe,
  FileText,
  Loader2,
  AlertTriangle,
  Infinity,
  Crown,
  Calendar,
  Hash,
  ExternalLink,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface BillingData {
  plan: string;
  planName: string;
  planPrice: string | null;
  planPeriod: string | null;
  status: string;
  subscriptionStart: string;
  subscriptionEndsAt: string | null;
  isLifetime: boolean;
  redeemedCode: string | null;
  usage: {
    auditsUsed: number;
    auditsLimit: number;
    auditsRemaining: number;
    auditsIsUnlimited: boolean;
    totalAudits: number;
    competitorsTracked: number;
    reportsGenerated: number;
  };
  paymentMethod: null;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.1 },
  }),
};

function UsageStat({
  label,
  used,
  limit,
  isUnlimited,
  icon: Icon,
}: {
  label: string;
  used: number;
  limit: number;
  isUnlimited: boolean;
  icon: typeof Zap;
}) {
  const percentage = isUnlimited
    ? 0
    : limit > 0
      ? Math.round((used / limit) * 100)
      : 0;
  const barColor =
    percentage >= 80
      ? "bg-red-500"
      : percentage >= 60
        ? "bg-amber-500"
        : "bg-emerald-500";

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100">
            <Icon className="h-5 w-5 text-zinc-600" />
          </div>
          <div>
            <p className="text-sm text-zinc-500">{label}</p>
            <p className="text-2xl font-bold">
              {used}
              {!isUnlimited && limit > 0 && (
                <span className="text-base font-normal text-zinc-400">
                  {" "}
                  / {limit}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
      {isUnlimited ? (
        <div className="mt-4 flex items-center gap-1.5 text-sm text-emerald-600">
          <Infinity className="h-4 w-4" />
          Unlimited
        </div>
      ) : (
        <div className="mt-4 space-y-1.5">
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(percentage, 100)}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`h-full rounded-full ${barColor}`}
            />
          </div>
          <div className="flex justify-between text-xs text-zinc-400">
            <span>{used} used</span>
            <span>{Math.max(0, limit - used)} remaining</span>
          </div>
        </div>
      )}
    </div>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BillingPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded: clerkLoaded } = useUser();
  const [data, setData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBilling = async () => {
      try {
        const res = await axios.get("/api/user/billing");
        setData(res.data);
      } catch {
        setError("Failed to load billing information.");
      } finally {
        setLoading(false);
      }
    };
    fetchBilling();
  }, []);

  const handleUpgrade = () => {
    if (!clerkLoaded) return;
    const currentPlan = data?.plan || "FREE";
    router.push(`/pricing/checkout?plan=${currentPlan}`);
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold">Billing & Subscription</h1>
        <p className="mt-2 text-zinc-600">
          Manage your subscription and billing information.
        </p>
        <div className="mt-8 grid animate-pulse gap-8 lg:grid-cols-3">
          <div className="h-72 rounded-2xl border border-zinc-200 bg-white p-8 lg:col-span-2">
            <div className="h-6 w-48 rounded bg-zinc-100" />
            <div className="mt-6 h-4 w-24 rounded bg-zinc-100" />
            <div className="mt-2 h-8 w-40 rounded bg-zinc-100" />
            <div className="my-6 h-px bg-zinc-200" />
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <div className="h-4 w-20 rounded bg-zinc-100" />
                <div className="mt-2 h-6 w-28 rounded bg-zinc-100" />
              </div>
              <div>
                <div className="h-4 w-28 rounded bg-zinc-100" />
                <div className="mt-2 h-6 w-36 rounded bg-zinc-100" />
              </div>
            </div>
          </div>
          <div className="h-72 rounded-2xl border border-zinc-200 bg-white p-8">
            <div className="h-6 w-40 rounded bg-zinc-100" />
            <div className="mt-4 h-4 w-56 rounded bg-zinc-100" />
            <div className="my-6 h-px bg-zinc-200" />
            <div className="h-4 w-36 rounded bg-zinc-100" />
            <div className="mt-6 h-10 w-full rounded-xl bg-zinc-100" />
          </div>
        </div>
        <div className="mt-8 h-48 rounded-2xl border border-zinc-200 bg-white p-8">
          <div className="h-6 w-40 rounded bg-zinc-100" />
        </div>
      </motion.div>
    );
  }

  if (error || !data) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
          <AlertTriangle className="h-8 w-8 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-800">
          Failed to load billing info
        </h2>
        <p className="mt-2 text-zinc-500">
          {error || "An unexpected error occurred."}
        </p>
      </motion.div>
    );
  }

  const { usage } = data;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-3xl font-bold">Billing & Subscription</h1>
      <p className="mt-2 text-zinc-600">
        Manage your subscription and billing information.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <motion.div
          custom={0}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="rounded-2xl border border-zinc-200 bg-white p-8 lg:col-span-2"
        >
          <h2 className="text-xl font-semibold">Subscription Overview</h2>
          <div className="mt-6 flex items-start justify-between">
            <div>
              <p className="text-sm text-zinc-500">Current Plan</p>
              <p className="mt-1 text-3xl font-bold">{data.planName}</p>
              {data.redeemedCode && (
                <p className="mt-1 text-xs text-zinc-400">
                  Activated via code: {data.redeemedCode}
                </p>
              )}
            </div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium ${
                data.status === "Active"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              {data.status}
            </span>
          </div>
          <Separator className="my-6" />
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-sm text-zinc-500">Plan Price</p>
              <p className="mt-1 text-lg font-semibold">
                {data.planPrice
                  ? `${data.planPrice}${data.planPeriod ? ` ${data.planPeriod}` : ""}`
                  : "Free"}
              </p>
            </div>
            <div>
              <p className="text-sm text-zinc-500">
                {data.isLifetime ? "Expiration" : "Next Billing Date"}
              </p>
              <p className="mt-1 text-lg font-semibold">
                {data.isLifetime
                  ? data.subscriptionEndsAt
                    ? `Expires in 5 years`
                    : "Lifetime access"
                  : data.subscriptionEndsAt
                    ? formatDate(data.subscriptionEndsAt)
                    : "—"}
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-sm text-zinc-500">Subscription Start</p>
              <p className="mt-1 text-lg font-semibold">
                {formatDate(data.subscriptionStart)}
              </p>
            </div>
            <div>
              <p className="text-sm text-zinc-500">Reports Generated</p>
              <p className="mt-1 text-lg font-semibold">
                {usage.reportsGenerated}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => router.push("/dashboard/history")}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-6 py-2.5 text-sm font-medium transition-colors hover:bg-zinc-100"
            >
              View Invoices
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>

        <motion.div
          custom={1}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="rounded-2xl border border-zinc-200 bg-white p-8"
        >
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Payment Method</h2>
          </div>
          <p className="mt-2 text-sm text-zinc-500">
            {data.plan === "FREE"
              ? "You are currently on the Free plan."
              : `You are on the ${data.planName} plan.`}
          </p>
          <Separator className="my-6" />
          {data.paymentMethod === null ? (
            <>
              <p className="text-sm text-zinc-500">No payment method added</p>
              <p className="mt-1 text-sm font-medium">
                {data.plan === "FREE"
                  ? "Upgrade to unlock premium features"
                  : "Contact sales to update payment method"}
              </p>
            </>
          ) : (
            <p className="text-sm text-zinc-500">Payment method on file</p>
          )}
          {data.plan !== "LIFETIME" && (
            <button
              onClick={handleUpgrade}
              className="mt-6 w-full rounded-xl bg-black px-6 py-2.5 text-sm font-medium text-white transition-all hover:opacity-90"
            >
              {data.plan === "FREE" ? "Upgrade Plan" : "Manage Plan"}
            </button>
          )}
        </motion.div>
      </div>

      <motion.div
        custom={2}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="mt-8 rounded-2xl border border-zinc-200 bg-white p-8"
      >
        <h2 className="text-xl font-semibold">Usage Statistics</h2>
        <div className="mt-6 grid gap-8 sm:grid-cols-3">
          <UsageStat
            label="Audits Used (This Month)"
            used={usage.auditsUsed}
            limit={usage.auditsLimit}
            isUnlimited={usage.auditsIsUnlimited}
            icon={Zap}
          />
          <UsageStat
            label="Competitors Tracked"
            used={usage.competitorsTracked}
            limit={-1}
            isUnlimited={true}
            icon={Globe}
          />
          <UsageStat
            label="Reports Generated"
            used={usage.reportsGenerated}
            limit={-1}
            isUnlimited={true}
            icon={FileText}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
