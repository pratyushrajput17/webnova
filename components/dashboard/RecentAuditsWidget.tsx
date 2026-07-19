"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { Clock, ExternalLink, Trash2, Loader2 } from "lucide-react";

interface Audit {
  id: string;
  websiteUrl: string;
  seoScore: number;
  createdAt: string;
}

export default function RecentAuditsWidget() {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("/api/audit/history?limit=5");
        setAudits(res.data.audits);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm("Delete this audit?")) return;

    setDeleting(id);
    try {
      await axios.delete(`/api/audit/${id}`);
      setAudits((prev) => prev.filter((a) => a.id !== id));
    } catch {
      // silently fail
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-600 bg-emerald-50";
    if (score >= 70) return "text-amber-600 bg-amber-50";
    return "text-red-600 bg-red-50";
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Recent Audits</h2>
        <div className="mt-8 flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recent Audits</h2>
        <Link
          href="/dashboard/history"
          className="text-sm font-medium text-zinc-500 transition-colors hover:text-black"
        >
          View all
        </Link>
      </div>

      {audits.length === 0 ? (
        <div className="mt-8 rounded-xl bg-zinc-50 px-6 py-10 text-center">
          <p className="text-sm text-zinc-500">
            No audits yet. Analyze your first website to get started.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {audits.map((audit) => (
            <Link
              key={audit.id}
              href={`/dashboard/history/${audit.id}`}
              className="group flex items-center justify-between rounded-xl border border-zinc-100 px-4 py-3.5 transition-all hover:border-zinc-200 hover:shadow-sm"
            >
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-800">
                    {audit.websiteUrl}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-400">
                    <Clock className="h-3 w-3" />
                    {formatDate(audit.createdAt)}
                  </p>
                </div>
                <span
                  className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-sm font-medium ${getScoreColor(audit.seoScore)}`}
                >
                  {audit.seoScore}
                </span>
              </div>
              <div className="ml-3 flex items-center gap-1">
                <button
                  onClick={(e) => handleDelete(audit.id, e)}
                  disabled={deleting === audit.id}
                  className="rounded-lg p-2 text-zinc-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 disabled:opacity-50"
                  aria-label="Delete audit"
                >
                  {deleting === audit.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
                <ExternalLink className="h-4 w-4 text-zinc-300" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
