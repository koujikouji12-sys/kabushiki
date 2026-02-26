import type { FullStockData } from "@/lib/stock/types";
import { ChangeIndicator } from "@/components/ui/ChangeIndicator";

interface MarketSummaryProps {
  allStocks: FullStockData[];
}

export function MarketSummary({ allStocks }: MarketSummaryProps) {
  if (allStocks.length === 0) return null;

  const quotes = allStocks.map((s) => s.quote);
  const rising = quotes.filter((q) => q.changePercent > 0).length;
  const falling = quotes.filter((q) => q.changePercent < 0).length;
  const flat = quotes.length - rising - falling;

  const avgChange = quotes.reduce((sum, q) => sum + q.changePercent, 0) / quotes.length;
  const maxRiser = quotes.reduce((best, q) => (q.changePercent > best.changePercent ? q : best));
  const maxFaller = quotes.reduce((worst, q) => (q.changePercent < worst.changePercent ? q : worst));

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <p className="text-slate-400 text-xs mb-1">市場概況</p>
        <div className="flex gap-3 text-sm font-semibold">
          <span className="text-green-400">{rising}↑</span>
          <span className="text-slate-400">{flat}→</span>
          <span className="text-red-400">{falling}↓</span>
        </div>
        <p className="text-slate-500 text-xs mt-1">全{quotes.length}銘柄</p>
      </div>

      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <p className="text-slate-400 text-xs mb-1">平均騰落率</p>
        <ChangeIndicator changePercent={avgChange} size="lg" />
      </div>

      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <p className="text-slate-400 text-xs mb-1">本日最高騰</p>
        <p className="text-white text-sm font-semibold truncate">{maxRiser.nameJa}</p>
        <ChangeIndicator changePercent={maxRiser.changePercent} size="sm" />
      </div>

      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <p className="text-slate-400 text-xs mb-1">本日最安</p>
        <p className="text-white text-sm font-semibold truncate">{maxFaller.nameJa}</p>
        <ChangeIndicator changePercent={maxFaller.changePercent} size="sm" />
      </div>
    </div>
  );
}
