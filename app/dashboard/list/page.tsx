"use client";

import { useStock } from "../layout";
import { StockTable } from "@/components/stock/StockTable";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function ListPage() {
  const { allStocks, loading } = useStock();

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-white text-2xl font-bold">銘柄一覧</h2>
        <p className="text-slate-400 text-sm mt-1">
          日経225主要50銘柄 - テクニカルスコア一覧（クリックで個別分析）
        </p>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" message="データ取得中..." />
        </div>
      )}

      {!loading && allStocks.length === 0 && (
        <div className="bg-slate-800/50 border border-slate-700 border-dashed rounded-xl p-10 text-center">
          <p className="text-slate-400 text-sm">
            サイドバーの「データ更新」ボタンを押してデータを取得してください
          </p>
        </div>
      )}

      {!loading && allStocks.length > 0 && (
        <StockTable stocks={allStocks} />
      )}
    </div>
  );
}
