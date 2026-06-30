"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import {
  Loader2,
  Ticket,
} from "lucide-react";

interface RedeemHistoryItem {
  id: string;
  code: string;
  plan: string;
  redeemedAt: string;
  user: { id: string; email: string; name: string | null } | null;
}

export default function RedeemHistory() {
  const [history, setHistory] = useState<RedeemHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const res = await axios.get("/api/admin/redeem/history");
        setHistory(res.data.history);
      } catch {}
      setLoading(false);
    }
    fetch();
  }, []);

  const getPlanBadge = (plan: string) => {
    const colors: Record<string, string> = {
      STARTER: "bg-blue-100 text-blue-700",
      PRO: "bg-indigo-100 text-indigo-700",
      ENTERPRISE: "bg-amber-100 text-amber-700",
    };
    return (
      <span
        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[plan] ?? "bg-zinc-100 text-zinc-700"}`}
      >
        {plan}
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-zinc-800">Redeem History</h1>
        <p className="mt-1 text-zinc-500">
          Track all redeemed codes.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="px-6 py-4 font-semibold text-zinc-600">Code</th>
                <th className="px-6 py-4 font-semibold text-zinc-600">Plan</th>
                <th className="px-6 py-4 font-semibold text-zinc-600">User</th>
                <th className="px-6 py-4 font-semibold text-zinc-600">Email</th>
                <th className="px-6 py-4 font-semibold text-zinc-600">Redeemed Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-zinc-400" />
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center text-zinc-300">
                      <Ticket className="mb-2 h-8 w-8" />
                      <p className="text-sm">No redeemed codes yet.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                history.map((item, i) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-zinc-50 transition-colors hover:bg-zinc-50/50"
                  >
                    <td className="px-6 py-4">
                      <code className="font-mono text-xs text-zinc-700">
                        {item.code}
                      </code>
                    </td>
                    <td className="px-6 py-4">{getPlanBadge(item.plan)}</td>
                    <td className="px-6 py-4 font-medium text-zinc-800">
                      {item.user?.name ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-zinc-600">
                      {item.user?.email ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-zinc-500">
                      {item.redeemedAt
                        ? new Date(item.redeemedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
