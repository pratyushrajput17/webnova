"use client";

import { motion } from "framer-motion";
import Container from "@/components/shared/Container";
import { Globe, Brain, Sparkles, TrendingUp } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Globe,
    title: "Enter Website URL",
    description: "Submit your website URL for instant analysis.",
  },
  {
    number: "02",
    icon: Brain,
    title: "AI Analyzes Website",
    description: "Our AI scans SEO, performance, security and accessibility.",
  },
  {
    number: "03",
    icon: Sparkles,
    title: "Receive Smart Recommendations",
    description: "Get prioritized improvements with clear explanations.",
  },
  {
    number: "04",
    icon: TrendingUp,
    title: "Track Growth Over Time",
    description: "Monitor your scores and watch your website improve.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-28">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">
            How It Works
          </p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            How WebNova Works
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-500">
            Get actionable website insights in just a few steps.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-16 grid gap-8 md:grid-cols-4"
        >
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                variants={itemVariants}
                className="group relative rounded-3xl border border-zinc-200 bg-white p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                <span className="block text-6xl font-bold text-zinc-100 transition-colors duration-300 group-hover:text-zinc-200">
                  {step.number}
                </span>
                <Icon className="mt-4 h-8 w-8" />
                <h3 className="mt-5 text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 leading-relaxed text-zinc-500">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </Container>
    </section>
  );
}
