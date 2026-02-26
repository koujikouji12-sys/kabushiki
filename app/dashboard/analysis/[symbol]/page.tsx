"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useStock } from "../../layout";
import { PriceChart } from "@/components/charts/PriceChart";
import { VolumeChart } from "@/components/charts/VolumeChart";
import { IndicatorPanel } from "@/components/charts/IndicatorPanel";
import { ScoreBadge } from "@/components/ui/Badge";
import { ChangeIndicator } from "@/components/ui/ChangeIndicator";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { FullStockData, OHLCVBar } from "@/lib/stock/types";

export default function AnalysisPage() {
  const { symbol } = useParams<{ symbol: string }>();
  const { allStocks } = useStock();

  const [stockData, setStockData] = useState<FullStockData | null>(null);
  const [history, setHistory] = useState<OHLCVBar[]>([]);
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState("3mo");

  const decodedSymbol = decodeURIComponent(symbol);

  // コンテキストから既存データを取得
  useEffect(() => {
    const found = allStocks.find((s) => s.quote.symbol === decodedSymbol);
    if (found) {
      setStockData(found);
      setHistory(found.history);
    }
  }, [allStocks, decodedSymbol]);

  // 履歴データを個別取得
  const fetchHistory = async (r: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/stock/history?symbol=${encodeURIComponent(decodedSymbol)}&range=${r}`);
      const data = await res.json();
      setHistory(data.bars ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!stockData) {
      fetchHistory(range);
    }
  }, [decodedSymbol]);

  const handleRangeChange = (r: string) => {
    setRange(r);
    fetchHistory(r);
  };

  if (!stockData && history.length === 0 && loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" message="データ取得中..." />
      </div>
    );
  }

  const quote = stockData?.quote;
  const score = stockData?.score;
  const indicators = stockData?.indicators;

  return (
    <div>
      {/* 戻るボタン */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-4 transition-colors"
      >
        ← ダッシュボードに戻る
      </Link>

      {quote ? (
        <>
          {/* ヘッダー */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-white text-2xl font-bold">{quote.nameJa}</h2>
                {score && <ScoreBadge score={score.totalScore} size="lg" />}
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-slate-400 text-sm">{quote.code}</span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400 text-sm">{quote.sector}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white text-3xl font-bold tabular-nums">
                ¥{quote.price.toLocaleString()}
              </p>
              <ChangeIndicator
                changePercent={quote.changePercent}
                changeAmount={quote.changeAmount}
                showAmount={true}
                size="md"
              />
            </div>
          </div>

          {/* スコア詳細 */}
          {score && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-6">
              <h3 className="text-white font-semibold mb-3">テクニカルスコア詳細</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                {[
                  { label: "RSI(14)", score: score.rsiScore, value: indicators?.rsi14?.toFixed(1) },
                  { label: "MACD", score: score.macdScore, value: indicators?.macdCross === "golden" ? "GC" : indicators?.macdCross === "dead" ? "DC" : "---" },
                  { label: "出来高比", score: score.volumeScore, value: indicators?.volumeRatio?.toFixed(2) + "x" },
                  { label: "25日乖離", score: score.deviationScore, value: (indicators?.maDeviation25 ?? 0) >= 0 ? `+${indicators?.maDeviation25?.toFixed(2)}%` : `${indicators?.maDeviation25?.toFixed(2)}%` },
                  { label: "BB位置", score: score.bbScore, value: indicators?.bbPosition !== null ? `${(indicators!.bbPosition! * 100).toFixed(0)}%` : "---" },
                ].map((item) => (
                  <div key={item.label} className="bg-slate-700/50 rounded-lg p-3 text-center">
                    <p className="text-slate-400 text-xs mb-1">{item.label}</p>
                    <p className="text-white font-bold text-lg tabular-nums">{item.value ?? "---"}</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <ScoreBadge score={item.score} size="sm" />
                      <span className="text-slate-500 text-xs">/20</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-1">
                {score.reasons.map((reason, i) => (
                  <p key={i} className="text-slate-400 text-sm flex items-start gap-2">
                    <span className="text-blue-400">•</span> {reason}
                  </p>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="mb-6">
          <h2 className="text-white text-2xl font-bold">{decodedSymbol}</h2>
          <p className="text-slate-400 text-sm">データ更新後に詳細が表示されます</p>
        </div>
      )}

      {/* チャートエリア */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">価格チャート</h3>
          <div className="flex gap-1">
            {["1mo", "3mo", "6mo", "1y"].map((r) => (
              <button
                key={r}
                onClick={() => handleRangeChange(r)}
                className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                  range === r
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner message="チャートデータ取得中..." />
          </div>
        ) : (
          <>
            <PriceChart history={history} indicators={indicators ?? {
              symbol: decodedSymbol,
              rsi14: null, macdLine: null, macdSignal: null, macdHistogram: null, macdCross: "none",
              volumeRatio: null, maDeviation25: null, bbLower: null, bbMiddle: null, bbUpper: null, bbPosition: null
            }} />
            <div className="flex gap-4 text-xs text-slate-500 mt-2 justify-end">
              <span className="text-blue-400">── 終値</span>
              <span className="text-yellow-400">-- MA25</span>
              <span className="text-blue-400/40">▬ BB帯</span>
            </div>
          </>
        )}
      </div>

      {/* 出来高チャート */}
      {history.length > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-4">
          <h3 className="text-white font-semibold mb-3">出来高</h3>
          <VolumeChart history={history} />
        </div>
      )}

      {/* テクニカル指標チャート */}
      {history.length > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <h3 className="text-white font-semibold mb-3">テクニカル指標</h3>
          <IndicatorPanel history={history} />
        </div>
      )}
    </div>
  );
}
