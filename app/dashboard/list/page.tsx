"use client";

import { useStock } from "../layout";
import { StockTable } from "@/components/stock/StockTable";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const TOTAL_STOCKS = 225;

export default function ListPage() {
  const { allStocks, loading, allStocksLoading, allStocksProgress } = useStock();

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-white text-2xl font-bold">銘柄一覧</h2>
          <p className="text-slate-400 text-sm mt-1">
            日経225全銘柄 - テクニカルスコア一覧（クリックで個別分析）
          </p>
        </div>
        {/* Phase 2 進捗バッジ */}
        {allStocksLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-1.5">
            <span className="animate-spin inline-block w-3 h-3 border border-slate-400 border-t-transparent rounded-full" />
            <span>{allStocksProgress} / {TOTAL_STOCKS} 銘柄取得中...</span>
          </div>
        )}
        {!allStocksLoading && allStocks.length > 0 && (
          <div className="text-xs text-slate-500 bg-slate-800/40 border border-slate-700/50 rounded-lg px-3 py-1.5">
            {allStocks.length} 銘柄
          </div>
        )}
      </div>

      {/* Phase 1 ローディング（ヒートマップ取得中） */}
      {loading && (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" message="データ取得中..." />
        </div>
      )}

      {/* Phase 2 開始待ち（Phase 1 完了後、最初の50銘柄到着前） */}
      {!loading && allStocksLoading && allStocks.length === 0 && (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" message="指標データ取得中（最初の50銘柄）..." />
        </div>
      )}

      {/* データなし（更新ボタン待ち） */}
      {!loading && !allStocksLoading && allStocks.length === 0 && (
        <div className="bg-slate-800/50 border border-slate-700 border-dashed rounded-xl p-10 text-center">
          <p className="text-slate-400 text-sm">
            サイドバーの「データ更新」ボタンを押してデータを取得してください
          </p>
        </div>
      )}

      {/* テーブル（50銘柄ずつ順次表示） */}
      {allStocks.length > 0 && (
        <StockTable stocks={allStocks} />
      )}
    </div>
  );
}
