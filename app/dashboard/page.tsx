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
  Loader2,
} from "lucide-react";
import axios from "axios";
import StatsCard from "@/components/dashboard/StatsCard";
import ActivityCard from "@/components/dashboard/ActivityCard";
import TaskCard from "@/components/dashboard/TaskCard";
import RecentAuditsWidget from "@/components/dashboard/RecentAuditsWidget";
import UsageCard from "@/components/dashboard/UsageCard";

interface DashboardData {
  totalAudits: number;
  auditsThisMonth: number;
  averageSeoScore: number;
  reportsGenerated: number;
  plan: string;
  subscriptionEndsAt: string | null;
  createdAt: string;
  chartData: { month: string; score: number }[];
  recentActivity: { text: string; time: string }[];
  upcomingTasks: { text: string; completed: boolean }[];
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

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("/api/dashboard");
        setData(res.data);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
