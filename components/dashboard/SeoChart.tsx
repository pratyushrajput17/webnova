"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", score: 65 },
  { month: "Feb", score: 72 },
  { month: "Mar", score: 76 },
  { month: "Apr", score: 81 },
  { month: "May", score: 88 },
  { month: "Jun", score: 91 },
];

export default function SeoChart() {
  return (
    <div className="h-87.5 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#000"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}