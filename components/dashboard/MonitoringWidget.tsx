"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { Radar, Clock, ArrowRight, Loader2 } from "lucide-react";

interface ScheduleItem {
  id: string;
  websiteUrl: string;
  frequency: string;
  status: string;
  nextRunAt: string;
  currentSeoScore: number | null;
  lastAuditAt: string | null;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function MonitoringWidget() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("/api/scheduled-audits");
        setSchedules(res.data.schedules.slice(0, 5));
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
        <h2 className="text-lg font-semibold">Monitoring</h2>
        <div className="mt-6 flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
        </div>
      </div>
    );
  }

  const activeCount = schedules.filter((s) => s.status === "ACTIVE").length;
  const nextSchedule = schedules
    .filter((s) => s.status === "ACTIVE")
    .sort(
      (a, b) =>
        new Date(a.nextRunAt).getTime() - new Date(b.nextRunAt).getTime()
    )[0];

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Monitoring</h2>
        <Link
          href="/dashboard/monitoring"
          className="text-sm font-medium text-zinc-500 transition-colors hover:text-black"
        >
          View all
        </Link>
      </div>

      {schedules.length === 0 ? (
        <div className="mt-6 rounded-xl bg-zinc-50 px-6 py-8 text-center">
          <Radar className="mx-auto mb-3 h-8 w-8 text-zinc-300" />
          <p className="text-sm text-zinc-500">
            No websites being monitored yet.
          </p>
          <Link
            href="/dashboard/monitoring"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-black hover:underline"
          >
            Start monitoring
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-4 flex items-center gap-4">
            <div className="rounded-xl bg-zinc-50 px-4 py-2">
              <p className="text-xs text-zinc-400">Monitored</p>
              <p className="text-lg font-bold text-zinc-800">{activeCount}</p>
            </div>
            {nextSchedule && (
              <div className="rounded-xl bg-zinc-50 px-4 py-2">
                <p className="text-xs text-zinc-400">Next Audit</p>
                <p className="text-sm font-semibold text-zinc-700">
                  {nextSchedule.websiteUrl.length > 20
                    ? nextSchedule.websiteUrl.substring(0, 20) + "..."
                    : nextSchedule.websiteUrl}
                </p>
                <p className="flex items-center gap-1 text-xs text-zinc-500">
                  <Clock className="h-3 w-3" />
                  {formatDate(nextSchedule.nextRunAt)}
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 space-y-2">
            {schedules.slice(0, 3).map((s) => (
              <Link
                key={s.id}
                href="/dashboard/monitoring"
                className="flex items-center justify-between rounded-xl border border-zinc-100 px-4 py-2.5 transition-all hover:border-zinc-200 hover:bg-zinc-50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-700">
                    {s.websiteUrl}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {s.frequency === "weekly" ? "Weekly" : "Monthly"}
                    {s.currentSeoScore !== null && ` • Score: ${s.currentSeoScore}`}
                  </p>
                </div>
                <span
                  className={`h-2 w-2 rounded-full ${
                    s.status === "ACTIVE" ? "bg-emerald-500" : "bg-zinc-300"
                  }`}
                />
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
