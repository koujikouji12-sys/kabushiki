"use client";

import { useState, useMemo } from "react";
import type { FullStockData } from "@/lib/stock/types";
import { StockRow } from "./StockRow";
import { SortableHeader } from "@/components/ui/SortableHeader";

interface StockTableProps {
  stocks: FullStockData[];
}

type SortKey = "rank" | "price" | "changePercent" | "volume" | "rsi" | "deviation" | "score";

export function StockTable({ stocks }: StockTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");
  const [filter, setFilter] = useState("");

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setDirection((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key as SortKey);
      setDirection("desc");
    }
  };

  const sorted = useMemo(() => {
    let data = [...stocks];

    if (filter) {
      const f = filter.toLowerCase();
      data = data.filter(
        (s) =>
          s.quote.nameJa.includes(f) ||
          s.quote.code.includes(f) ||
          s.quote.sector.includes(f)
      );
    }

    data.sort((a, b) => {
      let aVal = 0;
      let bVal = 0;
      switch (sortKey) {
        case "price":
          aVal = a.quote.price; bVal = b.quote.price; break;
        case "changePercent":
          aVal = a.quote.changePercent; bVal = b.quote.changePercent; break;
        case "volume":
          aVal = a.quote.volume; bVal = b.quote.volume; break;
        case "rsi":
          aVal = a.indicators.rsi14 ?? -1; bVal = b.indicators.rsi14 ?? -1; break;
        case "deviation":
          aVal = a.indicators.maDeviation25 ?? -999; bVal = b.indicators.maDeviation25 ?? -999; break;
        case "score":
          aVal = a.score.totalScore; bVal = b.score.totalScore; break;
        default:
          return 0;
      }
      return direction === "desc" ? bVal - aVal : aVal - bVal;
    });

    return data;
  }, [stocks, sortKey, direction, filter]);

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="銘柄名・コード・セクターで検索..."
          className="w-full md:w-80 bg-slate-800 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/80">
            <tr>
              <SortableHeader label="#" sortKey="rank" currentSort={sortKey} direction={direction} onSort={handleSort} className="w-10" />
              <SortableHeader label="銘柄" sortKey="rank" currentSort={sortKey} direction={direction} onSort={handleSort} />
              <th className="px-3 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider hidden md:table-cell">セクター</th>
              <SortableHeader label="現在値" sortKey="price" currentSort={sortKey} direction={direction} onSort={handleSort} className="text-right" />
              <SortableHeader label="前日比" sortKey="changePercent" currentSort={sortKey} direction={direction} onSort={handleSort} className="text-right" />
              <SortableHeader label="出来高" sortKey="volume" currentSort={sortKey} direction={direction} onSort={handleSort} className="text-right hidden lg:table-cell" />
              <SortableHeader label="RSI" sortKey="rsi" currentSort={sortKey} direction={direction} onSort={handleSort} className="text-center hidden md:table-cell" />
              <th className="px-3 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider hidden lg:table-cell">MACD</th>
              <SortableHeader label="乖離率" sortKey="deviation" currentSort={sortKey} direction={direction} onSort={handleSort} className="text-center hidden lg:table-cell" />
              <SortableHeader label="スコア" sortKey="score" currentSort={sortKey} direction={direction} onSort={handleSort} className="text-center" />
            </tr>
          </thead>
          <tbody className="bg-slate-900">
            {sorted.map((stock, i) => (
              <StockRow key={stock.quote.symbol} data={stock} rank={i + 1} />
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            {filter ? "検索結果がありません" : "データなし"}
          </div>
        )}
      </div>
      <p className="text-slate-600 text-xs mt-2 text-right">{sorted.length} 銘柄表示中</p>
    </div>
  );
}
