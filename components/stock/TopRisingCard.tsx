"use client";

import Link from "next/link";
import type { FullStockData } from "@/lib/stock/types";
import { ScoreBadge } from "@/components/ui/Badge";
import { ChangeIndicator } from "@/components/ui/ChangeIndicator";

interface TopRisingCardProps {
  data: FullStockData;
  rank: number;
}

export function TopRisingCard({ data, rank }: TopRisingCardProps) {
  const { quote, score, indicators } = data;

  const rankColor =
    rank === 1
      ? "text-yellow-400"
      : rank === 2
      ? "text-slate-300"
      : rank === 3
      ? "text-orange-400"
      : "text-slate-500";

  return (
    <Link href={`/dashboard/analysis/${quote.symbol}`}>
      <div className="bg-slate-800 border border-slate-700 hover:border-blue-500/50 rounded-xl p-4 cursor-pointer transition-all hover:bg-slate-750 group">
        {/* ヘッダー行 */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-black ${rankColor}`}>{rank}</span>
            <div>
              <p className="text-white font-semibold text-sm group-hover:text-blue-300 transition-colors">
                {quote.nameJa}
              </p>
              <p className="text-slate-500 text-xs">{quote.code} | {quote.sector}</p>
            </div>
          </div>
          <ScoreBadge score={score.totalScore} size="md" />
        </div>

        {/* 株価 */}
        <div className="flex items-end gap-2 mb-3">
          <span className="text-white text-xl font-bold tabular-nums">
            ¥{quote.price.toLocaleString()}
          </span>
          <ChangeIndicator
            changePercent={quote.changePercent}
            changeAmount={quote.changeAmount}
            showAmount={true}
            size="sm"
          />
        </div>

        {/* スコアバー */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>総合スコア</span>
            <span>{score.totalScore}/100</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-1.5 rounded-full transition-all"
              style={{ width: `${score.totalScore}%` }}
            />
          </div>
        </div>

        {/* 指標スコア内訳 */}
        <div className="grid grid-cols-5 gap-1 mb-3">
          {[
            { label: "RSI", score: score.rsiScore },
            { label: "MACD", score: score.macdScore },
            { label: "出来高", score: score.volumeScore },
            { label: "乖離率", score: score.deviationScore },
            { label: "BB", score: score.bbScore },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div
                className={`text-xs font-bold ${
                  item.score >= 15
                    ? "text-green-400"
                    : item.score >= 8
                    ? "text-yellow-400"
                    : "text-slate-500"
                }`}
              >
                {item.score}
              </div>
              <div className="text-slate-600 text-xs">{item.label}</div>
            </div>
          ))}
        </div>

        {/* 根拠 */}
        <div className="space-y-1">
          {score.reasons.filter((r) => r && !r.includes("不足")).slice(0, 2).map((reason, i) => (
            <p key={i} className="text-slate-400 text-xs flex items-start gap-1">
              <span className="text-blue-400 mt-0.5">•</span>
              {reason}
            </p>
          ))}
        </div>

        {/* RSI / BB 数値 */}
        <div className="flex gap-4 mt-2 pt-2 border-t border-slate-700/50">
          {indicators.rsi14 !== null && (
            <span className="text-xs text-slate-500">
              RSI: <span className="text-slate-300">{indicators.rsi14.toFixed(1)}</span>
            </span>
          )}
          {indicators.maDeviation25 !== null && (
            <span className="text-xs text-slate-500">
              乖離: <span className="text-slate-300">{indicators.maDeviation25.toFixed(2)}%</span>
            </span>
          )}
          {indicators.volumeRatio !== null && (
            <span className="text-xs text-slate-500">
              出来高比: <span className="text-slate-300">{indicators.volumeRatio.toFixed(2)}x</span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
