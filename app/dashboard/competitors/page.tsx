"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import CompetitorReportPDF from "@/components/pdf/CompetitorReportPDF";
import { downloadPDF, sanitizeFilename } from "@/lib/pdf";
import {
  ArrowRight,
  Trophy,
  Globe,
  Users,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  BarChart3,
  Hash,
  Image,
  ImageOff,
  Link,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
  FileDown,
  Crown,
  Zap,
  X,
} from "lucide-react";

interface MetricData {
  label: string;
  key: string;
  yourValue: number | string;
  competitorValue: number | string;
  yourWins: boolean;
  competitorWins: boolean;
  higherIsBetter: boolean;
}

interface ComparisonResult {
  yourData: {
    pageTitle: string;
    seoScore: number;
    h1Count: number;
    imageCount: number;
    missingAltCount: number;
    internalLinks: number;
    externalLinks: number;
  };
  competitorData: {
    pageTitle: string;
    seoScore: number;
    h1Count: number;
    imageCount: number;
    missingAltCount: number;
    internalLinks: number;
    externalLinks: number;
  };
  metrics: MetricData[];
  summary: string;
}

interface HistoryItem {
  id: string;
  yourSite: string;
  competitorSite: string;
  summary: string;
  createdAt: string;
}

const metricIcons: Record<string, typeof BarChart3> = {
  "SEO Score": BarChart3,
  "H1 Count": Hash,
  "Total Images": Image,
  "Missing Alt Tags": ImageOff,
  "Internal Links": Link,
  "External Links": Link,
};

interface QuotaExceededData {
  error: string;
  code: string;
  limit: number;
  used: number;
  plan: string;
}

export default function CompetitorsPage() {
  const router = useRouter();
  const [yourSite, setYourSite] = useState("");
  const [competitorSite, setCompetitorSite] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [quotaModal, setQuotaModal] = useState<QuotaExceededData | null>(null);

  const fetchHistory = async () => {
    try {
      const res = await axios.get("/api/competitors");
      setHistory(res.data.comparisons ?? []);
    } catch {
      // silently fail
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchHistory();
  }, []);

  const handleCompare = async () => {
    setError(null);
    setResult(null);
    setShowHistory(false);

    if (!yourSite.trim() || !competitorSite.trim()) {
      setError("Please enter both URLs.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post<ComparisonResult>("/api/competitors", {
        yourSite: yourSite.trim(),
        competitorSite: competitorSite.trim(),
      });
      setResult(res.data);
      fetchHistory();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const data = err.response.data;
        if (data.code === "COMPETITOR_QUOTA_EXCEEDED") {
          setQuotaModal(data as QuotaExceededData);
        } else if (data.error) {
          setError(data.error);
        } else {
          setError("Comparison failed. Please try again.");
        }
      } else {
        setError("Comparison failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = useCallback(async () => {
    if (!result) return;
    setPdfLoading(true);
    try {
      const yourName = sanitizeFilename(yourSite || "yoursite");
      const compName = sanitizeFilename(competitorSite || "competitor");
      await downloadPDF(
        <CompetitorReportPDF
          yourSite={yourSite}
          competitorSite={competitorSite}
          yourData={result.yourData}
          competitorData={result.competitorData}
          metrics={result.metrics}
          summary={result.summary}
        />,
        `competitor-report-${yourName}-vs-${compName}.pdf`
      );
    } finally {
      setPdfLoading(false);
    }
  }, [result, yourSite, competitorSite]);

  const loadHistoryItem = (item: HistoryItem) => {
    setYourSite(item.yourSite);
    setCompetitorSite(item.competitorSite);
    setShowHistory(false);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalWins = result
    ? result.metrics.filter((m) => m.yourWins).length
    : 0;
  const totalLosses = result
    ? result.metrics.filter((m) => m.competitorWins).length
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Competitor Analysis</h1>
          <p className="mt-2 text-zinc-600">
            Compare your website against competitors side by side.
          </p>
        </div>
        {history.length > 0 && (
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100"
          >
            <Clock className="h-4 w-4" />
            History
          </button>
        )}
      </div>

      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 overflow-hidden"
          >
            <div className="rounded-2xl border border-zinc-200 bg-white p-4">
              <h3 className="mb-3 text-sm font-semibold text-zinc-500">
                Recent Comparisons
              </h3>
              {historyLoading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
                </div>
              ) : history.length === 0 ? (
                <p className="py-4 text-center text-sm text-zinc-400">
                  No comparisons yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {history.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => loadHistoryItem(item)}
                      className="flex w-full items-center justify-between rounded-xl border border-zinc-100 px-4 py-3 text-left transition-colors hover:bg-zinc-50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-zinc-800">
                          {item.yourSite}
                        </p>
                        <p className="truncate text-xs text-zinc-400">
                          vs {item.competitorSite}
                        </p>
                      </div>
                      <div className="ml-4 flex items-center gap-3">
                        <span className="text-xs text-zinc-400">
                          {formatDate(item.createdAt)}
                        </span>
                        <ChevronRight className="h-4 w-4 text-zinc-300" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 md:p-8"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-600">
              <Globe className="h-4 w-4" />
              Your Website
            </label>
            <input
              type="url"
              placeholder="https://yoursite.com"
              value={yourSite}
              onChange={(e) => {
                setYourSite(e.target.value);
                setResult(null);
                setError(null);
              }}
              disabled={loading}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 text-base outline-none transition-colors focus:border-zinc-300 focus:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-600">
              <Users className="h-4 w-4" />
              Competitor Website
            </label>
            <input
              type="url"
              placeholder="https://competitor.com"
              value={competitorSite}
              onChange={(e) => {
                setCompetitorSite(e.target.value);
                setResult(null);
                setError(null);
              }}
              disabled={loading}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 text-base outline-none transition-colors focus:border-zinc-300 focus:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <button
            onClick={handleCompare}
            disabled={loading}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-black px-8 py-3.5 font-medium text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                Compare Websites
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
          {result && (
            <button
              onClick={handleCompare}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-5 py-3.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100"
            >
              <RefreshCw className="h-4 w-4" />
              Recompare
            </button>
          )}
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-5 py-3.5 text-sm text-red-700"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </motion.div>

      {loading && (
        <div className="mt-8">
          <div className="rounded-2xl border border-zinc-200 bg-white p-8">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <div className="h-5 w-32 animate-pulse rounded bg-zinc-100" />
                <div className="mt-4 space-y-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-14 animate-pulse rounded-xl bg-zinc-50"
                    />
                  ))}
                </div>
              </div>
              <div className="hidden md:block">
                <div className="h-5 w-32 animate-pulse rounded bg-zinc-100" />
                <div className="mt-4 space-y-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-14 animate-pulse rounded-xl bg-zinc-50"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-8 space-y-6"
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center"
              >
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
                <p className="mt-3 text-2xl font-bold text-emerald-700">
                  {totalWins}
                </p>
                <p className="text-sm text-emerald-600">Categories Won</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl border border-red-200 bg-red-50 p-5 text-center"
              >
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <p className="mt-3 text-2xl font-bold text-red-700">
                  {totalLosses}
                </p>
                <p className="text-sm text-red-600">Categories Behind</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="rounded-2xl border border-zinc-200 bg-white p-5 text-center"
              >
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100">
                  <BarChart3 className="h-5 w-5 text-zinc-600" />
                </div>
                <p className="mt-3 text-2xl font-bold text-zinc-800">
                  {result.metrics.length}
                </p>
                <p className="text-sm text-zinc-500">Total Metrics</p>
              </motion.div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white">
              <div className="border-b border-zinc-200 px-6 py-4">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <Trophy className="h-5 w-5" />
                  Side-by-Side Comparison
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-100 bg-zinc-50">
                      <th className="px-6 py-4 text-left font-medium text-zinc-500">
                        Metric
                      </th>
                      <th className="px-6 py-4 text-center font-medium text-zinc-500">
                        Your Site
                      </th>
                      <th className="px-6 py-4 text-center font-medium text-zinc-500">
                        <span className="hidden sm:inline">Competitor</span>
                        <span className="sm:hidden">vs</span>
                      </th>
                      <th className="px-6 py-4 text-right font-medium text-zinc-500">
                        Result
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.metrics.map((metric, i) => {
                      const Icon = metricIcons[metric.label] || BarChart3;
                      return (
                        <motion.tr
                          key={metric.key}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * i }}
                          className="border-b border-zinc-100 transition-colors hover:bg-zinc-50"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100">
                                <Icon className="h-4 w-4 text-zinc-500" />
                              </div>
                              <span className="font-medium text-zinc-800">
                                {metric.label}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold ${
                                metric.yourWins
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-zinc-50 text-zinc-700"
                              }`}
                            >
                              {metric.yourWins && (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              )}
                              {metric.yourValue}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold ${
                                metric.competitorWins
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-zinc-50 text-zinc-700"
                              }`}
                            >
                              {metric.competitorWins && (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              )}
                              {metric.competitorValue}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span
                              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                                metric.yourWins
                                  ? "bg-emerald-50 text-emerald-700"
                                  : metric.competitorWins
                                    ? "bg-red-50 text-red-700"
                                    : "bg-zinc-50 text-zinc-500"
                              }`}
                            >
                              {metric.yourWins
                                ? "WIN"
                                : metric.competitorWins
                                  ? "LOSS"
                                  : "TIE"}
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-2xl border border-zinc-200 bg-white p-6 md:p-8"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 shadow-lg shadow-blue-200/50">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-zinc-800">
                    Analysis Summary
                  </h2>
                  <p className="mt-3 leading-relaxed text-zinc-600">
                    {result.summary}
                  </p>
                </div>
              </div>
            </motion.div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleCompare}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-medium text-white transition-all hover:opacity-90"
                >
                  <RefreshCw className="h-4 w-4" />
                  Compare Again
                </button>
                <button
                  onClick={handleDownloadPDF}
                  disabled={pdfLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 px-6 py-3 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 disabled:opacity-50"
                >
                  {pdfLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileDown className="h-4 w-4" />
                  )}
                  Download PDF
                </button>
              </div>
              <button
                onClick={() => setShowHistory(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 px-6 py-3 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100"
              >
                <Clock className="h-4 w-4" />
                View History
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {quotaModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl"
            >
              <button
                onClick={() => setQuotaModal(null)}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50">
                <Zap className="h-7 w-7 text-amber-500" />
              </div>

              <h3 className="text-center text-xl font-bold text-zinc-800">
                Monthly Limit Reached
              </h3>
              <p className="mt-2 text-center text-sm text-zinc-500">
                You have reached your monthly competitor analysis limit on the{" "}
                <span className="font-medium text-zinc-700">
                  {quotaModal.plan === "FREE" ? "Free" : quotaModal.plan === "STARTER" ? "Starter" : quotaModal.plan === "PRO" ? "Professional" : quotaModal.plan === "LIFETIME" ? "Lifetime Access" : quotaModal.plan} plan
                </span>
                .
              </p>

              <div className="mt-6 rounded-xl border border-zinc-100 bg-zinc-50 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">Analyses used</span>
                  <span className="font-medium text-zinc-800">
                    {quotaModal.used} / {quotaModal.limit}
                  </span>
                </div>
              </div>

              <p className="mt-4 text-center text-xs text-zinc-400">
                Upgrade to a higher plan for unlimited competitor analysis.
              </p>

              <div className="mt-6 grid gap-3">
                <button
                  onClick={() => router.push(`/pricing/checkout?plan=${quotaModal.plan}`)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-medium text-white transition-all hover:opacity-90"
                >
                  <Crown className="h-4 w-4" />
                  Upgrade Plan
                </button>
                <button
                  onClick={() => setQuotaModal(null)}
                  className="inline-flex items-center justify-center rounded-xl border border-zinc-200 px-6 py-3 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100"
                >
                  Maybe Later
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
