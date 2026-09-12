// ラウンドの候補をトークン表から生成する。
//
//   node design/tools/generate-round.mjs design/rounds/r02
//
// 入力:  <round>/base-tokens.css（ラウンド開始時点の現行版）と <round>/candidates.mjs（その上書き）
// 出力:  <round>/build/ に artboard（*.dc.html）、canvas.json、preview.html
//
// コントラスト基準（design/adr/0002）を満たさない候補があれば生成を中止する。

import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  artboardScript,
  beginArtboard,
  loadRound,
  localFontLinks,
  screen,
  sheet,
  SCREEN_H,
  SCREEN_W,
  SHARED_CSS,
  SHEET_H,
  SHEET_W,
  FONT_STACK,
} from './render.mjs';

const roundDir = resolve(process.argv[2] ?? '');
const repoDir = resolve(import.meta.dirname, '../..');
const buildDir = join(roundDir, 'build');

const spec = (await import(pathToFileURL(join(roundDir, 'candidates.mjs')).href)).default;
const variants = await loadRound(roundDir, spec);

let failed = false;
for (const v of variants) {
  const ng = v.results.filter((r) => r.ratio < r.need);
  if (ng.length) {
    failed = true;
    console.error(
      `✗ ${v.id} ${v.name}: ` +
        ng.map((r) => `${r.name} ${r.ratio.toFixed(2)} < ${r.need}`).join(', ')
    );
  }
}
if (failed) {
  console.error('コントラスト基準を満たさない候補があるため、生成を中止しました。');
  process.exit(1);
}

const GOOGLE_FONTS =
  'https://fonts.googleapis.com/css2?family=Mulish:ital,wght@0,400..800;1,400..800&family=IBM+Plex+Sans+JP:wght@400;500;700&family=Geist+Mono:wght@400;500;600&display=swap';

const artboardFile = (body, script) => `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <link rel="stylesheet" href="${GOOGLE_FONTS}">
  <style>
    body { margin: 0; }
    a { color: #2474DF; } a:hover { color: #1F2F37; }
    ${SHARED_CSS}
  </style>
</helmet>
${body}
</x-dc>
${script}
</body>
</html>
`;

// 同じ artboard を canvas 用と preview 用の2通りで描く
const render = (fn) => {
  beginArtboard('canvas');
  const canvasHtml = fn();
  const script = artboardScript();
  beginArtboard('preview');
  const previewHtml = fn();
  return { canvasHtml, script, previewHtml };
};

mkdirSync(buildDir, { recursive: true });

const GAP_X = 120;
const ROW_GAP = 160;
const board = [];
variants.forEach((v, i) => {
  const x = i * (SHEET_W + GAP_X);
  const label = v.slug === 'Current' ? '現行版' : `${v.id} ${v.name}`;
  board.push({
    file: v.slug === 'Current' ? 'Main.dc.html' : `${v.slug}Sheet.dc.html`,
    x,
    y: 0,
    w: SHEET_W,
    h: SHEET_H,
    title: `${label} · 見本シート`,
    ...render(() => sheet(v, v.t, v.results)),
  });
  board.push({
    file: `${v.slug}Screen.dc.html`,
    x,
    y: SHEET_H + ROW_GAP,
    w: SCREEN_W,
    h: SCREEN_H,
    title: `${label} · 画面`,
    ...render(() => screen(v, v.t)),
  });
});

for (const b of board) writeFileSync(join(buildDir, b.file), artboardFile(b.canvasHtml, b.script));

const canvas = {
  artboards: board.map(({ file, x, y, w, h, title }) => ({
    file,
    x,
    y,
    w,
    h,
    title,
    is_interactive: true,
  })),
  annotations: [
    {
      id: 'brief',
      x: 0,
      y: -300,
      w: 560,
      text:
        spec.brief ??
        `ラウンド ${spec.round}｜基準: 軽い・やわらかい・整然・人懐っこい\n\nいちばん近い案を1つ選び、どこが良かったかを一言ください。気になる箇所はキャンバス上で直接直しても構いません。\n\nボタン・入力欄・スイッチは実際に hover／押下／フォーカスできます。左端の「現行版」が比較の基準線です。`,
    },
    { id: 'round-note', x: 640, y: -300, w: 720, text: spec.note },
  ],
  launch: { view: 'canvas' },
};
writeFileSync(join(buildDir, 'canvas.json'), JSON.stringify(canvas, null, 2) + '\n');

// ローカル確認用: 全 artboard を canvas.json の配置どおりに1枚へ並べる
const maxX = Math.max(...board.map((b) => b.x + b.w));
const maxY = Math.max(...board.map((b) => b.y + b.h));
writeFileSync(
  join(buildDir, 'preview.html'),
  `<!doctype html><html><head><meta charset="utf-8">${localFontLinks(join(repoDir, 'node_modules'))}
<style>body { margin: 0; background: #E9ECED; } ${SHARED_CSS}
.ab { position: absolute; overflow: hidden; outline: 1px solid rgb(31 47 55 / 0.08); }
.ab-title { position: absolute; transform: translateY(-28px); font: 600 16px ${FONT_STACK}; color: #525C60; }</style></head>
<body><div style="position: relative; width: ${maxX + 80}px; height: ${maxY + 120}px; margin: 60px 40px">
${board.map((b) => `<div class="ab-title" style="left: ${b.x}px; top: ${b.y}px">${b.title}</div><div class="ab" style="left: ${b.x}px; top: ${b.y}px; width: ${b.w}px; height: ${b.h}px">${b.previewHtml}</div>`).join('\n')}
</div></body></html>`
);

console.log(`✓ ${variants.length} 案 × 2 artboard を ${buildDir} に生成しました`);
for (const v of variants) {
  const min = v.results.reduce((a, r) => (r.ratio / r.need < a.ratio / a.need ? r : a));
  console.log(
    `  ${v.id.padEnd(3)} ${v.name}  最小余裕: ${min.name} ${min.ratio.toFixed(2)} / ${min.need}`
  );
}
console.log(`  artboards: ${board.map((b) => b.file).join(' ')}`);
