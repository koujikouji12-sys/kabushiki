// 25日移動平均乖離率 計算
// -5%〜0%の押し目ゾーンを最高スコアとする

export function calculateMADeviation(closes: number[], period = 25): number | null {
  if (closes.length < period) return null;

  const ma = closes.slice(-period).reduce((a, b) => a + b, 0) / period;
  const currentPrice = closes[closes.length - 1];

  if (ma === 0) return null;
  return ((currentPrice - ma) / ma) * 100;
}

export function scoreDeviation(deviation: number | null): { score: number; reason: string } {
  if (deviation === null) return { score: 0, reason: "乖離率データ不足" };

  const d = Math.round(deviation * 100) / 100;

  if (deviation >= -5 && deviation <= 0) {
    // -2.5% 付近を頂点として 20点
    const score = Math.round(20 * (1 - Math.abs(deviation - (-2.5)) / 2.5));
    return { score: Math.max(score, 5), reason: `25日MA乖離 ${d}%: 押し目買いゾーン` };
  }
  if (deviation > 0 && deviation <= 5) {
    return { score: 5, reason: `25日MA乖離 ${d}%: MA上位で安定` };
  }
  if (deviation > 5) {
    return { score: 0, reason: `25日MA乖離 ${d}%: 上昇乖離大（過熱気味）` };
  }
  if (deviation < -5 && deviation >= -10) {
    return { score: 3, reason: `25日MA乖離 ${d}%: 大きく下落（底打ち待ち）` };
  }
  return { score: 0, reason: `25日MA乖離 ${d}%: 急落（注意）` };
}
