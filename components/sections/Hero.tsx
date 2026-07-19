"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { ArrowRight, Search } from "lucide-react";
import Container from "@/components/shared/Container";

const stats = [
  { label: "SEO Score", value: "92", color: "bg-emerald-500" },
  { label: "Performance", value: "88", color: "bg-amber-500" },
  { label: "Accessibility", value: "95", color: "bg-blue-500" },
  { label: "Security", value: "97", color: "bg-violet-500" },
];

const chartData = [35, 55, 45, 65, 52, 72, 68, 82, 78, 88, 85, 92];

const competitors = [
  { name: "Your Site", score: 92, color: "bg-black" },
  { name: "Competitor A", score: 78, color: "bg-zinc-300" },
  { name: "Competitor B", score: 84, color: "bg-zinc-300" },
  { name: "Competitor C", score: 65, color: "bg-zinc-300" },
];

const audits = [
  { page: "/", issues: 3, status: "Good" },
  { page: "/pricing", issues: 7, status: "Needs Work" },
  { page: "/blog", issues: 2, status: "Good" },
  { page: "/about", issues: 12, status: "Poor" },
];

export default function Hero() {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  const handleAnalyze = () => {
    if (isSignedIn) {
      router.push("/dashboard/audits");
    } else {
      router.push("/login?redirect_url=/dashboard/audits");
    }
  };

  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,0,0,0.03)_0%,_transparent_60%)]" />

      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2">
        <div className="h-[600px] w-[600px] rounded-full bg-zinc-900/3 blur-3xl" />
      </div>

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <Container>
        <div className="relative mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-5 py-2 text-sm text-zinc-600 shadow-sm"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-xs text-white">
              AI
            </span>
            AI-Powered Website Intelligence
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto max-w-4xl text-balance text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl"
          >
            Analyze, Optimize and{" "}
            <span className="text-zinc-400">Grow</span> Your Website.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-zinc-500 md:text-xl"
          >
            Get instant SEO audits, competitor insights, performance analysis
            and AI recommendations that help businesses improve rankings and
            conversions.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-black px-8 py-4 text-base font-medium text-white transition-all hover:opacity-90"
            >
              Start Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mx-auto mt-10 max-w-xl"
          >
            <div className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white p-2 pl-5 shadow-sm transition-shadow focus-within:border-zinc-300 focus-within:shadow-md">
              <Search className="h-5 w-5 shrink-0 text-zinc-400" />
              <input
                type="text"
                placeholder="Enter your website URL"
                aria-label="Enter your website URL"
                className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-zinc-400"
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
              />
              <button
                onClick={handleAnalyze}
                className="rounded-xl bg-black px-6 py-3 text-sm font-medium text-white transition-all hover:opacity-90"
              >
                Analyze
              </button>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="relative mx-auto mt-20 max-w-5xl"
        >
          <div className="animate-float rounded-3xl border border-zinc-200 bg-white shadow-xl transition-all duration-500 hover:shadow-2xl">
            <div className="flex items-center gap-2 border-b border-zinc-100 px-6 py-4">
              <div className="h-3 w-3 rounded-full bg-red-400" />
              <div className="h-3 w-3 rounded-full bg-amber-400" />
              <div className="h-3 w-3 rounded-full bg-emerald-400" />
              <div className="ml-4 rounded-md bg-zinc-100 px-3 py-1.5 text-xs text-zinc-500">
                dashboard.webnova.ai
              </div>
            </div>

            <div className="p-6 md:p-8">
              <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="group rounded-2xl border border-zinc-100 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-zinc-500">
                        {stat.label}
                      </span>
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${stat.color}`}
                      />
                    </div>
                    <div className="mt-3 text-3xl font-bold">{stat.value}</div>
                    <div className="mt-3 h-1.5 w-full rounded-full bg-zinc-100">
                      <div
                        className={`h-1.5 rounded-full ${stat.color}`}
                        style={{ width: `${stat.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-zinc-100 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <h3 className="text-sm font-semibold text-zinc-500">
                    Monthly SEO Score
                  </h3>
                  <div className="mt-6 flex items-end justify-between gap-2">
                    {chartData.map((height, i) => (
                      <div
                        key={i}
                        className="flex-1 transition-all duration-300 hover:opacity-80"
                      >
                        <div
                          className="w-full rounded-full bg-zinc-900"
                          style={{ height: `${height}%`, minHeight: "4px" }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-between text-xs text-zinc-400">
                    <span>Jan</span>
                    <span>Jun</span>
                    <span>Dec</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-100 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <h3 className="text-sm font-semibold text-zinc-500">
                    Competitor Comparison
                  </h3>
                  <div className="mt-6 space-y-4">
                    {competitors.map((c) => (
                      <div key={c.name} className="flex items-center gap-4">
                        <span className="w-28 text-sm text-zinc-600">
                          {c.name}
                        </span>
                        <div className="flex-1">
                          <div className="h-3 rounded-full bg-zinc-100">
                            <div
                              className={`h-3 rounded-full ${c.color} transition-all duration-300`}
                              style={{ width: `${c.score}%` }}
                            />
                          </div>
                        </div>
                        <span className="w-8 text-right text-sm font-medium">
                          {c.score}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-100 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <h3 className="text-sm font-semibold text-zinc-500">
                    Recent Audits
                  </h3>
                  <div className="mt-4 space-y-3">
                    {audits.map((audit) => (
                      <div
                        key={audit.page}
                        className="flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3"
                      >
                        <span className="text-sm font-medium text-zinc-700">
                          {audit.page}
                        </span>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-zinc-400">
                            {audit.issues} issues
                          </span>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              audit.status === "Good"
                                ? "bg-emerald-50 text-emerald-600"
                                : audit.status === "Needs Work"
                                  ? "bg-amber-50 text-amber-600"
                                  : "bg-red-50 text-red-600"
                            }`}
                          >
                            {audit.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-100 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <h3 className="text-sm font-semibold text-zinc-500">
                    AI Recommendation
                  </h3>
                  <div className="mt-4 rounded-xl bg-zinc-50 p-5">
                    <div className="mb-3 inline-flex rounded-lg bg-zinc-900 px-3 py-1 text-xs font-medium text-white">
                      Performance
                    </div>
                    <p className="text-sm leading-relaxed text-zinc-600">
                      Compress hero image to improve performance by 18%.
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-sm font-medium text-zinc-900">
                      <span>Estimated Impact: +18%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
