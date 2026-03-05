"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { FullStockData, RefreshResponse, DividendQuote } from "@/lib/stock/types";
import type { StockMeta } from "@/lib/stock/types";
import { RefreshButton } from "@/components/stock/RefreshButton";
import { DEFAULT_DIVIDEND_STOCKS } from "@/lib/stock/dividend-stocks-list";

const DIVIDEND_STORAGE_KEY = "dividendWatchStocks";

// StockContext
interface StockContextType {
  // 日経225
  allStocks: FullStockData[];
  topRising: FullStockData[];
  loading: boolean;
  lastUpdated: string | null;
  refresh: () => Promise<void>;
  // 高配当株監視
  dividendStocks: StockMeta[];
  dividendQuotes: Map<string, DividendQuote>;
  dividendLoading: boolean;
  dividendLastUpdated: string | null;
  addDividendStock: (stock: StockMeta) => Promise<void>;
  removeDividendStock: (symbol: string) => void;
  resetDividendStocks: () => void;
}

const StockContext = createContext<StockContextType>({
  allStocks: [],
  topRising: [],
  loading: false,
  lastUpdated: null,
  refresh: async () => {},
  dividendStocks: DEFAULT_DIVIDEND_STOCKS,
  dividendQuotes: new Map(),
  dividendLoading: false,
  dividendLastUpdated: null,
  addDividendStock: async () => {},
  removeDividendStock: () => {},
  resetDividendStocks: () => {},
});

export const useStock = () => useContext(StockContext);

function NavLink({ href, label, icon }: { href: string; label: string; icon: string }) {
  const pathname = usePathname();
  const isActive = href === "/dashboard"
    ? pathname === "/dashboard"
    : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
          : "text-slate-400 hover:text-white hover:bg-slate-800"
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // 日経225 state
  const [allStocks, setAllStocks] = useState<FullStockData[]>([]);
  const [topRising, setTopRising] = useState<FullStockData[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 高配当株 state
  const [dividendStocks, setDividendStocksState] = useState<StockMeta[]>(DEFAULT_DIVIDEND_STOCKS);
  const [dividendQuotes, setDividendQuotes] = useState<Map<string, DividendQuote>>(new Map());
  const [dividendLoading, setDividendLoading] = useState(false);
  const [dividendLastUpdated, setDividendLastUpdated] = useState<string | null>(null);

  // コールバック内で最新の銘柄リストを参照するためのref
  const dividendStocksRef = useRef<StockMeta[]>(DEFAULT_DIVIDEND_STOCKS);

  // refとstateを同期
  useEffect(() => {
    dividendStocksRef.current = dividendStocks;
  }, [dividendStocks]);

  // localStorage に保存するヘルパー
  const saveDividendStocks = (stocks: StockMeta[]) => {
    localStorage.setItem(DIVIDEND_STORAGE_KEY, JSON.stringify(stocks));
  };

  // 高配当株データを取得（現在のrefの銘柄リストを使用）
  const fetchDividendQuotes = useCallback(async (stocks: StockMeta[]) => {
    if (stocks.length === 0) return;
    setDividendLoading(true);
    try {
      const symbols = stocks.map((s) => s.symbol).join(",");
      const res = await fetch(`/api/stock/dividend?symbols=${encodeURIComponent(symbols)}`);
      const data = await res.json();
      if (res.ok) {
        const newQuotes = new Map<string, DividendQuote>();
        for (const q of data.quotes as DividendQuote[]) {
          newQuotes.set(q.symbol, q);
        }
        setDividendQuotes(newQuotes);
        setDividendLastUpdated(data.timestamp);
      }
    } catch (e) {
      console.error("高配当株データ取得エラー:", e);
    } finally {
      setDividendLoading(false);
    }
  }, []);

  // 日経225 ＋ 高配当株を同時取得
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    // 日経225 と 高配当株を並列取得
    const nikkeiPromise = (async () => {
      try {
        const res = await fetch("/api/stock/refresh", { method: "POST" });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "データ取得に失敗しました");
          return;
        }
        const typed = data as RefreshResponse;
        setAllStocks(typed.allStocks);
        setTopRising(typed.topRising);
        setLastUpdated(typed.timestamp);
        if (typed.errors?.length) {
          console.warn("一部エラー:", typed.errors);
        }
      } catch (e) {
        setError("通信エラー: " + String(e));
        console.error("Refresh failed:", e);
      }
    })();

    const dividendPromise = fetchDividendQuotes(dividendStocksRef.current);

    await Promise.all([nikkeiPromise, dividendPromise]);
    setLoading(false);
  }, [fetchDividendQuotes]);

  // 銘柄を追加して、その銘柄のデータだけを取得
  const addDividendStock = useCallback(async (stock: StockMeta) => {
    const newStocks = [...dividendStocksRef.current, stock];
    dividendStocksRef.current = newStocks;
    setDividendStocksState(newStocks);
    saveDividendStocks(newStocks);

    // 追加した銘柄のデータだけ取得してマージ
    try {
      const res = await fetch(
        `/api/stock/dividend?symbols=${encodeURIComponent(stock.symbol)}`
      );
      const data = await res.json();
      if (res.ok && data.quotes?.length > 0) {
        setDividendQuotes((prev) => {
          const next = new Map(prev);
          next.set(stock.symbol, data.quotes[0] as DividendQuote);
          return next;
        });
      }
    } catch (e) {
      console.error("追加銘柄データ取得エラー:", e);
    }
  }, []);

  const removeDividendStock = useCallback((symbol: string) => {
    const newStocks = dividendStocksRef.current.filter((s) => s.symbol !== symbol);
    dividendStocksRef.current = newStocks;
    setDividendStocksState(newStocks);
    saveDividendStocks(newStocks);
    setDividendQuotes((prev) => {
      const next = new Map(prev);
      next.delete(symbol);
      return next;
    });
  }, []);

  const resetDividendStocks = useCallback(() => {
    dividendStocksRef.current = DEFAULT_DIVIDEND_STOCKS;
    setDividendStocksState(DEFAULT_DIVIDEND_STOCKS);
    saveDividendStocks(DEFAULT_DIVIDEND_STOCKS);
    setDividendQuotes(new Map());
  }, []);

  // マウント時に localStorage を読み込んで自動取得
  useEffect(() => {
    // localStorage から銘柄リストを復元
    let stocksToUse = DEFAULT_DIVIDEND_STOCKS;
    try {
      const saved = localStorage.getItem(DIVIDEND_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as StockMeta[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          stocksToUse = parsed;
          setDividendStocksState(parsed);
          dividendStocksRef.current = parsed;
        }
      }
    } catch {
      // 読み込み失敗時はデフォルトを使用
    }

    // 日経225 と 高配当株を並列で自動取得
    const autoFetch = async () => {
      setLoading(true);
      setError(null);

      const nikkeiPromise = (async () => {
        try {
          const res = await fetch("/api/stock/refresh", { method: "POST" });
          const data = await res.json();
          if (!res.ok) {
            setError(data.error ?? "データ取得に失敗しました");
            return;
          }
          const typed = data as RefreshResponse;
          setAllStocks(typed.allStocks);
          setTopRising(typed.topRising);
          setLastUpdated(typed.timestamp);
        } catch (e) {
          setError("通信エラー: " + String(e));
        }
      })();

      const dividendPromise = fetchDividendQuotes(stocksToUse);

      await Promise.all([nikkeiPromise, dividendPromise]);
      setLoading(false);
    };

    autoFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <StockContext.Provider
      value={{
        allStocks,
        topRising,
        loading,
        lastUpdated,
        refresh,
        dividendStocks,
        dividendQuotes,
        dividendLoading,
        dividendLastUpdated,
        addDividendStock,
        removeDividendStock,
        resetDividendStocks,
      }}
    >
      <div className="min-h-screen bg-slate-950 flex">
        {/* サイドバー */}
        <aside className="hidden md:flex flex-col w-56 bg-slate-900 border-r border-slate-800 p-4 fixed h-full">
          <div className="mb-6">
            <h1 className="text-white font-bold text-lg">📊 株式分析</h1>
            <p className="text-slate-500 text-xs mt-1">日経225 主要50銘柄</p>
          </div>

          <nav className="space-y-1 flex-1">
            <NavLink href="/dashboard" label="ダッシュボード" icon="🏠" />
            <NavLink href="/dashboard/list" label="銘柄一覧" icon="📋" />
            <NavLink href="/dashboard/heatmap" label="ヒートマップ" icon="🌡️" />
            <NavLink href="/dashboard/dividends" label="高配当株監視" icon="💰" />
          </nav>

          <div className="mt-auto pt-4 border-t border-slate-800">
            <RefreshButton onRefresh={refresh} loading={loading} lastUpdated={lastUpdated} />
            {error && (
              <p className="text-red-400 text-xs mt-2 break-words">{error}</p>
            )}
          </div>
        </aside>

        {/* モバイルヘッダー */}
        <header className="md:hidden fixed top-0 left-0 right-0 z-10 bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
          <h1 className="text-white font-bold">📊 株式分析</h1>
          <div className="flex items-center gap-1 overflow-x-auto">
            <Link href="/dashboard" className="text-slate-400 text-xs px-2 py-1 hover:text-white whitespace-nowrap">
              ダッシュボード
            </Link>
            <Link href="/dashboard/list" className="text-slate-400 text-xs px-2 py-1 hover:text-white whitespace-nowrap">
              銘柄一覧
            </Link>
            <Link href="/dashboard/heatmap" className="text-slate-400 text-xs px-2 py-1 hover:text-white whitespace-nowrap">
              🌡️ MAP
            </Link>
            <Link href="/dashboard/dividends" className="text-slate-400 text-xs px-2 py-1 hover:text-white whitespace-nowrap">
              💰 高配当
            </Link>
            <button
              onClick={refresh}
              disabled={loading}
              className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg disabled:opacity-50"
            >
              {loading ? "取得中..." : "更新"}
            </button>
          </div>
        </header>

        {/* メインコンテンツ */}
        <main className="flex-1 md:ml-56 pt-14 md:pt-0 min-h-screen">
          <div className="p-4 md:p-6 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </StockContext.Provider>
  );
}
