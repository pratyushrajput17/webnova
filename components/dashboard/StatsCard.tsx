"use client";

import { motion } from "framer-motion";
import type { ElementType } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ElementType;
  trend?: string;
  trendUp?: boolean;
  delay?: number;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
  delay = 0,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-2xl border border-zinc-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">{title}</p>
        <Icon className="h-5 w-5 text-zinc-400" />
      </div>
      <p className="mt-4 text-3xl font-bold">{value}</p>
      {trend && (
        <p
          className={`mt-2 text-sm ${
            trendUp ? "text-green-600" : "text-red-600"
          }`}
        >
          {trend}
        </p>
      )}
    </motion.div>
  );
}
