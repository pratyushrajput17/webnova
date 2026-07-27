"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Clock,
  BarChart3,
  Zap,
  Eye,
} from "lucide-react";

interface WebsiteItem {
  domain: string;
  latestAuditId: string;
  latestScore: number;
  previousScore: number | null;
  scoreChange: number | null;
  totalAudits: number;
  lastAuditedAt: string;
  latestPerformanceScore: number;
  latestAccessibilityScore: number;
}

function getScoreColor(score: number): string {
  if (score >= 90) return "text-emerald-600 bg-emerald-50 border-emerald-200";
  if (score >= 70) return "text-amber-600 bg-amber-50 border-amber-200";
  return "text-red-600 bg-red-50 border-red-200";
}

function getScoreRingColor(score: number): string {
  if (score >= 90) return "#10b981";
  if (score >= 70) return "#f59e0b";
  return "#ef4444";
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function MiniScoreRing({
  score,
  size = 56,
  strokeWidth = 5,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getScoreRingColor(score);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="fill-none stroke-zinc-100"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="fill-none transition-all duration-700"
          stroke={color}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-zinc-800">{score}</span>
      </div>
    </div>
  );
}

export default function WebsiteHistoryCard({
  website,
}: {
  website: WebsiteItem;
}) {
  const change = website.scoreChange;

  return (
    <Link
      href={`/dashboard/history/sites/${encodeURIComponent(website.domain)}`}
      className="group block rounded-2xl border border-zinc-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <MiniScoreRing score={website.latestScore} />
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-zinc-800 group-hover:text-black">
              {website.domain}
            </h3>
            <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDate(website.lastAuditedAt)}
              </span>
              <span>{website.totalAudits} audit{website.totalAudits !== 1 ? "s" : ""}</span>
            </div>
          </div>
        </div>
        {change !== null && (
          <div
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${
              change > 0
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : change < 0
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-zinc-200 bg-zinc-50 text-zinc-600"
            }`}
          >
            {change > 0 ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : change < 0 ? (
              <ArrowDownRight className="h-3 w-3" />
            ) : (
              <Minus className="h-3 w-3" />
            )}
            {change > 0 ? "+" : ""}
            {change}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-4 border-t border-zinc-100 pt-4">
        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          <BarChart3 className="h-3 w-3 text-zinc-400" />
          SEO: {website.latestScore}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          <Zap className="h-3 w-3 text-zinc-400" />
          Perf: {website.latestPerformanceScore}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          <Eye className="h-3 w-3 text-zinc-400" />
          A11y: {website.latestAccessibilityScore}
        </div>
      </div>

      <div className="mt-3 text-right">
        <span className="text-xs font-medium text-zinc-400 group-hover:text-black">
          View history &rarr;
        </span>
      </div>
    </Link>
  );
}
