"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import axios from "axios";
import {
  Search,
  ExternalLink,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe,
  ArrowRight,
  LayoutGrid,
  List,
} from "lucide-react";
import WebsiteHistoryCard from "@/components/dashboard/WebsiteHistoryCard";

interface WebsiteItem {
  domain: string;
  latestAuditId: string;
  latestScore: number;
  previousScore: number | null;
  scoreChange: number | null;
  totalAudits: number;
  lastAuditedAt: string;
  latestPerformanceScore: number;
  latestAccessibilityScore: number;
}

interface AuditFlat {
  id: string;
  websiteUrl: string;
  seoScore: number;
  pageTitle: string;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

function getScoreColor(score: number): string {
  if (score >= 90) return "text-emerald-600 bg-emerald-50 border-emerald-200";
  if (score >= 70) return "text-amber-600 bg-amber-50 border-amber-200";
  return "text-red-600 bg-red-50 border-red-200";
}

function getScoreLabel(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Needs Work";
  return "Poor";
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5">
      <div className="flex items-start gap-4">
        <div className="h-14 w-14 animate-pulse rounded-full bg-zinc-100" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-40 animate-pulse rounded bg-zinc-100" />
          <div className="h-3 w-28 animate-pulse rounded bg-zinc-100" />
        </div>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-zinc-100">
      <td className="px-6 py-4">
        <div className="h-5 w-48 animate-pulse rounded bg-zinc-100" />
      </td>
      <td className="px-6 py-4">
        <div className="h-5 w-32 animate-pulse rounded bg-zinc-100" />
      </td>
      <td className="px-6 py-4 text-center">
        <div className="mx-auto h-7 w-24 animate-pulse rounded-full bg-zinc-100" />
      </td>
      <td className="px-6 py-4">
        <div className="h-5 w-36 animate-pulse rounded bg-zinc-100" />
      </td>
      <td className="px-6 py-4 text-right">
        <div className="ml-auto h-9 w-24 animate-pulse rounded-lg bg-zinc-100" />
      </td>
    </tr>
  );
}

function EmptyState({ hasSearch, view }: { hasSearch: boolean; view: "websites" | "list" }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white py-20 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100">
        <Globe className="h-8 w-8 text-zinc-400" />
      </div>
      <h3 className="text-lg font-semibold text-zinc-800">
        {hasSearch ? "No results match your search" : "No audits found"}
      </h3>
      <p className="mt-2 text-sm text-zinc-500">
        {hasSearch
          ? "Try a different search term."
          : view === "websites"
            ? "Analyze your first website to see it appear here."
            : "Analyze your first website to get started."}
      </p>
      {!hasSearch && (
        <Link
          href="/dashboard/audits"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-medium text-white transition-all hover:opacity-90"
        >
          Analyze your first website
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

export default function HistoryPage() {
  const [view, setView] = useState<"websites" | "list">("websites");
  const [websites, setWebsites] = useState<WebsiteItem[]>([]);
  const [websitesLoading, setWebsitesLoading] = useState(true);
  const [websitesTotal, setWebsitesTotal] = useState(0);

  const [audits, setAudits] = useState<AuditFlat[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [listLoading, setListLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [search, setSearch] = useState("");

  useEffect(() => {
    if (view === "websites") {
      (async () => {
        setWebsitesLoading(true);
        try {
          const res = await axios.get("/api/audit/history/websites");
          setWebsites(res.data.websites);
          setWebsitesTotal(res.data.totalAudits);
        } catch {
          // silently fail
        } finally {
          setWebsitesLoading(false);
        }
      })();
    }
  }, [view]);

  useEffect(() => {
    if (view === "list") {
      (async () => {
        setListLoading(true);
        try {
          const res = await axios.get("/api/audit/history", {
            params: { page, limit: 10 },
          });
          setAudits(res.data.audits);
          setPagination(res.data.pagination);
        } catch {
          // silently fail
        } finally {
          setListLoading(false);
        }
      })();
    }
  }, [view, page]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this audit?")) return;
    setDeleting(id);
    try {
      await axios.delete(`/api/audit/${id}`);
      setAudits((prev) => prev.filter((a) => a.id !== id));
      setWebsites((prev) =>
        prev
          .map((w) =>
            w.latestAuditId === id
              ? { ...w, totalAudits: w.totalAudits - 1 }
              : w
          )
          .filter((w) => w.totalAudits > 0)
      );
    } catch {
      // silently fail
    } finally {
      setDeleting(null);
    }
  };

  const filteredWebsites = search.trim()
    ? websites.filter((w) =>
        w.domain.toLowerCase().includes(search.toLowerCase())
      )
    : websites;

  const filteredAudits = search.trim()
    ? audits.filter((a) =>
        a.websiteUrl.toLowerCase().includes(search.toLowerCase())
      )
    : audits;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Audit History</h1>
          <p className="mt-2 text-zinc-600">
            {view === "websites"
              ? `${websites.length} website${websites.length !== 1 ? "s" : ""} tracked, ${websitesTotal} total audits`
              : `${pagination?.total ?? 0} audits total`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView("websites")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              view === "websites"
                ? "bg-black text-white"
                : "border border-zinc-200 text-zinc-600 hover:bg-zinc-100"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            Websites
          </button>
          <button
            onClick={() => setView("list")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              view === "list"
                ? "bg-black text-white"
                : "border border-zinc-200 text-zinc-600 hover:bg-zinc-100"
            }`}
          >
            <List className="h-4 w-4" />
            All Audits
          </button>
        </div>
      </div>

      <div className="mt-6 mb-6">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder={view === "websites" ? "Search by domain..." : "Search by URL..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition-colors focus:border-zinc-300"
          />
        </div>
      </div>

      {view === "websites" ? (
        <>
          {websitesLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredWebsites.length === 0 ? (
            <EmptyState hasSearch={search.trim().length > 0} view="websites" />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredWebsites.map((w) => (
                <WebsiteHistoryCard key={w.domain} website={w} />
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {listLoading ? (
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50">
                    <th className="px-6 py-4 text-left font-medium text-zinc-500">
                      Website URL
                    </th>
                    <th className="px-6 py-4 text-left font-medium text-zinc-500">
                      Page Title
                    </th>
                    <th className="px-6 py-4 text-center font-medium text-zinc-500">
                      SEO Score
                    </th>
                    <th className="px-6 py-4 text-left font-medium text-zinc-500">
                      Date
                    </th>
                    <th className="px-6 py-4 text-right font-medium text-zinc-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : filteredAudits.length === 0 ? (
            <EmptyState hasSearch={search.trim().length > 0} view="list" />
          ) : (
            <>
              <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50">
                      <th className="px-6 py-4 text-left font-medium text-zinc-500">
                        Website URL
                      </th>
                      <th className="px-6 py-4 text-left font-medium text-zinc-500">
                        Page Title
                      </th>
                      <th className="px-6 py-4 text-center font-medium text-zinc-500">
                        SEO Score
                      </th>
                      <th className="px-6 py-4 text-left font-medium text-zinc-500">
                        Date
                      </th>
                      <th className="px-6 py-4 text-right font-medium text-zinc-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAudits.map((audit) => (
                      <tr
                        key={audit.id}
                        className="border-b border-zinc-100 transition-colors hover:bg-zinc-50"
                      >
                        <td className="px-6 py-4">
                          <span className="font-medium text-zinc-800">
                            {audit.websiteUrl}
                          </span>
                        </td>
                        <td className="max-w-[200px] truncate px-6 py-4 text-zinc-600">
                          {audit.pageTitle || "\u2014"}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium ${getScoreColor(audit.seoScore)}`}
                          >
                            {audit.seoScore}
                            <span className="text-xs opacity-70">
                              {getScoreLabel(audit.seoScore)}
                            </span>
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 text-zinc-500">
                            <Clock className="h-3.5 w-3.5" />
                            {formatDate(audit.createdAt)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/dashboard/history/${audit.id}`}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              View Report
                            </Link>
                            <button
                              onClick={() => handleDelete(audit.id)}
                              disabled={deleting === audit.id}
                              className="rounded-lg border border-zinc-200 p-2 text-zinc-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                            >
                              {deleting === audit.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
                  <p className="text-sm text-zinc-500">
                    Showing {(page - 1) * pagination.limit + 1}\u2013
                    {Math.min(page * pagination.limit, pagination.total)} of{" "}
                    {pagination.total} audits
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </button>
                    <span className="px-3 text-sm text-zinc-500">
                      Page {page} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page === pagination.totalPages}
                      className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </motion.div>
  );
}
