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
          //
          // 優先ロジック（lastDividendValue がある場合）:
          //   ratio = lastDiv / dividendRate
          //   1. ratio >= 0.8 → 年1回払い（竹内製作所など）: dividendRate / price
          //   2. lastDiv×2 > dividendRate×1.15（15%以上乖離）
          //      → dividendRate が古く増配を反映していない: lastDiv × 2 / price
          //      （例: MS&AD dividendRate=120 が古い、lastDiv×2=155 が正しい）
          //   3. それ以外 → dividendRate / price（YF の forward estimate が正確）
          //      （例: 三井トラスト dividendRate=170 が正確、lastDiv×2=180 は若干過大）
          //
          // フォールバック: summaryDetail.dividendYield → trailingAnnualDividendYield
          // ※ quote().dividendYield はパーセント単位のため使用しない
          let dividendYield: number | null = null;
          if (ks.lastDividendValue && price && price > 0) {
            const ratio = sd.dividendRate ? ks.lastDividendValue / sd.dividendRate : 0;
            const annualEst = ks.lastDividendValue * 2;
            if (ratio >= 0.8 && sd.dividendRate) {
              // 年1回払い: dividendRate がそのまま年間配当
              dividendYield = sd.dividendRate / price;
            } else if (sd.dividendRate && annualEst > sd.dividendRate * 1.15) {
              // dividendRate が増配前の古い値: 直近配当 × 2 を使用
              dividendYield = annualEst / price;
            } else if (sd.dividendRate) {
              // dividendRate が最新の forward estimate として信頼できる
              dividendYield = sd.dividendRate / price;
            } else {
              // dividendRate がない場合: 直近配当 × 2 で推計
              dividendYield = annualEst / price;
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
