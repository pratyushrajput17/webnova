"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import {
  ArrowLeft,
  Globe,
  BarChart3,
  ArrowRightLeft,
  Clock,
  History,
} from "lucide-react";
import ScoreTrendChart from "@/components/dashboard/ScoreTrendChart";
import AuditComparison from "@/components/dashboard/AuditComparison";
import AuditTimeline from "@/components/dashboard/AuditTimeline";

interface WebsiteData {
  domain: string;
  totalAudits: number;
  firstAuditAt: string;
  lastAuditAt: string;
  scoreHistory: {
    date: string;
    seoScore: number;
    performanceScore: number;
    accessibilityScore: number;
    id: string;
  }[];
  comparison: {
    older: { id: string; websiteUrl: string; seoScore: number; createdAt: string };
    newer: { id: string; websiteUrl: string; seoScore: number; createdAt: string };
    metrics: {
      label: string;
      current: number;
      previous: number;
      change: number;
      improved: boolean;
      degraded: boolean;
    }[];
    fixedIssues: string[];
    newIssues: string[];
    persistentIssues: string[];
  } | null;
  timeline: {
    id: string;
    seoScore: number;
    performanceScore: number;
    accessibilityScore: number;
    createdAt: string;
    websiteUrl: string;
    scoreChange: number | null;
  }[];
}

type Tab = "overview" | "comparison" | "timeline";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getScoreColor(score: number): string {
  if (score >= 90) return "text-emerald-600";
  if (score >= 70) return "text-amber-600";
  return "text-red-600";
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 animate-pulse rounded-xl bg-zinc-100" />
        <div className="space-y-2">
          <div className="h-8 w-64 animate-pulse rounded bg-zinc-100" />
          <div className="h-4 w-48 animate-pulse rounded bg-zinc-100" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-zinc-200 bg-white p-6"
          >
            <div className="h-4 w-20 animate-pulse rounded bg-zinc-100" />
            <div className="mt-3 h-8 w-12 animate-pulse rounded bg-zinc-100" />
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <div className="h-72 animate-pulse rounded-xl bg-zinc-50" />
      </div>
    </div>
  );
}

export default function WebsiteHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const domain = decodeURIComponent(params.domain as string);
  const [data, setData] = useState<WebsiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(
          `/api/audit/history/websites/${encodeURIComponent(domain)}`
        );
        setData(res.data);
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setError("No audits found for this website.");
        } else {
          setError("Failed to load website history.");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [domain]);

  if (loading) return <LoadingSkeleton />;

  if (error || !data) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100">
          <Globe className="h-8 w-8 text-zinc-400" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-800">
          {error || "Website not found"}
        </h2>
        <p className="mt-2 text-zinc-500">
          No audit history found for this website.
        </p>
        <button
          onClick={() => router.push("/dashboard/history")}
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-medium text-white transition-all hover:opacity-90"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to History
        </button>
      </motion.div>
    );
  }

  const latestScore = data.scoreHistory[data.scoreHistory.length - 1];
  const firstScore = data.scoreHistory[0];
  const totalChange =
    latestScore && firstScore
      ? latestScore.seoScore - firstScore.seoScore
      : null;

  const tabs: { id: Tab; label: string; icon: typeof BarChart3 }[] = [
    { id: "overview", label: "Score Trends", icon: BarChart3 },
    ...(data.comparison
      ? [{ id: "comparison" as Tab, label: "Latest Comparison", icon: ArrowRightLeft }]
      : []),
    { id: "timeline", label: "Timeline", icon: History },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard/history")}
            className="rounded-xl border border-zinc-200 p-2.5 transition-colors hover:bg-zinc-100"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">{data.domain}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-500">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                First audited {formatDate(data.firstAuditAt)}
              </span>
              <span>{data.totalAudits} audit{data.totalAudits !== 1 ? "s" : ""}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <p className="text-xs font-medium text-zinc-400">Latest SEO Score</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${getScoreColor(latestScore?.seoScore ?? 0)}`}>
              {latestScore?.seoScore ?? "\u2014"}
            </span>
            {totalChange !== null && totalChange !== 0 && (
              <span
                className={`text-sm font-semibold ${
                  totalChange > 0 ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {totalChange > 0 ? "+" : ""}
                {totalChange} overall
              </span>
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <p className="text-xs font-medium text-zinc-400">Performance</p>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {latestScore?.performanceScore ?? "\u2014"}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <p className="text-xs font-medium text-zinc-400">Accessibility</p>
          <p className="mt-2 text-3xl font-bold text-violet-600">
            {latestScore?.accessibilityScore ?? "\u2014"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-white p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-black text-white"
                  : "text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "overview" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-zinc-200 bg-white p-6"
        >
          <h2 className="text-lg font-semibold">Score Trends</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Track how your scores have changed across {data.totalAudits} audits.
          </p>
          <div className="mt-6">
            <ScoreTrendChart data={data.scoreHistory} height={350} />
          </div>
        </motion.div>
      )}

      {activeTab === "comparison" && data.comparison && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-zinc-200 bg-white p-6"
        >
          <h2 className="text-lg font-semibold">Latest Comparison</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Compare your two most recent audits.
          </p>
          <div className="mt-6">
            <AuditComparison comparison={data.comparison} />
          </div>
        </motion.div>
      )}

      {activeTab === "timeline" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-zinc-200 bg-white p-6"
        >
          <h2 className="text-lg font-semibold">Audit Timeline</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Chronological history of all audits for this website.
          </p>
          <div className="mt-6">
            <AuditTimeline entries={data.timeline} />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
