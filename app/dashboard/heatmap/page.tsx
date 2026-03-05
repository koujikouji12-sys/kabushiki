"use client";

import { useStock } from "../layout";
import { HeatmapChart } from "@/components/stock/HeatmapChart";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const LEGEND_ITEMS = [
  { color: "#7f1d1d", label: "-3%以下" },
  { color: "#b91c1c", label: "-2〜-3%" },
  { color: "#dc2626", label: "-1〜-2%" },
  { color: "#ef4444", label: "0〜-1%" },
  { color: "#374151", label: "±0%" },
  { color: "#4ade80", label: "0〜+1%" },
  { color: "#22c55e", label: "+1〜+2%" },
  { color: "#16a34a", label: "+2〜+3%" },
  { color: "#14532d", label: "+3%以上" },
];

export default function HeatmapPage() {
  const { allStocks, loading } = useStock();

  const rising = allStocks.filter((s) => s.quote.changePercent > 0).length;
  const falling = allStocks.filter((s) => s.quote.changePercent < 0).length;
  const flat = allStocks.length - rising - falling;

  return (
    <div>
      {/* ページヘッダー */}
      <div className="mb-6">
        <h2 className="text-white text-2xl font-bold">日経225 ヒートマップ</h2>
        <p className="text-slate-400 text-sm mt-1">
          業種別に分類・時価総額を面積・当日騰落率を色で表示（緑＝上昇、赤＝下落）
        </p>
      </div>

      {/* データなし */}
      {!loading && allStocks.length === 0 && (
        <div className="bg-slate-800/50 border border-slate-700 border-dashed rounded-xl p-10 text-center">
          <p className="text-5xl mb-4">🌡️</p>
          <p className="text-white text-lg font-semibold mb-2">データを取得してください</p>
          <p className="text-slate-400 text-sm">
            サイドバーの「データ更新」ボタンを押すと、ヒートマップが表示されます。
          </p>
        </div>
      )}

      {/* ローディング */}
      {loading && (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" message="データ取得中..." />
        </div>
      )}

      {/* ヒートマップ本体 */}
      {!loading && allStocks.length > 0 && (
        <div className="space-y-4">
          {/* 騰落サマリー */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-green-400 font-medium">上昇 {rising}銘柄</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-red-400 font-medium">下落 {falling}銘柄</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-500" />
              <span className="text-slate-400 font-medium">横ばい {flat}銘柄</span>
            </div>
          </div>

          {/* カラーレジェンド */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-slate-500 text-xs">騰落率：</span>
            {LEGEND_ITEMS.map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div
                  className="w-3.5 h-3.5 rounded"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-400 text-xs">{item.label}</span>
              </div>
            ))}
          </div>

          {/* ヒートマップ（業種別タイル） */}
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
            <HeatmapChart stocks={allStocks} />
          </div>

          <p className="text-slate-600 text-xs text-right">
            ※ タイルの大きさは業種内の時価総額に比例　タイルにカーソルを当てると詳細を表示
          </p>
        </div>
      )}
    </div>
  );
}
