"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function FixProgressWidget() {
  const [progress, setProgress] = useState<{
    total: number;
    open: number;
    addressed: number;
    verifiedFixed: number;
    percent: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/fix-assistant/progress")
      .then((res) => setProgress(res.data.progress))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-zinc-200 bg-white p-6">
        <Loader2 className="h-5 w-5 animate-spin text-zinc-300" />
      </div>
    );
  }

  if (!progress || progress.total === 0) {
    return null;
  }

  const strokeDasharray = 2 * Math.PI * 36;
  const strokeDashoffset = strokeDasharray - (progress.percent / 100) * strokeDasharray;

  return (
    <Link href="/dashboard/fixes">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="group rounded-2xl border border-zinc-200 bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-800">
                Fix Progress
              </h3>
              <p className="text-xs text-zinc-500">
                {progress.addressed + progress.verifiedFixed} of{" "}
                {progress.total} done
              </p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-zinc-300 transition-colors group-hover:text-zinc-500" />
        </div>

        <div className="mt-4 flex items-center gap-4">
          <div className="relative shrink-0">
            <svg width="80" height="80" className="-rotate-90">
              <circle
                cx="40"
                cy="40"
                r="36"
                fill="none"
                stroke="#f4f4f5"
                strokeWidth="6"
              />
              <motion.circle
                cx="40"
                cy="40"
                r="36"
                fill="none"
                stroke="#10b981"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={strokeDasharray}
                initial={{ strokeDashoffset: strokeDasharray }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-base font-bold text-zinc-800">
                {progress.percent}%
              </span>
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500">Open</span>
              <span className="font-medium text-zinc-700">{progress.open}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500">Addressed</span>
              <span className="font-medium text-amber-600">
                {progress.addressed}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500">Verified Fixed</span>
              <span className="font-medium text-emerald-600">
                {progress.verifiedFixed}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
