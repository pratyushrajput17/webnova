"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useRouter } from "next/navigation";
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
  Ticket,
  History,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface QuotaInfo {
  used: number;
  limit: number;
  remaining: number;
  isUnlimited: boolean;
  resetDays: number;
}

interface RedeemEntry {
  code: string;
  plan: string;
  usedAt: string;
  expiresAt: string | null;
}

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
  audit: QuotaInfo;
  competitor: QuotaInfo;
  totalAudits: number;
  auditsThisMonth: number;
  competitorsTracked: number;
  redeemHistory: RedeemEntry[];
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

function QuotaBar({
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
  const pct = isUnlimited ? 0 : Math.min(100, Math.round((used / limit) * 100));
  const barColor =
    pct >= 95 ? "bg-red-500" : pct >= 80 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-zinc-400" />
        <span className="text-sm font-medium text-zinc-600">{label}</span>
      </div>
      {isUnlimited ? (
        <div className="mt-2 flex items-center gap-1.5 text-sm text-emerald-600">
          <Infinity className="h-4 w-4" />
          Unlimited
        </div>
      ) : (
        <div className="mt-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-zinc-800">{used} used</span>
            <span className="font-medium text-zinc-500">
              {remaining(used, limit)} remaining
            </span>
          </div>
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-zinc-200">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`h-full rounded-full ${barColor}`}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function remaining(used: number, limit: number): number {
  return Math.max(0, limit - used);
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
        <div className="mt-8 space-y-8">
          <div className="h-72 animate-pulse rounded-2xl border border-zinc-200 bg-white p-8" />
          <div className="h-48 animate-pulse rounded-2xl border border-zinc-200 bg-white p-8" />
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
                {data.isLifetime ? "Lifetime Expiration" : "Renewal Date"}
              </p>
              <p className="mt-1 text-lg font-semibold">
                {data.subscriptionEndsAt
                  ? formatDate(data.subscriptionEndsAt)
                  : data.isLifetime
                    ? "Lifetime access"
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
              <p className="mt-1 text-lg font-semibold">{data.totalAudits}</p>
            </div>
          </div>
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-sm text-zinc-500">Audits Used</p>
              <p className="mt-1 text-lg font-semibold">{data.audit.used}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-500">Audits Remaining</p>
              <p className="mt-1 text-lg font-semibold">
                {data.audit.isUnlimited ? "∞" : data.audit.remaining}
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-sm text-zinc-500">Competitor Analyses Used</p>
              <p className="mt-1 text-lg font-semibold">{data.competitor.used}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-500">Competitor Analyses Remaining</p>
              <p className="mt-1 text-lg font-semibold">
                {data.competitor.isUnlimited ? "∞" : data.competitor.remaining}
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
          <p className="text-sm text-zinc-500">No payment method added</p>
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
        <h2 className="text-xl font-semibold">Usage & Quota</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <QuotaBar
            label={`Audits (${data.audit.resetDays >= 365 ? "yearly" : "monthly"})`}
            used={data.audit.used}
            limit={data.audit.limit}
            isUnlimited={data.audit.isUnlimited}
            icon={FileText}
          />
          <QuotaBar
            label="Competitor analyses (monthly)"
            used={data.competitor.used}
            limit={data.competitor.limit}
            isUnlimited={data.competitor.isUnlimited}
            icon={Globe}
          />
        </div>
      </motion.div>

      {data.redeemHistory.length > 0 && (
        <motion.div
          custom={3}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="mt-8 rounded-2xl border border-zinc-200 bg-white p-8"
        >
          <h2 className="text-xl font-semibold">Redeem History</h2>
          <div className="mt-6 space-y-3">
            {data.redeemHistory.map((entry, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50/50 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <Ticket className="h-4 w-4 text-zinc-400" />
                  <div>
                    <p className="text-sm font-medium text-zinc-800">
                      {entry.code}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {entry.plan} plan
                      {entry.usedAt && ` — ${formatDate(entry.usedAt)}`}
                    </p>
                  </div>
                </div>
                {entry.expiresAt && (
                  <span className="text-xs text-zinc-400">
                    Expires {formatDate(entry.expiresAt)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
