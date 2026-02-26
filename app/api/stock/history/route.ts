import { NextRequest, NextResponse } from "next/server";
import { fetchHistory } from "@/lib/stock/yahoo-client";

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol");
  if (!symbol) {
    return NextResponse.json({ error: "symbol パラメータが必要です" }, { status: 400 });
  }

  const range = req.nextUrl.searchParams.get("range") ?? "3mo";
  const monthsMap: Record<string, number> = { "1mo": 1, "3mo": 3, "6mo": 6, "1y": 12 };
  const months = monthsMap[range] ?? 3;

  try {
    const bars = await fetchHistory(symbol, months);
    return NextResponse.json({ symbol, bars, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("History fetch error:", error);
    return NextResponse.json(
      { error: "履歴データの取得に失敗しました" },
      { status: 500 }
    );
  }
}
