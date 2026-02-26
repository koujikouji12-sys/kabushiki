// RSI (Relative Strength Index) 計算
// 30〜50の範囲を「売られ過ぎからの回復局面」として高スコアを付与

export function calculateRSI(closes: number[], period = 14): number | null {
  if (closes.length < period + 1) return null;

  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 1; i <= period; i++) {
    const change = closes[i] - closes[i - 1];
    if (change > 0) avgGain += change;
    else avgLoss += Math.abs(change);
  }
  avgGain /= period;
  avgLoss /= period;

  for (let i = period + 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

export function scoreRSI(rsi: number | null): { score: number; reason: string } {
  if (rsi === null) return { score: 0, reason: "RSIデータ不足" };

  const r = Math.round(rsi * 10) / 10;

  if (rsi >= 30 && rsi <= 50) {
    // RSI=40 を中心に 20点満点
    const score = Math.round(20 * (1 - Math.abs(rsi - 40) / 10));
    return { score: Math.max(score, 5), reason: `RSI ${r}: 売られ過ぎからの回復局面` };
  }
  if (rsi < 30) {
    return { score: 8, reason: `RSI ${r}: 売られ過ぎ圏（反発待ち）` };
  }
  if (rsi > 50 && rsi < 70) {
    return { score: 3, reason: `RSI ${r}: 買われ過ぎに向かう途中` };
  }
  return { score: 0, reason: `RSI ${r}: 買われ過ぎ圏` };
}
