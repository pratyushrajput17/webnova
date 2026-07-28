"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import Link from "next/link";
import {
  Sparkles,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  Circle,
  AlertTriangle,
  FileText,
  Hash,
  ImageOff,
  Code,
  Globe,
} from "lucide-react";

interface FixItem {
  id: string;
  issueType: string;
  summary: string;
  suggestion: string | null;
  codeSnippet: string | null;
  status: string;
  url: string | null;
  createdAt: string;
}

const issueIcons: Record<string, typeof FileText> = {
  MISSING_TITLE: FileText,
  TITLE_TOO_SHORT: FileText,
  TITLE_TOO_LONG: FileText,
  MISSING_META_DESC: FileText,
  META_DESC_TOO_SHORT: FileText,
  META_DESC_TOO_LONG: FileText,
  MISSING_H1: Hash,
  MULTIPLE_H1: Hash,
  MISSING_ALT: ImageOff,
};

function Icon({ type }: { type: string }) {
  const Ic = issueIcons[type] || AlertTriangle;
  return <Ic className="h-4 w-4" />;
}

export default function FixesPage() {
  const [fixes, setFixes] = useState<FixItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    axios.get("/api/fix-assistant/issues").then((res) => {
      if (!cancelled) setFixes(res.data.fixes);
    }).catch(() => {
      //
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const updateStatus = useCallback(
    async (id: string, status: string) => {
      setStatusUpdating(id);
      try {
        await axios.patch(`/api/fix-assistant/issues/${id}`, { status });
        setFixes((prev) =>
          prev.map((f) => (f.id === id ? { ...f, status } : f))
        );
      } catch {
        //
      } finally {
        setStatusUpdating(null);
      }
    },
    []
  );

  const openFixes = fixes.filter((f) => f.status === "OPEN");
  const addressedFixes = fixes.filter((f) => f.status !== "OPEN");
  const total = fixes.length;
  const done = fixes.filter((f) => f.status !== "OPEN").length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="rounded-xl border border-zinc-200 p-2.5 transition-colors hover:bg-zinc-100"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Fix SEO Issues</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Track and resolve SEO issues across all your websites.
          </p>
        </div>
      </div>

      {total > 0 && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <svg width="72" height="72" className="-rotate-90">
                <circle
                  cx="36"
                  cy="36"
                  r="32"
                  fill="none"
                  stroke="#f4f4f5"
                  strokeWidth="6"
                />
                <motion.circle
                  cx="36"
                  cy="36"
                  r="32"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 32}
                  initial={{ strokeDashoffset: 2 * Math.PI * 32 }}
                  animate={{
                    strokeDashoffset:
                      2 * Math.PI * 32 - (percent / 100) * 2 * Math.PI * 32,
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-zinc-800">
                  {percent}%
                </span>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-zinc-700">
                  Overall Progress
                </span>
              </div>
              <p className="mt-0.5 text-xs text-zinc-500">
                {done} of {total} issues resolved
              </p>
              <div className="mt-2 flex gap-3">
                <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                  <Circle className="h-3 w-3" />
                  {openFixes.length} open
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                  <CheckCircle2 className="h-3 w-3" />
                  {addressedFixes.length} addressed
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-300" />
        </div>
      ) : fixes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100">
            <Sparkles className="h-7 w-7 text-zinc-400" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-800">
            No issues found
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            Run an audit and generate fix suggestions to see them here.
          </p>
          <Link
            href="/dashboard/audits"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-sm font-medium text-white transition-all hover:opacity-90"
          >
            Run an Audit
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Open Issues ({openFixes.length})
          </h2>
          {openFixes.length === 0 ? (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              All issues have been addressed. Great work!
            </div>
          ) : (
            <div className="space-y-3">
              {openFixes.map((fix) => (
                <FixCard
                  key={fix.id}
                  fix={fix}
                  statusUpdating={statusUpdating}
                  onUpdate={updateStatus}
                />
              ))}
            </div>
          )}

          {addressedFixes.length > 0 && (
            <>
              <h2 className="mt-8 text-sm font-semibold uppercase tracking-wider text-zinc-400">
                Addressed ({addressedFixes.length})
              </h2>
              <div className="space-y-3">
                {addressedFixes.map((fix) => (
                  <FixCard
                    key={fix.id}
                    fix={fix}
                    statusUpdating={statusUpdating}
                    onUpdate={updateStatus}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
}

function FixCard({
  fix,
  statusUpdating,
  onUpdate,
}: {
  fix: FixItem;
  statusUpdating: string | null;
  onUpdate: (id: string, status: string) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      layout
      className={`rounded-xl border transition-colors ${
        fix.status !== "OPEN"
          ? "border-emerald-100 bg-emerald-50/30"
          : "border-zinc-100 bg-white"
      }`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start gap-3 px-5 py-3.5 text-left"
      >
        <div
          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
            fix.status !== "OPEN"
              ? "bg-emerald-100 text-emerald-600"
              : "bg-amber-50 text-amber-600"
          }`}
        >
          <Icon type={fix.issueType} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-zinc-800">
              {fix.summary}
            </span>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                fix.status === "VERIFIED_FIXED"
                  ? "bg-emerald-100 text-emerald-700"
                  : fix.status === "ADDRESSED"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-zinc-100 text-zinc-600"
              }`}
            >
              {fix.status === "VERIFIED_FIXED"
                ? "Fixed"
                : fix.status === "ADDRESSED"
                  ? "Addressed"
                  : "Open"}
            </span>
          </div>
          {fix.url && (
            <span className="mt-0.5 flex items-center gap-1 text-xs text-zinc-400">
              <Globe className="h-3 w-3" />
              {fix.url}
            </span>
          )}
        </div>
      </button>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="overflow-hidden border-t border-zinc-100"
        >
          <div className="space-y-3 px-5 py-4">
            {fix.suggestion && (
              <p className="text-sm leading-relaxed text-zinc-600">
                {fix.suggestion}
              </p>
            )}
            {fix.codeSnippet && (
              <div className="overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
                <div className="flex items-center gap-1.5 border-b border-zinc-200 px-3 py-1.5">
                  <Code className="h-3 w-3 text-zinc-400" />
                  <span className="text-xs font-medium text-zinc-500">
                    Suggested Code
                  </span>
                </div>
                <pre className="overflow-x-auto px-3 py-2.5 text-xs text-zinc-800">
                  {fix.codeSnippet}
                </pre>
              </div>
            )}
            <div className="flex gap-2">
              {fix.status === "OPEN" ? (
                <button
                  onClick={() => onUpdate(fix.id, "ADDRESSED")}
                  disabled={statusUpdating === fix.id}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-black px-4 py-2 text-xs font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
                >
                  {statusUpdating === fix.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  )}
                  Mark Addressed
                </button>
              ) : (
                <button
                  onClick={() => onUpdate(fix.id, "OPEN")}
                  disabled={statusUpdating === fix.id}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 disabled:opacity-50"
                >
                  {statusUpdating === fix.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Circle className="h-3.5 w-3.5" />
                  )}
                  Reopen
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
