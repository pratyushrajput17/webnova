"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  Loader2,
  Search,
  Download,
  Ticket,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter,
  Star,
  Zap,
  Sparkles,
} from "lucide-react";

interface RedeemCodeItem {
  id: string;
  code: string;
  plan: string;
  duration: number;
  isUsed: boolean;
  usedBy: { id: string; email: string; name: string | null } | null;
  usedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

interface Stats {
  total: number;
  used: number;
  remaining: number;
  planBreakdown: Record<string, number>;
}

const PLAN_BADGES: Record<string, string> = {
  STARTER: "bg-blue-50 text-blue-700",
  PRO: "bg-indigo-50 text-indigo-700",
  LIFETIME: "bg-emerald-50 text-emerald-700",
  ENTERPRISE: "bg-amber-50 text-amber-700",
};

const PLAN_ICONS: Record<string, typeof Star> = {
  STARTER: Star,
  PRO: Zap,
  LIFETIME: Sparkles,
};

const PLAN_LABELS: Record<string, string> = {
  STARTER: "Starter",
  PRO: "Professional",
  LIFETIME: "Lifetime Access",
  ENTERPRISE: "Enterprise",
};

export default function AdminRedeemCodes() {
  const [codes, setCodes] = useState<RedeemCodeItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pagination, setPagination] = useState<{
    page: number;
    totalPages: number;
    total: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [exporting, setExporting] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const fetchCodes = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 20 };
      if (planFilter) params.plan = planFilter;
      if (statusFilter) params.isUsed = statusFilter;
      if (search) params.search = search;

      const res = await axios.get("/api/admin/codes", { params });
      setCodes(res.data.codes);
      setPagination(res.data.pagination);
      setStats(res.data.stats);
    } catch {}
    setLoading(false);
  }, [page, planFilter, statusFilter, search]);

  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const params: Record<string, string> = { format: "csv" };
      if (planFilter) params.plan = planFilter;
      if (statusFilter) params.isUsed = statusFilter;

      const res = await axios.get("/api/admin/codes", {
        params,
        responseType: "blob",
      });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `redeem-codes-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {}
    setExporting(false);
  };

  const handleRegenerate = async () => {
    if (!confirm("This will delete ALL unused codes and regenerate them. Continue?")) return;
    setRegenerating(true);
    try {
      await axios.delete("/api/admin/codes", {
        params: planFilter ? { plan: planFilter } : {},
      });
      await fetchCodes();
    } catch {}
    setRegenerating(false);
  };

  const getPlanIcon = (plan: string) => {
    const Icon = PLAN_ICONS[plan];
    if (!Icon) return null;
    return <Icon className="h-3.5 w-3.5" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-800">Redeem Codes</h1>
        <p className="mt-1 text-zinc-500">
          Manage all redeem codes across all plans.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            Total Codes
          </p>
          <p className="mt-2 text-3xl font-bold text-zinc-800">
            {stats ? stats.total.toLocaleString() : "—"}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-emerald-600">
            Available
          </p>
          <p className="mt-2 text-3xl font-bold text-emerald-700">
            {stats ? stats.remaining.toLocaleString() : "—"}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-amber-600">
            Used
          </p>
          <p className="mt-2 text-3xl font-bold text-amber-700">
            {stats ? stats.used.toLocaleString() : "—"}
          </p>
        </div>
        {stats?.planBreakdown &&
          Object.entries(stats.planBreakdown).map(([plan, count]) => (
            <div
              key={plan}
              className={`rounded-2xl border p-5 ${
                plan === "STARTER"
                  ? "border-blue-200 bg-blue-50/50"
                  : plan === "PRO"
                    ? "border-indigo-200 bg-indigo-50/50"
                    : plan === "LIFETIME"
                      ? "border-emerald-200 bg-emerald-50/50"
                      : "border-zinc-200 bg-zinc-50/50"
              }`}
            >
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                {PLAN_LABELS[plan] ?? plan}
              </p>
              <p className="mt-2 text-3xl font-bold text-zinc-800">
                {count.toLocaleString()}
              </p>
            </div>
          ))}
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by code..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-zinc-300"
          />
        </div>

        <select
          value={planFilter}
          onChange={(e) => {
            setPlanFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-zinc-300"
        >
          <option value="">All Plans</option>
          <option value="STARTER">Starter</option>
          <option value="PRO">Professional</option>
          <option value="LIFETIME">Lifetime</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-zinc-300"
        >
          <option value="">All Status</option>
          <option value="false">Available</option>
          <option value="true">Used</option>
        </select>

        <button
          onClick={handleExportCSV}
          disabled={exporting}
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-50"
        >
          {exporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Export CSV
        </button>

        <button
          onClick={handleRegenerate}
          disabled={regenerating}
          className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
        >
          {regenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Regenerate
        </button>
      </div>

      {/* Codes Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="px-6 py-4 font-semibold text-zinc-600">Code</th>
                <th className="px-6 py-4 font-semibold text-zinc-600">Plan</th>
                <th className="px-6 py-4 font-semibold text-zinc-600">Status</th>
                <th className="px-6 py-4 font-semibold text-zinc-600">Used By</th>
                <th className="px-6 py-4 font-semibold text-zinc-600">Redeemed</th>
                <th className="px-6 py-4 font-semibold text-zinc-600">Created</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-zinc-400" />
                  </td>
                </tr>
              ) : codes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center text-zinc-300">
                      <Ticket className="mb-2 h-8 w-8" />
                      <p className="text-sm">No codes found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {codes.map((item, i) => (
                    <motion.tr
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ delay: i * 0.02, duration: 0.2 }}
                      className="border-b border-zinc-50 transition-colors hover:bg-zinc-50/50"
                    >
                      <td className="px-6 py-4">
                        <code className="font-mono text-xs font-medium text-zinc-800">
                          {item.code}
                        </code>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            PLAN_BADGES[item.plan] ?? "bg-zinc-100 text-zinc-700"
                          }`}
                        >
                          {getPlanIcon(item.plan)}
                          {PLAN_LABELS[item.plan] ?? item.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {item.isUsed ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
                            <XCircle className="h-3.5 w-3.5" />
                            Used
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Available
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-zinc-600">
                        {item.usedBy ? (
                          <span className="text-xs">
                            {item.usedBy.name ?? item.usedBy.email}
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-zinc-500">
                        {item.usedAt
                          ? new Date(item.usedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="px-6 py-4 text-xs text-zinc-400">
                        {new Date(item.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-zinc-100 px-6 py-4">
            <p className="text-xs text-zinc-500">
              Showing {(pagination.page - 1) * 20 + 1}–{Math.min(pagination.page * 20, pagination.total)} of{" "}
              {pagination.total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-lg border border-zinc-200 p-2 text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-medium text-zinc-600">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
                className="rounded-lg border border-zinc-200 p-2 text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
