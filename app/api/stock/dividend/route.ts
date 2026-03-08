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
          const [q, summary]: [any, any] = await Promise.all([
            yahooFinance.quote(symbol),
            yahooFinance.quoteSummary(symbol, {
              modules: ["summaryDetail", "defaultKeyStatistics"],
            }).catch(() => null),
          ]);
          const sd: any = summary?.summaryDetail ?? {};
          const ks: any = summary?.defaultKeyStatistics ?? {};
          const price: number | null = q?.regularMarketPrice ?? null;

          // 配当利回りの計算（Yahoo Finance サイトと同じロジック）:
          // lastDividendValue / dividendRate の比率で支払い頻度を判定:
          //   ratio < 0.8 → 年2回払い: lastDividendValue × 2 / price（直近配当ベース、増配反映）
          //   ratio >= 0.8 → 年1回払い: dividendRate / price（Yahoo Finance の年間予測値）
          // フォールバック: summaryDetail.dividendYield → trailingAnnualDividendYield
          // ※ quote().dividendYield はパーセント単位のため使用しない
          let dividendYield: number | null = null;
          if (ks.lastDividendValue && price && price > 0) {
            const ratio = sd.dividendRate ? ks.lastDividendValue / sd.dividendRate : 0;
            if (ratio >= 0.8 && sd.dividendRate) {
              // 年1回払い（例: 竹内製作所）: dividendRate がそのまま年間配当
              dividendYield = sd.dividendRate / price;
            } else {
              // 年2回払い（日本株の標準）: 直近配当 × 2 で年間配当を推計
              dividendYield = (ks.lastDividendValue * 2) / price;
            }
          } else if (sd.dividendYield != null) {
            dividendYield = sd.dividendYield;
          } else if (q?.trailingAnnualDividendYield != null) {
            dividendYield = q.trailingAnnualDividendYield;
          }

          return {
            symbol,
            openPrice: q?.regularMarketOpen ?? null,
            highPrice: q?.regularMarketDayHigh ?? null,
            lowPrice: q?.regularMarketDayLow ?? null,
            closePrice: price,
            changePercent: q?.regularMarketChangePercent ?? null,
            changeAmount: q?.regularMarketChange ?? null,
            previousClose: q?.regularMarketPreviousClose ?? null,
            dividendYield,
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
            dividendYield: null,
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
