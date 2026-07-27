"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";

interface MetricComparison {
  label: string;
  current: number;
  previous: number;
  change: number;
  improved: boolean;
  degraded: boolean;
}

interface ComparisonResult {
  older: { id: string; websiteUrl: string; seoScore: number; createdAt: string };
  newer: { id: string; websiteUrl: string; seoScore: number; createdAt: string };
  metrics: MetricComparison[];
  fixedIssues: string[];
  newIssues: string[];
  persistentIssues: string[];
}

function MetricBar({
  metric,
}: {
  metric: MetricComparison;
}) {
  const maxVal = Math.max(metric.current, metric.previous, 1);
  const currentWidth = (metric.current / 100) * 100;
  const previousWidth = (metric.previous / 100) * 100;

  return (
    <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-500">
          {metric.label}
        </span>
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold ${
            metric.improved
              ? "text-emerald-600"
              : metric.degraded
                ? "text-red-600"
                : "text-zinc-500"
          }`}
        >
          {metric.improved ? (
            <ArrowUpRight className="h-3 w-3" />
          ) : metric.degraded ? (
            <ArrowDownRight className="h-3 w-3" />
          ) : (
            <Minus className="h-3 w-3" />
          )}
          {metric.change > 0 ? "+" : ""}
          {metric.change}
        </span>
      </div>
      <div className="mt-3 space-y-2">
        <div>
          <div className="mb-1 flex items-center justify-between text-xs text-zinc-400">
            <span>Previous</span>
            <span className="font-medium">{metric.previous}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${previousWidth}%` }}
              transition={{ duration: 0.6 }}
              className="h-full rounded-full bg-zinc-300"
            />
          </div>
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between text-xs text-zinc-400">
            <span>Current</span>
            <span className="font-medium">{metric.current}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${currentWidth}%` }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={`h-full rounded-full ${
                metric.improved
                  ? "bg-emerald-500"
                  : metric.degraded
                    ? "bg-red-500"
                    : "bg-zinc-500"
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuditComparison({
  comparison,
}: {
  comparison: ComparisonResult;
}) {
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="flex-1">
          <p className="text-xs font-medium text-zinc-400">Previous Audit</p>
          <p className="mt-1 text-sm font-semibold text-zinc-700">
            Score: {comparison.older.seoScore}
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">
            {formatDate(comparison.older.createdAt)}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100">
          <ArrowUpRight className="h-5 w-5 text-zinc-400" />
        </div>
        <div className="flex-1 text-right">
          <p className="text-xs font-medium text-zinc-400">Current Audit</p>
          <p className="mt-1 text-sm font-semibold text-zinc-700">
            Score: {comparison.newer.seoScore}
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">
            {formatDate(comparison.newer.createdAt)}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {comparison.metrics.map((m) => (
          <MetricBar key={m.label} metric={m} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {comparison.fixedIssues.length > 0 && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <h4 className="text-sm font-semibold text-emerald-800">
                Fixed ({comparison.fixedIssues.length})
              </h4>
            </div>
            <ul className="mt-3 space-y-2">
              {comparison.fixedIssues.map((issue, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-xs text-emerald-700"
                >
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  {issue}
                </li>
              ))}
            </ul>
          </div>
        )}

        {comparison.newIssues.length > 0 && (
          <div className="rounded-2xl border border-red-200 bg-red-50/50 p-5">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <h4 className="text-sm font-semibold text-red-800">
                New Issues ({comparison.newIssues.length})
              </h4>
            </div>
            <ul className="mt-3 space-y-2">
              {comparison.newIssues.map((issue, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-xs text-red-700"
                >
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                  {issue}
                </li>
              ))}
            </ul>
          </div>
        )}

        {comparison.persistentIssues.length > 0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <h4 className="text-sm font-semibold text-amber-800">
                Persistent ({comparison.persistentIssues.length})
              </h4>
            </div>
            <ul className="mt-3 space-y-2">
              {comparison.persistentIssues.map((issue, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-xs text-amber-700"
                >
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                  {issue}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
