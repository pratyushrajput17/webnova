"use client";

import { motion } from "framer-motion";
import Container from "@/components/shared/Container";
import {
  Search,
  BarChart3,
  ShieldCheck,
  Zap,
  Globe,
  Brain,
} from "lucide-react";

const features = [
  {
    icon: Search,
    title: "SEO Intelligence",
    description: "Discover hidden SEO issues and opportunities.",
  },
  {
    icon: BarChart3,
    title: "Competitor Insights",
    description: "Compare your website against competitors.",
  },
  {
    icon: ShieldCheck,
    title: "Security Audit",
    description: "Identify vulnerabilities and security risks.",
  },
  {
    icon: Zap,
    title: "Performance Analysis",
    description: "Improve speed and Core Web Vitals.",
  },
  {
    icon: Globe,
    title: "Accessibility",
    description: "Ensure your website works for everyone.",
  },
  {
    icon: Brain,
    title: "AI Recommendations",
    description: "Get actionable AI-powered suggestions.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Features() {
  return (
    <section id="features" className="py-28">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">
            Features
          </p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            Everything you need to grow.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-500">
            Comprehensive tools to analyze, optimize, and monitor your
            website&apos;s performance.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group rounded-3xl border border-zinc-200 bg-white p-8 transition-all duration-300 hover:-translate-y-2 hover:border-zinc-900 hover:shadow-xl"
            >
              <div className="inline-flex rounded-2xl bg-zinc-100 p-3 transition-colors duration-300 group-hover:bg-zinc-900 group-hover:text-white">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-xl font-semibold">{feature.title}</h3>
              <p className="mt-3 leading-relaxed text-zinc-500">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
