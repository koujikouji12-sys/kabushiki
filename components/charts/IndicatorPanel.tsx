"use client";

import {
  LineChart,
  Line,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { OHLCVBar } from "@/lib/stock/types";
import { calculateRSI } from "@/lib/stock/indicators/rsi";
import { calculateMACD } from "@/lib/stock/indicators/macd";

interface IndicatorPanelProps {
  history: OHLCVBar[];
}

export function IndicatorPanel({ history }: IndicatorPanelProps) {
  if (history.length < 35) return (
    <div className="text-center py-6 text-slate-500 text-sm">
      指標計算に必要なデータが不足しています（最低35日分必要）
    </div>
  );

  // RSI の日次系列を計算
  const rsiData = history.map((bar, i) => {
    const closes = history.slice(0, i + 1).map((b) => b.close);
    const rsi = closes.length >= 15 ? calculateRSI(closes) : null;
    return { date: bar.date.slice(5), rsi };
  }).filter((d) => d.rsi !== null);

  // MACD の日次系列を計算
  const macdData: Array<{ date: string; macd: number; signal: number; histogram: number }> = [];

  for (let i = 35; i < history.length; i++) {
    const closes = history.slice(0, i + 1).map((b) => b.close);
    const result = calculateMACD(closes);
    if (result) {
      macdData.push({
        date: history[i].date.slice(5),
        macd: result.macdLine,
        signal: result.signalLine,
        histogram: result.histogram,
      });
    }
  }

  return (
    <div className="space-y-4">
      {/* RSI チャート */}
      <div>
        <p className="text-slate-400 text-xs font-medium mb-2">RSI (14)</p>
        <ResponsiveContainer width="100%" height={100}>
          <LineChart data={rsiData} margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" hide />
            <YAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} width={30} />
            <Tooltip
              formatter={(v: number | undefined) => [v != null ? v.toFixed(1) : "-", "RSI"]}
              labelStyle={{ color: "#94a3b8" }}
              contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }}
            />
            <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" strokeWidth={1} />
            <ReferenceLine y={50} stroke="#64748b" strokeDasharray="3 3" strokeWidth={1} />
            <ReferenceLine y={30} stroke="#22c55e" strokeDasharray="3 3" strokeWidth={1} />
            <Line type="monotone" dataKey="rsi" stroke="#a78bfa" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex justify-end gap-4 text-xs text-slate-600 mt-1">
          <span className="text-red-400">70: 買われ過ぎ</span>
          <span className="text-green-400">30: 売られ過ぎ</span>
        </div>
      </div>

      {/* MACD チャート */}
      {macdData.length > 0 && (
        <div>
          <p className="text-slate-400 text-xs font-medium mb-2">MACD (12, 26, 9)</p>
          <ResponsiveContainer width="100%" height={100}>
            <ComposedChart data={macdData} margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" hide />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} width={40} />
              <Tooltip
                contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }}
              />
              <ReferenceLine y={0} stroke="#475569" />
              <Bar dataKey="histogram" name="ヒストグラム">
                {macdData.map((entry, index) => (
                  <rect key={index} fill={entry.histogram >= 0 ? "#22c55e60" : "#ef444460"} />
                ))}
              </Bar>
              <Line type="monotone" dataKey="macd" stroke="#60a5fa" strokeWidth={1.5} dot={false} name="MACD" />
              <Line type="monotone" dataKey="signal" stroke="#f97316" strokeWidth={1.5} dot={false} name="シグナル" />
            </ComposedChart>
          </ResponsiveContainer>
          <div className="flex justify-end gap-4 text-xs text-slate-600 mt-1">
            <span className="text-blue-400">── MACD</span>
            <span className="text-orange-400">── シグナル</span>
          </div>
        </div>
      )}
    </div>
  );
}
