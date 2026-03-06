import { NextResponse } from "next/server";
import { NIKKEI225_STOCKS } from "@/lib/stock/nikkei225-list";
import { fetchAllQuotes } from "@/lib/stock/yahoo-client";

export const maxDuration = 30;

// クォートのみ高速取得（ヒートマップ用）
export async function GET() {
  try {
    const quotes = await fetchAllQuotes(NIKKEI225_STOCKS);
    return NextResponse.json({ quotes, timestamp: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json(
      { error: "クォート取得に失敗しました", detail: String(error) },
      { status: 500 }
    );
  }
}
