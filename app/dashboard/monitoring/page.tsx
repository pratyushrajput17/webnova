"use client";

import { useState, useEffect, useCallback } from "react";
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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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

  const fetchSchedules = useCallback(async () => {
    try {
      const res = await axios.get("/api/scheduled-audits");
      setSchedules(res.data.schedules);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

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
      fetchSchedules();
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
      fetchSchedules();
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
      fetchSchedules();
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
    </motion.div>
  );
}
