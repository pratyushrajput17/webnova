"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ExternalLink,
  Clock,
} from "lucide-react";

interface TimelineEntry {
  id: string;
  seoScore: number;
  performanceScore: number;
  accessibilityScore: number;
  createdAt: string;
  websiteUrl: string;
  scoreChange: number | null;
}

function getScoreColor(score: number): string {
  if (score >= 90) return "bg-emerald-500";
  if (score >= 70) return "bg-amber-500";
  return "bg-red-500";
}

function getScoreTextColor(score: number): string {
  if (score >= 90) return "text-emerald-600";
  if (score >= 70) return "text-amber-600";
  return "text-red-600";
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRelative(dateStr: string): string {
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

export default function AuditTimeline({
  entries,
}: {
  entries: TimelineEntry[];
}) {
  if (entries.length === 0) {
    return (
      <div className="rounded-xl bg-zinc-50 px-6 py-10 text-center">
        <p className="text-sm text-zinc-500">No audit history yet.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-6 top-0 h-full w-px bg-zinc-200" />

      <div className="space-y-1">
        {entries.map((entry, idx) => {
          const isFirst = idx === 0;
          const change = entry.scoreChange;

          return (
            <Link
              key={entry.id}
              href={`/dashboard/history/${entry.id}`}
              className="group relative flex items-start gap-4 rounded-xl px-2 py-3 transition-colors hover:bg-zinc-50"
            >
              <div className="relative z-10 mt-1">
                <div
                  className={`h-3 w-3 rounded-full border-2 border-white ${
                    isFirst ? "ring-2 ring-zinc-200 " + getScoreColor(entry.seoScore) : "bg-zinc-300"
                  }`}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-lg font-bold ${getScoreTextColor(entry.seoScore)}`}
                    >
                      {entry.seoScore}
                    </span>
                    {change !== null && (
                      <span
                        className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
                          change > 0
                            ? "text-emerald-600"
                            : change < 0
                              ? "text-red-600"
                              : "text-zinc-500"
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
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <Clock className="h-3 w-3" />
                    <span>{formatRelative(entry.createdAt)}</span>
                    <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </div>

                <div className="mt-1.5 flex items-center gap-3 text-xs text-zinc-400">
                  <span>Perf: {entry.performanceScore}</span>
                  <span>A11y: {entry.accessibilityScore}</span>
                  <span className="text-zinc-300">|</span>
                  <span>{formatDate(entry.createdAt)}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
