"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { OHLCVBar, TechnicalIndicators } from "@/lib/stock/types";

interface PriceChartProps {
  history: OHLCVBar[];
  indicators: TechnicalIndicators;
}

interface CandleData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  bbMiddle: number | null;
  bbUpper: number | null;
  bbLower: number | null;
}

// ローソク足カスタムシェイプ
const CandlestickShape = (props: any) => {
  const { x, y, width, height, open, high, low, close } = props;

  if (!height || height <= 0 || high === low) return null;

  const isGreen = close >= open;
  const color = isGreen ? "#22c55e" : "#ef4444";

  // y = 高値のピクセル位置（上端）, y + height = 安値のピクセル位置（下端）
  const scale = height / (high - low);
  const bodyTop    = y + (high - Math.max(open, close)) * scale;
  const bodyBottom = y + (high - Math.min(open, close)) * scale;
  const bodyHeight = Math.max(Math.abs(bodyBottom - bodyTop), 1);
  const centerX    = x + width / 2;
  const barWidth   = Math.max(width * 0.7, 2);

  return (
    <g>
      {/* ヒゲ（高値〜安値） */}
      <line
        x1={centerX} y1={y}
        x2={centerX} y2={y + height}
        stroke={color} strokeWidth={1}
      />
      {/* 実体（始値〜終値） */}
      <rect
        x={centerX - barWidth / 2}
        y={bodyTop}
        width={barWidth}
        height={bodyHeight}
        fill={color}
        stroke={color}
        strokeWidth={0.5}
      />
    </g>
  );
};

export function PriceChart({ history }: PriceChartProps) {
  if (history.length === 0) return (
    <div className="flex items-center justify-center h-48 text-slate-500">データなし</div>
  );

  const data: CandleData[] = history.map((bar, i) => {
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
      bbUpper  = mean + 2 * std;
      bbLower  = mean - 2 * std;
    }

    return {
      date: bar.date.slice(5),
      open:  bar.open,
      high:  bar.high,
      low:   bar.low,
      close: bar.close,
      bbMiddle,
      bbUpper,
      bbLower,
    };
  });

  const allPrices = history.flatMap((b) => [b.high, b.low]);
  const minPrice = Math.min(...allPrices) * 0.998;
  const maxPrice = Math.max(...allPrices) * 1.002;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload as CandleData;
    if (!d) return null;
    const isGreen = d.close >= d.open;
    return (
      <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-xs space-y-0.5">
        <p className="text-slate-400 mb-1">{label}</p>
        <p className="text-slate-200">始値: ¥{d.open?.toLocaleString()}</p>
        <p className="text-green-400">高値: ¥{d.high?.toLocaleString()}</p>
        <p className="text-red-400"> 安値: ¥{d.low?.toLocaleString()}</p>
        <p style={{ color: isGreen ? "#22c55e" : "#ef4444" }}>
          終値: ¥{d.close?.toLocaleString()}
        </p>
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

        {/* ボリンジャーバンド */}
        <Line type="monotone" dataKey="bbUpper"  stroke="#3b82f650" strokeWidth={1} dot={false} name="BB上限" connectNulls />
        <Line type="monotone" dataKey="bbLower"  stroke="#3b82f650" strokeWidth={1} dot={false} name="BB下限" connectNulls />
        <Line type="monotone" dataKey="bbMiddle" stroke="#f59e0b"   strokeWidth={1} dot={false} name="MA25"  strokeDasharray="4 2" connectNulls />

        {/* ローソク足（high〜low の範囲バー + カスタムシェイプ） */}
        <Bar
          dataKey={(entry: any) => [entry.low, entry.high]}
          shape={<CandlestickShape />}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
