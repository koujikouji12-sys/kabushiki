"use client";

import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { OHLCVBar, TechnicalIndicators } from "@/lib/stock/types";

interface PriceChartProps {
  history: OHLCVBar[];
  indicators: TechnicalIndicators;
}

interface ChartData {
  date: string;
  close: number;
  bbMiddle: number | null;
  bbUpper: number | null;
  bbLower: number | null;
}

export function PriceChart({ history, indicators }: PriceChartProps) {
  if (history.length === 0) return (
    <div className="flex items-center justify-center h-48 text-slate-500">データなし</div>
  );

  // ボリンジャーバンドを日次で計算して描画データを作成
  const data: ChartData[] = history.map((bar, i) => {
    const closes = history.slice(0, i + 1).map((b) => b.close);

    let bbMiddle: number | null = null;
    let bbUpper: number | null = null;
    let bbLower: number | null = null;

    if (closes.length >= 25) {
      const slice = closes.slice(-25);
      const mean = slice.reduce((a, b) => a + b, 0) / 25;
      const variance = slice.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / 25;
      const std = Math.sqrt(variance);
      bbMiddle = mean;
      bbUpper = mean + 2 * std;
      bbLower = mean - 2 * std;
    }

    return {
      date: bar.date.slice(5), // "MM-DD" 形式
      close: bar.close,
      bbMiddle,
      bbUpper,
      bbLower,
    };
  });

  const prices = history.map((b) => b.close);
  const minPrice = Math.min(...prices) * 0.99;
  const maxPrice = Math.max(...prices) * 1.01;

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ value: number; name: string; color: string }>;
    label?: string;
  }) => {
    if (!active || !payload) return null;
    return (
      <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-xs">
        <p className="text-slate-400 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>
            {p.name}: ¥{p.value?.toLocaleString()}
          </p>
        ))}
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis
          dataKey="date"
          tick={{ fill: "#64748b", fontSize: 11 }}
          tickLine={false}
          interval={Math.floor(data.length / 6)}
        />
        <YAxis
          domain={[minPrice, maxPrice]}
          tick={{ fill: "#64748b", fontSize: 11 }}
          tickLine={false}
          tickFormatter={(v) => `¥${(v / 1000).toFixed(0)}k`}
          width={55}
        />
        <Tooltip content={<CustomTooltip />} />

        {/* ボリンジャーバンド帯域 */}
        <Area
          dataKey="bbUpper"
          fill="#3b82f620"
          stroke="#3b82f640"
          strokeWidth={1}
          dot={false}
          name="BB上限"
          connectNulls
        />
        <Area
          dataKey="bbLower"
          fill="#0f172a"
          stroke="#3b82f640"
          strokeWidth={1}
          dot={false}
          name="BB下限"
          connectNulls
        />

        {/* MA25 (ミドルバンド) */}
        <Line
          type="monotone"
          dataKey="bbMiddle"
          stroke="#f59e0b"
          strokeWidth={1}
          dot={false}
          name="MA25"
          strokeDasharray="4 2"
          connectNulls
        />

        {/* 終値 */}
        <Line
          type="monotone"
          dataKey="close"
          stroke="#60a5fa"
          strokeWidth={2}
          dot={false}
          name="終値"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
