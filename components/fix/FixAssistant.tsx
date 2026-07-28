"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  X,
  CheckCircle2,
  Circle,
  Loader2,
  Sparkles,
  Code,
  AlertTriangle,
  FileText,
  Hash,
  ImageOff,
} from "lucide-react";

interface FixItem {
  id: string;
  issueType: string;
  issueKey: string;
  summary: string;
  suggestion: string | null;
  codeSnippet: string | null;
  status: string;
  createdAt: string;
}

interface FixAssistantProps {
  auditId: string;
  open: boolean;
  onClose: () => void;
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

export default function FixAssistant({
  auditId,
  open,
  onClose,
}: FixAssistantProps) {
  const [fixes, setFixes] = useState<FixItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

  const generateFixes = useCallback(async () => {
    setGenerating(true);
    try {
      const res = await axios.post("/api/fix-assistant/issues", { auditId });
      setFixes(res.data.fixes);
    } catch {
      //
    } finally {
      setGenerating(false);
    }
  }, [auditId]);

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

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    axios.get(`/api/fix-assistant/issues?auditId=${auditId}`).then((res) => {
      if (cancelled) return;
      const fixesData: FixItem[] = res.data.fixes;
      setFixes(fixesData);
      setLoading(false);
      if (fixesData.length === 0) {
        setGenerating(true);
        axios.post("/api/fix-assistant/issues", { auditId }).then((r2) => {
          if (!cancelled) {
            setFixes(r2.data.fixes);
            setGenerating(false);
          }
        });
      }
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [open, auditId]);

  const openCount = fixes.filter((f) => f.status === "OPEN").length;
  const addressedCount = fixes.filter((f) => f.status !== "OPEN").length;
  const icon = (type: string) => {
    const Ic = issueIcons[type] || AlertTriangle;
    return <Ic className="h-4 w-4" />;
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 pt-12 pb-12 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-zinc-800">
                    Fix Suggestions
                  </h2>
                  <p className="text-xs text-zinc-500">
                    {openCount} open · {addressedCount} addressed
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-zinc-300" />
                </div>
              ) : fixes.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-sm text-zinc-400">
                  No issues found that need fixing.
                </div>
              ) : (
                <div className="space-y-3">
                  {fixes.map((fix) => (
                    <motion.div
                      key={fix.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`rounded-xl border p-4 transition-colors ${
                        fix.status !== "OPEN"
                          ? "border-emerald-100 bg-emerald-50/30"
                          : "border-zinc-100 bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div
                            className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                              fix.status !== "OPEN"
                                ? "bg-emerald-100 text-emerald-600"
                                : "bg-amber-50 text-amber-600"
                            }`}
                          >
                            {icon(fix.issueType)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-zinc-800">
                                {fix.summary}
                              </span>
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                  fix.status !== "OPEN"
                                    ? "bg-emerald-100 text-emerald-700"
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
                            {fix.suggestion && (
                              <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">
                                {fix.suggestion}
                              </p>
                            )}
                            {fix.codeSnippet && (
                              <div className="mt-2 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
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
                          </div>
                        </div>
                        <div className="shrink-0">
                          {statusUpdating === fix.id ? (
                            <Loader2 className="h-5 w-5 animate-spin text-zinc-300" />
                          ) : fix.status === "OPEN" ? (
                            <button
                              onClick={() => updateStatus(fix.id, "ADDRESSED")}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Mark Addressed
                            </button>
                          ) : fix.status === "ADDRESSED" ? (
                            <button
                              onClick={() => updateStatus(fix.id, "OPEN")}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100"
                            >
                              <Circle className="h-3.5 w-3.5" />
                              Reopen
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {fixes.length > 0 && (
              <div className="flex items-center justify-between border-t border-zinc-100 px-6 py-3">
                <span className="text-xs text-zinc-400">
                  {addressedCount}/{fixes.length} issues addressed
                </span>
                <button
                  onClick={generateFixes}
                  disabled={generating}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-800"
                >
                  {generating && <Loader2 className="h-3 w-3 animate-spin" />}
                  Regenerate
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
