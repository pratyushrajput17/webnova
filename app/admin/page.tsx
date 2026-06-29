"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import {
  Users,
  FileSearch,
  CreditCard,
  Ticket,
  DollarSign,
  Loader2,
  Megaphone,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  totalAudits: number;
  totalRedeemed: number;
  activeSubscriptions: number;
  totalRevenue: number;
}

const statCards = [
  {
    key: "totalUsers" as const,
    label: "Total Users",
    icon: Users,
    color: "from-blue-400 to-blue-500",
    shadow: "shadow-blue-200/50",
  },
  {
    key: "totalAudits" as const,
    label: "Total Audits",
    icon: FileSearch,
    color: "from-emerald-400 to-emerald-500",
    shadow: "shadow-emerald-200/50",
  },
  {
    key: "activeSubscriptions" as const,
    label: "Active Subscriptions",
    icon: CreditCard,
    color: "from-violet-400 to-violet-500",
    shadow: "shadow-violet-200/50",
  },
  {
    key: "totalRedeemed" as const,
    label: "Redeemed Codes",
    icon: Ticket,
    color: "from-amber-400 to-amber-500",
    shadow: "shadow-amber-200/50",
  },
  {
    key: "totalRevenue" as const,
    label: "Estimated Revenue",
    icon: DollarSign,
    color: "from-rose-400 to-rose-500",
    shadow: "shadow-rose-200/50",
  },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastLink, setBroadcastLink] = useState("");
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    async function fetch() {
      try {
        const res = await axios.get("/api/admin/stats");
        setStats(res.data);
      } catch {}
      setLoading(false);
    }
    fetch();
  }, []);

  const handleBroadcast = async () => {
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;
    setBroadcasting(true);
    setBroadcastResult(null);
    try {
      const res = await axios.post("/api/notifications/broadcast", {
        title: broadcastTitle.trim(),
        message: broadcastMessage.trim(),
        link: broadcastLink.trim() || undefined,
      });
      setBroadcastResult({
        success: true,
        message: `Announcement sent to ${res.data.sentTo} users.`,
      });
      setBroadcastTitle("");
      setBroadcastMessage("");
      setBroadcastLink("");
    } catch {
      setBroadcastResult({ success: false, message: "Failed to send announcement." });
    }
    setBroadcasting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-800">Admin Dashboard</h1>
        <p className="mt-1 text-zinc-500">
          Overview of your WebNova platform.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          const value = stats ? stats[card.key] : 0;
          const display =
            card.key === "totalRevenue" ? `$${value.toLocaleString()}` : value.toLocaleString();

          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${card.color} shadow-lg ${card.shadow}`}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-500">
                    {card.label}
                  </p>
                  <p className="mt-0.5 text-2xl font-bold text-zinc-800">
                    {display}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-10">
        <h2 className="mb-4 text-xl font-bold text-zinc-800">
          Announcement
        </h2>
        <p className="mb-6 text-sm text-zinc-500">
          Send a notification to all platform users.
        </p>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Title
              </label>
              <input
                type="text"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                placeholder="e.g. New Feature Released"
                className="mt-1.5 w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none transition-colors focus:border-zinc-300"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Message
              </label>
              <textarea
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                rows={3}
                placeholder="Write your announcement..."
                className="mt-1.5 w-full resize-none rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none transition-colors focus:border-zinc-300"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Link (optional)
              </label>
              <input
                type="text"
                value={broadcastLink}
                onChange={(e) => setBroadcastLink(e.target.value)}
                placeholder="e.g. /dashboard/audits"
                className="mt-1.5 w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none transition-colors focus:border-zinc-300"
              />
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleBroadcast}
                disabled={broadcasting || !broadcastTitle.trim() || !broadcastMessage.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
              >
                {broadcasting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Megaphone className="h-4 w-4" />
                )}
                Send Announcement
              </button>
              {broadcastResult && (
                <div
                  className={`flex items-center gap-2 text-sm ${
                    broadcastResult.success ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {broadcastResult.success ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  {broadcastResult.message}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
