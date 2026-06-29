"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import {
  BarChart3,
  Loader2,
  TrendingUp,
  PieChart,
  Activity,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface DayData {
  date: string;
  count: number;
}

interface PlanData {
  name: string;
  value: number;
}

interface Analytics {
  newUsers: DayData[];
  auditsPerDay: DayData[];
  planDistribution: PlanData[];
}

const PLAN_COLORS: Record<string, string> = {
  FREE: "#a1a1aa",
  STARTER: "#3b82f6",
  PRO: "#6366f1",
  ENTERPRISE: "#f59e0b",
};

export default function AdminAnalytics() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const res = await axios.get("/api/admin/analytics");
        setData(res.data);
      } catch {}
      setLoading(false);
    }
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-32 text-zinc-400">
        Failed to load analytics.
      </div>
    );
  }

  const totalNewUsers = data.newUsers.reduce((s, d) => s + d.count, 0);
  const totalAudits = data.auditsPerDay.reduce((s, d) => s + d.count, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-800">Analytics</h1>
        <p className="mt-1 text-zinc-500">
          Platform metrics over the last 30 days.
        </p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-blue-500 shadow-lg shadow-blue-200/50">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-zinc-500">New Users (30d)</p>
              <p className="text-2xl font-bold text-zinc-800">
                {totalNewUsers}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-500 shadow-lg shadow-emerald-200/50">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-zinc-500">Audits (30d)</p>
              <p className="text-2xl font-bold text-zinc-800">{totalAudits}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* New Users Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-zinc-200 bg-white p-6"
        >
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            <h2 className="text-sm font-semibold text-zinc-700">
              New Users
            </h2>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.newUsers}>
                <defs>
                  <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#71717a" }}
                  tickFormatter={(v: string) => {
                    const d = new Date(v);
                    return `${d.getMonth() + 1}/${d.getDate()}`;
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 10, fill: "#71717a" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e4e4e7",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    fontSize: 12,
                  }}
                  labelFormatter={(v) =>
                    typeof v === "string"
                      ? new Date(v).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      : v
                  }
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#userGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Audits Per Day Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-zinc-200 bg-white p-6"
        >
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-emerald-500" />
            <h2 className="text-sm font-semibold text-zinc-700">
              Audits Per Day
            </h2>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.auditsPerDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#71717a" }}
                  tickFormatter={(v: string) => {
                    const d = new Date(v);
                    return `${d.getMonth() + 1}/${d.getDate()}`;
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 10, fill: "#71717a" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e4e4e7",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    fontSize: 12,
                  }}
                  labelFormatter={(v) =>
                    typeof v === "string"
                      ? new Date(v).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      : v
                  }
                />
                <Bar
                  dataKey="count"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Plan Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-zinc-200 bg-white p-6"
        >
          <div className="mb-4 flex items-center gap-2">
            <PieChart className="h-5 w-5 text-indigo-500" />
            <h2 className="text-sm font-semibold text-zinc-700">
              Plan Distribution
            </h2>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={data.planDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {data.planDistribution.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={PLAN_COLORS[entry.name] ?? "#a1a1aa"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e4e4e7",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    fontSize: 12,
                  }}
                />
                <Legend
                  formatter={(value: string) => (
                    <span className="text-xs text-zinc-600">{value}</span>
                  )}
                />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
