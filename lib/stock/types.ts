// 銘柄の静的メタデータ
export interface StockMeta {
  code: string;     // "7203"
  symbol: string;   // "7203.T"
  nameJa: string;   // "トヨタ自動車"
  sector: string;   // "輸送用機器"
}

// Yahoo Finance からの現在値
export interface StockQuote {
  symbol: string;
  code: string;
  nameJa: string;
  sector: string;
  price: number;
  previousClose: number;
  changeAmount: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
}

// 日次OHLCV バー
export interface OHLCVBar {
  date: string;   // "2024-01-15"
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// テクニカル指標の計算結果
export interface TechnicalIndicators {
  symbol: string;
  rsi14: number | null;
  macdLine: number | null;
  macdSignal: number | null;
  macdHistogram: number | null;
  macdCross: "golden" | "dead" | "none";
  volumeRatio: number | null;
  maDeviation25: number | null;
  bbLower: number | null;
  bbMiddle: number | null;
  bbUpper: number | null;
  bbPosition: number | null; // 0=下限バンド付近, 1=上限バンド付近
}

// スコアリング結果（各指標 0-20点 = 合計 0-100点）
export interface StockScore {
  symbol: string;
  rsiScore: number;
  macdScore: number;
  volumeScore: number;
  deviationScore: number;
  bbScore: number;
  totalScore: number;
  reasons: string[]; // 日本語の根拠説明
}

// 全データをまとめた型
export interface FullStockData {
  quote: StockQuote;
  indicators: TechnicalIndicators;
  score: StockScore;
  history: OHLCVBar[];
  lastUpdated: string; // ISO timestamp
}

// APIレスポンス型
export interface RefreshResponse {
  topRising: FullStockData[];   // スコア上位10銘柄
  allStocks: FullStockData[];   // 全50銘柄（スコア降順）
  timestamp: string;
  errors: string[];
}
