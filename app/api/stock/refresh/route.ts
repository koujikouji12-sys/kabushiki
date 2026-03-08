import { NextRequest, NextResponse } from "next/server";
import { NIKKEI225_STOCKS } from "@/lib/stock/nikkei225-list";
import { fetchAllQuotes, fetchAllHistories } from "@/lib/stock/yahoo-client";
import { computeIndicatorsAndScore } from "@/lib/stock/indicators/scorer";
import type { FullStockData } from "@/lib/stock/types";

export const maxDuration = 60; // 50銘柄/ページに最適化

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const page: number = body.page ?? 0;
  const pageSize: number = body.pageSize ?? 50;
  const offset = page * pageSize;
  const totalCount = NIKKEI225_STOCKS.length;
  const timestamp = new Date().toISOString();
  const errors: string[] = [];

  try {
    const pageStocks = NIKKEI225_STOCKS.slice(offset, offset + pageSize);
    if (pageStocks.length === 0) {
      return NextResponse.json({ stocks: [], topRising: [], page, pageSize, totalCount, isLast: true, timestamp, errors });
    }

    const pageSymbols = pageStocks.map((s) => s.symbol);

    // このページ分のクォートと過去データを並列取得
    const [quotes, histories] = await Promise.all([
      fetchAllQuotes(pageStocks),
      fetchAllHistories(pageSymbols, 3),
    ]);

    const stocks: FullStockData[] = [];
    for (const quote of quotes) {
      const bars = histories.get(quote.symbol) ?? [];
      if (bars.length < 35) {
        errors.push(`${quote.nameJa}: 履歴データ不足 (${bars.length}日分)`);
      }
      try {
        const { indicators, score } = computeIndicatorsAndScore(quote.symbol, bars);
        stocks.push({ quote, indicators, score, history: bars.slice(-60), lastUpdated: timestamp });
      } catch (e) {
        errors.push(`${quote.nameJa}: 指標計算エラー`);
        console.error(`Score error for ${quote.symbol}:`, e);
      }
    }

    const isLast = offset + pageSize >= totalCount;

    // 最初のページのみ topRising を計算（スコア上位10件）
    const topRising = page === 0 ? stocks.slice().sort((a, b) => b.score.totalScore - a.score.totalScore).slice(0, 10) : [];

    return NextResponse.json({ stocks, topRising, page, pageSize, totalCount, isLast, timestamp, errors });
  } catch (error) {
    console.error("Refresh error:", error);
    return NextResponse.json(
      { error: "データ更新に失敗しました", errors: [String(error)] },
      { status: 500 }
    );
  }
}
