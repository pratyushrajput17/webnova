"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  BarChart3,
  Zap,
  Crown,
  Sparkles,
  Infinity,
  Loader2,
  ChevronRight,
} from "lucide-react";

interface UsageData {
  plan: string;
  used: number;
  limit: number;
  remaining: number;
  isUnlimited: boolean;
  withinQuota: boolean;
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

function getUsagePercent(used: number, limit: number, isUnlimited: boolean): number {
  if (isUnlimited) return 0;
  if (limit <= 0) return 100;
  return Math.min(100, Math.round((used / limit) * 100));
}

function getProgressColor(pct: number): string {
  if (pct >= 90) return "bg-red-500";
  if (pct >= 70) return "bg-amber-500";
  return "bg-emerald-500";
}

function getProgressTrackColor(pct: number): string {
  if (pct >= 90) return "bg-red-100";
  if (pct >= 70) return "bg-amber-100";
  return "bg-emerald-100";
}

export default function UsageCard() {
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
  const pct = getUsagePercent(usage.used, usage.limit, usage.isUnlimited);
  const isWarning = pct >= 70 && pct < 90;
  const isCritical = pct >= 90;
  const borderColor = isCritical
    ? "border-red-200"
    : isWarning
      ? "border-amber-200"
      : "border-zinc-200";

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
      className={`rounded-2xl border bg-white p-5 transition-all duration-300 hover:shadow-md ${borderColor}`}
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
            onClick={() => {}} // TODO: link to pricing
            className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100"
          >
            Upgrade
            <ChevronRight className="h-3 w-3" />
          </button>
        )}
      </div>

      <div className="mt-4">
        {usage.isUnlimited ? (
          <div className="flex items-center gap-2 rounded-xl bg-zinc-50 px-4 py-3">
            <Infinity className="h-5 w-5 text-zinc-400" />
            <span className="text-sm font-medium text-zinc-700">
              Unlimited audits
            </span>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-zinc-700">
                {usage.used} / {usage.limit} audits used
              </span>
              <span
                className={`font-medium ${
                  isCritical
                    ? "text-red-600"
                    : isWarning
                      ? "text-amber-600"
                      : "text-emerald-600"
                }`}
              >
                {usage.remaining} remaining
              </span>
            </div>
            <div
              className={`mt-2 h-2 w-full overflow-hidden rounded-full ${getProgressTrackColor(pct)}`}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full rounded-full ${getProgressColor(pct)}`}
              />
            </div>
            {isCritical && (
              <p className="mt-2 text-xs text-red-600">
                You have reached your monthly audit limit.
              </p>
            )}
            {isWarning && !isCritical && (
              <p className="mt-2 text-xs text-amber-600">
                You are running low on monthly audits.
              </p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
