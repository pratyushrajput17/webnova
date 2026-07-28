"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import Link from "next/link";
import {
  Globe,
  Loader2,
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Zap,
  BarChart3,
  ArrowUpDown,
  ChevronDown,
  Radio,
  ExternalLink,
} from "lucide-react";

interface WebsiteData {
  domain: string;
  latestAuditId: string;
  latestScore: number;
  previousScore: number | null;
  scoreChange: number | null;
  latestPerformanceScore: number;
  latestAccessibilityScore: number;
  totalAudits: number;
  lastAuditedAt: string;
  openIssues: number;
  criticalAlerts: number;
  health: "healthy" | "needs_attention" | "critical";
  monitoring: {
    status: string;
    frequency: string;
    nextRunAt: string;
    lastRunAt: string | null;
  } | null;
}

type SortKey = "score" | "lastAudited" | "issues" | "scoreDrop";
type FilterKey = "all" | "healthy" | "needs_attention" | "critical" | "monitoring";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function HealthDot({ health }: { health: string }) {
  const colors: Record<string, string> = {
    healthy: "bg-emerald-500",
    needs_attention: "bg-amber-500",
    critical: "bg-red-500",
  };
  return <span className={`inline-block h-2 w-2 rounded-full ${colors[health] || "bg-zinc-300"}`} />;
}

function ScoreChangeIndicator({ change }: { change: number | null }) {
  if (change === null || change === 0) return <Minus className="h-3.5 w-3.5 text-zinc-300" />;
  if (change > 0) return <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />;
  return <TrendingDown className="h-3.5 w-3.5 text-red-500" />;
}

export default function MyWebsitesPage() {
  const [websites, setWebsites] = useState<WebsiteData[]>([]);
  const [totalAudits, setTotalAudits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sort, setSort] = useState<SortKey>("lastAudited");
  const [showSortMenu, setShowSortMenu] = useState(false);

  useEffect(() => {
    axios.get("/api/websites").then((res) => {
      setWebsites(res.data.websites);
      setTotalAudits(res.data.totalAudits);
    }).catch(() => {
      //
    }).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = [...websites];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((w) => w.domain.includes(q));
    }

    if (filter === "healthy") result = result.filter((w) => w.health === "healthy");
    else if (filter === "needs_attention") result = result.filter((w) => w.health === "needs_attention");
    else if (filter === "critical") result = result.filter((w) => w.health === "critical");
    else if (filter === "monitoring") result = result.filter((w) => w.monitoring?.status === "ACTIVE");

    if (sort === "score") result.sort((a, b) => b.latestScore - a.latestScore);
    else if (sort === "issues") result.sort((a, b) => b.openIssues - a.openIssues);
    else if (sort === "scoreDrop") result.sort((a, b) => (a.scoreChange ?? 0) - (b.scoreChange ?? 0));
    else result.sort((a, b) => new Date(b.lastAuditedAt).getTime() - new Date(a.lastAuditedAt).getTime());

    return result;
  }, [websites, search, filter, sort]);

  const criticalCount = websites.filter((w) => w.health === "critical").length;
  const monitoredCount = websites.filter((w) => w.monitoring?.status === "ACTIVE").length;
  const needsAttentionCount = websites.filter((w) => w.health === "needs_attention").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-300" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">My Websites</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {websites.length} website{websites.length !== 1 ? "s" : ""} · {totalAudits} audit{totalAudits !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {websites.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-zinc-100 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Websites</p>
            <p className="mt-1 text-2xl font-bold text-zinc-900">{websites.length}</p>
          </div>
          <div className="rounded-xl border border-zinc-100 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Monitored</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">{monitoredCount}</p>
          </div>
          <div className="rounded-xl border border-zinc-100 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Attention Needed</p>
            <p className="mt-1 text-2xl font-bold text-amber-600">{needsAttentionCount}</p>
          </div>
          <div className="rounded-xl border border-zinc-100 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Critical</p>
            <p className="mt-1 text-2xl font-bold text-red-600">{criticalCount}</p>
          </div>
        </div>
      )}

      {websites.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search domain..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-800 placeholder-zinc-400 focus:border-zinc-300 focus:outline-none focus:ring-0"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(["all", "healthy", "needs_attention", "critical", "monitoring"] as FilterKey[]).map((f) => {
              const labels: Record<FilterKey, string> = {
                all: "All",
                healthy: "Healthy",
                needs_attention: "Needs Attention",
                critical: "Critical",
                monitoring: "Monitoring Active",
              };
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    filter === f
                      ? "border-zinc-800 bg-zinc-800 text-white"
                      : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  {f === "monitoring" && <Radio className="h-3 w-3" />}
                  {f === "healthy" && <CheckCircle2 className="h-3 w-3" />}
                  {f === "needs_attention" && <AlertTriangle className="h-3 w-3" />}
                  {f === "critical" && <AlertTriangle className="h-3 w-3" />}
                  {labels[f]}
                </button>
              );
            })}
          </div>
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
              {sort === "score" ? "SEO Score" : sort === "issues" ? "Most Issues" : sort === "scoreDrop" ? "Largest Drop" : "Last Audited"}
              <ChevronDown className="h-3 w-3" />
            </button>
            {showSortMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
                <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-xl border border-zinc-200 bg-white py-1 shadow-lg">
                  {([
                    { key: "lastAudited", label: "Last Audited" },
                    { key: "score", label: "SEO Score" },
                    { key: "issues", label: "Most Issues" },
                    { key: "scoreDrop", label: "Largest Score Drop" },
                  ] as { key: SortKey; label: string }[]).map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => { setSort(opt.key); setShowSortMenu(false); }}
                      className={`w-full px-4 py-2 text-left text-xs transition-colors ${
                        sort === opt.key ? "bg-zinc-50 font-medium text-zinc-800" : "text-zinc-600 hover:bg-zinc-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {websites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100">
            <Globe className="h-7 w-7 text-zinc-400" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-800">No websites yet</h3>
          <p className="mt-1 text-sm text-zinc-500">Run your first audit to get started.</p>
          <Link
            href="/dashboard/audits"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-sm font-medium text-white transition-all hover:opacity-90"
          >
            <Zap className="h-4 w-4" />
            Run an Audit
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-zinc-500">No websites match your search or filter.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((website, i) => (
            <motion.div
              key={website.domain}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
              className="group rounded-2xl border border-zinc-200 bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <HealthDot health={website.health} />
                    <h3 className="truncate text-sm font-semibold text-zinc-800">
                      {website.domain}
                    </h3>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-zinc-400">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(website.lastAuditedAt)}</span>
                    {website.monitoring?.status === "ACTIVE" && (
                      <>
                        <span className="text-zinc-200">·</span>
                        <Radio className="h-3 w-3 text-emerald-500" />
                        <span className="text-emerald-600">Monitoring</span>
                      </>
                    )}
                  </div>
                </div>
                <Link
                  href={`/dashboard/sites/${encodeURIComponent(website.domain)}`}
                  className="shrink-0 rounded-lg border border-zinc-200 p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-zinc-50 p-2.5 text-center">
                  <p className="text-xs text-zinc-500">SEO</p>
                  <div className="mt-0.5 flex items-center justify-center gap-1">
                    <span className={`text-lg font-bold ${
                      website.latestScore >= 70 ? "text-emerald-600" : website.latestScore >= 50 ? "text-amber-600" : "text-red-600"
                    }`}>
                      {website.latestScore}
                    </span>
                    <ScoreChangeIndicator change={website.scoreChange} />
                  </div>
                </div>
                <div className="rounded-lg bg-zinc-50 p-2.5 text-center">
                  <p className="text-xs text-zinc-500">Perf</p>
                  <p className={`mt-0.5 text-lg font-bold ${
                    website.latestPerformanceScore >= 70 ? "text-emerald-600" : "text-amber-600"
                  }`}>
                    {website.latestPerformanceScore}
                  </p>
                </div>
                <div className="rounded-lg bg-zinc-50 p-2.5 text-center">
                  <p className="text-xs text-zinc-500">A11y</p>
                  <p className={`mt-0.5 text-lg font-bold ${
                    website.latestAccessibilityScore >= 70 ? "text-emerald-600" : "text-amber-600"
                  }`}>
                    {website.latestAccessibilityScore}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-zinc-500">
                  <BarChart3 className="h-3 w-3" />
                  <span>{website.totalAudits} audit{website.totalAudits !== 1 ? "s" : ""}</span>
                  {website.openIssues > 0 && (
                    <>
                      <span className="text-zinc-200">·</span>
                      <span className="text-amber-600">{website.openIssues} open</span>
                    </>
                  )}
                </div>
                <span className={`text-xs font-medium capitalize ${
                  website.health === "healthy" ? "text-emerald-600" : website.health === "needs_attention" ? "text-amber-600" : "text-red-600"
                }`}>
                  {website.health.replace("_", " ")}
                </span>
              </div>

              <div className="mt-4 flex gap-2">
                <Link
                  href={`/dashboard/sites/${encodeURIComponent(website.domain)}`}
                  className="flex-1 rounded-lg bg-black py-2 text-center text-xs font-medium text-white transition-all hover:opacity-90"
                >
                  View Website
                </Link>
                <Link
                  href={`/dashboard/audits`}
                  className="flex-1 rounded-lg border border-zinc-200 py-2 text-center text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
                >
                  Run Audit
                </Link>
                <Link
                  href={`/dashboard/history/${website.latestAuditId}`}
                  className="flex-1 rounded-lg border border-zinc-200 py-2 text-center text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
                >
                  Latest Report
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
