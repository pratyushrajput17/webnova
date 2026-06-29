"use client";

import { motion } from "framer-motion";
import {
  Search,
  FileText,
  Hash,
  Image,
  ImageOff,
  Link,
  ExternalLink,
} from "lucide-react";

interface AuditResult {
  pageTitle: string;
  metaDescription: string;
  h1Count: number;
  imageCount: number;
  missingAltCount: number;
  internalLinks: number;
  externalLinks: number;
  seoScore: number;
}

interface Props {
  result: AuditResult;
  url: string;
}

function getScoreColor(score: number): string {
  if (score >= 90) return "text-emerald-600";
  if (score >= 70) return "text-amber-600";
  return "text-red-600";
}

function getScoreBg(score: number): string {
  if (score >= 90) return "bg-emerald-500";
  if (score >= 70) return "bg-amber-500";
  return "bg-red-500";
}

function getScoreLabel(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Needs Work";
  return "Poor";
}

function getScoreLabelBg(score: number): string {
  if (score >= 90) return "bg-emerald-50 text-emerald-700";
  if (score >= 70) return "bg-amber-50 text-amber-700";
  if (score >= 50) return "bg-orange-50 text-orange-700";
  return "bg-red-50 text-red-700";
}

const statCards = [
  { label: "Page Title", key: "pageTitle", icon: FileText },
  { label: "Meta Description", key: "metaDescription", icon: FileText },
  { label: "H1 Tags", key: "h1Count", icon: Hash },
  { label: "Images", key: "imageCount", icon: Image },
  { label: "Missing Alt Tags", key: "missingAltCount", icon: ImageOff },
  { label: "Internal Links", key: "internalLinks", icon: Link },
  { label: "External Links", key: "externalLinks", icon: ExternalLink },
];

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

export default function AuditResults({ result, url }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-semibold">
            Results for <span className="text-zinc-500">{url}</span>
          </h2>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-4 py-1.5 text-sm font-medium text-green-700">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Audit Complete
        </span>
      </div>

      <div className="mb-8 rounded-2xl border border-zinc-200 bg-white p-6 md:p-8">
        <div className="flex flex-col items-center text-center md:flex-row md:gap-8 md:text-left">
          <div className="relative shrink-0">
            <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-zinc-100">
              <span
                className={`text-4xl font-bold ${getScoreColor(result.seoScore)}`}
              >
                {result.seoScore}
              </span>
            </div>
          </div>
          <div className="mt-4 md:mt-0 md:flex-1">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
              <h3 className="text-2xl font-bold">SEO Score</h3>
              <span
                className={`inline-flex items-center rounded-full px-3 py-0.5 text-sm font-medium ${getScoreLabelBg(result.seoScore)}`}
              >
                {getScoreLabel(result.seoScore)}
              </span>
            </div>
            <div className="mt-3 h-2.5 w-full rounded-full bg-zinc-100">
              <div
                className={`h-2.5 rounded-full transition-all duration-700 ${getScoreBg(result.seoScore)}`}
                style={{ width: `${result.seoScore}%` }}
              />
            </div>
            <p className="mt-3 text-sm text-zinc-500">
              SEO score is calculated based on title, meta description, heading
              structure, and image accessibility.
            </p>
          </div>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {statCards.map((card) => {
          const Icon = card.icon;
          const value = result[card.key as keyof AuditResult];
          const isText = typeof value === "string";

          return (
            <motion.div
              key={card.key}
              variants={itemVariants}
              className="rounded-2xl border border-zinc-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-500">
                  {card.label}
                </span>
                <Icon className="h-4 w-4 text-zinc-400" />
              </div>
              <div className="mt-2">
                {isText && value ? (
                  <p className="line-clamp-2 text-sm font-medium leading-snug text-zinc-800">
                    {value}
                  </p>
                ) : (
                  <p className="text-2xl font-bold">{String(value)}</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
