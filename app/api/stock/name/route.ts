/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol");
  if (!symbol) {
    return NextResponse.json({ error: "symbol is required" }, { status: 400 });
  }
  try {
    const q: any = await yahooFinance.quote(symbol);
    if (!q) {
      return NextResponse.json({ error: "銘柄が見つかりません" }, { status: 404 });
    }
    const name = q.shortName || q.longName || null;
    return NextResponse.json({ symbol, name });
  } catch {
    return NextResponse.json({ error: "銘柄情報の取得に失敗しました" }, { status: 500 });
  }
}
