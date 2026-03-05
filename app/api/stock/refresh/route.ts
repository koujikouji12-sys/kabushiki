import { NextResponse } from "next/server";
import { NIKKEI225_STOCKS } from "@/lib/stock/nikkei225-list";
import { fetchAllQuotes, fetchAllHistories } from "@/lib/stock/yahoo-client";
import { computeIndicatorsAndScore } from "@/lib/stock/indicators/scorer";
import type { FullStockData, RefreshResponse } from "@/lib/stock/types";

export const maxDuration = 60; // 60秒タイムアウト

export async function POST() {
  const errors: string[] = [];
  const timestamp = new Date().toISOString();

  try {
    // クオートと過去データを並列取得（大幅な高速化）
    const symbols = NIKKEI225_STOCKS.map((s) => s.symbol);
    const [quotes, histories] = await Promise.all([
      fetchAllQuotes(NIKKEI225_STOCKS),
      fetchAllHistories(symbols, 3),
    ]);

    // 各銘柄の指標計算＋スコアリング
    const allStocks: FullStockData[] = [];

    for (const quote of quotes) {
      const bars = histories.get(quote.symbol) ?? [];

      if (bars.length < 35) {
        errors.push(`${quote.nameJa}: 履歴データ不足 (${bars.length}日分)`);
      }

      try {
        const { indicators, score } = computeIndicatorsAndScore(quote.symbol, bars);
        allStocks.push({
          quote,
          indicators,
          score,
          history: bars.slice(-60), // チャート用に直近60日分
          lastUpdated: timestamp,
        });
      } catch (e) {
        errors.push(`${quote.nameJa}: 指標計算エラー`);
        console.error(`Score error for ${quote.symbol}:`, e);
      }
    }

    // スコア降順でソート
    allStocks.sort((a, b) => b.score.totalScore - a.score.totalScore);

    const topRising = allStocks.slice(0, 10);

    const response: RefreshResponse = {
      topRising,
      allStocks,
      timestamp,
      errors,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Refresh error:", error);
    return NextResponse.json(
      { error: "データ更新に失敗しました", errors: [String(error)] },
      { status: 500 }
    );
  }
}
