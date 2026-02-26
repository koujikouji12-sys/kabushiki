"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { OHLCVBar } from "@/lib/stock/types";

interface VolumeChartProps {
  history: OHLCVBar[];
}

export function VolumeChart({ history }: VolumeChartProps) {
  if (history.length === 0) return null;

  const data = history.map((bar, i) => ({
    date: bar.date.slice(5),
    volume: bar.volume,
    isUp: i > 0 ? bar.close >= history[i - 1].close : true,
  }));

  return (
    <ResponsiveContainer width="100%" height={100}>
      <BarChart data={data} margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
        <XAxis dataKey="date" hide />
        <YAxis
          tick={{ fill: "#64748b", fontSize: 10 }}
          tickLine={false}
          tickFormatter={(v) => `${(v / 10000).toFixed(0)}万`}
          width={40}
        />
        <Tooltip
          formatter={(value: number | undefined) => [value != null ? `${(value / 10000).toFixed(0)}万株` : "-", "出来高"]}
          labelStyle={{ color: "#94a3b8" }}
          contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }}
        />
        <Bar
          dataKey="volume"
          maxBarSize={8}
          fill="#22c55e60"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
