// MACD (12,26,9) 計算
// ゴールデンクロス（MACDがシグナル線を上抜け）を最高スコアとする

function ema(data: number[], period: number): number[] {
  if (data.length === 0) return [];
  const k = 2 / (period + 1);
  const result: number[] = [data[0]];
  for (let i = 1; i < data.length; i++) {
    result.push(data[i] * k + result[i - 1] * (1 - k));
  }
  return result;
}

export interface MACDResult {
  macdLine: number;
  signalLine: number;
  histogram: number;
  cross: "golden" | "dead" | "none";
}

export function calculateMACD(
  closes: number[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9
): MACDResult | null {
  if (closes.length < slowPeriod + signalPeriod + 2) return null;

  const emaFast = ema(closes, fastPeriod);
  const emaSlow = ema(closes, slowPeriod);

  // MACD ライン（slow EMA が始まる index から）
  const macdLine: number[] = [];
  for (let i = slowPeriod - 1; i < closes.length; i++) {
    macdLine.push(emaFast[i] - emaSlow[i]);
  }

  if (macdLine.length < signalPeriod + 2) return null;

  const signalArr = ema(macdLine, signalPeriod);

  const currentMACD = macdLine[macdLine.length - 1];
  const prevMACD = macdLine[macdLine.length - 2];
  const currentSignal = signalArr[signalArr.length - 1];
  const prevSignal = signalArr[signalArr.length - 2];

  let cross: "golden" | "dead" | "none" = "none";
  if (prevMACD <= prevSignal && currentMACD > currentSignal) cross = "golden";
  else if (prevMACD >= prevSignal && currentMACD < currentSignal) cross = "dead";

  return {
    macdLine: currentMACD,
    signalLine: currentSignal,
    histogram: currentMACD - currentSignal,
    cross,
  };
}

export function scoreMACD(result: MACDResult | null): { score: number; reason: string } {
  if (!result) return { score: 0, reason: "MACDデータ不足" };

  if (result.cross === "golden") {
    return { score: 20, reason: "MACDゴールデンクロス発生（強い買いシグナル）" };
  }
  if (result.macdLine > result.signalLine) {
    // ヒストグラムが拡大中かどうか
    const score = result.histogram > 0 ? 12 : 8;
    return { score, reason: "MACDシグナル線上位（上昇トレンド継続）" };
  }
  if (result.cross === "dead") {
    return { score: 0, reason: "MACDデッドクロス発生（下落シグナル）" };
  }
  return { score: 0, reason: "MACDシグナル線下位（下落トレンド）" };
}
