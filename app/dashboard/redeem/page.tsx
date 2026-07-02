"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  Ticket,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeft,
  Zap,
  Crown,
  Sparkles,
  Gift,
  AlertCircle,
  Clock,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface RedeemResponse {
  success: boolean;
  plan: string;
  duration: number;
  subscriptionEndsAt: string;
}

const planDisplay: Record<string, { label: string; color: string; icon: typeof Crown }> = {
  STARTER: { label: "Starter", color: "text-blue-600", icon: Zap },
  PRO: { label: "Professional", color: "text-indigo-600", icon: Crown },
  LIFETIME: { label: "Lifetime Access", color: "text-emerald-600", icon: Sparkles },
  ENTERPRISE: { label: "Enterprise", color: "text-violet-600", icon: Crown },
};

export default function RedeemPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RedeemResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (result) {
      const timer = setTimeout(() => router.push("/dashboard"), 4000);
      return () => clearTimeout(timer);
    }
  }, [result, router]);

  const handleRedeem = async () => {
    setError(null);
    setResult(null);

    const trimmed = code.trim();
    if (!trimmed) {
      setError("Please enter a redeem code.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post<RedeemResponse>("/api/redeem", {
        code: trimmed,
      });
      setResult(res.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Failed to redeem code. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      handleRedeem();
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const planInfo = result ? planDisplay[result.plan] : null;
  const PlanIcon = planInfo?.icon ?? Gift;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto max-w-2xl"
    >
      <button
        onClick={() => router.back()}
        className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="rounded-2xl border border-zinc-200 bg-white p-8 md:p-10">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-200/50">
            <Ticket className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">Redeem Code</h1>
            <p className="mt-1 text-zinc-500">
              Enter your subscription code to activate your plan.
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mt-8"
            >
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100"
                >
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </motion.div>
                <h2 className="text-xl font-bold text-emerald-800">
                  Plan Upgraded Successfully
                </h2>
                <p className="mt-2 text-emerald-600">
                  Your code has been redeemed.
                </p>

                <div className="mt-6 inline-flex items-center gap-3 rounded-xl border border-emerald-200 bg-white px-6 py-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg" />
                  <PlanIcon
                    className={`h-6 w-6 ${planInfo?.color ?? "text-emerald-600"}`}
                  />
                  <div className="text-left">
                    <p className="text-sm text-zinc-500">New Plan</p>
                    <p className="text-lg font-bold text-zinc-800">
                      {planInfo?.label ?? result.plan}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-zinc-500">
                  <Clock className="h-4 w-4" />
                  Active until {formatDate(result.subscriptionEndsAt)}
                </div>

                <p className="mt-6 text-sm text-zinc-400">
                  Redirecting to dashboard...
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="mt-8">
                <label className="text-sm font-medium text-zinc-700">
                  Subscription Code
                </label>
                <div className="relative mt-2">
                  <Gift className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="WEB-ST-XXXXXXXX"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.toUpperCase());
                      setError(null);
                    }}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-4 pl-12 pr-4 font-mono text-base tracking-widest outline-none transition-colors focus:border-zinc-300 focus:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-5 py-3.5 text-sm text-red-700"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{error}</span>
                    <button
                      onClick={() => setError(null)}
                      className="ml-auto shrink-0 rounded-lg p-0.5 transition-colors hover:bg-red-100"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={handleRedeem}
                disabled={loading || !code.trim()}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-black px-8 py-4 font-medium text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Redeeming...
                  </>
                ) : (
                  <>
                    <Gift className="h-5 w-5" />
                    Redeem Code
                  </>
                )}
              </button>

              <div className="mt-8 rounded-xl border border-zinc-100 bg-zinc-50 p-5">
                <h3 className="text-sm font-semibold text-zinc-700">
                  How to Redeem
                </h3>
                <ol className="mt-3 space-y-2 text-sm text-zinc-500">
                  <li className="flex items-start gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-xs font-medium text-zinc-600">
                      1
                    </span>
                    Purchase a subscription from an authorized reseller.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-xs font-medium text-zinc-600">
                      2
                    </span>
                    Receive your unique redeem code via email.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-xs font-medium text-zinc-600">
                      3
                    </span>
                    Enter the code above and click Redeem to activate.
                  </li>
                </ol>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
