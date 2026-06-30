"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import {
  Ticket,
  Loader2,
  Download,
  CheckCircle2,
  Copy,
  Star,
  Zap,
  Crown,
} from "lucide-react";

const PLAN_CONFIG = [
  { key: "STARTER", label: "Starter", icon: Star, color: "from-blue-400 to-blue-500", shadow: "shadow-blue-200/50", bg: "bg-blue-50 text-blue-700" },
  { key: "PRO", label: "Pro", icon: Zap, color: "from-indigo-400 to-indigo-500", shadow: "shadow-indigo-200/50", bg: "bg-indigo-50 text-indigo-700" },
  { key: "ENTERPRISE", label: "Enterprise", icon: Crown, color: "from-amber-400 to-amber-500", shadow: "shadow-amber-200/50", bg: "bg-amber-50 text-amber-700" },
];

const BULK_OPTIONS = [10, 50, 100, 500];

export default function AdminRedeem() {
  const [selectedPlan, setSelectedPlan] = useState("STARTER");
  const [bulkCount, setBulkCount] = useState(10);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{
    count: number;
    plan: string;
    codes: string[];
  } | null>(null);

  const handleGenerate = async (count: number) => {
    setGenerating(true);
    setResult(null);
    try {
      const res = await axios.post("/api/admin/codes", {
        plan: selectedPlan,
        count,
      });
      setResult(res.data);
    } catch {}
    setGenerating(false);
  };

  const handleExportCSV = async () => {
    try {
      const res = await axios.get("/api/admin/codes", {
        params: { format: "csv" },
        responseType: "blob",
      });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `redeem-codes-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {}
  };

  const copyAll = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.codes.join("\n"));
    } catch {}
  };

  const currentPlan = PLAN_CONFIG.find((p) => p.key === selectedPlan)!;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-800">Redeem Codes</h1>
        <p className="mt-1 text-zinc-500">
          Generate and manage redeem codes.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Plan Selection */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold text-zinc-500 uppercase tracking-wider">
            1. Select Plan
          </h2>
          <div className="space-y-3">
            {PLAN_CONFIG.map((plan) => {
              const Icon = plan.icon;
              const isSelected = selectedPlan === plan.key;
              return (
                <button
                  key={plan.key}
                  onClick={() => setSelectedPlan(plan.key)}
                  className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-500/20"
                      : "border-zinc-200 hover:bg-zinc-50"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${plan.color} shadow-lg ${plan.shadow}`}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-zinc-800">{plan.label}</p>
                    <p className="text-xs text-zinc-500">30-day subscription</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bulk Generation */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold text-zinc-500 uppercase tracking-wider">
            2. Choose Quantity
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {BULK_OPTIONS.map((count) => (
              <button
                key={count}
                onClick={() => setBulkCount(count)}
                className={`rounded-xl border px-4 py-3 text-center text-sm font-medium transition-all ${
                  bulkCount === count
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                {count} codes
              </button>
            ))}
          </div>

          <button
            onClick={() => handleGenerate(bulkCount)}
            disabled={generating}
            className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${currentPlan.color} px-6 py-3 text-sm font-medium text-white shadow-lg ${currentPlan.shadow} transition-all hover:opacity-90 disabled:opacity-50`}
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Ticket className="h-4 w-4" />
                Generate {bulkCount} {currentPlan.label} Codes
              </>
            )}
          </button>

          <button
            onClick={handleExportCSV}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 px-6 py-3 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
          >
            <Download className="h-4 w-4" />
            Export All Codes as CSV
          </button>
        </div>

        {/* Results */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold text-zinc-500 uppercase tracking-wider">
            3. Results
          </h2>
          {result ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">
                  {result.count} codes generated
                </span>
              </div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">
                  {result.count} codes
                </span>
                <button
                  onClick={copyAll}
                  className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
                >
                  <Copy className="h-3 w-3" />
                  Copy All
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto rounded-xl border border-zinc-100 bg-zinc-50">
                {result.codes.map((code) => (
                  <div
                    key={code}
                    className="flex items-center justify-between border-b border-zinc-100 px-4 py-2.5 text-sm last:border-0"
                  >
                    <code className="font-mono text-xs text-zinc-700">
                      {code}
                    </code>
                    <span className={`rounded px-2 py-0.5 text-[10px] font-medium ${currentPlan.bg}`}>
                      {result.plan}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-300">
              <Ticket className="mb-2 h-10 w-10" />
              <p className="text-sm">Generate codes to see them here</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
