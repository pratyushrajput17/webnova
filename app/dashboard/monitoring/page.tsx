"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import axios from "axios";
import {
  Plus,
  Loader2,
  Radar,
  Clock,
  Pause,
  Play,
  Trash2,
  ExternalLink,
  Zap,
  AlertCircle,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Bell,
  BellOff,
  Settings2,
  X,
} from "lucide-react";

interface Schedule {
  id: string;
  websiteUrl: string;
  frequency: string;
  status: string;
  lastRunAt: string | null;
  nextRunAt: string;
  lastAttemptAt: string | null;
  lastRunStatus: string | null;
  lastError: string | null;
  createdAt: string;
  latestAuditId: string | null;
  currentSeoScore: number | null;
  lastAuditAt: string | null;
}

function getScoreColor(score: number): string {
  if (score >= 90) return "text-emerald-600 bg-emerald-50 border-emerald-200";
  if (score >= 70) return "text-amber-600 bg-amber-50 border-amber-200";
  return "text-red-600 bg-red-50 border-red-200";
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatFrequency(f: string): string {
  return f === "weekly" ? "Weekly" : "Monthly";
}

function getStatusBadge(status: string) {
  switch (status) {
    case "ACTIVE":
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
          <CheckCircle2 className="h-3 w-3" />
          Active
        </span>
      );
    case "PAUSED":
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
          <Pause className="h-3 w-3" />
          Paused
        </span>
      );
    case "LIMIT_REACHED":
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
          <AlertCircle className="h-3 w-3" />
          Limit Reached
        </span>
      );
    case "FAILED":
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
          <AlertCircle className="h-3 w-3" />
          Failed
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
          {status}
        </span>
      );
  }
}

export default function MonitoringPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addUrl, setAddUrl] = useState("");
  const [addFrequency, setAddFrequency] = useState<"weekly" | "monthly">("weekly");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [alertSettingsSite, setAlertSettingsSite] = useState<string | null>(null);
  const [alertPrefs, setAlertPrefs] = useState<Record<string, {
    emailAlerts: boolean;
    improvementAlerts: boolean;
    notificationEmail: string;
    thresholds: Record<string, number>;
  }>>({});
  const [savingAlertPrefs, setSavingAlertPrefs] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await axios.get("/api/scheduled-audits");
        if (!cancelled) setSchedules(res.data.schedules);
      } catch {}
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [refreshKey]);

  const handleAdd = async () => {
    if (!addUrl.trim()) {
      setAddError("Please enter a URL.");
      return;
    }
    setAdding(true);
    setAddError(null);
    try {
      await axios.post("/api/scheduled-audits", {
        url: addUrl.trim(),
        frequency: addFrequency,
      });
      setShowAddModal(false);
      setAddUrl("");
      setAddFrequency("weekly");
      setRefreshKey((k) => k + 1);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setAddError(err.response.data.error);
      } else {
        setAddError("Failed to create schedule.");
      }
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (id: string, currentStatus: string) => {
    setActionLoading(id);
    try {
      const newStatus = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";
      await axios.patch(`/api/scheduled-audits/${id}`, {
        status: newStatus,
      });
      setRefreshKey((k) => k + 1);
    } catch {
      // silently fail
    } finally {
      setActionLoading(null);
    }
  };

  const handleRunNow = async (id: string) => {
    setActionLoading(id);
    try {
      await axios.post(`/api/scheduled-audits/${id}/run`);
      setRefreshKey((k) => k + 1);
    } catch {
      // silently fail
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this monitoring schedule? Previous audits will be preserved.")) return;
    setActionLoading(id);
    try {
      await axios.delete(`/api/scheduled-audits/${id}`);
      setSchedules((prev) => prev.filter((s) => s.id !== id));
    } catch {
      // silently fail
    } finally {
      setActionLoading(null);
    }
  };

  const fetchAlertPrefs = async () => {
    try {
      const res = await axios.get("/api/alert-preferences");
      const prefsMap: Record<string, typeof alertPrefs[string]> = {};
      for (const p of res.data.preferences ?? []) {
        prefsMap[p.websiteUrl] = {
          emailAlerts: p.emailAlerts,
          improvementAlerts: p.improvementAlerts,
          notificationEmail: p.notificationEmail ?? "",
          thresholds: p.thresholds ?? {},
        };
      }
      setAlertPrefs(prefsMap);
    } catch {
      // silently fail
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAlertPrefs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const handleSaveAlertPrefs = async (websiteUrl: string) => {
    const prefs = alertPrefs[websiteUrl];
    if (!prefs) return;
    setSavingAlertPrefs(true);
    try {
      await axios.put("/api/alert-preferences", {
        websiteUrl,
        emailAlerts: prefs.emailAlerts,
        improvementAlerts: prefs.improvementAlerts,
        notificationEmail: prefs.notificationEmail || null,
        thresholds: prefs.thresholds,
      });
      setAlertSettingsSite(null);
    } catch {
      // silently fail
    } finally {
      setSavingAlertPrefs(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Website Monitoring</h1>
          <p className="mt-2 text-zinc-600">
            Schedule automatic SEO audits for your websites.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition-all hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Monitor Website
        </button>
      </div>

      {showAddModal && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6"
        >
          <h2 className="text-lg font-semibold">Add Website Monitoring</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700">
                Website URL
              </label>
              <input
                type="text"
                placeholder="example.com"
                value={addUrl}
                onChange={(e) => setAddUrl(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-zinc-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700">
                Audit Frequency
              </label>
              <div className="mt-2 flex gap-3">
                <button
                  onClick={() => setAddFrequency("weekly")}
                  className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                    addFrequency === "weekly"
                      ? "border-black bg-black text-white"
                      : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  <Calendar className="mr-2 inline h-4 w-4" />
                  Weekly
                </button>
                <button
                  onClick={() => setAddFrequency("monthly")}
                  className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                    addFrequency === "monthly"
                      ? "border-black bg-black text-white"
                      : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  <Calendar className="mr-2 inline h-4 w-4" />
                  Monthly
                </button>
              </div>
            </div>

            {addError && (
              <p className="text-sm text-red-600">{addError}</p>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setAddError(null);
                }}
                className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={adding}
                className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
              >
                {adding ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Add Schedule
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="mt-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
          </div>
        ) : schedules.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white py-20 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100">
              <Radar className="h-8 w-8 text-zinc-400" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-800">
              No websites being monitored
            </h3>
            <p className="mt-2 text-sm text-zinc-500">
              Add a website to start automatic SEO monitoring.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-medium text-white transition-all hover:opacity-90"
            >
              Monitor your first website
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  <th className="px-6 py-4 text-left font-medium text-zinc-500">
                    Website
                  </th>
                  <th className="px-6 py-4 text-center font-medium text-zinc-500">
                    SEO Score
                  </th>
                  <th className="px-6 py-4 text-center font-medium text-zinc-500">
                    Schedule
                  </th>
                  <th className="px-6 py-4 text-left font-medium text-zinc-500">
                    Last Audit
                  </th>
                  <th className="px-6 py-4 text-left font-medium text-zinc-500">
                    Next Audit
                  </th>
                  <th className="px-6 py-4 text-center font-medium text-zinc-500">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right font-medium text-zinc-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-zinc-100 transition-colors hover:bg-zinc-50"
                  >
                    <td className="px-6 py-4">
                      <span className="font-medium text-zinc-800">
                        {s.websiteUrl}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {s.currentSeoScore !== null ? (
                        <span
                          className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${getScoreColor(s.currentSeoScore)}`}
                        >
                          {s.currentSeoScore}
                        </span>
                      ) : (
                        <span className="text-zinc-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 text-sm text-zinc-600">
                        <Clock className="h-3.5 w-3.5 text-zinc-400" />
                        {formatFrequency(s.frequency)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-zinc-500">
                        {s.lastAuditAt
                          ? formatDateTime(s.lastAuditAt)
                          : "Never"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-zinc-500">
                        {formatDateTime(s.nextRunAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(s.status)}
                      {s.lastRunStatus === "FAILED" && s.lastError && (
                        <p className="mt-1 text-xs text-red-500">
                          {s.lastError}
                        </p>
                      )}
                      {s.lastRunStatus === "LIMIT_REACHED" && (
                        <p className="mt-1 text-xs text-amber-500">
                          Audit limit reached
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {s.latestAuditId && (
                          <Link
                            href={`/dashboard/history/${s.latestAuditId}`}
                            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
                            title="View Report"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        )}
                        <button
                          onClick={() => handleRunNow(s.id)}
                          disabled={actionLoading === s.id || s.status === "PAUSED"}
                          className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50"
                          title="Run Now"
                        >
                          {actionLoading === s.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Zap className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleToggle(s.id, s.status)}
                          disabled={actionLoading === s.id}
                          className={`rounded-lg p-2 transition-colors disabled:opacity-50 ${
                            s.status === "ACTIVE"
                              ? "text-zinc-400 hover:bg-amber-50 hover:text-amber-600"
                              : "text-zinc-400 hover:bg-emerald-50 hover:text-emerald-600"
                          }`}
                          title={s.status === "ACTIVE" ? "Pause" : "Resume"}
                        >
                          {s.status === "ACTIVE" ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => setAlertSettingsSite(s.websiteUrl)}
                          className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-violet-50 hover:text-violet-600"
                          title="Alert Settings"
                        >
                          {alertPrefs[s.websiteUrl]?.emailAlerts === false ? (
                            <BellOff className="h-4 w-4" />
                          ) : (
                            <Bell className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          disabled={actionLoading === s.id}
                          className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          title="Delete Schedule"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {alertSettingsSite && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl"
          >
            <button
              onClick={() => setAlertSettingsSite(null)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50">
              <Settings2 className="h-6 w-6 text-violet-500" />
            </div>

            <h3 className="text-center text-xl font-bold text-zinc-800">
              Alert Settings
            </h3>
            <p className="mt-1 text-center text-sm text-zinc-500">
              {alertSettingsSite.replace(/^https?:\/\//, "").replace(/\/.*$/, "")}
            </p>

            <div className="mt-6 space-y-5">
              <label className="flex items-center justify-between rounded-xl border border-zinc-200 p-4">
                <div>
                  <p className="text-sm font-medium text-zinc-800">
                    Email Alerts
                  </p>
                  <p className="text-xs text-zinc-500">
                    Receive email notifications for critical and warning changes
                  </p>
                </div>
                <button
                  onClick={() =>
                    setAlertPrefs((prev) => ({
                      ...prev,
                      [alertSettingsSite]: {
                        ...prev[alertSettingsSite],
                        emailAlerts: !prev[alertSettingsSite]?.emailAlerts,
                      },
                    }))
                  }
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    alertPrefs[alertSettingsSite]?.emailAlerts
                      ? "bg-black"
                      : "bg-zinc-200"
                  }`}
                >
                  <span
                    className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                      alertPrefs[alertSettingsSite]?.emailAlerts
                        ? "translate-x-5"
                        : ""
                    }`}
                  />
                </button>
              </label>

              <label className="flex items-center justify-between rounded-xl border border-zinc-200 p-4">
                <div>
                  <p className="text-sm font-medium text-zinc-800">
                    Improvement Alerts
                  </p>
                  <p className="text-xs text-zinc-500">
                    Also receive emails when SEO improvements are detected
                  </p>
                </div>
                <button
                  onClick={() =>
                    setAlertPrefs((prev) => ({
                      ...prev,
                      [alertSettingsSite]: {
                        ...prev[alertSettingsSite],
                        improvementAlerts: !prev[alertSettingsSite]?.improvementAlerts,
                      },
                    }))
                  }
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    alertPrefs[alertSettingsSite]?.improvementAlerts
                      ? "bg-black"
                      : "bg-zinc-200"
                  }`}
                >
                  <span
                    className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                      alertPrefs[alertSettingsSite]?.improvementAlerts
                        ? "translate-x-5"
                        : ""
                    }`}
                  />
                </button>
              </label>

              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  Notification Email
                </label>
                <input
                  type="email"
                  placeholder="default: your account email"
                  value={alertPrefs[alertSettingsSite]?.notificationEmail ?? ""}
                  onChange={(e) =>
                    setAlertPrefs((prev) => ({
                      ...prev,
                      [alertSettingsSite]: {
                        ...prev[alertSettingsSite],
                        notificationEmail: e.target.value,
                      },
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-zinc-300"
                />
                <p className="mt-1 text-xs text-zinc-400">
                  Leave empty to use your account email
                </p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3">
              <button
                onClick={() => setAlertSettingsSite(null)}
                className="rounded-xl border border-zinc-200 px-6 py-3 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveAlertPrefs(alertSettingsSite)}
                disabled={savingAlertPrefs}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
              >
                {savingAlertPrefs ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Save
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

    </motion.div>
  );
}
