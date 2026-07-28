"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Globe,
  TrendingUp,
  FileText,
  BarChart3,
  Users,
  Loader2,
  AlertTriangle,
  TrendingDown,
} from "lucide-react";
import Link from "next/link";
import axios from "axios";
import StatsCard from "@/components/dashboard/StatsCard";
import ActivityCard from "@/components/dashboard/ActivityCard";
import TaskCard from "@/components/dashboard/TaskCard";
import RecentAuditsWidget from "@/components/dashboard/RecentAuditsWidget";
import UsageCard from "@/components/dashboard/UsageCard";
import ProgressCard from "@/components/dashboard/ProgressCard";
import MonitoringWidget from "@/components/dashboard/MonitoringWidget";
import RecentAlertsWidget from "@/components/dashboard/RecentAlertsWidget";
import FixProgressWidget from "@/components/fix/FixProgressWidget";

interface DashboardData {
  totalAudits: number;
  auditsThisMonth: number;
  averageSeoScore: number;
  reportsGenerated: number;
  competitorAnalyses: number;
  auditRemaining: number;
  auditLimit: number;
  competitorRemaining: number;
  competitorLimit: number;
  plan: string;
  subscriptionEndsAt: string | null;
  createdAt: string;
  chartData: { month: string; score: number }[];
  recentActivity: { text: string; time: string }[];
  upcomingTasks: { text: string; completed: boolean }[];
}

interface WebsiteSummary {
  domain: string;
  latestScore: number;
  scoreChange: number | null;
  health: string;
  latestAuditId: string;
  lastAuditedAt: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [websites, setWebsites] = useState<WebsiteSummary[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [dashRes, sitesRes] = await Promise.all([
          axios.get("/api/dashboard"),
          axios.get("/api/websites").catch(() => ({ data: { websites: [] } })),
        ]);
        setData(dashRes.data);
        setWebsites(sitesRes.data.websites || []);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const criticalSites = websites.filter((w) => w.health === "critical").sort((a, b) => a.latestScore - b.latestScore);
  const needsAttentionSites = websites.filter((w) => w.health === "needs_attention");
  const healthyCount = websites.filter((w) => w.health === "healthy").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  const stats = [
    { title: "Total Audits", value: data?.totalAudits ?? 0, icon: Globe },
    {
      title: "This Month Audits",
      value: data?.auditsThisMonth ?? 0,
      icon: FileText,
    },
    {
      title: "Average SEO Score",
      value: data ? `${data.averageSeoScore}%` : "0%",
      icon: TrendingUp,
    },
    {
      title: "Reports Generated",
      value: data?.reportsGenerated ?? 0,
      icon: BarChart3,
    },
    {
      title: "Competitor Analyses",
      value: data?.competitorAnalyses ?? 0,
      icon: Users,
    },
    {
      title: "Remaining Audits",
      value: data ? `${data.auditRemaining}/${data.auditLimit}` : "0/0",
      icon: BarChart3,
    },
  ];

  const chartData = data?.chartData ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-3xl font-bold">Dashboard Overview</h1>

      <div className="mt-8">
        <UsageCard />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((stat, i) => (
          <StatsCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            delay={i * 0.1}
          />
        ))}
      </motion.div>

      {websites.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mt-8"
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Link href="/dashboard/websites" className="rounded-xl border border-zinc-100 bg-white p-4 transition-colors hover:bg-zinc-50">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Websites</p>
              <p className="mt-1 text-2xl font-bold text-zinc-900">{websites.length}</p>
            </Link>
            <div className="rounded-xl border border-zinc-100 bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Healthy</p>
              <p className="mt-1 text-2xl font-bold text-emerald-600">{healthyCount}</p>
            </div>
            <div className="rounded-xl border border-zinc-100 bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-amber-600">Needs Attention</p>
              <p className="mt-1 text-2xl font-bold text-amber-600">{needsAttentionSites.length}</p>
            </div>
            <Link href="/dashboard/websites?filter=critical" className="rounded-xl border border-red-100 bg-white p-4 transition-colors hover:bg-red-50">
              <p className="text-xs font-medium uppercase tracking-wider text-red-600">Critical</p>
              <p className="mt-1 text-2xl font-bold text-red-600">{criticalSites.length}</p>
            </Link>
          </div>
          {criticalSites.length > 0 && (
            <div className="mt-4 rounded-xl border border-red-100 bg-red-50/50 p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-red-800">
                <AlertTriangle className="h-4 w-4" />
                Websites Requiring Immediate Attention
              </h3>
              <div className="mt-3 space-y-2">
                {criticalSites.slice(0, 5).map((site) => (
                  <Link
                    key={site.domain}
                    href={`/dashboard/sites/${encodeURIComponent(site.domain)}`}
                    className="flex items-center justify-between rounded-lg bg-white px-4 py-2.5 transition-colors hover:bg-zinc-50"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <TrendingDown className="h-4 w-4 shrink-0 text-red-500" />
                      <span className="truncate text-sm font-medium text-zinc-800">{site.domain}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-bold text-red-600">{site.latestScore}</span>
                      {site.scoreChange !== null && site.scoreChange < 0 && (
                        <span className="text-xs text-red-500">{site.scoreChange}</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
              {criticalSites.length > 5 && (
                <Link
                  href="/dashboard/websites?filter=critical"
                  className="mt-2 inline-flex text-xs font-medium text-red-600 hover:text-red-800"
                >
                  View all {criticalSites.length} critical websites
                </Link>
              )}
            </div>
          )}
        </motion.div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-2xl border border-zinc-200 bg-white p-6 lg:col-span-2"
        >
          <h2 className="text-lg font-semibold">Monthly SEO Score</h2>
          {chartData.length === 0 ? (
            <div className="mt-6 flex h-72 items-center justify-center rounded-xl bg-zinc-50">
              <p className="text-sm text-zinc-500">
                No audit data yet. Run your first audit to see your SEO score
                trend.
              </p>
            </div>
          ) : (
            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                  <XAxis
                    dataKey="month"
                    stroke="#a1a1aa"
                    fontSize={12}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#a1a1aa"
                    fontSize={12}
                    domain={[0, 100]}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e4e4e7",
                      background: "#fff",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#18181b"
                    strokeWidth={2}
                    dot={{ fill: "#18181b", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: "#18181b" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="lg:col-span-3"
        >
          <RecentAuditsWidget />
        </motion.div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
        >
          <ProgressCard />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <MonitoringWidget />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.42 }}
        >
          <FixProgressWidget />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.45 }}
        className="mt-8"
      >
        <RecentAlertsWidget />
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mt-8 grid gap-8 lg:grid-cols-2"
      >
        <ActivityCard
          title="Recent Activity"
          activities={data?.recentActivity ?? []}
        />
        <TaskCard
          title="Upcoming Tasks"
          tasks={data?.upcomingTasks ?? []}
        />
      </motion.div>
    </motion.div>
  );
}
