"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStock } from "../layout";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { ScreenResult } from "@/lib/stock/dividend-screener";

// ---- フォーマット関数 ----
function formatPrice(price: number | null): string {
  if (price == null) return "—";
  return price.toLocaleString("ja-JP");
}
function formatPercent(pct: number | null): string {
  if (pct == null) return "—";
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(2)}%`;
}
function formatRange(high: number | null, low: number | null): string {
  if (high == null || low == null) return "—";
  return (high - low).toLocaleString("ja-JP");
}

function ChangeCell({ value }: { value: number | null }) {
  if (value == null) return <span className="text-slate-500">—</span>;
  const isUp = value > 0;
  const isDown = value < 0;
  return (
    <span
      className={
        isUp ? "text-green-400 font-semibold" :
        isDown ? "text-red-400 font-semibold" :
        "text-slate-400"
      }
    >
      {formatPercent(value)}
    </span>
  );
}

function PriceCell({ value, up, down }: { value: number | null; up?: boolean; down?: boolean }) {
  if (value == null) return <span className="text-slate-500">—</span>;
  const cls = up ? "text-green-400" : down ? "text-red-400" : "text-slate-200";
  return <span className={`font-mono ${cls}`}>{formatPrice(value)}</span>;
}

// ---- スクリーニング結果の表示 ----
const CRITERIA_LABELS: { key: keyof ScreenResult["criteria"]; label: string; short: string }[] = [
  { key: "dividendYield",   label: "配当利回り3.75%+",  short: "配当" },
  { key: "pbr",             label: "PBR 0.5〜1.5倍",    short: "PBR" },
  { key: "payoutRatio",     label: "配当性向80%未満",   short: "性向" },
  { key: "operatingMargin", label: "営業利益率10%+",    short: "利益率" },
  { key: "equityRatio",     label: "自己資本比率50%+",  short: "自己資本" },
  { key: "currentRatio",    label: "流動比率200%+",     short: "流動比率" },
  { key: "cashRatio",       label: "現金比率10%+",      short: "現金" },
];

function MetricCell({ value, pct = false }: { value: number | null; pct?: boolean }) {
  if (value == null) return <span className="text-slate-600">—</span>;
  if (pct) return <span>{(value * 100).toFixed(1)}%</span>;
  return <span>{value.toFixed(2)}</span>;
}

interface ScreenPanelProps {
  alreadyAdded: Set<string>;
  onAdd: (result: ScreenResult) => Promise<void>;
}

function ScreeningPanel({ alreadyAdded, onAdd }: ScreenPanelProps) {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ScreenResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [addingSymbol, setAddingSymbol] = useState<string | null>(null);
  const [minMet, setMinMet] = useState(4);

  const runScreen = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const res = await fetch("/api/stock/dividend/screen");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "スクリーニングに失敗しました");
      } else {
        setResults(data.results as ScreenResult[]);
      }
    } catch (e) {
      setError("通信エラー: " + String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (result: ScreenResult) => {
    setAddingSymbol(result.candidate.symbol);
    await onAdd(result);
    setAddingSymbol(null);
  };

  const filtered = results?.filter(r => r.metCount >= minMet) ?? [];

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 mb-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-slate-200 text-sm font-semibold">候補銘柄スクリーニング</h3>
          <p className="text-slate-500 text-xs mt-0.5">
            約60銘柄をYahoo Financeで評価（配当利回り・PBR・営業利益率・流動比率など7条件）
            {!results && !loading && (
              <span className="text-blue-400 ml-2">← 「実行」ボタンを押してください（30〜60秒）</span>
            )}
          </p>
        </div>
        <button
          onClick={runScreen}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm px-5 py-2.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-lg shadow-blue-900/30"
        >
          {loading ? (
            <><span className="animate-spin inline-block w-3 h-3 border border-white border-t-transparent rounded-full" />取得中...</>
          ) : (
            "スクリーニング実行"
          )}
        </button>
      </div>

      {/* 判定条件一覧 */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {CRITERIA_LABELS.map(c => (
          <span key={c.key} className="text-xs bg-slate-700/60 text-slate-400 px-2 py-0.5 rounded">
            {c.label}
          </span>
        ))}
      </div>

      {error && (
        <p className="text-red-400 text-sm mb-3">{error}</p>
      )}

      {loading && (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="md" message="Yahoo Finance からデータ取得中（約30〜60秒）..." />
        </div>
      )}

      {results && !loading && (
        <div>
          {/* フィルター */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-slate-400 text-xs">最低合致条件数：</span>
            {[3, 4, 5, 6].map(n => (
              <button
                key={n}
                onClick={() => setMinMet(n)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                  minMet === n
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "border-slate-600 text-slate-400 hover:border-slate-500"
                }`}
              >
                {n}以上
              </button>
            ))}
            <span className="text-slate-500 text-xs ml-auto">
              {filtered.length} / {results.length} 銘柄
            </span>
          </div>

          {filtered.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-6">
              条件を満たす銘柄がありません。フィルターを緩めてください。
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[820px]">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-800/80">
                    <th className="text-left text-slate-400 font-medium px-3 py-2">銘柄</th>
                    <th className="text-right text-slate-400 font-medium px-2 py-2">配当利回り</th>
                    <th className="text-right text-slate-400 font-medium px-2 py-2">PBR</th>
                    <th className="text-right text-slate-400 font-medium px-2 py-2">配当性向</th>
                    <th className="text-right text-slate-400 font-medium px-2 py-2">営業利益率</th>
                    <th className="text-right text-slate-400 font-medium px-2 py-2">自己資本比率</th>
                    <th className="text-right text-slate-400 font-medium px-2 py-2">流動比率</th>
                    <th className="text-right text-slate-400 font-medium px-2 py-2">現金比率</th>
                    <th className="text-center text-slate-400 font-medium px-2 py-2">合致</th>
                    <th className="text-center text-slate-400 font-medium px-2 py-2">追加</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => {
                    const { candidate, metrics, criteria, metCount } = r;
                    const added = alreadyAdded.has(candidate.symbol);
                    return (
                      <tr key={candidate.symbol} className="border-b border-slate-800/60 hover:bg-slate-800/30">
                        <td className="px-3 py-2">
                          <div className="text-white font-medium">{candidate.nameJa}</div>
                          <div className="text-slate-500">{candidate.code} · {candidate.sector}</div>
                        </td>
                        <td className={`px-2 py-2 text-right font-mono ${criteria.dividendYield ? "text-green-400" : "text-red-400"}`}>
                          <MetricCell value={metrics.dividendYield} pct />
                        </td>
                        <td className={`px-2 py-2 text-right font-mono ${criteria.pbr === true ? "text-green-400" : criteria.pbr === false ? "text-red-400" : "text-slate-500"}`}>
                          <MetricCell value={metrics.pbr} />
                        </td>
                        <td className={`px-2 py-2 text-right font-mono ${criteria.payoutRatio === true ? "text-green-400" : criteria.payoutRatio === false ? "text-red-400" : "text-slate-500"}`}>
                          <MetricCell value={metrics.payoutRatio} pct />
                        </td>
                        <td className={`px-2 py-2 text-right font-mono ${criteria.operatingMargin === true ? "text-green-400" : criteria.operatingMargin === false ? "text-red-400" : "text-slate-500"}`}>
                          <MetricCell value={metrics.operatingMargin} pct />
                        </td>
                        <td className={`px-2 py-2 text-right font-mono ${criteria.equityRatio === true ? "text-green-400" : criteria.equityRatio === false ? "text-red-400" : "text-slate-500"}`}>
                          <MetricCell value={metrics.equityRatio} pct />
                        </td>
                        <td className={`px-2 py-2 text-right font-mono ${criteria.currentRatio === true ? "text-green-400" : criteria.currentRatio === false ? "text-red-400" : "text-slate-500"}`}>
                          {metrics.currentRatio != null
                            ? <span>{(metrics.currentRatio * 100).toFixed(0)}%</span>
                            : <span className="text-slate-600">—</span>}
                        </td>
                        <td className={`px-2 py-2 text-right font-mono ${criteria.cashRatio === true ? "text-green-400" : criteria.cashRatio === false ? "text-red-400" : "text-slate-500"}`}>
                          <MetricCell value={metrics.cashRatio} pct />
                        </td>
                        <td className="px-2 py-2 text-center">
                          <span className={`font-bold text-sm ${
                            metCount >= 6 ? "text-green-400" :
                            metCount >= 4 ? "text-yellow-400" :
                            "text-slate-500"
                          }`}>
                            {metCount}/{CRITERIA_LABELS.length}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-center">
                          {added ? (
                            <span className="text-slate-600 text-xs">追加済</span>
                          ) : (
                            <button
                              onClick={() => handleAdd(r)}
                              disabled={addingSymbol === candidate.symbol}
                              className="bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white text-xs px-2.5 py-1 rounded-lg transition-colors"
                            >
                              {addingSymbol === candidate.symbol ? "..." : "追加"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <p className="text-slate-600 text-xs mt-2">
            ※ データはYahoo Finance取得値。金融業（銀行・保険・商社等）は流動比率・自己資本比率の基準が業種の性質上異なります。
          </p>
        </div>
      )}
    </div>
  );
}

// ---- メインページ ----
export default function DividendsPage() {
  const {
    dividendStocks,
    dividendQuotes,
    dividendLoading,
    dividendLastUpdated,
    addDividendStock,
    removeDividendStock,
    resetDividendStocks,
  } = useStock();

  const router = useRouter();
  const [showScreening, setShowScreening] = useState(true);
  const [addCode, setAddCode] = useState("");
  const [addName, setAddName] = useState("");
  const [addSector, setAddSector] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const alreadyAdded = new Set(dividendStocks.map(s => s.symbol));

  const handleAdd = async () => {
    const code = addCode.trim().replace(/[^0-9]/g, "");
    if (!code) { setFormError("証券コード（数字）を入力してください"); return; }
    const symbol = `${code}.T`;
    if (alreadyAdded.has(symbol)) { setFormError("この銘柄はすでに追加されています"); return; }
    setFormError(null);
    setAddLoading(true);
    await addDividendStock({ code, symbol, nameJa: addName.trim() || code, sector: addSector.trim() || "その他" });
    setAddLoading(false);
    setAddCode(""); setAddName(""); setAddSector("");
  };

  const handleAddFromScreen = async (result: ScreenResult) => {
    const { candidate } = result;
    await addDividendStock({
      code: candidate.code,
      symbol: candidate.symbol,
      nameJa: candidate.nameJa,
      sector: candidate.sector,
    });
  };

  const handleReset = () => {
    if (!confirm("デフォルトの銘柄リストに戻しますか？")) return;
    resetDividendStocks();
  };

  return (
    <div>
      {/* ページヘッダー */}
      <div className="mb-6">
        <h2 className="text-white text-2xl font-bold">高配当株 監視リスト</h2>
        <p className="text-slate-400 text-sm mt-1">
          {dividendLastUpdated
            ? `最終更新: ${new Date(dividendLastUpdated).toLocaleString("ja-JP")}`
            : "データ取得中..."}
        </p>
      </div>

      {/* 銘柄追加フォーム */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 mb-4">
        <h3 className="text-slate-300 text-sm font-semibold mb-3">銘柄を手動で追加</h3>
        {formError && <p className="text-red-400 text-xs mb-2">{formError}</p>}
        <div className="flex gap-2 flex-wrap items-end">
          <div className="flex flex-col gap-1">
            <label className="text-slate-500 text-xs">証券コード *</label>
            <input
              type="text" placeholder="例: 8306" value={addCode}
              onChange={e => setAddCode(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAdd()}
              className="bg-slate-900 border border-slate-600 text-white text-sm px-3 py-2 rounded-lg w-32 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-36">
            <label className="text-slate-500 text-xs">銘柄名</label>
            <input
              type="text" placeholder="例: 三菱UFJ" value={addName}
              onChange={e => setAddName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAdd()}
              className="bg-slate-900 border border-slate-600 text-white text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1 w-28">
            <label className="text-slate-500 text-xs">セクター</label>
            <input
              type="text" placeholder="例: 銀行業" value={addSector}
              onChange={e => setAddSector(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAdd()}
              className="bg-slate-900 border border-slate-600 text-white text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <button
            onClick={handleAdd} disabled={addLoading}
            className="bg-green-700 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-1"
          >
            {addLoading ? <><span className="animate-spin inline-block">⟳</span> 取得中...</> : "＋ 追加"}
          </button>
          <button
            onClick={handleReset}
            className="text-slate-500 hover:text-slate-300 text-xs px-3 py-2 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
          >
            デフォルトに戻す
          </button>
        </div>
      </div>

      {/* スクリーニングセクション */}
      <div className="mb-5">
        <button
          onClick={() => setShowScreening(v => !v)}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium mb-3 transition-colors"
        >
          <span className={`transition-transform ${showScreening ? "rotate-90" : ""}`}>▶</span>
          候補銘柄スクリーニング（約60銘柄を自動評価）
        </button>
        {showScreening && (
          <ScreeningPanel alreadyAdded={alreadyAdded} onAdd={handleAddFromScreen} />
        )}
      </div>

      {/* 監視リスト テーブル */}
      {dividendLoading && dividendQuotes.size === 0 ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" message="Yahoo Finance からデータ取得中..." />
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-800/60">
                <th className="text-left text-slate-400 font-medium px-4 py-3 w-16">コード</th>
                <th className="text-left text-slate-400 font-medium px-4 py-3">銘柄名</th>
                <th className="text-right text-slate-400 font-medium px-4 py-3 w-24">始値</th>
                <th className="text-right font-medium px-4 py-3 w-24"><span className="text-red-400">高値</span></th>
                <th className="text-right font-medium px-4 py-3 w-24"><span className="text-blue-400">安値</span></th>
                <th className="text-right text-slate-400 font-medium px-4 py-3 w-24">値幅</th>
                <th className="text-right text-slate-400 font-medium px-4 py-3 w-24">騰落率</th>
                <th className="text-right text-slate-400 font-medium px-4 py-3 w-24">終値</th>
                <th className="text-center text-slate-400 font-medium px-3 py-3 w-12">削除</th>
              </tr>
            </thead>
            <tbody>
              {dividendStocks.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center text-slate-500 py-12">
                    監視銘柄がありません。上のフォームから銘柄を追加してください。
                  </td>
                </tr>
              )}
              {dividendStocks.map(stock => {
                const q = dividendQuotes.get(stock.symbol);
                const isUp = (q?.changePercent ?? 0) > 0;
                const isDown = (q?.changePercent ?? 0) < 0;
                return (
                  <tr
                    key={stock.symbol}
                    onClick={() => router.push(`/dashboard/analysis/${encodeURIComponent(stock.symbol)}`)}
                    className="border-b border-slate-800/70 hover:bg-slate-800/30 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3 text-slate-500 font-mono text-xs">{stock.code}</td>
                    <td className="px-4 py-3">
                      <div className="text-white font-medium leading-tight">{stock.nameJa}</div>
                      <div className="text-slate-500 text-xs mt-0.5">{stock.sector}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-300">
                      {formatPrice(q?.openPrice ?? null)}
                    </td>
                    <td className="px-4 py-3 text-right"><PriceCell value={q?.highPrice ?? null} up /></td>
                    <td className="px-4 py-3 text-right"><PriceCell value={q?.lowPrice ?? null} down /></td>
                    <td className="px-4 py-3 text-right font-mono text-slate-300">
                      {formatRange(q?.highPrice ?? null, q?.lowPrice ?? null)}
                    </td>
                    <td className="px-4 py-3 text-right"><ChangeCell value={q?.changePercent ?? null} /></td>
                    <td className="px-4 py-3 text-right">
                      <PriceCell value={q?.closePrice ?? null} up={isUp} down={isDown} />
                    </td>
                    <td className="px-3 py-3 text-center">
                      <button
                        onClick={e => { e.stopPropagation(); removeDividendStock(stock.symbol); }}
                        className="text-slate-600 hover:text-red-400 transition-colors text-base leading-none"
                        title={`${stock.nameJa}を削除`}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-slate-600 text-xs mt-3 text-right">
        全{dividendStocks.length}銘柄を監視中　※ 銘柄リストはブラウザに保存されます
      </p>
    </div>
  );
}
