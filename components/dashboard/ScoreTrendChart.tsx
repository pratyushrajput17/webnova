"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ScorePoint {
  date: string;
  seoScore: number;
  performanceScore: number;
  accessibilityScore: number;
  id: string;
}

const COLORS = {
  seo: "#18181b",
  performance: "#3b82f6",
  accessibility: "#8b5cf6",
};

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-lg">
      <p className="mb-2 text-xs font-medium text-zinc-500">
        {label
          ? new Date(label).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : ""}
      </p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-sm">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-zinc-600">{entry.name}:</span>
          <span className="font-semibold text-zinc-800">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function ScoreTrendChart({
  data,
  height = 300,
}: {
  data: ScorePoint[];
  height?: number;
}) {
  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-xl bg-zinc-50"
        style={{ height }}
      >
        <p className="text-sm text-zinc-500">No data to display.</p>
      </div>
    );
  }

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
          <XAxis
            dataKey="date"
            stroke="#a1a1aa"
            fontSize={11}
            axisLine={false}
            tickLine={false}
            tickFormatter={(val: string) =>
              new Date(val).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            }
          />
          <YAxis
            stroke="#a1a1aa"
            fontSize={11}
            domain={[0, 100]}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            iconType="circle"
            iconSize={8}
          />
          <Line
            type="monotone"
            dataKey="seoScore"
            name="SEO Score"
            stroke={COLORS.seo}
            strokeWidth={2.5}
            dot={{ fill: COLORS.seo, strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5, fill: COLORS.seo }}
          />
          <Line
            type="monotone"
            dataKey="performanceScore"
            name="Performance"
            stroke={COLORS.performance}
            strokeWidth={2}
            dot={{ fill: COLORS.performance, strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5, fill: COLORS.performance }}
          />
          <Line
            type="monotone"
            dataKey="accessibilityScore"
            name="Accessibility"
            stroke={COLORS.accessibility}
            strokeWidth={2}
            dot={{ fill: COLORS.accessibility, strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5, fill: COLORS.accessibility }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
