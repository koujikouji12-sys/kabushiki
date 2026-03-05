"use client";

import { useRef, useEffect, useState } from "react";
import type { FullStockData } from "@/lib/stock/types";

function getChangeColor(pct: number): string {
  if (pct <= -3) return "#7f1d1d";
  if (pct <= -2) return "#b91c1c";
  if (pct <= -1) return "#dc2626";
  if (pct < 0)   return "#ef4444";
  if (pct === 0) return "#374151";
  if (pct < 1)   return "#4ade80";
  if (pct < 2)   return "#22c55e";
  if (pct < 3)   return "#16a34a";
  return "#14532d";
}

// スクワリファイドツリーマップ
function worstRatio(row: number[], shorter: number): number {
  if (row.length === 0) return Infinity;
  const s = row.reduce((a, b) => a + b, 0);
  const max = Math.max(...row);
  const min = Math.min(...row);
  return Math.max(
    (shorter * shorter * max) / (s * s),
    (s * s) / (shorter * shorter * min)
  );
}

interface Rect { x: number; y: number; w: number; h: number }

function squarify<T>(
  items: Array<{ value: number; data: T }>,
  rx: number, ry: number, rw: number, rh: number
): Array<{ data: T } & Rect> {
  const result: Array<{ data: T } & Rect> = [];
  if (items.length === 0 || rw <= 0 || rh <= 0) return result;

  const totalValue = items.reduce((s, i) => s + i.value, 0);
  if (totalValue === 0) return result;

  // ピクセル面積に変換
  const totalArea = rw * rh;
  const areas = items.map(i => (i.value / totalValue) * totalArea);

  function recurse(start: number, x: number, y: number, w: number, h: number) {
    if (start >= items.length || w <= 0 || h <= 0) return;
    if (start === items.length - 1) {
      result.push({ data: items[start].data, x, y, w, h });
      return;
    }

    const shorter = Math.min(w, h);
    let rowEnd = start + 1;
    let prev = worstRatio([areas[start]], shorter);

    for (let i = start + 1; i < items.length; i++) {
      const row = areas.slice(start, i + 1);
      const next = worstRatio(row, shorter);
      if (next > prev) break;
      prev = next;
      rowEnd = i + 1;
    }

    const rowAreas = areas.slice(start, rowEnd);
    const rowArea = rowAreas.reduce((a, b) => a + b, 0);
    const thick = rowArea / shorter;

    if (w <= h) {
      // 横方向に並べる（行の厚みは縦）
      let cx = x;
      for (let j = 0; j < rowAreas.length; j++) {
        const iw = rowAreas[j] / thick;
        result.push({ data: items[start + j].data, x: cx, y, w: iw, h: thick });
        cx += iw;
      }
      recurse(rowEnd, x, y + thick, w, h - thick);
    } else {
      // 縦方向に並べる（行の厚みは横）
      let cy = y;
      for (let j = 0; j < rowAreas.length; j++) {
        const ih = rowAreas[j] / thick;
        result.push({ data: items[start + j].data, x, y: cy, w: thick, h: ih });
        cy += ih;
      }
      recurse(rowEnd, x + thick, y, w - thick, h);
    }
  }

  recurse(0, rx, ry, rw, rh);
  return result;
}

const CHART_H = 600;
const SECTOR_PAD = 2;  // セクター間の隙間
const STOCK_PAD = 1;   // 銘柄間の隙間

export function HeatmapChart({ stocks }: { stocks: FullStockData[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setWidth(el.clientWidth);
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 業種別グループ化
  const sectorMap = new Map<string, FullStockData[]>();
  for (const s of stocks) {
    const key = s.quote.sector || "その他";
    if (!sectorMap.has(key)) sectorMap.set(key, []);
    sectorMap.get(key)!.push(s);
  }

  // セクターを時価総額合計でソート
  const sectorItems = Array.from(sectorMap.entries())
    .map(([name, ss]) => ({
      value: ss.reduce((sum, s) => sum + (s.quote.marketCap ?? 1_000_000_000), 0),
      data: { name, stocks: ss },
    }))
    .sort((a, b) => b.value - a.value);

  // セクターをツリーマップレイアウト
  const sectorRects = width > 0
    ? squarify(sectorItems, 0, 0, width, CHART_H)
    : [];

  // 各セクター内で銘柄をツリーマップレイアウト
  type StockLayout = { stock: FullStockData } & Rect;
  type SectorInfo = { name: string; avgPct: number } & Rect;

  const stockLayouts: StockLayout[] = [];
  const sectorInfos: SectorInfo[] = [];

  for (const sr of sectorRects) {
    const { name, stocks: ss } = sr.data;
    const inner = {
      x: sr.x + SECTOR_PAD,
      y: sr.y + SECTOR_PAD,
      w: sr.w - SECTOR_PAD * 2,
      h: sr.h - SECTOR_PAD * 2,
    };

    const avgPct = ss.reduce((s, st) => s + st.quote.changePercent, 0) / ss.length;
    sectorInfos.push({ name, x: sr.x, y: sr.y, w: sr.w, h: sr.h, avgPct });

    const stockItems = ss
      .map(s => ({ value: s.quote.marketCap ?? 1_000_000_000, data: s }))
      .sort((a, b) => b.value - a.value);

    const rects = squarify(stockItems, inner.x, inner.y, inner.w, inner.h);
    for (const r of rects) {
      stockLayouts.push({ stock: r.data, x: r.x, y: r.y, w: r.w, h: r.h });
    }
  }

  return (
    <div ref={containerRef} className="w-full">
      {width > 0 && (
        <svg width={width} height={CHART_H} className="block select-none">
          {/* 銘柄タイル */}
          {stockLayouts.map(({ stock, x, y, w, h }) => {
            const pct = stock.quote.changePercent;
            const sign = pct >= 0 ? "+" : "";
            const color = getChangeColor(pct);
            const p = STOCK_PAD;
            const rx = x + p, ry = y + p;
            const rw = Math.max(0, w - p * 2), rh = Math.max(0, h - p * 2);
            const cx = rx + rw / 2;
            const cy = ry + rh / 2;
            const fs = Math.min(13, Math.max(7, Math.min(rw / 6, rh / 3)));
            const showName  = rw > 44 && rh > 28;
            const showPrice = rw > 60 && rh > 46;
            const showPct   = rw > 22 && rh > 18;

            const lines = (showName ? 1 : 0) + (showPrice ? 1 : 0) + (showPct ? 1 : 0);
            const lineH = Math.min(14, rh / (lines + 0.5));
            const startY = cy - ((lines - 1) * lineH) / 2;
            let li = 0;

            return (
              <g key={stock.quote.code}>
                <rect
                  x={rx} y={ry} width={rw} height={rh}
                  fill={color} stroke="#0f172a" strokeWidth={0.5} rx={1}
                />
                <title>{`${stock.quote.nameJa}  ${stock.quote.price.toLocaleString("ja-JP")}円  ${sign}${pct.toFixed(2)}%`}</title>
                {showName && (
                  <text x={cx} y={startY + lineH * li++}
                    textAnchor="middle" dominantBaseline="middle"
                    fill="white" fontSize={fs} fontWeight="600">
                    {stock.quote.nameJa.length > 6 ? stock.quote.nameJa.slice(0, 5) + "…" : stock.quote.nameJa}
                  </text>
                )}
                {showPrice && (
                  <text x={cx} y={startY + lineH * li++}
                    textAnchor="middle" dominantBaseline="middle"
                    fill="white" fontSize={Math.max(7, fs - 2)} opacity={0.75}>
                    {stock.quote.price.toLocaleString("ja-JP")}円
                  </text>
                )}
                {showPct && (
                  <text x={cx} y={startY + lineH * li++}
                    textAnchor="middle" dominantBaseline="middle"
                    fill="white" fontSize={Math.max(7, fs - 1)} fontWeight="700">
                    {sign}{pct.toFixed(2)}%
                  </text>
                )}
              </g>
            );
          })}

          {/* 業種ラベル（各セクター左上） */}
          {sectorInfos.map(({ name, x, y, w, h, avgPct }) => {
            if (w < 28 || h < 14) return null;
            const sign = avgPct >= 0 ? "+" : "";
            const pctText = `${sign}${avgPct.toFixed(2)}%`;
            const labelW = Math.min(w - SECTOR_PAD * 2, name.length * 7 + pctText.length * 6.5 + 14);
            return (
              <g key={name}>
                <rect
                  x={x + SECTOR_PAD} y={y + SECTOR_PAD}
                  width={labelW} height={17}
                  fill="rgba(0,0,0,0.78)" rx={2}
                />
                <text x={x + SECTOR_PAD + 4} y={y + SECTOR_PAD + 11.5}
                  fill="#f1f5f9" fontSize={10} fontWeight="700">
                  {name}
                </text>
                <text x={x + SECTOR_PAD + name.length * 7 + 6} y={y + SECTOR_PAD + 11.5}
                  fill={avgPct >= 0 ? "#4ade80" : "#f87171"} fontSize={9} fontWeight="600">
                  {pctText}
                </text>
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}
