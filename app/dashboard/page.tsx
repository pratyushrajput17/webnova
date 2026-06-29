"use client";

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
  Users,
  AlertTriangle,
} from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import ActivityCard from "@/components/dashboard/ActivityCard";
import TaskCard from "@/components/dashboard/TaskCard";
import RecentAuditsWidget from "@/components/dashboard/RecentAuditsWidget";
import UsageCard from "@/components/dashboard/UsageCard";

const stats = [
  { title: "Total Audits", value: "154", icon: Globe },
  { title: "Average SEO Score", value: "91%", icon: TrendingUp },
  { title: "Competitors Tracked", value: "28", icon: Users },
  { title: "Issues Found", value: "46", icon: AlertTriangle },
];

const chartData = [
  { month: "Jan", score: 65 },
  { month: "Feb", score: 72 },
  { month: "Mar", score: 76 },
  { month: "Apr", score: 81 },
  { month: "May", score: 88 },
  { month: "Jun", score: 91 },
];

const recentActivities = [
  { text: "Audit completed for webnova.com", time: "2 hours ago" },
  { text: "Competitor added successfully", time: "5 hours ago" },
  { text: "SEO score improved by 4%", time: "1 day ago" },
  { text: "PDF report exported", time: "2 days ago" },
];

const upcomingTasks = [
  { text: "Run weekly audit", completed: false },
  { text: "Review competitor report", completed: false },
  { text: "Fix SEO warnings", completed: false },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export default function DashboardPage() {
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
        <ActivityCard activities={recentActivities} />
        <TaskCard tasks={upcomingTasks} />
      </motion.div>
    </motion.div>
  );
}
