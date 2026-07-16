"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Loader2, X, Zap, Crown, Sparkles } from "lucide-react";

interface QuotaExceededData {
  error: string;
  code: string;
  limit: number;
  used: number;
  plan: string;
}

export default function WebsiteAnalyzer() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [quotaModal, setQuotaModal] = useState<QuotaExceededData | null>(null);

  const validateInput = (input: string): string | null => {
    if (!input.trim()) return "Please enter a URL.";

    let normalized = input.trim();
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = "https://" + normalized;
    }

    try {
      const parsed = new URL(normalized);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        return "Please enter a valid URL.";
      }
      if (!parsed.hostname.includes(".")) {
        return "Please enter a valid URL.";
      }
    } catch {
      return "Please enter a valid URL.";
    }

    return null;
  };

  const handleAnalyze = async () => {
    setError("");
    setQuotaModal(null);

    const validationError = validateInput(url);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post<{ id: string }>("/api/audit", {
        url: url.trim(),
      });
      router.push(`/dashboard/history/${response.data.id}`);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const data = err.response.data;
        if (data.code === "QUOTA_EXCEEDED") {
          setQuotaModal(data as QuotaExceededData);
        } else if (data.error) {
          setError(data.error);
        } else {
          setError("Website could not be analyzed. Please try again.");
        }
      } else {
        setError("Website could not be analyzed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      handleAnalyze();
    }
  };

  return (
    <div>
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Globe className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError("");
              }}
              onKeyDown={handleKeyDown}
              disabled={loading}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3.5 pl-12 pr-4 text-base outline-none transition-colors focus:border-zinc-300 focus:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-black px-8 py-3.5 font-medium text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze"
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 px-5 py-3.5 text-sm font-medium text-red-600">
            {error}
          </div>
        )}
      </div>

      <AnimatePresence>
        {quotaModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl"
            >
              <button
                onClick={() => setQuotaModal(null)}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50">
                <Zap className="h-7 w-7 text-amber-500" />
              </div>

              <h3 className="text-center text-xl font-bold text-zinc-800">
                Monthly Limit Reached
              </h3>
              <p className="mt-2 text-center text-sm text-zinc-500">
                You have reached your monthly audit limit on the{" "}
                <span className="font-medium text-zinc-700">
                  {quotaModal.plan === "FREE" ? "Free" : quotaModal.plan === "STARTER" ? "Starter" : quotaModal.plan === "PRO" ? "Professional" : quotaModal.plan === "LIFETIME" ? "Lifetime Access" : quotaModal.plan} plan
                </span>
                .
              </p>

              <div className="mt-6 rounded-xl border border-zinc-100 bg-zinc-50 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">Audits used</span>
                  <span className="font-medium text-zinc-800">
                    {quotaModal.used} / {quotaModal.limit}
                  </span>
                </div>
              </div>

              <p className="mt-4 text-center text-xs text-zinc-400">
                Upgrade to a higher plan for more monthly audits.
              </p>

              <div className="mt-6 grid gap-3">
                <button
                  onClick={() => router.push(`/pricing/checkout?plan=${quotaModal.plan}`)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-medium text-white transition-all hover:opacity-90"
                >
                  <Crown className="h-4 w-4" />
                  Upgrade Plan
                </button>
                <button
                  onClick={() => setQuotaModal(null)}
                  className="inline-flex items-center justify-center rounded-xl border border-zinc-200 px-6 py-3 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100"
                >
                  Maybe Later
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
