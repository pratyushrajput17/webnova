"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  Loader2,
} from "lucide-react";

interface WebsiteProgress {
  domain: string;
  latestScore: number;
  scoreChange: number | null;
  totalAudits: number;
  lastAuditedAt: string;
}

function getScoreColor(score: number): string {
  if (score >= 90) return "text-emerald-600";
  if (score >= 70) return "text-amber-600";
  return "text-red-600";
}

function getScoreBg(score: number): string {
  if (score >= 90) return "bg-emerald-50 border-emerald-200";
  if (score >= 70) return "bg-amber-50 border-amber-200";
  return "bg-red-50 border-red-200";
}

export default function ProgressCard() {
  const [websites, setWebsites] = useState<WebsiteProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("/api/audit/history/websites");
        setWebsites(res.data.websites.slice(0, 5));
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold">SEO Progress</h2>
        <div className="mt-6 flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
        </div>
      </div>
    );
  }

  if (websites.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold">SEO Progress</h2>
        <div className="mt-6 rounded-xl bg-zinc-50 px-6 py-8 text-center">
          <p className="text-sm text-zinc-500">
            Run multiple audits on the same website to track your SEO progress.
          </p>
          <Link
            href="/dashboard/audits"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-black hover:underline"
          >
            Start auditing
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">SEO Progress</h2>
        <Link
          href="/dashboard/history"
          className="text-sm font-medium text-zinc-500 transition-colors hover:text-black"
        >
          View all
        </Link>
      </div>

      <div className="mt-5 space-y-3">
        {websites.map((w) => (
          <Link
            key={w.domain}
            href={`/dashboard/history/sites/${encodeURIComponent(w.domain)}`}
            className="group flex items-center justify-between rounded-xl border border-zinc-100 px-4 py-3 transition-all hover:border-zinc-200 hover:bg-zinc-50"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-zinc-700 group-hover:text-black">
                {w.domain}
              </p>
              <p className="mt-0.5 text-xs text-zinc-400">
                {w.totalAudits} audit{w.totalAudits !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-sm font-semibold ${getScoreBg(w.latestScore)} ${getScoreColor(w.latestScore)}`}
              >
                {w.latestScore}
              </span>
              {w.scoreChange !== null && (
                <span
                  className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
                    w.scoreChange > 0
                      ? "text-emerald-600"
                      : w.scoreChange < 0
                        ? "text-red-600"
                        : "text-zinc-400"
                  }`}
                >
                  {w.scoreChange > 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : w.scoreChange < 0 ? (
                    <TrendingDown className="h-3 w-3" />
                  ) : (
                    <Minus className="h-3 w-3" />
                  )}
                  {w.scoreChange > 0 ? "+" : ""}
                  {w.scoreChange}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
