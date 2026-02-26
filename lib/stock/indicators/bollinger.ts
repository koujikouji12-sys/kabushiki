// ボリンジャーバンド (25日, ±2σ) 計算
// 価格が-2σ下限バンド付近を最高スコアとする

export interface BollingerResult {
  upper: number;   // +2σ
  middle: number;  // 25日MA
  lower: number;   // -2σ
  position: number; // 0=下限バンド付近, 1=上限バンド付近
}

export function calculateBollinger(
  closes: number[],
  period = 25,
  multiplier = 2
): BollingerResult | null {
  if (closes.length < period) return null;

  const slice = closes.slice(-period);
  const mean = slice.reduce((a, b) => a + b, 0) / period;
  const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
  const stdDev = Math.sqrt(variance);

  const upper = mean + multiplier * stdDev;
  const lower = mean - multiplier * stdDev;
  const currentPrice = closes[closes.length - 1];

  const bandWidth = upper - lower;
  const position = bandWidth === 0 ? 0.5 : (currentPrice - lower) / bandWidth;

  return {
    upper,
    middle: mean,
    lower,
    position: Math.max(0, Math.min(1, position)),
  };
}

export function scoreBollinger(bb: BollingerResult | null): { score: number; reason: string } {
  if (!bb) return { score: 0, reason: "BBデータ不足" };

  const pos = Math.round(bb.position * 100);

  if (bb.position <= 0.05) {
    return { score: 20, reason: `BB下限タッチ（強い反発期待）` };
  }
  if (bb.position <= 0.15) {
    return { score: 17, reason: `BB下限バンド付近（反発期待高）` };
  }
  if (bb.position <= 0.25) {
    return { score: 12, reason: `BBバンド下方域（${pos}%位置）` };
  }
  if (bb.position <= 0.40) {
    return { score: 6, reason: `BBバンド下半分（${pos}%位置）` };
  }
  if (bb.position >= 0.85) {
    return { score: 0, reason: `BB上限バンド付近（売り圧力に注意）` };
  }
  return { score: 2, reason: `BBバンド中央域（${pos}%位置）` };
}
