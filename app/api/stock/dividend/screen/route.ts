import { NextResponse } from "next/server";
import { screenAllCandidates } from "@/lib/stock/dividend-screener";

export const maxDuration = 60;

export async function GET() {
  try {
    const results = await screenAllCandidates();
    return NextResponse.json({ results, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("Screening error:", error);
    return NextResponse.json(
      { error: "スクリーニングに失敗しました", detail: String(error) },
      { status: 500 }
    );
  }
}
