"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import Container from "@/components/shared/Container";

const benefits = [
  "Prioritized recommendations based on impact",
  "In-depth competitor analysis",
  "Untapped SEO opportunities",
  "AI-powered explanations for every issue",
];

export default function AIDemo() {
  return (
    <section id="ai-insights" className="py-28">
      <Container>
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">
              AI Insights
            </p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
              Smarter recommendations, better results.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-zinc-500">
              WebNova doesn&apos;t just show scores. It explains why issues
              exist, how they impact your business, and what to fix first.
            </p>
            <ul className="mt-10 space-y-4">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3 text-zinc-700">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-zinc-900" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-4 rounded-3xl bg-zinc-900/5 blur-xl" />
            <div className="relative rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl">
              <div className="rounded-2xl bg-zinc-50 p-6">
                <div className="mb-4 inline-flex rounded-lg bg-zinc-900 px-3 py-1 text-xs font-medium text-white">
                  AI Recommendation
                </div>
                <p className="text-base leading-relaxed text-zinc-600">
                  Your homepage image is 2.4MB and delays page load by
                  approximately 1.8 seconds. Compressing it could improve
                  performance by 18%.
                </p>
                <div className="mt-6 flex items-center gap-3 rounded-xl bg-zinc-900 px-5 py-3.5 text-sm font-medium text-white">
                  <CheckCircle2 className="h-4 w-4" />
                  Estimated Impact: +18% Performance
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-zinc-400">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                Analyzed 15 seconds ago
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
