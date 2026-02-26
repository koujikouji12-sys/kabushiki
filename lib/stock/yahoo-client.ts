/* eslint-disable @typescript-eslint/no-explicit-any */
import YahooFinance from "yahoo-finance2";
const yahooFinance = new YahooFinance();
import { subMonths } from "date-fns";
import type { StockMeta, StockQuote, OHLCVBar } from "./types";

// バッチ処理（レート制限対策）
async function fetchInBatches<T>(
  items: string[],
  fetcher: (item: string) => Promise<T | null>,
  batchSize = 5,
  delayMs = 300
): Promise<(T | null)[]> {
  const results: (T | null)[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(batch.map(fetcher));
    results.push(
      ...batchResults.map((r) => (r.status === "fulfilled" ? r.value : null))
    );
    if (i + batchSize < items.length) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  return results;
}

// 単一銘柄の現在値取得
export async function fetchQuote(
  meta: StockMeta
): Promise<StockQuote | null> {
  try {
    const q: any = await yahooFinance.quote(meta.symbol);
    if (!q) return null;
    return {
      symbol: meta.symbol,
      code: meta.code,
      nameJa: meta.nameJa,
      sector: meta.sector,
      price: q.regularMarketPrice ?? 0,
      previousClose: q.regularMarketPreviousClose ?? 0,
      changeAmount: q.regularMarketChange ?? 0,
      changePercent: q.regularMarketChangePercent ?? 0,
      volume: q.regularMarketVolume ?? 0,
      marketCap: q.marketCap ?? undefined,
    };
  } catch {
    return null;
  }
}

// 全銘柄の現在値を一括取得
export async function fetchAllQuotes(
  stocks: StockMeta[]
): Promise<StockQuote[]> {
  const results = await fetchInBatches(
    stocks.map((s) => s.symbol),
    async (symbol) => {
      const meta = stocks.find((s) => s.symbol === symbol);
      if (!meta) return null;
      return fetchQuote(meta);
    }
  );
  return results.filter((r): r is StockQuote => r !== null);
}

// 単一銘柄の過去データ取得
export async function fetchHistory(
  symbol: string,
  months = 3
): Promise<OHLCVBar[]> {
  try {
    const period1 = subMonths(new Date(), months).toISOString().split("T")[0];
    const result: any = await yahooFinance.chart(symbol, {
      period1,
      interval: "1d",
    });
    const quotes: any[] = result?.quotes ?? [];
    console.log(`[history] ${symbol}: ${quotes.length}件`);
    return quotes
      .filter((d: any) => d.close != null && d.volume != null)
      .map((d: any) => ({
        date: new Date(d.date).toISOString().split("T")[0],
        open: d.open ?? d.close,
        high: d.high ?? d.close,
        low: d.low ?? d.close,
        close: d.close,
        volume: d.volume ?? 0,
      }));
  } catch (e) {
    console.error(`[history] ${symbol} エラー:`, String(e));
    return [];
  }
}

// 全銘柄の過去データを一括取得
export async function fetchAllHistories(
  symbols: string[],
  months = 3
): Promise<Map<string, OHLCVBar[]>> {
  const result = new Map<string, OHLCVBar[]>();
  const histories = await fetchInBatches(
    symbols,
    async (symbol) => ({ symbol, bars: await fetchHistory(symbol, months) })
  );
  for (const h of histories) {
    if (h) result.set(h.symbol, h.bars);
  }
  return result;
}
