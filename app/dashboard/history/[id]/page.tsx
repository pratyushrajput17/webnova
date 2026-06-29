"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import AuditReportPDF from "@/components/pdf/AuditReportPDF";
import { downloadPDF, sanitizeFilename } from "@/lib/pdf";
import {
  ArrowLeft,
  Trash2,
  Loader2,
  ExternalLink,
  Clock,
  FileText,
  Hash,
  Image,
  ImageOff,
  Link,
  Globe,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Eye,
  Zap,
  FileDown,
} from "lucide-react";

interface AuditDetail {
  id: string;
  websiteUrl: string;
  pageTitle: string;
  metaDescription: string | null;
  seoScore: number;
  performanceScore: number;
  accessibilityScore: number;
  h1Count: number;
  imageCount: number;
  missingAltCount: number;
  internalLinks: number;
  externalLinks: number;
  createdAt: string;
  aiRecommendations: string[];
}

interface ScoreConfig {
  label: string;
  key: "seoScore" | "performanceScore" | "accessibilityScore";
  icon: typeof BarChart3;
  color: string;
  ringColor: string;
  bgColor: string;
  lightBg: string;
}

const scoreConfigs: ScoreConfig[] = [
  {
    label: "SEO Score",
    key: "seoScore",
    icon: BarChart3,
    color: "text-emerald-600",
    ringColor: "#10b981",
    bgColor: "bg-emerald-500",
    lightBg: "bg-emerald-50",
  },
  {
    label: "Performance",
    key: "performanceScore",
    icon: Zap,
    color: "text-blue-600",
    ringColor: "#3b82f6",
    bgColor: "bg-blue-500",
    lightBg: "bg-blue-50",
  },
  {
    label: "Accessibility",
    key: "accessibilityScore",
    icon: Eye,
    color: "text-violet-600",
    ringColor: "#8b5cf6",
    bgColor: "bg-violet-500",
    lightBg: "bg-violet-50",
  },
];

function getScoreLabel(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Needs Work";
  return "Poor";
}

function getScoreLabelStyle(score: number): string {
  if (score >= 90) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (score >= 70) return "bg-amber-50 text-amber-700 border-amber-200";
  if (score >= 50) return "bg-orange-50 text-orange-700 border-orange-200";
  return "bg-red-50 text-red-700 border-red-200";
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ScoreRing({
  score,
  color,
  size = 112,
  strokeWidth = 8,
}: {
  score: number;
  color: string;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        style={{ width: size, height: size }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="fill-none stroke-zinc-100"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="fill-none"
          stroke={color}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-3xl font-bold tracking-tight"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{ color }}
        >
          {score}
        </motion.span>
      </div>
    </div>
  );
}

interface StatItem {
  label: string;
  key: string;
  icon: typeof FileText;
  isText?: boolean;
}

const statItems: StatItem[] = [
  { label: "Page Title", key: "pageTitle", icon: FileText, isText: true },
  {
    label: "Meta Description",
    key: "metaDescription",
    icon: FileText,
    isText: true,
  },
  { label: "H1 Tags", key: "h1Count", icon: Hash },
  { label: "Total Images", key: "imageCount", icon: Image },
  { label: "Missing Alt Tags", key: "missingAltCount", icon: ImageOff },
  { label: "Internal Links", key: "internalLinks", icon: Link },
  { label: "External Links", key: "externalLinks", icon: ExternalLink },
];

function SeverityIcon({ text }: { text: string }) {
  const isPositive =
    text.startsWith("Excellent") ||
    text.startsWith("Limit") ||
    text.startsWith("Good") ||
    text.startsWith("Optimize") ||
    text.startsWith("Your overall") ||
    text.includes("maintain");

  if (
    text.startsWith("Add") ||
    text.startsWith("Write") ||
    text.startsWith("Include") ||
    text.startsWith("Reduce") ||
    text.startsWith("Improve") ||
    text.startsWith("Optimize")
  ) {
    return <AlertCircle className="h-5 w-5 shrink-0 text-amber-500" />;
  }

  if (isPositive) {
    return <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />;
  }

  return <AlertTriangle className="h-5 w-5 shrink-0 text-red-500" />;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 animate-pulse rounded-xl bg-zinc-100" />
        <div className="space-y-2">
          <div className="h-8 w-56 animate-pulse rounded bg-zinc-100" />
          <div className="h-4 w-72 animate-pulse rounded bg-zinc-100" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-zinc-200 bg-white p-6"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="h-28 w-28 animate-pulse rounded-full bg-zinc-100" />
              <div className="h-5 w-24 animate-pulse rounded bg-zinc-100" />
              <div className="h-6 w-16 animate-pulse rounded-full bg-zinc-100" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-zinc-200 bg-white p-5"
          >
            <div className="h-4 w-24 animate-pulse rounded bg-zinc-100" />
            <div className="mt-3 h-7 w-16 animate-pulse rounded bg-zinc-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AuditDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [audit, setAudit] = useState<AuditDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAudit = async () => {
      try {
        const res = await axios.get(`/api/audit/${params.id}`);
        setAudit(res.data);
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setError("Audit not found");
        } else {
          setError("Failed to load audit report.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAudit();
  }, [params.id, router]);

  const handleDelete = async () => {
    if (!confirm("Delete this audit report?")) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/audit/${params.id}`);
      router.push("/dashboard/history");
    } catch {
      setDeleting(false);
    }
  };

  const handleDownloadPDF = useCallback(async () => {
    if (!audit) return;
    setPdfLoading(true);
    try {
      const siteName = sanitizeFilename(audit.websiteUrl);
      await downloadPDF(
        <AuditReportPDF
          websiteUrl={audit.websiteUrl}
          pageTitle={audit.pageTitle}
          metaDescription={audit.metaDescription}
          seoScore={audit.seoScore}
          performanceScore={audit.performanceScore}
          accessibilityScore={audit.accessibilityScore}
          h1Count={audit.h1Count}
          imageCount={audit.imageCount}
          missingAltCount={audit.missingAltCount}
          internalLinks={audit.internalLinks}
          externalLinks={audit.externalLinks}
          aiRecommendations={audit.aiRecommendations}
          createdAt={audit.createdAt}
        />,
        `audit-report-${siteName}.pdf`
      );
    } finally {
      setPdfLoading(false);
    }
  }, [audit]);

  if (loading) return <LoadingSkeleton />;

  if (error || !audit) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100">
          <Globe className="h-8 w-8 text-zinc-400" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-800">
          {error || "Audit not found"}
        </h2>
        <p className="mt-2 text-zinc-500">
          {error === "Audit not found"
            ? "This audit report doesn't exist or may have been deleted."
            : "Something went wrong loading this report."}
        </p>
        <button
          onClick={() => router.push("/dashboard/history")}
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-medium text-white transition-all hover:opacity-90"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to History
        </button>
      </motion.div>
    );
  }

  const recommendations: string[] = Array.isArray(audit.aiRecommendations)
    ? audit.aiRecommendations
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard/history")}
            className="rounded-xl border border-zinc-200 p-2.5 transition-colors hover:bg-zinc-100"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">Audit Report</h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-500">
              <span className="inline-flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" />
                {audit.websiteUrl}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {formatDate(audit.createdAt)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadPDF}
            disabled={pdfLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 disabled:opacity-50"
          >
            {pdfLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileDown className="h-4 w-4" />
            )}
            Download PDF
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-5 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Delete
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {scoreConfigs.map((config) => {
          const score = audit[config.key];
          const Icon = config.icon;
          return (
            <motion.div
              key={config.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-2xl border border-zinc-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex flex-col items-center gap-4">
                <ScoreRing
                  score={score}
                  color={config.ringColor}
                  size={112}
                />
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Icon className="h-4 w-4 text-zinc-400" />
                    <span className="text-sm font-medium text-zinc-500">
                      {config.label}
                    </span>
                  </div>
                  <span
                    className={`mt-2 inline-flex items-center rounded-full border px-3 py-0.5 text-sm font-medium ${getScoreLabelStyle(score)}`}
                  >
                    {getScoreLabel(score)}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 md:p-8">
        <h2 className="text-lg font-semibold text-zinc-800">
          Page Statistics
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {statItems.map((item) => {
            const Icon = item.icon;
            const value = audit[item.key as keyof AuditDetail];
            const isText = item.isText;

            return (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 transition-colors hover:bg-zinc-100"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                    {item.label}
                  </span>
                  <Icon className="h-3.5 w-3.5 text-zinc-300" />
                </div>
                <div className="mt-2">
                  {isText && value ? (
                    <p className="line-clamp-2 text-sm font-medium leading-snug text-zinc-800">
                      {String(value)}
                    </p>
                  ) : !isText ? (
                    <p className="text-2xl font-bold text-zinc-900">
                      {String(value ?? 0)}
                    </p>
                  ) : (
                    <p className="text-sm italic text-zinc-400">None</p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-2xl border border-zinc-200 bg-white p-6 md:p-8"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-800">
                AI Recommendations
              </h2>
              <p className="text-sm text-zinc-500">
                Generated based on your audit results.
              </p>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {recommendations.map((rec, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * i }}
                className="flex items-start gap-3 rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 transition-colors hover:bg-zinc-100"
              >
                <SeverityIcon text={rec} />
                <p className="text-sm leading-relaxed text-zinc-700">
                  {rec}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={() => router.push("/dashboard/audits")}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-medium text-white transition-all hover:opacity-90"
        >
          <Zap className="h-4 w-4" />
          Analyze Another URL
        </button>
        <button
          onClick={() => router.push("/dashboard/history")}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 px-6 py-3 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to History
        </button>
      </div>
    </motion.div>
  );
}
