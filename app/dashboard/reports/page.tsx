"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import AuditReportPDF from "@/components/pdf/AuditReportPDF";
import { downloadPDF, sanitizeFilename } from "@/lib/pdf";
import {
  FileText,
  Download,
  Calendar,
  CheckCircle2,
  Globe,
  Loader2,
  AlertTriangle,
  BarChart3,
  Zap,
  Eye,
  Search,
} from "lucide-react";

interface AuditItem {
  id: string;
  websiteUrl: string;
  pageTitle: string;
  metaDescription: string | null;
  seoScore: number;
  performanceScore: number;
  accessibilityScore: number;
  createdAt: string;
  aiRecommendations: string[];
}

interface AuditFull extends AuditItem {
  h1Count: number;
  imageCount: number;
  missingAltCount: number;
  internalLinks: number;
  externalLinks: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / 86400000);

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function ScoreBadge({
  label,
  score,
  icon: Icon,
}: {
  label: string;
  score: number;
  icon: typeof BarChart3;
}) {
  const color =
    score >= 80
      ? "text-emerald-600 bg-emerald-50"
      : score >= 60
        ? "text-amber-600 bg-amber-50"
        : "text-red-600 bg-red-50";

  return (
    <div className="flex items-center gap-1.5 rounded-md bg-zinc-50 px-2.5 py-1">
      <Icon className="h-3.5 w-3.5 text-zinc-400" />
      <span className={`text-xs font-semibold ${color.split(" ")[0]}`}>
        {score}
      </span>
    </div>
  );
}

export default function ReportsPage() {
  const [audits, setAudits] = useState<AuditItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get("/api/audit/history?limit=100");
        setAudits(res.data.audits || []);
      } catch {
        setError("Failed to load reports.");
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleDownloadPDF = useCallback(
    async (audit: AuditItem) => {
      setDownloadingId(audit.id);
      setDownloadError(null);
      try {
        const res = await axios.get(`/api/audit/${audit.id}`);
        const full: AuditFull = res.data;
        const siteName = sanitizeFilename(full.websiteUrl);
        await downloadPDF(
          <AuditReportPDF
            websiteUrl={full.websiteUrl}
            pageTitle={full.pageTitle}
            metaDescription={full.metaDescription}
            seoScore={full.seoScore}
            performanceScore={full.performanceScore}
            accessibilityScore={full.accessibilityScore}
            h1Count={full.h1Count}
            imageCount={full.imageCount}
            missingAltCount={full.missingAltCount}
            internalLinks={full.internalLinks}
            externalLinks={full.externalLinks}
            aiRecommendations={full.aiRecommendations}
            createdAt={full.createdAt}
          />,
          `audit-report-${siteName}.pdf`
        );
      } catch {
        setDownloadError(`Failed to generate report for ${audit.websiteUrl}.`);
      } finally {
        setDownloadingId(null);
      }
    },
    []
  );

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="mt-2 text-zinc-600">
          Download detailed audit reports for your websites.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-zinc-200 bg-white p-6"
            >
              <div className="h-12 w-12 animate-pulse rounded-xl bg-zinc-100" />
              <div className="mt-5 h-6 w-3/4 animate-pulse rounded bg-zinc-100" />
              <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-zinc-100" />
              <div className="mt-4 h-4 w-1/3 animate-pulse rounded bg-zinc-100" />
              <div className="mt-6 h-10 animate-pulse rounded-xl bg-zinc-100" />
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
          <AlertTriangle className="h-8 w-8 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-800">
          Failed to load reports
        </h2>
        <p className="mt-2 text-zinc-500">{error}</p>
      </motion.div>
    );
  }

  if (audits.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="mt-2 text-zinc-600">
          Download detailed audit reports for your websites.
        </p>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white py-24"
        >
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100">
            <Search className="h-8 w-8 text-zinc-400" />
          </div>
          <h2 className="text-xl font-semibold text-zinc-800">
            No reports available yet
          </h2>
          <p className="mt-2 max-w-md text-center text-zinc-500">
            Generate your first audit to create reports.
          </p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-3xl font-bold">Reports</h1>
      <p className="mt-2 text-zinc-600">
        Download detailed audit reports for your websites.
      </p>

      {downloadError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {downloadError}
        </motion.div>
      )}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {audits.map((audit) => (
          <motion.div
            key={audit.id}
            variants={itemVariants}
            className="rounded-2xl border border-zinc-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100">
              <FileText className="h-6 w-6 text-zinc-600" />
            </div>

            <h3 className="mt-5 line-clamp-1 text-lg font-semibold">
              {audit.pageTitle || "Untitled Audit"}
            </h3>
            <p className="mt-1 line-clamp-1 text-sm text-zinc-500">
              {audit.websiteUrl}
            </p>

            <div className="mt-4 flex items-center gap-2 text-sm text-zinc-500">
              <Calendar className="h-4 w-4" />
              {formatDate(audit.createdAt)}
            </div>

            <div className="mt-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Completed
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <ScoreBadge label="SEO" score={audit.seoScore} icon={BarChart3} />
              <ScoreBadge label="Perf" score={audit.performanceScore} icon={Zap} />
              <ScoreBadge label="A11y" score={audit.accessibilityScore} icon={Eye} />
            </div>

            <button
              onClick={() => handleDownloadPDF(audit)}
              disabled={downloadingId === audit.id}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {downloadingId === audit.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {downloadingId === audit.id
                ? "Generating..."
                : "Download PDF"}
            </button>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
