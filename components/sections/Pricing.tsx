"use client";

import { motion } from "framer-motion";
import {
  Search,
  GitCompare,
  FileText,
  FileDown,
  Clock,
  Headphones,
  Users,
  Sparkles,
  Package,
  Brain,
  Code2,
  UserCheck,
  Rocket,
  Check,
  ArrowRight,
} from "lucide-react";
import Container from "@/components/shared/Container";
import { PLANS, type PricingPlan } from "@/lib/pricing";

const iconMap: Record<string, typeof Search> = {
  Search,
  GitCompare,
  FileText,
  FileDown,
  Clock,
  Headphones,
  Users,
  Sparkles,
  Package,
  Brain,
  Code2,
  UserCheck,
  Rocket,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function FeatureIcon({ name }: { name: string }) {
  const Icon = iconMap[name];
  if (!Icon) return null;
  return <Icon className="h-4 w-4" />;
}

function PricingCard({ plan, index }: { plan: PricingPlan; index: number }) {
  return (
    <motion.div
      variants={itemVariants}
      className={`relative flex flex-col rounded-3xl border-2 p-8 transition-all duration-300 md:p-10 ${
        plan.popular
          ? "border-zinc-900 bg-white shadow-2xl shadow-zinc-900/10 ring-1 ring-zinc-900/5 hover:-translate-y-2 hover:shadow-3xl"
          : plan.key === "LIFETIME"
            ? "border-emerald-200 bg-white shadow-lg hover:-translate-y-2 hover:border-emerald-300 hover:shadow-xl"
            : "border-zinc-200 bg-white shadow-lg hover:-translate-y-2 hover:border-zinc-300 hover:shadow-xl"
      }`}
    >
      {plan.badge && (
        <div
          className={`absolute -top-4 left-1/2 -translate-x-1/2 rounded-full px-5 py-1.5 text-sm font-semibold shadow-sm ${
            plan.popular
              ? "bg-zinc-900 text-white"
              : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
          }`}
        >
          {plan.badge}
        </div>
      )}

      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold text-zinc-800">{plan.name}</h3>
          <p className="mt-1.5 text-sm text-zinc-500">{plan.description}</p>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-baseline gap-1">
          <span className="text-5xl font-extrabold tracking-tight text-zinc-900">
            {plan.price}
          </span>
          <span className="text-sm font-medium text-zinc-400">
            {plan.period}
          </span>
        </div>
        {plan.savings && (
          <span
            className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
              plan.popular
                ? "bg-zinc-100 text-zinc-700"
                : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {plan.savings}
          </span>
        )}
      </div>

      <div className="mt-8 h-px w-full bg-zinc-100" />

      <ul className="mt-8 space-y-4">
        {plan.features.map((feature) => (
          <li key={feature.text} className="flex items-start gap-3">
            <span
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                plan.popular ? "bg-zinc-900" : "bg-zinc-100"
              }`}
            >
              <Check
                className={`h-3 w-3 ${
                  plan.popular ? "text-white" : "text-zinc-700"
                }`}
              />
            </span>
            <span className="flex items-center gap-2 text-sm text-zinc-600">
              <FeatureIcon name={feature.icon} />
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-10">
        <button
          className={`group inline-flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-semibold transition-all ${
            plan.popular
              ? "bg-zinc-900 text-white shadow-lg shadow-zinc-900/20 hover:bg-zinc-800 hover:shadow-xl"
              : plan.key === "LIFETIME"
                ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-500 hover:to-emerald-400 hover:shadow-xl"
                : "bg-zinc-100 text-zinc-800 hover:bg-zinc-200"
          }`}
        >
          <span>{plan.cta}</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </motion.div>
  );
}

export default function Pricing() {
  return (
    <section id="pricing" className="bg-white py-28">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">
            Pricing
          </p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-zinc-900 md:text-5xl">
            Simple, transparent pricing.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-500">
            Choose the plan that fits your needs. Upgrade or switch anytime.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {PLANS.map((plan, i) => (
            <PricingCard key={plan.key} plan={plan} index={i} />
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 text-center text-sm text-zinc-400"
        >
          All plans include a 14-day money-back guarantee. No questions asked.
        </motion.p>
      </Container>
    </section>
  );
}
