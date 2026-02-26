import { calculateRSI, scoreRSI } from "./rsi";
import { calculateMACD, scoreMACD } from "./macd";
import { calculateVolumeRatio, scoreVolume } from "./volume";
import { calculateMADeviation, scoreDeviation } from "./deviation";
import { calculateBollinger, scoreBollinger } from "./bollinger";
import type { OHLCVBar, TechnicalIndicators, StockScore } from "../types";

export function computeIndicatorsAndScore(
  symbol: string,
  bars: OHLCVBar[]
): { indicators: TechnicalIndicators; score: StockScore } {
  const closes = bars.map((b) => b.close);
  const volumes = bars.map((b) => b.volume);

  const rsi = calculateRSI(closes);
  const macd = calculateMACD(closes);
  const volumeRatio = calculateVolumeRatio(volumes);
  const deviation = calculateMADeviation(closes);
  const bb = calculateBollinger(closes);

  const rsiResult = scoreRSI(rsi);
  const macdResult = scoreMACD(macd);
  const volumeResult = scoreVolume(volumeRatio);
  const deviationResult = scoreDeviation(deviation);
  const bbResult = scoreBollinger(bb);

  const indicators: TechnicalIndicators = {
    symbol,
    rsi14: rsi,
    macdLine: macd?.macdLine ?? null,
    macdSignal: macd?.signalLine ?? null,
    macdHistogram: macd?.histogram ?? null,
    macdCross: macd?.cross ?? "none",
    volumeRatio,
    maDeviation25: deviation,
    bbLower: bb?.lower ?? null,
    bbMiddle: bb?.middle ?? null,
    bbUpper: bb?.upper ?? null,
    bbPosition: bb?.position ?? null,
  };

  const score: StockScore = {
    symbol,
    rsiScore: rsiResult.score,
    macdScore: macdResult.score,
    volumeScore: volumeResult.score,
    deviationScore: deviationResult.score,
    bbScore: bbResult.score,
    totalScore:
      rsiResult.score +
      macdResult.score +
      volumeResult.score +
      deviationResult.score +
      bbResult.score,
    reasons: [
      rsiResult.reason,
      macdResult.reason,
      volumeResult.reason,
      deviationResult.reason,
      bbResult.reason,
    ],
  };

  return { indicators, score };
}
