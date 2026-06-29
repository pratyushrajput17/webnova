"use client";

import { motion } from "framer-motion";
import WebsiteAnalyzer from "@/components/dashboard/WebsiteAnalyzer";

export default function AuditsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-3xl font-bold">Website Audits</h1>
      <p className="mt-2 text-zinc-600">
        Enter a URL to analyze its SEO, performance, accessibility and
        security.
      </p>

      <div className="mt-8">
        <WebsiteAnalyzer />
      </div>
    </motion.div>
  );
}
