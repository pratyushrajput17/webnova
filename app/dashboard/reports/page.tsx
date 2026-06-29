"use client";

import { motion } from "framer-motion";
import { FileText, Download, Calendar, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Report {
  name: string;
  website: string;
  date: string;
  status: "Completed" | "Pending";
}

const reports: Report[] = [
  {
    name: "SEO Audit Report",
    website: "webnova.com",
    date: "Today",
    status: "Completed",
  },
  {
    name: "Competitor Report",
    website: "agencyhub.io",
    date: "Yesterday",
    status: "Completed",
  },
  {
    name: "Accessibility Report",
    website: "startuphub.ai",
    date: "Jun 19, 2026",
    status: "Pending",
  },
  {
    name: "Security Audit",
    website: "webnova.com",
    date: "Jun 12, 2026",
    status: "Completed",
  },
  {
    name: "Performance Review",
    website: "agencysite.io",
    date: "Jun 8, 2026",
    status: "Completed",
  },
  {
    name: "Full Website Audit",
    website: "startuphub.ai",
    date: "Jun 1, 2026",
    status: "Pending",
  },
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

export default function ReportsPage() {
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
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {reports.map((report, i) => (
          <motion.div
            key={`${report.name}-${i}`}
            variants={itemVariants}
            className="rounded-2xl border border-zinc-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100">
              <FileText className="h-6 w-6 text-zinc-600" />
            </div>
            <h3 className="mt-5 text-lg font-semibold">{report.name}</h3>
            <p className="mt-1 text-sm text-zinc-500">{report.website}</p>
            <div className="mt-4 flex items-center gap-2 text-sm text-zinc-500">
              <Calendar className="h-4 w-4" />
              {report.date}
            </div>
            <div className="mt-3">
              {report.status === "Completed" ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {report.status}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-50 px-3 py-1 text-sm font-medium text-yellow-700">
                  <Clock className="h-3.5 w-3.5" />
                  {report.status}
                </span>
              )}
            </div>
            <Button
              variant="outline"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border-zinc-200 py-2.5 text-sm font-medium"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
