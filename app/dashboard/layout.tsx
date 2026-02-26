"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { FullStockData, RefreshResponse } from "@/lib/stock/types";
import { RefreshButton } from "@/components/stock/RefreshButton";

// StockContext
interface StockContextType {
  allStocks: FullStockData[];
  topRising: FullStockData[];
  loading: boolean;
  lastUpdated: string | null;
  refresh: () => Promise<void>;
}

const StockContext = createContext<StockContextType>({
  allStocks: [],
  topRising: [],
  loading: false,
  lastUpdated: null,
  refresh: async () => {},
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
  const [allStocks, setAllStocks] = useState<FullStockData[]>([]);
  const [topRising, setTopRising] = useState<FullStockData[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
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
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <StockContext.Provider value={{ allStocks, topRising, loading, lastUpdated, refresh }}>
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
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="text-slate-400 text-sm px-2 py-1 hover:text-white">
              ダッシュボード
            </Link>
            <Link href="/dashboard/list" className="text-slate-400 text-sm px-2 py-1 hover:text-white">
              一覧
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
