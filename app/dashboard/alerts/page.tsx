"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import axios from "axios";
import {
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Info,
  Bell,
  RefreshCw,
} from "lucide-react";

interface Alert {
  id: string;
  websiteUrl: string;
  severity: string;
  changeType: string;
  summary: string;
  metadata: Record<string, unknown>;
  emailStatus: string;
  emailSentAt: string | null;
  readAt: string | null;
  createdAt: string;
}

function getSeverityBadge(severity: string) {
  switch (severity) {
    case "CRITICAL":
      return {
        icon: AlertTriangle,
        bg: "bg-red-50 text-red-700 border-red-200",
        label: "Critical",
      };
    case "WARNING":
      return {
        icon: AlertTriangle,
        bg: "bg-amber-50 text-amber-700 border-amber-200",
        label: "Warning",
      };
    case "IMPROVEMENT":
      return {
        icon: CheckCircle2,
        bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        label: "Improvement",
      };
    default:
      return {
        icon: Info,
        bg: "bg-blue-50 text-blue-700 border-blue-200",
        label: "Info",
      };
  }
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) {
    const hrs = Math.floor(diffMs / 3600000);
    if (hrs < 1) return `${Math.floor(diffMs / 60000)}m ago`;
    return `${hrs}h ago`;
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getDomain(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/alerts");
      setAlerts(res.data.alerts ?? []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAlerts();
  }, []);

  const filteredAlerts =
    filter === "all"
      ? alerts
      : alerts.filter((a) => a.severity === filter.toUpperCase());

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Alert History</h1>
          <p className="mt-2 text-zinc-600">
            Monitor SEO changes detected across your websites.
          </p>
        </div>
        <button
          onClick={fetchAlerts}
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {["all", "CRITICAL", "WARNING", "IMPROVEMENT", "INFORMATIONAL"].map(
          (f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                filter === f
                  ? "border-black bg-black text-white"
                  : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              {f === "all"
                ? "All"
                : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          )
        )}
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white py-20 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100">
              <Bell className="h-8 w-8 text-zinc-400" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-800">
              No alerts yet
            </h3>
            <p className="mt-2 text-sm text-zinc-500">
              SEO change alerts will appear here after scheduled audits detect
              meaningful changes.
            </p>
            <Link
              href="/dashboard/monitoring"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-medium text-white transition-all hover:opacity-90"
            >
              Set up monitoring
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAlerts.map((alert, i) => {
              const badge = getSeverityBadge(alert.severity);
              const Icon = badge.icon;
              const isUnread = !alert.readAt;
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className={`rounded-2xl border bg-white p-5 transition-all hover:shadow-sm ${
                    isUnread
                      ? "border-zinc-300"
                      : "border-zinc-200"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${badge.bg}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${badge.bg}`}
                          >
                            {badge.label}
                          </span>
                          <span className="text-sm font-medium text-zinc-800">
                            {getDomain(alert.websiteUrl)}
                          </span>
                          {isUnread && (
                            <span className="h-2 w-2 rounded-full bg-blue-500" />
                          )}
                        </div>
                        <span className="text-xs text-zinc-400">
                          {formatDate(alert.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm text-zinc-600">
                        {alert.summary}
                      </p>
                      <div className="mt-2 flex items-center gap-3">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium ${
                            alert.emailStatus === "SENT"
                              ? "text-emerald-600"
                              : alert.emailStatus === "FAILED"
                                ? "text-red-500"
                                : "text-zinc-400"
                          }`}
                        >
                          {alert.emailStatus === "SENT"
                            ? "Email Sent"
                            : alert.emailStatus === "FAILED"
                              ? "Email Failed"
                              : alert.emailStatus === "PENDING"
                                ? "Pending"
                                : "No Email"}
                        </span>
                        {alert.emailSentAt && (
                          <span className="text-xs text-zinc-400">
                            {formatDate(alert.emailSentAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
