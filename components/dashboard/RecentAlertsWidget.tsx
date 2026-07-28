"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import {
  Loader2,
  Bell,
  AlertTriangle,
  CheckCircle2,
  Info,
  ArrowRight,
} from "lucide-react";

interface AlertItem {
  id: string;
  websiteUrl: string;
  severity: string;
  changeType: string;
  summary: string;
  createdAt: string;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHours = Math.floor(diffMs / 3600000);
  if (diffHours < 1) return `${Math.floor(diffMs / 60000)}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  return `${diffDays}d ago`;
}

function getDomain(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
}

function getAlertIndicator(severity: string) {
  switch (severity) {
    case "CRITICAL":
      return {
        icon: AlertTriangle,
        bg: "bg-red-50 text-red-600",
        border: "border-red-200",
      };
    case "WARNING":
      return {
        icon: AlertTriangle,
        bg: "bg-amber-50 text-amber-600",
        border: "border-amber-200",
      };
    case "IMPROVEMENT":
      return {
        icon: CheckCircle2,
        bg: "bg-emerald-50 text-emerald-600",
        border: "border-emerald-200",
      };
    default:
      return {
        icon: Info,
        bg: "bg-blue-50 text-blue-600",
        border: "border-blue-200",
      };
  }
}

export default function RecentAlertsWidget() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("/api/alerts?limit=5");
        setAlerts(res.data.alerts ?? []);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Recent SEO Changes</h2>
        <div className="mt-6 flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recent SEO Changes</h2>
        <Link
          href="/dashboard/alerts"
          className="text-sm font-medium text-zinc-500 transition-colors hover:text-black"
        >
          View all
        </Link>
      </div>

      {alerts.length === 0 ? (
        <div className="mt-6 rounded-xl bg-zinc-50 px-6 py-8 text-center">
          <Bell className="mx-auto mb-3 h-8 w-8 text-zinc-300" />
          <p className="text-sm text-zinc-500">
            No change alerts yet.
          </p>
          <Link
            href="/dashboard/monitoring"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-black hover:underline"
          >
            Set up monitoring
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          {alerts.map((alert) => {
            const indicator = getAlertIndicator(alert.severity);
            const Icon = indicator.icon;
            return (
              <Link
                key={alert.id}
                href="/dashboard/alerts"
                className={`flex items-start gap-3 rounded-xl border p-3.5 transition-all hover:shadow-sm ${indicator.border}`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${indicator.bg}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-800">
                    {alert.summary}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {getDomain(alert.websiteUrl)}
                    <span className="mx-1">•</span>
                    {formatDate(alert.createdAt)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
