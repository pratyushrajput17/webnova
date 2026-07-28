"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Globe,
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Hash,
  ImageOff,
  Code,
  BarChart3,
  Zap,
  Eye,
  ExternalLink,
  Radio,
  PauseCircle,
  PlayCircle,
  RefreshCw,
  Settings,
  FileDown,
} from "lucide-react";

type TabId = "overview" | "issues" | "history" | "monitoring" | "reports";

interface Scores {
  seo: number;
  performance: number;
  accessibility: number;
  previousSeo: number | null;
  scoreChange: number | null;
  previousPerformance: number | null;
  previousAccessibility: number | null;
}

interface IssueItem {
  type: string;
  severity: "critical" | "warning" | "info";
  summary: string;
  resource?: string;
  fixSuggestion?: string | null;
  fixStatus?: string;
}

interface FixIssueItem {
  id: string;
  issueType: string;
  issueKey: string;
  summary: string;
  suggestion: string | null;
  codeSnippet: string | null;
  status: string;
}

interface AlertItem {
  id: string;
  severity: string;
  changeType: string;
  summary: string;
  createdAt: string;
  readAt: string | null;
}

interface WebsiteData {
  domain: string;
  totalAudits: number;
  firstAuditAt: string;
  lastAuditAt: string;
  latestAuditId: string;
  latestScores: Scores;
  health: "healthy" | "needs_attention" | "critical";
  scoreHistory: { date: string; seoScore: number; performanceScore: number; accessibilityScore: number; id: string }[];
  comparison: {
    seoScore: { current: number; previous: number; change: number };
    performanceScore: { current: number; previous: number; change: number };
    accessibilityScore: { current: number; previous: number; change: number };
  } | null;
  issues: IssueItem[];
  fixIssues: {
    items: FixIssueItem[];
    counts: { open: number; addressed: number; total: number };
  };
  alerts: AlertItem[];
  monitoring: {
    id: string;
    status: string;
    frequency: string;
    nextRunAt: string;
    lastRunAt: string | null;
    lastRunStatus: string | null;
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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function relativeTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
}

function ScoreCard({
  label,
  score,
  previous,
  icon: Icon,
  color,
}: {
  label: string;
  score: number;
  previous: number | null;
  icon: typeof BarChart3;
  color: string;
}) {
  const change = previous !== null ? score - previous : null;
  return (
    <div className="rounded-xl border border-zinc-100 bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">{label}</span>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className={`text-3xl font-bold ${
          score >= 70 ? "text-emerald-600" : score >= 50 ? "text-amber-600" : "text-red-600"
        }`}>
          {score}
        </span>
        {change !== null && (
          <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${
            change > 0 ? "text-emerald-600" : change < 0 ? "text-red-600" : "text-zinc-400"
          }`}>
            {change > 0 ? <TrendingUp className="h-3 w-3" /> : change < 0 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
            {change > 0 ? "+" : ""}{change}
          </span>
        )}
      </div>
    </div>
  );
}

function HealthBadge({ health }: { health: string }) {
  const styles: Record<string, string> = {
    healthy: "bg-emerald-50 text-emerald-700 border-emerald-200",
    needs_attention: "bg-amber-50 text-amber-700 border-amber-200",
    critical: "bg-red-50 text-red-700 border-red-200",
  };
  const labels: Record<string, string> = {
    healthy: "Healthy",
    needs_attention: "Needs Attention",
    critical: "Critical",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${styles[health] || ""}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${
        health === "healthy" ? "bg-emerald-500" : health === "needs_attention" ? "bg-amber-500" : "bg-red-500"
      }`} />
      {labels[health] || health}
    </span>
  );
}

const tabs = [
  { id: "overview" as TabId, label: "Overview", icon: Eye },
  { id: "issues" as TabId, label: "Issues", icon: AlertTriangle },
  { id: "history" as TabId, label: "History", icon: Clock },
  { id: "monitoring" as TabId, label: "Monitoring", icon: Radio },
  { id: "reports" as TabId, label: "Reports", icon: FileText },
];

export default function SiteOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const domain = decodeURIComponent(params.domain as string);
  const [data, setData] = useState<WebsiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    axios.get(`/api/websites/${encodeURIComponent(domain)}`).then((res) => {
      if (!cancelled) setData(res.data);
    }).catch(() => {
      if (!cancelled) setError("Failed to load website data.");
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [domain]);

  const handleMonitoringAction = async (action: string) => {
    if (!data?.monitoring) return;
    setStatusUpdating(true);
    try {
      if (action === "run") {
        await axios.post(`/api/scheduled-audits/${data.monitoring.id}/run`);
      } else {
        const newStatus = action === "pause" ? "PAUSED" : "ACTIVE";
        await axios.patch(`/api/scheduled-audits/${data.monitoring.id}`, { status: newStatus });
      }
      const res = await axios.get(`/api/websites/${encodeURIComponent(domain)}`);
      setData(res.data);
    } catch {
      //
    } finally {
      setStatusUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-300" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100">
          <Globe className="h-7 w-7 text-zinc-400" />
        </div>
        <h2 className="text-lg font-semibold text-zinc-800">{error || "Website not found"}</h2>
        <p className="mt-1 text-sm text-zinc-500">No audit data available for this domain.</p>
        <button onClick={() => router.push("/dashboard/websites")} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-sm font-medium text-white transition-all hover:opacity-90">
          <ArrowLeft className="h-4 w-4" />
          Back to Websites
        </button>
      </div>
    );
  }

  const scores = data.latestScores;
  const criticalIssues = data.issues.filter((i) => i.severity === "critical");
  const warnings = data.issues.filter((i) => i.severity === "warning");
  const totalIssues = data.issues.length + data.fixIssues.counts.open;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-start gap-4">
        <button
          onClick={() => router.push("/dashboard/websites")}
          className="mt-1 rounded-xl border border-zinc-200 p-2.5 transition-colors hover:bg-zinc-100"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <h1 className="truncate text-2xl font-bold md:text-3xl">{data.domain}</h1>
            <HealthBadge health={data.health} />
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-500">
            <span className="inline-flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" />
              {data.totalAudits} audit{data.totalAudits !== 1 ? "s" : ""}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Last audit: {relativeTime(data.lastAuditAt)}
            </span>
            {data.monitoring?.status === "ACTIVE" && (
              <span className="inline-flex items-center gap-1.5 text-emerald-600">
                <Radio className="h-3.5 w-3.5" />
                Monitoring active
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-xl border border-zinc-200 bg-white p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-zinc-800 text-white"
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
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <ScoreCard label="SEO Score" score={scores.seo} previous={scores.previousSeo} icon={BarChart3} color="text-emerald-500" />
            <ScoreCard label="Performance" score={scores.performance} previous={scores.previousPerformance} icon={Zap} color="text-blue-500" />
            <ScoreCard label="Accessibility" score={scores.accessibility} previous={scores.previousAccessibility} icon={Eye} color="text-violet-500" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-red-100 bg-red-50/30 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-red-600">Critical Issues</p>
              <p className="mt-1 text-2xl font-bold text-red-600">{criticalIssues.length}</p>
            </div>
            <div className="rounded-xl border border-amber-100 bg-amber-50/30 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-amber-600">Warnings</p>
              <p className="mt-1 text-2xl font-bold text-amber-600">{warnings.length}</p>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-emerald-600">Issues Fixed</p>
              <p className="mt-1 text-2xl font-bold text-emerald-600">{data.fixIssues.counts.addressed}</p>
            </div>
            <div className="rounded-xl border border-zinc-100 bg-zinc-50/30 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">Open Issues</p>
              <p className="mt-1 text-2xl font-bold text-zinc-800">{totalIssues}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-zinc-100 bg-white p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Last Audit</p>
              <p className="mt-1 text-sm font-medium text-zinc-800">{formatDateTime(data.lastAuditAt)}</p>
              <Link href={`/dashboard/history/${data.latestAuditId}`} className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800">
                View Report <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
            <div className="rounded-xl border border-zinc-100 bg-white p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                {data.monitoring ? "Next Scheduled Audit" : "Monitoring"}
              </p>
              {data.monitoring ? (
                <>
                  <p className="mt-1 text-sm font-medium text-zinc-800">
                    {data.monitoring.status === "ACTIVE"
                      ? formatDateTime(data.monitoring.nextRunAt)
                      : "Paused"}
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs text-zinc-500">
                    <Radio className={`h-3 w-3 ${data.monitoring.status === "ACTIVE" ? "text-emerald-500" : "text-zinc-400"}`} />
                    {data.monitoring.frequency === "weekly" ? "Weekly" : "Monthly"} · {data.monitoring.status.toLowerCase()}
                  </span>
                </>
              ) : (
                <p className="mt-1 text-sm text-zinc-500">Not configured</p>
              )}
            </div>
          </div>

          {data.comparison && (
            <div className="rounded-xl border border-zinc-100 bg-white p-5">
              <h3 className="text-sm font-semibold text-zinc-800">Score Change Since Last Audit</h3>
              <div className="mt-3 space-y-3">
                {[
                  { label: "SEO Score", current: data.comparison.seoScore.current, previous: data.comparison.seoScore.previous, change: data.comparison.seoScore.change },
                  { label: "Performance", current: data.comparison.performanceScore.current, previous: data.comparison.performanceScore.previous, change: data.comparison.performanceScore.change },
                  { label: "Accessibility", current: data.comparison.accessibilityScore.current, previous: data.comparison.accessibilityScore.previous, change: data.comparison.accessibilityScore.change },
                ].map((metric) => (
                  <div key={metric.label} className="flex items-center justify-between rounded-lg bg-zinc-50 px-4 py-2.5">
                    <span className="text-sm text-zinc-600">{metric.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-zinc-400">{metric.previous} → {metric.current}</span>
                      <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${
                        metric.change > 0 ? "text-emerald-600" : metric.change < 0 ? "text-red-600" : "text-zinc-400"
                      }`}>
                        {metric.change > 0 ? <TrendingUp className="h-3 w-3" /> : metric.change < 0 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                        {metric.change > 0 ? "+" : ""}{metric.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.alerts.length > 0 && (
            <div className="rounded-xl border border-zinc-100 bg-white p-5">
              <h3 className="text-sm font-semibold text-zinc-800">Recent SEO Changes</h3>
              <div className="mt-3 space-y-2">
                {data.alerts.slice(0, 5).map((alert) => (
                  <div key={alert.id} className="flex items-start gap-3 rounded-lg bg-zinc-50 px-4 py-2.5">
                    {alert.severity === "CRITICAL" ? (
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                    ) : alert.severity === "WARNING" ? (
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                    ) : (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-zinc-700 line-clamp-1">{alert.summary}</p>
                      <p className="text-xs text-zinc-400">{relativeTime(alert.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "issues" && (
        <div className="space-y-6">
          {criticalIssues.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-red-600 mb-3">Critical ({criticalIssues.length})</h3>
              <div className="space-y-2">
                {criticalIssues.map((issue, i) => (
                  <IssueCard key={i} issue={issue} />
                ))}
              </div>
            </div>
          )}
          {warnings.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-600 mb-3">Warnings ({warnings.length})</h3>
              <div className="space-y-2">
                {warnings.map((issue, i) => (
                  <IssueCard key={i} issue={issue} />
                ))}
              </div>
            </div>
          )}
          {data.fixIssues.items.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-3">
                Fix Suggestions ({data.fixIssues.counts.open} open / {data.fixIssues.counts.total} total)
              </h3>
              <div className="space-y-2">
                {data.fixIssues.items.map((fix) => (
                  <FixIssueCard key={fix.id} fix={fix} />
                ))}
              </div>
            </div>
          )}
          {criticalIssues.length === 0 && warnings.length === 0 && data.fixIssues.items.length === 0 && (
            <div className="flex items-center justify-center py-12 text-sm text-zinc-400">
              <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" />
              No issues found for this website.
            </div>
          )}
        </div>
      )}

      {activeTab === "history" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-800">Audit History</h3>
            <Link
              href={`/dashboard/history`}
              className="text-xs font-medium text-blue-600 hover:text-blue-800"
            >
              View All History
            </Link>
          </div>
          {data.timeline.length === 0 ? (
            <p className="text-sm text-zinc-500">No audits found.</p>
          ) : (
            <div className="space-y-2">
              {data.timeline.map((entry) => (
                <Link
                  key={entry.id}
                  href={`/dashboard/history/${entry.id}`}
                  className="flex items-center justify-between rounded-xl border border-zinc-100 bg-white px-5 py-3.5 transition-colors hover:bg-zinc-50"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="text-sm text-zinc-500 whitespace-nowrap">{formatDate(entry.createdAt)}</span>
                    <div className="hidden sm:flex items-center gap-3">
                      <span className="text-xs text-zinc-400">SEO: {entry.seoScore}</span>
                      <span className="text-xs text-zinc-400">Perf: {entry.performanceScore}</span>
                      <span className="text-xs text-zinc-400">A11y: {entry.accessibilityScore}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {entry.scoreChange !== null && (
                      <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${
                        entry.scoreChange > 0 ? "text-emerald-600" : entry.scoreChange < 0 ? "text-red-600" : "text-zinc-400"
                      }`}>
                        {entry.scoreChange > 0 ? <TrendingUp className="h-3 w-3" /> : entry.scoreChange < 0 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                        {entry.scoreChange > 0 ? "+" : ""}{entry.scoreChange}
                      </span>
                    )}
                    <ExternalLink className="h-3.5 w-3.5 text-zinc-300" />
                  </div>
                </Link>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Link
              href={`/dashboard/history/sites/${encodeURIComponent(domain)}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
            >
              <BarChart3 className="h-3.5 w-3.5" />
              Score Trends
            </Link>
            <Link
              href={`/dashboard/history/${data.latestAuditId}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
            >
              <FileDown className="h-3.5 w-3.5" />
              Download PDF
            </Link>
          </div>
        </div>
      )}

      {activeTab === "monitoring" && (
        <div className="space-y-6">
          {data.monitoring ? (
            <div className="rounded-xl border border-zinc-100 bg-white p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    data.monitoring.status === "ACTIVE" ? "bg-emerald-100" : "bg-zinc-100"
                  }`}>
                    <Radio className={`h-5 w-5 ${data.monitoring.status === "ACTIVE" ? "text-emerald-600" : "text-zinc-400"}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-800">
                      {data.monitoring.status === "ACTIVE" ? "Monitoring Active" : "Monitoring Paused"}
                    </h3>
                    <p className="text-xs text-zinc-500">
                      {data.monitoring.frequency === "weekly" ? "Weekly" : "Monthly"} schedule
                    </p>
                  </div>
                </div>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  data.monitoring.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-600"
                }`}>
                  {data.monitoring.status}
                </span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-zinc-50 p-3">
                  <p className="text-xs text-zinc-500">Last Run</p>
                  <p className="mt-0.5 text-sm font-medium text-zinc-800">
                    {data.monitoring.lastRunAt ? formatDateTime(data.monitoring.lastRunAt) : "Never"}
                  </p>
                  {data.monitoring.lastRunStatus && (
                    <span className={`mt-1 inline-flex items-center text-xs ${
                      data.monitoring.lastRunStatus === "SUCCESS" ? "text-emerald-600" : "text-red-600"
                    }`}>
                      {data.monitoring.lastRunStatus}
                    </span>
                  )}
                </div>
                <div className="rounded-lg bg-zinc-50 p-3">
                  <p className="text-xs text-zinc-500">Next Run</p>
                  <p className="mt-0.5 text-sm font-medium text-zinc-800">
                    {data.monitoring.status === "ACTIVE"
                      ? formatDateTime(data.monitoring.nextRunAt)
                      : "Paused"}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {data.monitoring.status === "ACTIVE" ? (
                  <button
                    onClick={() => handleMonitoringAction("pause")}
                    disabled={statusUpdating}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 disabled:opacity-50"
                  >
                    {statusUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : <PauseCircle className="h-3.5 w-3.5" />}
                    Pause
                  </button>
                ) : (
                  <button
                    onClick={() => handleMonitoringAction("resume")}
                    disabled={statusUpdating}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-black px-4 py-2 text-xs font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
                  >
                    {statusUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : <PlayCircle className="h-3.5 w-3.5" />}
                    Resume
                  </button>
                )}
                <button
                  onClick={() => handleMonitoringAction("run")}
                  disabled={statusUpdating || data.monitoring.status !== "ACTIVE"}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 disabled:opacity-50"
                >
                  {statusUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                  Run Now
                </button>
                <Link
                  href="/dashboard/monitoring"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
                >
                  <Settings className="h-3.5 w-3.5" />
                  Edit Schedule
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100">
                <Radio className="h-6 w-6 text-zinc-400" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-800">No monitoring configured</h3>
              <p className="mt-1 text-xs text-zinc-500">Set up scheduled audits to monitor this website.</p>
              <Link
                href="/dashboard/monitoring"
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-black px-4 py-2 text-xs font-medium text-white transition-all hover:opacity-90"
              >
                <Radio className="h-3.5 w-3.5" />
                Configure Monitoring
              </Link>
            </div>
          )}
        </div>
      )}

      {activeTab === "reports" && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-zinc-800">Available Reports</h3>
          {data.timeline.length === 0 ? (
            <p className="text-sm text-zinc-500">No reports available yet.</p>
          ) : (
            <div className="space-y-2">
              {data.timeline.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-xl border border-zinc-100 bg-white px-5 py-3.5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="h-4 w-4 shrink-0 text-zinc-400" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-800">
                        Audit Report — {formatDate(entry.createdAt)}
                      </p>
                      <p className="text-xs text-zinc-500">
                        SEO: {entry.seoScore} · Perf: {entry.performanceScore} · A11y: {entry.accessibilityScore}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/dashboard/history/${entry.id}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
                    >
                      <Eye className="h-3 w-3" />
                      View
                    </Link>
                    <Link
                      href={`/dashboard/history/${entry.id}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
                    >
                      <FileDown className="h-3 w-3" />
                      PDF
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

function IssueCard({ issue }: { issue: IssueItem }) {
  const icons: Record<string, typeof FileText> = {
    MISSING_TITLE: FileText,
    MISSING_META_DESC: FileText,
    MISSING_H1: Hash,
    MISSING_ALT: ImageOff,
    LOW_SCORE: BarChart3,
  };
  const Icon = icons[issue.type] || AlertTriangle;

  return (
    <div className="flex items-start gap-3 rounded-xl border border-zinc-100 bg-white px-5 py-3.5">
      <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
        issue.severity === "critical" ? "bg-red-50 text-red-500" : "bg-amber-50 text-amber-500"
      }`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-zinc-800">{issue.summary}</p>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            issue.severity === "critical" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
          }`}>
            {issue.severity}
          </span>
        </div>
      </div>
    </div>
  );
}

function FixIssueCard({ fix }: { fix: FixIssueItem }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-zinc-100 bg-white">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start gap-3 px-5 py-3.5 text-left"
      >
        <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
          fix.status !== "OPEN" ? "bg-emerald-100 text-emerald-600" : "bg-amber-50 text-amber-600"
        }`}>
          {fix.status !== "OPEN" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-zinc-800">{fix.summary}</p>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              fix.status !== "OPEN" ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-600"
            }`}>
              {fix.status === "VERIFIED_FIXED" ? "Fixed" : fix.status === "ADDRESSED" ? "Addressed" : "Open"}
            </span>
          </div>
        </div>
      </button>
      {expanded && (
        <div className="border-t border-zinc-100 px-5 py-3">
          {fix.suggestion && <p className="text-sm text-zinc-600">{fix.suggestion}</p>}
          {fix.codeSnippet && (
            <div className="mt-2 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
              <div className="flex items-center gap-1.5 border-b border-zinc-200 px-3 py-1.5">
                <Code className="h-3 w-3 text-zinc-400" />
                <span className="text-xs font-medium text-zinc-500">Suggested Code</span>
              </div>
              <pre className="overflow-x-auto px-3 py-2.5 text-xs text-zinc-800">{fix.codeSnippet}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
