// 株式分析ダッシュボード 提案書 PowerPoint 生成スクリプト
import PptxGenJS from "pptxgenjs";

const pptx = new PptxGenJS();

// ===== カラーパレット =====
const C = {
  bg:        "0F172A", // slate-950
  card:      "1E293B", // slate-800
  border:    "334155", // slate-700
  white:     "F8FAFC",
  slate400:  "94A3B8",
  slate500:  "64748B",
  blue:      "3B82F6",
  blueLight: "93C5FD",
  green:     "22C55E",
  greenDark: "15803D",
  yellow:    "F59E0B",
  amber:     "FBBF24",
  red:       "EF4444",
  accent:    "60A5FA",
};

// ===== スライドサイズ (16:9) =====
pptx.layout = "LAYOUT_WIDE"; // 33.87 x 19.05 cm

// =============================================
// ヘルパー関数
// =============================================
function addBg(slide, color = C.bg) {
  slide.background = { color };
}

function addTitle(slide, text, y = 0.4, size = 32, color = C.white) {
  slide.addText(text, {
    x: 0.5, y, w: "90%", h: 0.7,
    fontSize: size, bold: true, color,
    fontFace: "Meiryo UI",
  });
}

function addSubtitle(slide, text, y = 1.1, size = 14, color = C.slate400) {
  slide.addText(text, {
    x: 0.5, y, w: "90%", h: 0.4,
    fontSize: size, color,
    fontFace: "Meiryo UI",
  });
}

function addCard(slide, x, y, w, h, fillColor = C.card, lineColor = C.border) {
  slide.addShape(pptx.ShapeType.rect, {
    x, y, w, h,
    fill: { color: fillColor },
    line: { color: lineColor, width: 1 },
    rectRadius: 0.08,
  });
}

function addBadge(slide, text, x, y, bgColor, textColor = C.white) {
  slide.addShape(pptx.ShapeType.rect, {
    x, y, w: 1.4, h: 0.32,
    fill: { color: bgColor },
    line: { color: bgColor, width: 0 },
    rectRadius: 0.16,
  });
  slide.addText(text, {
    x, y, w: 1.4, h: 0.32,
    fontSize: 10, bold: true, color: textColor,
    align: "center", valign: "middle",
    fontFace: "Meiryo UI",
  });
}

function addDivider(slide, y, color = C.border) {
  slide.addShape(pptx.ShapeType.line, {
    x: 0.5, y, w: "88%", h: 0,
    line: { color, width: 1 },
  });
}

function addNumberedItem(slide, num, title, desc, x, y, w) {
  // 番号バッジ
  slide.addShape(pptx.ShapeType.rect, {
    x, y, w: 0.32, h: 0.32,
    fill: { color: C.blue },
    line: { color: C.blue, width: 0 },
    rectRadius: 0.16,
  });
  slide.addText(String(num), {
    x, y, w: 0.32, h: 0.32,
    fontSize: 10, bold: true, color: C.white,
    align: "center", valign: "middle",
    fontFace: "Meiryo UI",
  });
  // タイトル
  slide.addText(title, {
    x: x + 0.42, y: y - 0.02, w: w - 0.42, h: 0.22,
    fontSize: 12, bold: true, color: C.white,
    fontFace: "Meiryo UI",
  });
  // 説明
  slide.addText(desc, {
    x: x + 0.42, y: y + 0.2, w: w - 0.42, h: 0.28,
    fontSize: 9.5, color: C.slate400,
    fontFace: "Meiryo UI",
  });
}

// =============================================
// スライド 1: 表紙
// =============================================
{
  const s = pptx.addSlide();
  addBg(s);

  // グラデーション装飾ライン (上部)
  s.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: 0.08,
    fill: { color: C.blue },
    line: { color: C.blue, width: 0 },
  });

  // アイコン + タイトル
  s.addText("📊", {
    x: 0.5, y: 2.2, w: 1, h: 1,
    fontSize: 52, align: "center",
  });

  s.addText("日経225 株式分析ダッシュボード", {
    x: 1.6, y: 2.3, w: 8, h: 0.75,
    fontSize: 34, bold: true, color: C.white,
    fontFace: "Meiryo UI",
  });

  s.addText("テクニカル分析 × 高配当スクリーニング × マルチユーザー対応", {
    x: 1.6, y: 3.05, w: 8, h: 0.4,
    fontSize: 15, color: C.accent,
    fontFace: "Meiryo UI",
  });

  addDivider(s, 3.6);

  s.addText("システム提案書　2026年3月", {
    x: 0.5, y: 3.75, w: "90%", h: 0.35,
    fontSize: 12, color: C.slate500,
    fontFace: "Meiryo UI",
  });

  // 右下装飾
  s.addShape(pptx.ShapeType.rect, {
    x: 9.8, y: 3.8, w: 2.8, h: 1.5,
    fill: { color: "1C3058", transparency: 40 },
    line: { color: C.blue, width: 1 },
    rectRadius: 0.1,
  });
  for (const [i, tech] of ["Next.js 16", "Supabase", "Yahoo Finance", "Tailwind CSS"].entries()) {
    s.addText(`✦ ${tech}`, {
      x: 9.9, y: 3.9 + i * 0.3, w: 2.6, h: 0.28,
      fontSize: 10, color: C.blueLight,
      fontFace: "Meiryo UI",
    });
  }
}

// =============================================
// スライド 2: 目次
// =============================================
{
  const s = pptx.addSlide();
  addBg(s);
  s.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: 0.08,
    fill: { color: C.blue }, line: { color: C.blue, width: 0 },
  });

  addTitle(s, "目次", 0.3, 28);
  addDivider(s, 1.05);

  const items = [
    ["01", "システム概要",      "何を解決するシステムか"],
    ["02", "主要機能",          "4つのコア機能を詳解"],
    ["03", "テクニカル分析エンジン", "5指標スコアリングの仕組み"],
    ["04", "高配当株スクリーニング", "7条件による自動評価"],
    ["05", "技術スタック",      "使用技術と構成"],
    ["06", "セキュリティ・認証", "Googleログイン × マルチユーザー"],
    ["07", "アーキテクチャ",    "システム構成図"],
    ["08", "アピールポイント",  "差別化要素のまとめ"],
  ];

  const colW = 4.5;
  for (const [i, [num, title, sub]] of items.entries()) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.5 + col * (colW + 0.4);
    const y = 1.25 + row * 0.82;

    addCard(s, x, y, colW, 0.68);
    s.addText(num, {
      x: x + 0.15, y: y + 0.1, w: 0.5, h: 0.48,
      fontSize: 22, bold: true, color: C.blue,
      fontFace: "Meiryo UI",
    });
    s.addText(title, {
      x: x + 0.65, y: y + 0.08, w: colW - 0.75, h: 0.26,
      fontSize: 13, bold: true, color: C.white,
      fontFace: "Meiryo UI",
    });
    s.addText(sub, {
      x: x + 0.65, y: y + 0.35, w: colW - 0.75, h: 0.22,
      fontSize: 10, color: C.slate400,
      fontFace: "Meiryo UI",
    });
  }
}

// =============================================
// スライド 3: システム概要
// =============================================
{
  const s = pptx.addSlide();
  addBg(s);
  s.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: 0.08,
    fill: { color: C.blue }, line: { color: C.blue, width: 0 },
  });

  addBadge(s, "01  システム概要", 0.5, 0.22, C.blue);
  addTitle(s, "日経225全銘柄をリアルタイム分析する\n株式ダッシュボード", 0.65, 24);

  addDivider(s, 1.72);

  // 課題 → 解決策
  addCard(s, 0.5, 1.85, 4.5, 2.5, "1C2B40");
  s.addText("❌  従来の課題", {
    x: 0.65, y: 1.95, w: 4.2, h: 0.35,
    fontSize: 13, bold: true, color: C.red,
    fontFace: "Meiryo UI",
  });
  const problems = [
    "日経225全銘柄を手作業で確認するのは非現実的",
    "テクニカル指標の計算に専門知識が必要",
    "高配当株の財務条件を複数サイトで調べる手間",
    "複数ユーザーがデータを共用できない",
  ];
  for (const [i, p] of problems.entries()) {
    s.addText(`• ${p}`, {
      x: 0.65, y: 2.38 + i * 0.41, w: 4.2, h: 0.35,
      fontSize: 11, color: C.slate400,
      fontFace: "Meiryo UI",
    });
  }

  s.addText("→", {
    x: 5.1, y: 2.8, w: 0.5, h: 0.5,
    fontSize: 28, bold: true, color: C.blue,
    align: "center",
    fontFace: "Meiryo UI",
  });

  addCard(s, 5.7, 1.85, 4.5, 2.5, "0F2A1A");
  s.addText("✅  本システムで解決", {
    x: 5.85, y: 1.95, w: 4.2, h: 0.35,
    fontSize: 13, bold: true, color: C.green,
    fontFace: "Meiryo UI",
  });
  const solutions = [
    "Yahoo Finance APIで225銘柄を自動一括取得",
    "RSI / MACD / BB など5指標を自動計算・スコアリング",
    "配当利回り・PBRなど7条件でワンクリックスクリーニング",
    "Googleログインでユーザーごとにデータを分離管理",
  ];
  for (const [i, p] of solutions.entries()) {
    s.addText(`• ${p}`, {
      x: 5.85, y: 2.38 + i * 0.41, w: 4.2, h: 0.35,
      fontSize: 11, color: C.slate400,
      fontFace: "Meiryo UI",
    });
  }

  s.addText("対象銘柄：日経225  ／  データソース：Yahoo Finance（無料・リアルタイム）", {
    x: 0.5, y: 4.6, w: "88%", h: 0.3,
    fontSize: 10, color: C.slate500, align: "center",
    fontFace: "Meiryo UI",
  });
}

// =============================================
// スライド 4: 主要機能
// =============================================
{
  const s = pptx.addSlide();
  addBg(s);
  s.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: 0.08,
    fill: { color: C.blue }, line: { color: C.blue, width: 0 },
  });

  addBadge(s, "02  主要機能", 0.5, 0.22, C.blue);
  addTitle(s, "4つのコア機能", 0.65, 26);
  addDivider(s, 1.2);

  const features = [
    {
      icon: "🏠", title: "ダッシュボード",
      color: C.blue, colorHex: "1C3058",
      points: [
        "5指標スコアリングによる 期待上昇銘柄TOP10",
        "市場概況サマリー（上昇・下落・横ばい集計）",
        "各指標の詳細説明付き（初心者でも理解可能）",
      ],
    },
    {
      icon: "🌡️", title: "ヒートマップ",
      color: C.green, colorHex: "0F2A1A",
      points: [
        "業種別・時価総額比例タイル表示",
        "騰落率を色で直感的に把握（緑＝上昇/赤＝下落）",
        "Phase1高速取得でヒートマップを先行表示",
      ],
    },
    {
      icon: "📋", title: "銘柄一覧",
      color: C.yellow, colorHex: "2A1F0A",
      points: [
        "日経225全銘柄を一覧表示",
        "現在値・騰落率・テクニカルスコアを一覧で確認",
        "銘柄クリックで詳細分析ページへ遷移",
      ],
    },
    {
      icon: "💰", title: "高配当株監視",
      color: C.amber, colorHex: "2A1A0A",
      points: [
        "カスタム監視リスト（追加・削除・デフォルト復元）",
        "配当利回り・PBRなど7条件スクリーニング",
        "スクリーニング結果からワンクリックで監視追加",
      ],
    },
  ];

  const cardW = 4.55;
  for (const [i, f] of features.entries()) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.25 + col * (cardW + 0.3);
    const y = 1.35 + row * 1.65;

    addCard(s, x, y, cardW, 1.5, f.colorHex);

    s.addText(f.icon, {
      x: x + 0.15, y: y + 0.1, w: 0.55, h: 0.55,
      fontSize: 26,
    });
    s.addText(f.title, {
      x: x + 0.75, y: y + 0.1, w: cardW - 0.85, h: 0.38,
      fontSize: 14, bold: true, color: C.white,
      fontFace: "Meiryo UI",
    });
    for (const [j, pt] of f.points.entries()) {
      s.addText(`• ${pt}`, {
        x: x + 0.15, y: y + 0.62 + j * 0.28, w: cardW - 0.25, h: 0.26,
        fontSize: 10, color: C.slate400,
        fontFace: "Meiryo UI",
      });
    }
  }
}

// =============================================
// スライド 5: テクニカル分析エンジン
// =============================================
{
  const s = pptx.addSlide();
  addBg(s);
  s.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: 0.08,
    fill: { color: C.blue }, line: { color: C.blue, width: 0 },
  });

  addBadge(s, "03  テクニカル分析エンジン", 0.5, 0.22, C.blue);
  addTitle(s, "5指標100点満点スコアリング", 0.65, 26);
  addSubtitle(s, "各指標20点 × 5 = 100点満点で「買いシグナル」を定量評価", 1.18, 13);
  addDivider(s, 1.58);

  const indicators = [
    {
      name: "RSI (14日)", icon: "📈", score: "20pts",
      condition: "30〜50：回復局面",
      desc: "過売り圏からの反転を捉える。30未満の過売りより「回復過程」が狙い目。",
      color: C.blue,
    },
    {
      name: "MACD", icon: "📊", score: "20pts",
      condition: "ゴールデンクロス",
      desc: "MACDラインがシグナルを上抜けた直後の勢い転換を検出。",
      color: "8B5CF6",
    },
    {
      name: "出来高比率", icon: "📦", score: "20pts",
      condition: "5日平均 / 20日平均 ≥ 1.5倍",
      desc: "通常の1.5倍以上の出来高増加で「市場の注目度上昇」を判定。",
      color: C.green,
    },
    {
      name: "25日移動平均乖離率", icon: "📉", score: "20pts",
      condition: "-5〜0%：押し目局面",
      desc: "25日MAをわずかに下回った「押し目買い」タイミングを特定。",
      color: C.yellow,
    },
    {
      name: "ボリンジャーバンド", icon: "🎯", score: "20pts",
      condition: "-2σ付近：バンド反発期待",
      desc: "下限バンドに近づいた銘柄の反発確率が統計的に高いことを利用。",
      color: C.red,
    },
  ];

  const W = 1.9;
  for (const [i, ind] of indicators.entries()) {
    const x = 0.25 + i * (W + 0.12);
    addCard(s, x, 1.7, W, 2.9, C.card);

    // カラーバー (上部)
    s.addShape(pptx.ShapeType.rect, {
      x, y: 1.7, w: W, h: 0.07,
      fill: { color: ind.color },
      line: { color: ind.color, width: 0 },
      rectRadius: 0,
    });

    s.addText(ind.icon, {
      x: x + 0.15, y: 1.82, w: 0.45, h: 0.42,
      fontSize: 22,
    });
    s.addText(ind.score, {
      x: x + W - 0.72, y: 1.82, w: 0.65, h: 0.3,
      fontSize: 11, bold: true, color: ind.color,
      align: "right", fontFace: "Meiryo UI",
    });
    s.addText(ind.name, {
      x: x + 0.1, y: 2.27, w: W - 0.2, h: 0.36,
      fontSize: 11, bold: true, color: C.white,
      fontFace: "Meiryo UI",
    });
    s.addShape(pptx.ShapeType.rect, {
      x: x + 0.1, y: 2.65, w: W - 0.2, h: 0.28,
      fill: { color: "0F172A" },
      line: { color: ind.color, width: 1 },
      rectRadius: 0.04,
    });
    s.addText(ind.condition, {
      x: x + 0.12, y: 2.65, w: W - 0.24, h: 0.28,
      fontSize: 9.5, bold: true, color: ind.color,
      align: "center", valign: "middle",
      fontFace: "Meiryo UI",
    });
    s.addText(ind.desc, {
      x: x + 0.1, y: 2.98, w: W - 0.2, h: 1.5,
      fontSize: 9, color: C.slate400,
      wrap: true, fontFace: "Meiryo UI",
    });
  }

  addCard(s, 0.25, 4.75, "93%", 0.42, "172036");
  s.addText("💡  スコア合計が高い銘柄ほど「複数の買いシグナルが重なった」状態 → 期待値の高い上昇候補としてTOP10に掲載", {
    x: 0.4, y: 4.8, w: "88%", h: 0.32,
    fontSize: 11, color: C.blueLight,
    fontFace: "Meiryo UI",
  });
}

// =============================================
// スライド 6: 高配当株スクリーニング
// =============================================
{
  const s = pptx.addSlide();
  addBg(s);
  s.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: 0.08,
    fill: { color: C.amber }, line: { color: C.amber, width: 0 },
  });

  addBadge(s, "04  高配当株スクリーニング", 0.5, 0.22, C.amber, "0F172A");
  addTitle(s, "7条件による自動ファンダメンタルズ評価", 0.65, 26);
  addSubtitle(s, "約60の高配当候補銘柄をワンクリックでスクリーニング。条件数でフィルタリング可能。", 1.18, 13);
  addDivider(s, 1.58);

  const criteria = [
    { icon: "💰", name: "配当利回り", cond: "3.0%以上（必須）", color: C.amber, note: "高配当投資の最低ライン" },
    { icon: "📐", name: "PBR",       cond: "0.5〜1.5倍",       color: C.blue,  note: "割安 & 実態価値内" },
    { icon: "📊", name: "配当性向",  cond: "80%未満",          color: C.green, note: "配当の持続可能性" },
    { icon: "📈", name: "営業利益率", cond: "10%以上",         color: "8B5CF6", note: "事業の収益力" },
    { icon: "🏛️", name: "自己資本比率", cond: "50%以上",      color: C.yellow, note: "財務健全性" },
    { icon: "💧", name: "流動比率",  cond: "200%以上",         color: "06B6D4", note: "短期支払い能力" },
    { icon: "💵", name: "現金比率",  cond: "10%以上",          color: C.red,   note: "キャッシュリッチ度" },
  ];

  const cW = 1.3;
  for (const [i, c] of criteria.entries()) {
    const x = 0.25 + i * (cW + 0.13);
    addCard(s, x, 1.7, cW, 2.8, C.card);
    s.addShape(pptx.ShapeType.rect, {
      x, y: 1.7, w: cW, h: 0.06,
      fill: { color: c.color }, line: { color: c.color, width: 0 },
    });
    s.addText(c.icon, {
      x: x + cW / 2 - 0.25, y: 1.8, w: 0.5, h: 0.45,
      fontSize: 22, align: "center",
    });
    s.addText(c.name, {
      x: x + 0.06, y: 2.28, w: cW - 0.12, h: 0.36,
      fontSize: 10.5, bold: true, color: C.white, align: "center",
      fontFace: "Meiryo UI",
    });
    s.addShape(pptx.ShapeType.rect, {
      x: x + 0.06, y: 2.65, w: cW - 0.12, h: 0.3,
      fill: { color: "0F172A" }, line: { color: c.color, width: 1 },
      rectRadius: 0.04,
    });
    s.addText(c.cond, {
      x: x + 0.06, y: 2.65, w: cW - 0.12, h: 0.3,
      fontSize: 9, bold: true, color: c.color,
      align: "center", valign: "middle",
      fontFace: "Meiryo UI",
    });
    s.addText(c.note, {
      x: x + 0.06, y: 3.0, w: cW - 0.12, h: 1.4,
      fontSize: 9, color: C.slate400, align: "center", wrap: true,
      fontFace: "Meiryo UI",
    });
  }

  // 機能説明
  addCard(s, 0.25, 4.68, 4.4, 0.55, "1C2B40");
  s.addText("🔍  スクリーニング機能", {
    x: 0.4, y: 4.72, w: 4.1, h: 0.22,
    fontSize: 11, bold: true, color: C.blueLight,
    fontFace: "Meiryo UI",
  });
  s.addText("合致条件数 3〜6以上でフィルタ → ポートフォリオ候補を絞り込み", {
    x: 0.4, y: 4.92, w: 4.1, h: 0.22,
    fontSize: 10, color: C.slate400,
    fontFace: "Meiryo UI",
  });

  addCard(s, 4.9, 4.68, 4.8, 0.55, "1C2B40");
  s.addText("➕  ワンクリック追加", {
    x: 5.05, y: 4.72, w: 4.5, h: 0.22,
    fontSize: 11, bold: true, color: C.green,
    fontFace: "Meiryo UI",
  });
  s.addText("スクリーニング結果から監視リストへ即座に追加。localStorageで永続化。", {
    x: 5.05, y: 4.92, w: 4.5, h: 0.22,
    fontSize: 10, color: C.slate400,
    fontFace: "Meiryo UI",
  });
}

// =============================================
// スライド 7: 技術スタック
// =============================================
{
  const s = pptx.addSlide();
  addBg(s);
  s.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: 0.08,
    fill: { color: C.blue }, line: { color: C.blue, width: 0 },
  });

  addBadge(s, "05  技術スタック", 0.5, 0.22, C.blue);
  addTitle(s, "モダンなフルスタック構成", 0.65, 26);
  addDivider(s, 1.2);

  const stacks = [
    {
      category: "フロントエンド", color: C.blue, colorHex: "1C3058",
      items: [
        ["Next.js 16", "App Router / SSR / API Routes"],
        ["React 19", "最新フックス・Concurrent Features"],
        ["TypeScript 5", "型安全な開発"],
        ["Tailwind CSS 4", "ダークテーマ・レスポンシブ"],
        ["Recharts 3", "インタラクティブチャート"],
      ],
    },
    {
      category: "バックエンド / API", color: C.green, colorHex: "0F2A1A",
      items: [
        ["Yahoo Finance 2", "無料・リアルタイム株価API"],
        ["Next.js API Routes", "サーバーレスエンドポイント"],
        ["date-fns 4", "日付計算ライブラリ"],
        ["独自指標エンジン", "RSI / MACD / BB / 乖離率"],
      ],
    },
    {
      category: "認証 / データ永続化", color: C.amber, colorHex: "2A1A0A",
      items: [
        ["NextAuth.js 4", "OAuth2 認証フレームワーク"],
        ["Google OAuth", "ソーシャルログイン"],
        ["Supabase", "ユーザー追跡・DB"],
        ["localStorage", "監視銘柄リストの永続化"],
      ],
    },
  ];

  for (const [i, stack] of stacks.entries()) {
    const x = 0.25 + i * 3.35;
    addCard(s, x, 1.35, 3.2, 3.5, stack.colorHex);
    s.addShape(pptx.ShapeType.rect, {
      x, y: 1.35, w: 3.2, h: 0.07,
      fill: { color: stack.color }, line: { color: stack.color, width: 0 },
    });
    s.addText(stack.category, {
      x: x + 0.15, y: 1.48, w: 2.9, h: 0.35,
      fontSize: 13, bold: true, color: stack.color,
      fontFace: "Meiryo UI",
    });
    for (const [j, [tech, desc]] of stack.items.entries()) {
      s.addText(tech, {
        x: x + 0.15, y: 1.9 + j * 0.53, w: 2.9, h: 0.25,
        fontSize: 11.5, bold: true, color: C.white,
        fontFace: "Meiryo UI",
      });
      s.addText(desc, {
        x: x + 0.15, y: 2.13 + j * 0.53, w: 2.9, h: 0.22,
        fontSize: 9.5, color: C.slate400,
        fontFace: "Meiryo UI",
      });
    }
  }

  // 性能最適化
  addCard(s, 0.25, 5.0, "93%", 0.22, "172036");
  s.addText("⚡ 性能最適化：2フェーズデータ取得（Phase1: ヒートマップ高速表示 → Phase2: 完全データ取得）で体感速度を大幅改善", {
    x: 0.4, y: 5.03, w: "88%", h: 0.18,
    fontSize: 10, color: C.blueLight,
    fontFace: "Meiryo UI",
  });
}

// =============================================
// スライド 8: セキュリティ・認証
// =============================================
{
  const s = pptx.addSlide();
  addBg(s);
  s.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: 0.08,
    fill: { color: C.green }, line: { color: C.green, width: 0 },
  });

  addBadge(s, "06  セキュリティ・認証", 0.5, 0.22, C.green, "0F172A");
  addTitle(s, "Google OAuth × マルチユーザー対応", 0.65, 26);
  addDivider(s, 1.2);

  // 認証フロー図
  addCard(s, 0.25, 1.35, 9.6, 1.65, C.card);
  s.addText("認証フロー", {
    x: 0.4, y: 1.42, w: 9.2, h: 0.28,
    fontSize: 12, bold: true, color: C.slate400,
    fontFace: "Meiryo UI",
  });

  const steps = [
    ["👤", "ユーザー", "ログインボタン押下"],
    ["🔐", "Google OAuth", "Googleアカウント認証"],
    ["🔑", "NextAuth.js", "セッション生成・Cookie管理"],
    ["🗄️", "Supabase", "ユーザー情報記録"],
    ["📊", "ダッシュボード", "個人専用データで表示"],
  ];

  for (const [i, [icon, name, desc]] of steps.entries()) {
    const x = 0.4 + i * 1.88;
    s.addShape(pptx.ShapeType.rect, {
      x, y: 1.75, w: 1.6, h: 1.1,
      fill: { color: "0F172A" }, line: { color: C.blue, width: 1 },
      rectRadius: 0.06,
    });
    s.addText(icon, {
      x, y: 1.79, w: 1.6, h: 0.42,
      fontSize: 20, align: "center",
    });
    s.addText(name, {
      x, y: 2.2, w: 1.6, h: 0.24,
      fontSize: 9.5, bold: true, color: C.white, align: "center",
      fontFace: "Meiryo UI",
    });
    s.addText(desc, {
      x, y: 2.44, w: 1.6, h: 0.35,
      fontSize: 8.5, color: C.slate400, align: "center", wrap: true,
      fontFace: "Meiryo UI",
    });
    if (i < steps.length - 1) {
      s.addText("→", {
        x: x + 1.65, y: 2.1, w: 0.2, h: 0.3,
        fontSize: 14, color: C.blue, align: "center",
        fontFace: "Meiryo UI",
      });
    }
  }

  // マルチユーザー説明
  const feats = [
    {
      icon: "🔒", title: "データ分離",
      desc: "メールアドレスをキーにlocalStorageを分離。他ユーザーの監視リストは参照不可。",
      color: C.green,
    },
    {
      icon: "⚙️", title: "管理者機能",
      desc: "指定メールアドレス（admin）のみユーザー管理ページへアクセス可能。",
      color: C.amber,
    },
    {
      icon: "📤", title: "CSVエクスポート",
      desc: "ユーザーデータをCSV形式でエクスポート。管理者専用機能。",
      color: C.blue,
    },
    {
      icon: "📱", title: "レスポンシブ対応",
      desc: "モバイルヘッダー + PCサイドバーの切り替えで、スマホからでも利用可能。",
      color: "8B5CF6",
    },
  ];

  for (const [i, f] of feats.entries()) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.25 + col * 4.95;
    const y = 3.2 + row * 0.85;
    addCard(s, x, y, 4.75, 0.72, C.card);
    s.addText(f.icon, {
      x: x + 0.15, y: y + 0.1, w: 0.45, h: 0.5,
      fontSize: 22,
    });
    s.addText(f.title, {
      x: x + 0.65, y: y + 0.08, w: 3.9, h: 0.26,
      fontSize: 12, bold: true, color: f.color,
      fontFace: "Meiryo UI",
    });
    s.addText(f.desc, {
      x: x + 0.65, y: y + 0.35, w: 3.9, h: 0.3,
      fontSize: 9.5, color: C.slate400,
      fontFace: "Meiryo UI",
    });
  }
}

// =============================================
// スライド 9: アーキテクチャ
// =============================================
{
  const s = pptx.addSlide();
  addBg(s);
  s.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: 0.08,
    fill: { color: C.blue }, line: { color: C.blue, width: 0 },
  });

  addBadge(s, "07  アーキテクチャ", 0.5, 0.22, C.blue);
  addTitle(s, "システム構成図", 0.65, 26);
  addDivider(s, 1.2);

  // ===== レイヤー図 =====
  // クライアント
  addCard(s, 0.25, 1.35, 3.0, 3.4, "1C3058");
  s.addText("🖥️  クライアント", {
    x: 0.4, y: 1.42, w: 2.8, h: 0.3,
    fontSize: 12, bold: true, color: C.blue,
    fontFace: "Meiryo UI",
  });
  for (const [i, t] of ["React 19 SPA", "Tailwind CSS UI", "Recharts チャート", "localStorage\n（監視リスト永続化）", "NextAuth.js\n（Googleセッション）"].entries()) {
    addCard(s, 0.4, 1.82 + i * 0.56, 2.7, 0.46, "0F172A");
    s.addText(t, {
      x: 0.5, y: 1.84 + i * 0.56, w: 2.5, h: 0.44,
      fontSize: 10, color: C.white, valign: "middle",
      fontFace: "Meiryo UI",
    });
  }

  // 矢印
  s.addText("⇄", {
    x: 3.35, y: 2.65, w: 0.5, h: 0.4,
    fontSize: 22, color: C.blue, align: "center",
    fontFace: "Meiryo UI",
  });

  // Next.js サーバー
  addCard(s, 3.95, 1.35, 3.0, 3.4, "0F2A1A");
  s.addText("⚡  Next.js サーバー", {
    x: 4.1, y: 1.42, w: 2.8, h: 0.3,
    fontSize: 12, bold: true, color: C.green,
    fontFace: "Meiryo UI",
  });
  const apis = [
    "GET /api/stock/heatmap\n（高速クォート取得）",
    "POST /api/stock/refresh\n（225銘柄完全取得）",
    "GET /api/stock/dividend\n（高配当株クォート）",
    "GET /api/stock/dividend/screen\n（7条件スクリーニング）",
    "GET /api/stock/history\n（価格履歴）",
  ];
  for (const [i, api] of apis.entries()) {
    addCard(s, 4.1, 1.82 + i * 0.56, 2.7, 0.46, "0A1A0A");
    s.addText(api, {
      x: 4.2, y: 1.84 + i * 0.56, w: 2.5, h: 0.44,
      fontSize: 8.5, color: C.green, valign: "middle",
      fontFace: "Meiryo UI",
    });
  }

  // 矢印
  s.addText("⇄", {
    x: 7.05, y: 2.65, w: 0.5, h: 0.4,
    fontSize: 22, color: C.green, align: "center",
    fontFace: "Meiryo UI",
  });

  // 外部サービス
  addCard(s, 7.65, 1.35, 2.4, 3.4, "2A1F0A");
  s.addText("🌐  外部サービス", {
    x: 7.8, y: 1.42, w: 2.2, h: 0.3,
    fontSize: 12, bold: true, color: C.yellow,
    fontFace: "Meiryo UI",
  });
  const exts = [
    ["📈", "Yahoo Finance API", "株価・財務データ"],
    ["🔑", "Google OAuth", "ユーザー認証"],
    ["🗄️", "Supabase", "ユーザーDB"],
  ];
  for (const [i, [icon, name, desc]] of exts.entries()) {
    addCard(s, 7.8, 1.82 + i * 0.74, 2.1, 0.62, "1A1200");
    s.addText(icon, { x: 7.85, y: 1.87 + i * 0.74, w: 0.35, h: 0.5, fontSize: 18 });
    s.addText(name, {
      x: 8.25, y: 1.87 + i * 0.74, w: 1.6, h: 0.24,
      fontSize: 10, bold: true, color: C.yellow,
      fontFace: "Meiryo UI",
    });
    s.addText(desc, {
      x: 8.25, y: 2.1 + i * 0.74, w: 1.6, h: 0.24,
      fontSize: 9, color: C.slate400,
      fontFace: "Meiryo UI",
    });
  }

  // 2フェーズ説明
  addCard(s, 0.25, 4.9, "93%", 0.35, "172036");
  s.addText("⚡ 2フェーズ取得戦略：Phase1（ヒートマップ高速表示）→ Phase2（完全データ取得）で待機時間の体感を最小化", {
    x: 0.4, y: 4.93, w: "88%", h: 0.28,
    fontSize: 10, color: C.blueLight,
    fontFace: "Meiryo UI",
  });
}

// =============================================
// スライド 10: アピールポイント
// =============================================
{
  const s = pptx.addSlide();
  addBg(s);
  s.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: 0.08,
    fill: { color: C.green }, line: { color: C.green, width: 0 },
  });

  addBadge(s, "08  アピールポイント", 0.5, 0.22, C.green, "0F172A");
  addTitle(s, "このシステムならではの強み", 0.65, 26);
  addDivider(s, 1.2);

  const points = [
    {
      num: "01", icon: "🆓", title: "完全無料データソース",
      body: "Yahoo Finance APIを利用し、Bloomberg・Refinitiv等の有料データなしに日経225全銘柄のリアルタイム株価・財務データを取得。ランニングコストほぼゼロ。",
      color: C.green, bg: "0F2A1A",
    },
    {
      num: "02", icon: "🤖", title: "定量的なシグナル検出",
      body: "感覚・経験に依存せず、RSI・MACD・ボリンジャーバンドなど5指標を数値化。100点満点スコアで「買いシグナルの強さ」を客観的に順位付け。",
      color: C.blue, bg: "1C3058",
    },
    {
      num: "03", icon: "⚡", title: "2フェーズ高速UX",
      body: "Phase1でヒートマップ＋高配当株を即時表示し、Phase2で完全データを取得。30〜60秒かかるデータ取得中も画面が動いて「待っている感」を軽減。",
      color: C.amber, bg: "2A1A0A",
    },
    {
      num: "04", icon: "👥", title: "マルチユーザー対応",
      body: "GoogleアカウントでログインするだけでOK。メールアドレスをキーにデータを分離し、家族・チームで同じシステムを独立して利用可能。",
      color: "8B5CF6", bg: "1A0A2A",
    },
    {
      num: "05", icon: "🔍", title: "7条件ファンダ評価",
      body: "配当利回り・PBR・配当性向・営業利益率・自己資本比率・流動比率・現金比率の7指標を同時評価。複数条件合致度でスクリーニングの深さを調整可能。",
      color: C.yellow, bg: "2A2008",
    },
    {
      num: "06", icon: "📐", title: "型安全・保守性",
      body: "TypeScript 5 + ESLintで型安全を確保。コンポーネント・API Route・ライブラリの役割分担が明確で拡張・保守が容易なアーキテクチャ設計。",
      color: "06B6D4", bg: "082A2A",
    },
  ];

  const cardW = 4.55;
  for (const [i, p] of points.entries()) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.25 + col * (cardW + 0.3);
    const y = 1.35 + row * 1.3;

    addCard(s, x, y, cardW, 1.18, p.bg);
    s.addShape(pptx.ShapeType.rect, {
      x, y, w: cardW, h: 0.06,
      fill: { color: p.color }, line: { color: p.color, width: 0 },
    });
    s.addText(p.icon, {
      x: x + 0.12, y: y + 0.1, w: 0.42, h: 0.42,
      fontSize: 20,
    });
    s.addText(p.num, {
      x: x + 0.56, y: y + 0.1, w: 0.38, h: 0.28,
      fontSize: 10, bold: true, color: p.color,
      fontFace: "Meiryo UI",
    });
    s.addText(p.title, {
      x: x + 0.95, y: y + 0.1, w: cardW - 1.05, h: 0.28,
      fontSize: 12, bold: true, color: C.white,
      fontFace: "Meiryo UI",
    });
    s.addText(p.body, {
      x: x + 0.12, y: y + 0.44, w: cardW - 0.22, h: 0.7,
      fontSize: 9.5, color: C.slate400, wrap: true,
      fontFace: "Meiryo UI",
    });
  }
}

// =============================================
// スライド 11: まとめ
// =============================================
{
  const s = pptx.addSlide();
  addBg(s);
  s.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: 0.08,
    fill: { color: C.blue }, line: { color: C.blue, width: 0 },
  });

  addTitle(s, "まとめ", 0.3, 28);
  addDivider(s, 1.02);

  // 中央キャッチコピー
  addCard(s, 0.5, 1.15, "88%", 1.5, "172036");
  s.addText("「日経225 × テクニカル × ファンダメンタルズ」を\nワンストップで分析できる個人投資家向け株式ダッシュボード", {
    x: 0.7, y: 1.2, w: "84%", h: 1.35,
    fontSize: 17, bold: true, color: C.white,
    align: "center", valign: "middle",
    fontFace: "Meiryo UI",
  });

  // サマリー
  const summaries = [
    { label: "対象銘柄",   value: "日経225 全225銘柄", color: C.blue },
    { label: "テクニカル", value: "5指標 / 100点満点スコア", color: C.green },
    { label: "ファンダ",   value: "7条件スクリーニング", color: C.amber },
    { label: "認証",       value: "Google OAuth マルチユーザー", color: "8B5CF6" },
    { label: "コスト",     value: "データ取得費用ゼロ（Yahoo Finance）", color: C.yellow },
  ];

  for (const [i, sum] of summaries.entries()) {
    const x = 0.5 + (i % 3) * 3.1;
    const y = 2.85 + Math.floor(i / 3) * 0.72;
    addCard(s, x, y, 2.9, 0.58, C.card);
    s.addText(sum.label, {
      x: x + 0.12, y: y + 0.04, w: 2.65, h: 0.22,
      fontSize: 10, color: C.slate400,
      fontFace: "Meiryo UI",
    });
    s.addText(sum.value, {
      x: x + 0.12, y: y + 0.27, w: 2.65, h: 0.26,
      fontSize: 12, bold: true, color: sum.color,
      fontFace: "Meiryo UI",
    });
  }

  // 技術スタック一覧
  addDivider(s, 4.35);
  s.addText("使用技術：Next.js 16  ・  React 19  ・  TypeScript 5  ・  Tailwind CSS 4  ・  NextAuth.js  ・  Supabase  ・  Yahoo Finance API  ・  Recharts", {
    x: 0.5, y: 4.42, w: "88%", h: 0.3,
    fontSize: 10, color: C.slate500, align: "center",
    fontFace: "Meiryo UI",
  });

  // フッター
  s.addText("© 2026  日経225 株式分析ダッシュボード", {
    x: 0.5, y: 4.82, w: "88%", h: 0.25,
    fontSize: 9, color: C.slate500, align: "center",
    fontFace: "Meiryo UI",
  });
}

// =============================================
// 保存
// =============================================
const OUTPUT_PATH = "c:/Users/kouit/kabushiki/株式分析ダッシュボード_提案書.pptx";
await pptx.writeFile({ fileName: OUTPUT_PATH });
console.log(`✅  PowerPoint を保存しました: ${OUTPUT_PATH}`);
