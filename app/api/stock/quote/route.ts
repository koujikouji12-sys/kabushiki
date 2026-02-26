import { NextRequest, NextResponse } from "next/server";
import { NIKKEI225_STOCKS } from "@/lib/stock/nikkei225-list";
import { fetchAllQuotes } from "@/lib/stock/yahoo-client";

export async function GET(_req: NextRequest) {
  try {
    const quotes = await fetchAllQuotes(NIKKEI225_STOCKS);
    return NextResponse.json({
      quotes,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Quote fetch error:", error);
    return NextResponse.json(
      { error: "株価データの取得に失敗しました" },
      { status: 500 }
    );
  }
}
