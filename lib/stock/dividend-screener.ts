/* eslint-disable @typescript-eslint/no-explicit-any */
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

export interface ScreenCandidate {
  code: string;
  symbol: string;
  nameJa: string;
  sector: string;
}

export interface ScreenMetrics {
  dividendYield: number | null;   // 配当利回り (小数: 0.04 = 4%)
  pbr: number | null;             // PBR
  payoutRatio: number | null;     // 配当性向 (小数)
  operatingMargin: number | null; // 営業利益率 (小数)
  currentRatio: number | null;    // 流動比率 (倍: 2.0 = 200%)
  equityRatio: number | null;     // 自己資本比率 (小数)
  cashRatio: number | null;       // 現金比率 (小数)
  revenueGrowth: number | null;   // 売上成長率 (小数)
}

export interface CriteriaResult {
  dividendYield: boolean | null;   // 1. 3%以上（必須条件）
  pbr: boolean | null;             // 2. PBR 0.5〜1.5
  payoutRatio: boolean | null;     // 3/4. 配当性向80%未満
  operatingMargin: boolean | null; // 6. 営業利益率10%以上
  equityRatio: boolean | null;     // 8. 自己資本比率50%以上
  currentRatio: boolean | null;    // 9. 流動比率200%以上
  cashRatio: boolean | null;       // 10. 現金比率10%以上
}

export interface ScreenResult {
  candidate: ScreenCandidate;
  metrics: ScreenMetrics;
  criteria: CriteriaResult;
  metCount: number; // 満たした条件数
}

// スクリーニング対象の候補銘柄リスト（高配当期待銘柄）
export const SCREEN_CANDIDATES: ScreenCandidate[] = [
  // 銀行業
  { code: "8306", symbol: "8306.T", nameJa: "三菱UFJフィナンシャル・グループ", sector: "銀行業" },
  { code: "8316", symbol: "8316.T", nameJa: "三井住友フィナンシャルグループ", sector: "銀行業" },
  { code: "8411", symbol: "8411.T", nameJa: "みずほフィナンシャルグループ", sector: "銀行業" },
  { code: "8309", symbol: "8309.T", nameJa: "三井住友トラストグループ", sector: "銀行業" },
  { code: "7186", symbol: "7186.T", nameJa: "コンコルディア・フィナンシャルグループ", sector: "銀行業" },
  { code: "8354", symbol: "8354.T", nameJa: "ふくおかフィナンシャルグループ", sector: "銀行業" },
  { code: "8377", symbol: "8377.T", nameJa: "ほくほくフィナンシャルグループ", sector: "銀行業" },
  // 保険業
  { code: "8725", symbol: "8725.T", nameJa: "MS&ADインシュアランスグループHD", sector: "保険業" },
  { code: "8766", symbol: "8766.T", nameJa: "東京海上ホールディングス", sector: "保険業" },
  { code: "8630", symbol: "8630.T", nameJa: "SOMPOホールディングス", sector: "保険業" },
  // 卸売業（商社）
  { code: "8058", symbol: "8058.T", nameJa: "三菱商事", sector: "卸売業" },
  { code: "8031", symbol: "8031.T", nameJa: "三井物産", sector: "卸売業" },
  { code: "8001", symbol: "8001.T", nameJa: "伊藤忠商事", sector: "卸売業" },
  { code: "8002", symbol: "8002.T", nameJa: "丸紅", sector: "卸売業" },
  { code: "8053", symbol: "8053.T", nameJa: "住友商事", sector: "卸売業" },
  { code: "8130", symbol: "8130.T", nameJa: "サンゲツ", sector: "卸売業" },
  // 情報・通信
  { code: "9432", symbol: "9432.T", nameJa: "日本電信電話(NTT)", sector: "情報・通信" },
  { code: "9433", symbol: "9433.T", nameJa: "KDDI", sector: "情報・通信" },
  { code: "9434", symbol: "9434.T", nameJa: "ソフトバンク", sector: "情報・通信" },
  { code: "3076", symbol: "3076.T", nameJa: "あいホールディングス", sector: "情報・通信" },
  { code: "4832", symbol: "4832.T", nameJa: "JFEシステムズ", sector: "情報・通信" },
  // 不動産業
  { code: "3003", symbol: "3003.T", nameJa: "ヒューリック", sector: "不動産業" },
  { code: "3231", symbol: "3231.T", nameJa: "野村不動産ホールディングス", sector: "不動産業" },
  { code: "8802", symbol: "8802.T", nameJa: "三菱地所", sector: "不動産業" },
  // その他金融業
  { code: "8591", symbol: "8591.T", nameJa: "オリックス", sector: "その他金融業" },
  { code: "8593", symbol: "8593.T", nameJa: "三菱HCキャピタル", sector: "その他金融業" },
  { code: "8584", symbol: "8584.T", nameJa: "ジャックス", sector: "その他金融業" },
  // 石油・石炭製品
  { code: "5020", symbol: "5020.T", nameJa: "ENEOSホールディングス", sector: "石油・石炭製品" },
  // 輸送用機器
  { code: "7203", symbol: "7203.T", nameJa: "トヨタ自動車", sector: "輸送用機器" },
  { code: "7270", symbol: "7270.T", nameJa: "SUBARU", sector: "輸送用機器" },
  { code: "7261", symbol: "7261.T", nameJa: "マツダ", sector: "輸送用機器" },
  // 機械
  { code: "6301", symbol: "6301.T", nameJa: "小松製作所(コマツ)", sector: "機械" },
  { code: "6326", symbol: "6326.T", nameJa: "クボタ", sector: "機械" },
  { code: "6432", symbol: "6432.T", nameJa: "竹内製作所", sector: "機械" },
  { code: "6345", symbol: "6345.T", nameJa: "アイチコーポレーション", sector: "機械" },
  // 化学
  { code: "4042", symbol: "4042.T", nameJa: "東ソー", sector: "化学" },
  { code: "4097", symbol: "4097.T", nameJa: "高圧ガス工業", sector: "化学" },
  { code: "4248", symbol: "4248.T", nameJa: "竹本容器", sector: "化学" },
  { code: "4188", symbol: "4188.T", nameJa: "三菱ケミカルグループ", sector: "化学" },
  { code: "4008", symbol: "4008.T", nameJa: "住友精化", sector: "化学" },
  // 鉄鋼
  { code: "5401", symbol: "5401.T", nameJa: "日本製鉄", sector: "鉄鋼" },
  { code: "5411", symbol: "5411.T", nameJa: "JFEホールディングス", sector: "鉄鋼" },
  // 食料品
  { code: "2296", symbol: "2296.T", nameJa: "伊藤ハム米久ホールディングス", sector: "食料品" },
  { code: "2502", symbol: "2502.T", nameJa: "アサヒグループホールディングス", sector: "食料品" },
  { code: "2503", symbol: "2503.T", nameJa: "キリンホールディングス", sector: "食料品" },
  // 医薬品
  { code: "4540", symbol: "4540.T", nameJa: "ツムラ", sector: "医薬品" },
  { code: "4502", symbol: "4502.T", nameJa: "武田薬品工業", sector: "医薬品" },
  // 陸運業
  { code: "9020", symbol: "9020.T", nameJa: "東日本旅客鉄道(JR東日本)", sector: "陸運業" },
  { code: "9022", symbol: "9022.T", nameJa: "東海旅客鉄道(JR東海)", sector: "陸運業" },
  { code: "9075", symbol: "9075.T", nameJa: "福山通運", sector: "陸運業" },
  // 海運業
  { code: "9101", symbol: "9101.T", nameJa: "日本郵船", sector: "海運業" },
  { code: "9104", symbol: "9104.T", nameJa: "商船三井", sector: "海運業" },
  { code: "9107", symbol: "9107.T", nameJa: "川崎汽船", sector: "海運業" },
  // 倉庫・運輸関連業
  { code: "9303", symbol: "9303.T", nameJa: "住友倉庫", sector: "倉庫・運輸関連業" },
  // 電気機器
  { code: "6971", symbol: "6971.T", nameJa: "京セラ", sector: "電気機器" },
  { code: "6501", symbol: "6501.T", nameJa: "日立製作所", sector: "電気機器" },
  // 建設業
  { code: "1803", symbol: "1803.T", nameJa: "清水建設", sector: "建設業" },
  { code: "1812", symbol: "1812.T", nameJa: "鹿島建設", sector: "建設業" },
  // サービス業
  { code: "9795", symbol: "9795.T", nameJa: "ステップ", sector: "サービス業" },
  { code: "6073", symbol: "6073.T", nameJa: "アサンテ", sector: "サービス業" },
  // 小売業
  { code: "8173", symbol: "8173.T", nameJa: "上新電機", sector: "小売業" },
  // その他製品
  { code: "7994", symbol: "7994.T", nameJa: "オカムラ", sector: "その他製品" },
  // ガラス・土石製品
  { code: "5388", symbol: "5388.T", nameJa: "クニミネ工業", sector: "ガラス・土石製品" },
];

async function screenOneStock(candidate: ScreenCandidate): Promise<ScreenResult | null> {
  try {
    const data: any = await yahooFinance.quoteSummary(candidate.symbol, {
      modules: [
        "summaryDetail",
        "defaultKeyStatistics",
        "financialData",
        "balanceSheetHistory",
        "balanceSheetHistoryQuarterly",
      ],
    });

    const sd: any = data?.summaryDetail ?? {};
    const ks: any = data?.defaultKeyStatistics ?? {};
    const fd: any = data?.financialData ?? {};

    // 年次・四半期の両方を試してデータがある方を使う
    const bsAnnual: any =
      data?.balanceSheetHistory?.balanceSheetStatements?.[0] ?? {};
    const bsQuarterly: any =
      data?.balanceSheetHistoryQuarterly?.balanceSheetStatements?.[0] ?? {};
    // より情報が多い方を使う（totalAssetsがあれば優先）
    const bs: any =
      bsAnnual.totalAssets != null ? bsAnnual : bsQuarterly;

    // 配当利回りの計算（route.ts と同じロジック）:
    //   ratio >= 0.8 → 年1回払い: dividendRate / price
    //   lastDiv×2 > dividendRate×1.15 → dividendRate が古い: lastDiv×2 / price
    //   それ以外 → dividendRate / price（YF の forward estimate が正確）
    const currentPrice: number | null = fd.currentPrice ?? null;
    const dividendYield: number | null = (() => {
      if (ks.lastDividendValue && currentPrice && currentPrice > 0) {
        const ratio = sd.dividendRate ? ks.lastDividendValue / sd.dividendRate : 0;
        const annualEst = ks.lastDividendValue * 2;
        if (ratio >= 0.8 && sd.dividendRate) {
          return sd.dividendRate / currentPrice;
        } else if (sd.dividendRate && annualEst > sd.dividendRate * 1.15) {
          return annualEst / currentPrice;
        } else if (sd.dividendRate) {
          return sd.dividendRate / currentPrice;
        } else {
          return annualEst / currentPrice;
        }
      }
      return sd.dividendYield ?? sd.trailingAnnualDividendYield ?? null;
    })();
    const pbr: number | null = ks.priceToBook ?? null;
    const payoutRatio: number | null = sd.payoutRatio ?? null;
    const operatingMargin: number | null = fd.operatingMargins ?? null;
    const currentRatio: number | null = fd.currentRatio ?? null;
    const revenueGrowth: number | null = fd.revenueGrowth ?? null;

    // 自己資本比率 = stockholdersEquity / totalAssets
    const totalAssets: number | null =
      bs.totalAssets ?? null;
    const stockholdersEquity: number | null =
      bs.totalStockholderEquity ?? bs.stockholdersEquity ?? null;
    // 現金（フィールド名のバリエーションに対応）
    const cashRaw: number | null =
      bs.cash ??
      bs.cashAndCashEquivalents ??
      bs.cashAndShortTermInvestments ??
      fd.totalCash ??
      null;

    const equityRatio: number | null =
      totalAssets && stockholdersEquity && totalAssets > 0
        ? stockholdersEquity / totalAssets
        : null;
    const cashRatio: number | null =
      totalAssets && cashRaw && totalAssets > 0
        ? cashRaw / totalAssets
        : null;

    const metrics: ScreenMetrics = {
      dividendYield,
      pbr,
      payoutRatio,
      operatingMargin,
      currentRatio,
      equityRatio,
      cashRatio,
      revenueGrowth,
    };

    const criteria: CriteriaResult = {
      dividendYield: dividendYield !== null ? dividendYield >= 0.03 : null,
      pbr: pbr !== null ? pbr >= 0.5 && pbr <= 1.5 : null,
      payoutRatio: payoutRatio !== null ? payoutRatio < 0.8 : null,
      operatingMargin: operatingMargin !== null ? operatingMargin >= 0.10 : null,
      equityRatio: equityRatio !== null ? equityRatio >= 0.5 : null,
      currentRatio: currentRatio !== null ? currentRatio >= 2.0 : null,
      cashRatio: cashRatio !== null ? cashRatio >= 0.10 : null,
    };

    const metCount = Object.values(criteria).filter(v => v === true).length;
    return { candidate, metrics, criteria, metCount };
  } catch (e) {
    console.error(`[screener] ${candidate.symbol} エラー:`, String(e));
    return null;
  }
}

export async function screenAllCandidates(): Promise<ScreenResult[]> {
  const results: ScreenResult[] = [];

  // Phase 1: 全候補を一括クォートで配当利回りを事前取得し、必須条件（3%以上）で絞り込む
  let filteredCandidates = SCREEN_CANDIDATES;
  try {
    const symbols = SCREEN_CANDIDATES.map(c => c.symbol);
    const quotes: any = await yahooFinance.quote(symbols);
    const quoteArr: any[] = Array.isArray(quotes) ? quotes : [quotes];
    const yieldMap = new Map<string, number>();
    for (const q of quoteArr) {
      // quote().dividendYield はパーセント単位（例: 2.91 = 2.91%）のため使用しない
      // trailingAnnualDividendYield は小数単位（例: 0.0266 = 2.66%）で正しい
      const y = q?.trailingAnnualDividendYield ?? null;
      if (y != null && q?.symbol) yieldMap.set(q.symbol, y);
    }
    // trailingAnnualDividendYield は過去実績のため増配後は実際より低く出ることがある
    // 2.5%以上（またはデータなし）を通過させ、詳細取得時の正確計算で最終判定する
    filteredCandidates = SCREEN_CANDIDATES.filter(c => {
      const y = yieldMap.get(c.symbol);
      return y == null || y >= 0.025;
    });
    console.log(`[screener] 事前フィルタ: ${SCREEN_CANDIDATES.length}銘柄 → ${filteredCandidates.length}銘柄 (trailing利回り2.5%+)`);
  } catch (e) {
    console.warn("[screener] 事前フィルタ失敗、全銘柄をスクリーニング:", String(e));
  }

  // Phase 2: 絞り込み済み銘柄のみ詳細データ取得（バッチサイズ10・200ms遅延）
  const batchSize = 10;
  const delayMs = 200;

  for (let i = 0; i < filteredCandidates.length; i += batchSize) {
    const batch = filteredCandidates.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(batch.map(screenOneStock));
    for (const r of batchResults) {
      if (r.status === "fulfilled" && r.value) {
        results.push(r.value);
      }
    }
    if (i + batchSize < filteredCandidates.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  // 条件合致数降順、次に配当利回り降順でソート
  return results.sort((a, b) => {
    if (b.metCount !== a.metCount) return b.metCount - a.metCount;
    const ya = a.metrics.dividendYield ?? 0;
    const yb = b.metrics.dividendYield ?? 0;
    return yb - ya;
  });
}
