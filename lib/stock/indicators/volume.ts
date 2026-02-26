// 出来高増加率 計算
// 直近5日平均 / 過去20日平均 の比率

export function calculateVolumeRatio(volumes: number[]): number | null {
  if (volumes.length < 20) return null;

  const recent5 = volumes.slice(-5).reduce((a, b) => a + b, 0) / 5;
  const avg20 = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;

  if (avg20 === 0) return null;
  return recent5 / avg20;
}

export function scoreVolume(ratio: number | null): { score: number; reason: string } {
  if (ratio === null) return { score: 0, reason: "出来高データ不足" };

  const r = Math.round(ratio * 100) / 100;

  if (ratio >= 2.0) return { score: 20, reason: `出来高急増（${r}倍）: 強い関心上昇` };
  if (ratio >= 1.5) return { score: 15, reason: `出来高増加（${r}倍）: 関心が高まっている` };
  if (ratio >= 1.2) return { score: 8, reason: `出来高やや増加（${r}倍）` };
  if (ratio >= 0.8) return { score: 3, reason: `出来高普通（${r}倍）` };
  return { score: 0, reason: `出来高減少（${r}倍）: 関心低下` };
}
