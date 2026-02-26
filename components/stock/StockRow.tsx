"use client";

import Link from "next/link";
import type { FullStockData } from "@/lib/stock/types";
import { ScoreBadge } from "@/components/ui/Badge";
import { ChangeIndicator } from "@/components/ui/ChangeIndicator";

interface StockRowProps {
  data: FullStockData;
  rank: number;
}

export function StockRow({ data, rank }: StockRowProps) {
  const { quote, score, indicators } = data;

  const macdColor =
    indicators.macdCross === "golden"
      ? "text-green-400"
      : indicators.macdCross === "dead"
      ? "text-red-400"
      : indicators.macdLine !== null && indicators.macdSignal !== null && indicators.macdLine > indicators.macdSignal
      ? "text-green-300"
      : "text-slate-400";

  const macdLabel =
    indicators.macdCross === "golden"
      ? "GC"
      : indicators.macdCross === "dead"
      ? "DC"
      : indicators.macdLine !== null && indicators.macdSignal !== null && indicators.macdLine > indicators.macdSignal
      ? "↑"
      : "↓";

  return (
    <tr className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
      <td className="px-3 py-3 text-slate-500 text-sm tabular-nums">{rank}</td>
      <td className="px-3 py-3">
        <Link
          href={`/dashboard/analysis/${quote.symbol}`}
          className="hover:text-blue-400 transition-colors"
        >
          <p className="text-white text-sm font-medium">{quote.nameJa}</p>
          <p className="text-slate-500 text-xs">{quote.code}</p>
        </Link>
      </td>
      <td className="px-3 py-3 text-slate-400 text-xs hidden md:table-cell">{quote.sector}</td>
      <td className="px-3 py-3 text-right">
        <p className="text-white font-semibold tabular-nums">¥{quote.price.toLocaleString()}</p>
      </td>
      <td className="px-3 py-3 text-right">
        <ChangeIndicator changePercent={quote.changePercent} size="sm" />
      </td>
      <td className="px-3 py-3 text-right text-slate-400 text-xs tabular-nums hidden lg:table-cell">
        {(quote.volume / 10000).toFixed(0)}万
      </td>
      <td className="px-3 py-3 text-center hidden md:table-cell">
        {indicators.rsi14 !== null ? (
          <span
            className={`text-sm tabular-nums ${
              indicators.rsi14 < 30
                ? "text-red-400"
                : indicators.rsi14 < 50
                ? "text-green-400"
                : indicators.rsi14 < 70
                ? "text-yellow-400"
                : "text-red-400"
            }`}
          >
            {indicators.rsi14.toFixed(1)}
          </span>
        ) : (
          <span className="text-slate-600 text-xs">-</span>
        )}
      </td>
      <td className={`px-3 py-3 text-center text-sm font-semibold hidden lg:table-cell ${macdColor}`}>
        {macdLabel}
      </td>
      <td className="px-3 py-3 text-center hidden lg:table-cell">
        {indicators.maDeviation25 !== null ? (
          <span
            className={`text-xs tabular-nums ${
              indicators.maDeviation25 >= -5 && indicators.maDeviation25 <= 0
                ? "text-green-400"
                : indicators.maDeviation25 > 5
                ? "text-orange-400"
                : "text-slate-400"
            }`}
          >
            {indicators.maDeviation25 >= 0 ? "+" : ""}{indicators.maDeviation25.toFixed(2)}%
          </span>
        ) : (
          <span className="text-slate-600 text-xs">-</span>
        )}
      </td>
      <td className="px-3 py-3 text-center">
        <ScoreBadge score={score.totalScore} size="sm" />
      </td>
    </tr>
  );
}
