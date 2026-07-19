"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Zap,
  Crown,
  Sparkles,
  Infinity,
  Loader2,
  ChevronRight,
  Globe,
  FileText,
} from "lucide-react";

interface QuotaInfo {
  used: number;
  limit: number;
  remaining: number;
  isUnlimited: boolean;
  withinQuota: boolean;
}

interface UsageData {
  plan: string;
  audit: QuotaInfo;
  competitor: QuotaInfo;
}

const planLabels: Record<string, string> = {
  FREE: "Free",
  STARTER: "Starter",
  PRO: "Professional",
  LIFETIME: "Lifetime Access",
  ENTERPRISE: "Enterprise",
};

const planIcons: Record<string, typeof BarChart3> = {
  FREE: BarChart3,
  STARTER: Zap,
  PRO: Crown,
  LIFETIME: Sparkles,
  ENTERPRISE: Crown,
};

function ProgressBar({
  used,
  limit,
  isUnlimited,
  label,
  icon: Icon,
}: {
  used: number;
  limit: number;
  isUnlimited: boolean;
  label: string;
  icon: typeof Zap;
}) {
  const pct = isUnlimited ? 0 : Math.min(100, Math.round((used / limit) * 100));
  const isWarning = pct >= 80 && pct < 95;
  const isCritical = pct >= 95;
  const barColor = isCritical
    ? "bg-red-500"
    : isWarning
      ? "bg-amber-500"
      : "bg-emerald-500";

  return (
    <div className="flex-1">
      <div className="flex items-center gap-2 text-sm">
        <Icon className="h-4 w-4 text-zinc-400" />
        <span className="font-medium text-zinc-600">{label}</span>
      </div>
      {isUnlimited ? (
        <div className="mt-2 flex items-center gap-1.5 text-sm text-emerald-600">
          <Infinity className="h-4 w-4" />
          Unlimited
        </div>
      ) : (
        <div className="mt-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-zinc-800">
              {used} / {limit}
            </span>
            <span
              className={
                isCritical
                  ? "font-medium text-red-600"
                  : isWarning
                    ? "font-medium text-amber-600"
                    : "font-medium text-emerald-600"
              }
            >
              {remaining(used, limit)} remaining
            </span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-zinc-100">
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

const resetLabels: Record<string, string> = {
  FREE: "monthly",
  STARTER: "yearly",
  PRO: "",
  LIFETIME: "",
};

export default function UsageCard() {
  const router = useRouter();
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const res = await axios.get("/api/user/usage");
        setUsage(res.data);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchUsage();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div className="h-5 w-32 animate-pulse rounded bg-zinc-100" />
          <div className="h-5 w-20 animate-pulse rounded-full bg-zinc-100" />
        </div>
        <div className="mt-4 flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
        </div>
      </div>
    );
  }

  if (!usage) return null;

  const Icon = planIcons[usage.plan] || BarChart3;

  const planBgColor =
    usage.plan === "FREE"
      ? "bg-zinc-100"
      : usage.plan === "STARTER"
        ? "bg-blue-50"
        : usage.plan === "LIFETIME"
          ? "bg-emerald-50"
          : usage.plan === "PRO"
            ? "bg-indigo-50"
            : "bg-amber-50";

  const planIconColor =
    usage.plan === "FREE"
      ? "text-zinc-500"
      : usage.plan === "STARTER"
        ? "text-blue-600"
        : usage.plan === "LIFETIME"
          ? "text-emerald-600"
          : usage.plan === "PRO"
            ? "text-indigo-600"
            : "text-amber-600";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-zinc-200 bg-white p-5 transition-all duration-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${planBgColor}`}
          >
            <Icon className={`h-5 w-5 ${planIconColor}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500">Current Plan</p>
            <p className="text-lg font-bold text-zinc-800">
              {planLabels[usage.plan] || usage.plan}
            </p>
          </div>
        </div>
        {usage.plan === "FREE" && (
          <button
            onClick={() => router.push("/pricing/checkout?plan=FREE")}
            className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100"
          >
            Upgrade
            <ChevronRight className="h-3 w-3" />
          </button>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-6 sm:flex-row">
        <ProgressBar
          used={usage.audit.used}
          limit={usage.audit.limit}
          isUnlimited={usage.audit.isUnlimited}
          label={`Audits (${resetLabels[usage.plan] || "unlimited"})`}
          icon={FileText}
        />
        <ProgressBar
          used={usage.competitor.used}
          limit={usage.competitor.limit}
          isUnlimited={usage.competitor.isUnlimited}
          label="Competitor analyses (monthly)"
          icon={Globe}
        />
      </div>
    </motion.div>
  );
}
