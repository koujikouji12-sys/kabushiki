"use client";

import { useStock } from "./layout";
import { TopRisingCard } from "@/components/stock/TopRisingCard";
import { MarketSummary } from "@/components/stock/MarketSummary";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function DashboardPage() {
  const { topRising, allStocks, loading } = useStock();

  return (
    <div>
      {/* ページヘッダー */}
      <div className="mb-6">
        <h2 className="text-white text-2xl font-bold">ダッシュボード</h2>
        <p className="text-slate-400 text-sm mt-1">
          5つのテクニカル指標による期待上昇銘柄スコアリング
        </p>
      </div>

      {/* 初回未取得の案内 */}
      {!loading && allStocks.length === 0 && (
        <div className="bg-slate-800/50 border border-slate-700 border-dashed rounded-xl p-10 text-center mb-6">
          <p className="text-5xl mb-4">📈</p>
          <p className="text-white text-lg font-semibold mb-2">データを取得してください</p>
          <p className="text-slate-400 text-sm mb-4">
            サイドバーの「データ更新」ボタンを押すと、Yahoo Finance から<br />
            日経225主要50銘柄のデータを取得・分析します。
          </p>
          <p className="text-slate-500 text-xs">
            ※ 初回取得は30〜60秒程度かかる場合があります
          </p>
        </div>
      )}

      {/* ローディング */}
      {loading && (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" message="Yahoo Finance からデータ取得中... (30〜60秒)" />
        </div>
      )}

      {/* 市場概況 */}
      {!loading && allStocks.length > 0 && (
        <MarketSummary allStocks={allStocks} />
      )}

      {/* 期待上昇銘柄 TOP10 */}
      {!loading && topRising.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-white text-lg font-bold">🚀 期待上昇銘柄 TOP10</h3>
            <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full border border-green-500/30">
              スコア上位
            </span>
          </div>

          {/* 指標説明 */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 mb-4">
            <p className="text-slate-400 text-xs font-medium mb-2">スコア算出基準（各20点 = 計100点満点）</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
              {[
                { name: "RSI(14)", desc: "30〜50: 回復局面" },
                { name: "MACD", desc: "ゴールデンクロス" },
                { name: "出来高", desc: "5日/20日比 ≥1.5x" },
                { name: "25日乖離率", desc: "-5〜0%: 押し目" },
                { name: "BB下限", desc: "-2σ付近: 反発期待" },
              ].map((item) => (
                <div key={item.name} className="bg-slate-800 rounded-lg px-3 py-2">
                  <p className="text-blue-400 font-medium">{item.name}</p>
                  <p className="text-slate-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {topRising.map((stock, i) => (
              <TopRisingCard key={stock.quote.symbol} data={stock} rank={i + 1} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
