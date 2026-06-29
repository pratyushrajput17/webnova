"use client";

import { motion } from "framer-motion";
import {
  CreditCard,
  CheckCircle2,
  ArrowUpRight,
  Zap,
  Globe,
  FileText,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

const usageStats = [
  {
    label: "Audits Used",
    value: "87",
    total: null,
    subtitle: "Unlimited",
    unlimited: true,
    icon: Zap,
  },
  {
    label: "Competitors Tracked",
    value: "28",
    total: null,
    icon: Globe,
  },
  {
    label: "Reports Generated",
    value: "154",
    total: null,
    icon: FileText,
  },
];

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.1 },
  }),
};

export default function BillingPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-3xl font-bold">Billing &amp; Subscription</h1>
      <p className="mt-2 text-zinc-600">
        Manage your subscription and billing information.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <motion.div
          custom={0}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="rounded-2xl border border-zinc-200 bg-white p-8 lg:col-span-2"
        >
          <h2 className="text-xl font-semibold">Subscription Overview</h2>
          <div className="mt-6 flex items-start justify-between">
            <div>
              <p className="text-sm text-zinc-500">Current Plan</p>
              <p className="mt-1 text-3xl font-bold">Pro</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-4 py-1.5 text-sm font-medium text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              Active
            </span>
          </div>
          <Separator className="my-6" />
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-sm text-zinc-500">Monthly Price</p>
              <p className="mt-1 text-lg font-semibold">$79 / month</p>
            </div>
            <div>
              <p className="text-sm text-zinc-500">Next Billing Date</p>
              <p className="mt-1 text-lg font-semibold">July 25, 2026</p>
            </div>
          </div>
          <button className="mt-8 inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-6 py-2.5 text-sm font-medium transition-colors hover:bg-zinc-100">
            View Invoices
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </motion.div>

        <motion.div
          custom={1}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="rounded-2xl border border-zinc-200 bg-white p-8"
        >
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Payment Method</h2>
          </div>
          <p className="mt-2 text-sm text-zinc-500">
            You are currently on the Pro plan.
          </p>
          <Separator className="my-6" />
          <p className="text-sm text-zinc-500">Card ending in 4242</p>
          <p className="mt-1 text-sm font-medium">Expires 12/28</p>
          <button className="mt-6 w-full rounded-xl bg-black px-6 py-2.5 text-sm font-medium text-white transition-all hover:opacity-90">
            Upgrade Plan
          </button>
        </motion.div>
      </div>

      <motion.div
        custom={2}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="mt-8 rounded-2xl border border-zinc-200 bg-white p-8"
      >
        <h2 className="text-xl font-semibold">Usage Statistics</h2>
        <div className="mt-6 grid gap-8 sm:grid-cols-3">
          {usageStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100">
                      <Icon className="h-5 w-5 text-zinc-600" />
                    </div>
                    <div>
                      <p className="text-sm text-zinc-500">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                  </div>
                </div>
                {stat.unlimited ? (
                  <div className="mt-4 flex items-center gap-1.5 text-sm text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    {stat.subtitle}
                  </div>
                ) : (
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-zinc-500">Active</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
