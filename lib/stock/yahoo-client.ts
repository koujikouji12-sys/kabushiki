/* eslint-disable @typescript-eslint/no-explicit-any */
import YahooFinance from "yahoo-finance2";
const yahooFinance = new YahooFinance();
import { subMonths } from "date-fns";
import type { StockMeta, StockQuote, OHLCVBar } from "./types";

// バッチ処理（レート制限対策）
async function fetchInBatches<T>(
  items: string[],
  fetcher: (item: string) => Promise<T | null>,
  batchSize = 15,
  delayMs = 100
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

// 単一銘柄の現在値取得（フォールバック用）
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

// 全銘柄の現在値を一括取得（1リクエストで全銘柄、失敗時は個別取得にフォールバック）
export async function fetchAllQuotes(
  stocks: StockMeta[]
): Promise<StockQuote[]> {
  const symbols = stocks.map((s) => s.symbol);

  try {
    // yahoo-finance2 は配列を渡すと一括取得できる（大幅に高速化）
    const results: any = await yahooFinance.quote(symbols);
    const arr: any[] = Array.isArray(results) ? results : [results];

    const quotes = arr
      .filter((q) => q != null && q.regularMarketPrice != null)
      .map((q) => {
        const meta = stocks.find((s) => s.symbol === q.symbol);
        if (!meta) return null;
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
        } as StockQuote;
      })
      .filter((q): q is StockQuote => q !== null);

    if (quotes.length > 0) {
      console.log(`[quotes] 一括取得成功: ${quotes.length}銘柄`);
      return quotes;
    }
    throw new Error("一括取得: 有効な結果なし");
  } catch (e) {
    console.warn("[quotes] 一括取得失敗、個別取得にフォールバック:", String(e));
    // フォールバック: 15件バッチ・100ms遅延で個別取得
    const fallback = await fetchInBatches(
      symbols,
      async (symbol) => {
        const meta = stocks.find((s) => s.symbol === symbol);
        return meta ? fetchQuote(meta) : null;
      },
      15,
      100
    );
    return fallback.filter((r): r is StockQuote => r !== null);
  }
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

// 全銘柄の過去データを高速一括取得（15件並列・100ms遅延）
export async function fetchAllHistories(
  symbols: string[],
  months = 3
): Promise<Map<string, OHLCVBar[]>> {
  const result = new Map<string, OHLCVBar[]>();
  const histories = await fetchInBatches(
    symbols,
    async (symbol) => ({ symbol, bars: await fetchHistory(symbol, months) }),
    15,
    100
  );
  for (const h of histories) {
    if (h) result.set(h.symbol, h.bars);
  }
  console.log(`[histories] 取得完了: ${result.size}銘柄`);
  return result;
}
