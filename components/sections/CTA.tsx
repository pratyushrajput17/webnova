"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import Container from "@/components/shared/Container";

export default function CTA() {
  return (
    <section className="py-28">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50 p-16 text-center md:p-24"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.02)_0%,transparent_60%)]" />
          <div className="relative">
            <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
              Ready to grow your website?
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-500">
              Start optimizing your website with AI-powered insights today.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-10 py-4 text-base font-medium text-white transition-all hover:bg-zinc-800"
              >
                Start Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-10 py-4 text-base font-medium text-zinc-700 transition-all hover:border-zinc-300 hover:bg-zinc-50">
                <Play className="h-4 w-4" />
                Book Demo
              </button>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
