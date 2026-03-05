/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";
import type { DividendQuote, DividendRefreshResponse } from "@/lib/stock/types";

const yahooFinance = new YahooFinance();

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbolsParam = searchParams.get("symbols");

  if (!symbolsParam) {
    return NextResponse.json({ error: "symbols パラメータが必要です" }, { status: 400 });
  }

  const symbols = symbolsParam.split(",").filter(Boolean);
  if (symbols.length === 0) {
    return NextResponse.json({ error: "有効なシンボルがありません" }, { status: 400 });
  }

  // バッチ処理（レート制限対策）
  const batchSize = 5;
  const delayMs = 300;
  const quotes: DividendQuote[] = [];

  for (let i = 0; i < symbols.length; i += batchSize) {
    const batch = symbols.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(
      batch.map(async (symbol): Promise<DividendQuote> => {
        try {
          const q: any = await yahooFinance.quote(symbol);
          return {
            symbol,
            openPrice: q?.regularMarketOpen ?? null,
            highPrice: q?.regularMarketDayHigh ?? null,
            lowPrice: q?.regularMarketDayLow ?? null,
            closePrice: q?.regularMarketPrice ?? null,
            changePercent: q?.regularMarketChangePercent ?? null,
            changeAmount: q?.regularMarketChange ?? null,
            previousClose: q?.regularMarketPreviousClose ?? null,
          };
        } catch {
          return {
            symbol,
            openPrice: null,
            highPrice: null,
            lowPrice: null,
            closePrice: null,
            changePercent: null,
            changeAmount: null,
            previousClose: null,
            error: true,
          };
        }
      })
    );

    for (const r of batchResults) {
      if (r.status === "fulfilled") {
        quotes.push(r.value);
      }
    }

    if (i + batchSize < symbols.length) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  const response: DividendRefreshResponse = {
    quotes,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response);
}
