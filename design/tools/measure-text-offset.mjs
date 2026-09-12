// 入力欄の中で、文字のインクが上下どちらに寄っているかを画素で測る。
//
//   node design/tools/measure-text-offset.mjs
//
// 高さ 44px の入力欄（input）と、同じ見た目の div（flex で中央揃え。Select の値と同じ組み方）に
// 同じ文字列を入れて描画し、枠の内側でインクより上の余白と下の余白を数える。
// 「差」が正なら文字が上に寄っている。フォントの縦メトリクスを補正したら、これで確かめる。
// 和文フォントは、補正を足した src/styles/ibm-plex-sans-jp.css を読む（design/adr/0032）。

import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { inflateSync } from 'node:zlib';
import { CHROME } from './render.mjs';

const NM = resolve(import.meta.dirname, '../../node_modules');
const DSF = 4;
const MIX = `'Mulish Variable', 'IBM Plex Sans JP'`;
const JP = `'IBM Plex Sans JP'`;
const rows = [
  ['input', '山田 花子', MIX],
  ['div', '山田 花子', MIX],
  ['input', '山田 花子', JP],
  ['div', '山田 花子', JP],
  ['input', 'お仕事のご相談', MIX],
  ['div', 'お仕事のご相談', MIX],
  ['input', 'hanako@example.com', MIX],
  ['div', 'hanako@example.com', MIX],
];
const H = 44;
const GAP = 20;

const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="file://${NM}/@fontsource-variable/mulish/wght.css">
<link rel="stylesheet" href="file://${resolve(import.meta.dirname, '../../src/styles/ibm-plex-sans-jp.css')}">
<style>
body { margin: 0; background: #fff; line-height: 1.5; }
.f { position: absolute; left: 10px; width: 360px; height: ${H}px; border: 2px solid transparent; border-radius: 12px; background: #F2F4F4; color: #000; font: inherit; font-size: 16px; padding: 0 14px; box-sizing: border-box; margin: 0; outline: none; }
div.f { display: flex; align-items: center; }
</style></head><body>
${rows
  .map(([tag, text, ff], i) => {
    const style = `top: ${10 + i * (H + GAP)}px; font-family: ${ff}`;
    return tag === 'input'
      ? `<input class="f" style="${style}" value="${text}">`
      : `<div class="f" style="${style}"><span>${text}</span></div>`;
  })
  .join('\n')}
</body></html>`;

const dir = mkdtempSync(join(tmpdir(), 'kz-measure-'));
writeFileSync(join(dir, 'm.html'), html);
execFileSync(
  CHROME,
  [
    '--no-sandbox',
    '--hide-scrollbars',
    '--allow-file-access-from-files',
    '--virtual-time-budget=4000',
    `--force-device-scale-factor=${DSF}`,
    `--window-size=400,${20 + rows.length * (H + GAP)}`,
    `--screenshot=${join(dir, 'm.png')}`,
    `file://${join(dir, 'm.html')}`,
  ],
  { stdio: 'ignore' }
);

// 最小限の PNG デコーダ（8bit・非インターレース・RGB / RGBA）
function decodePng(buf) {
  let pos = 8;
  let width, height, colorType;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      colorType = data[9];
    }
    if (type === 'IDAT') idat.push(data);
    pos += 12 + len;
  }
  const bpp = colorType === 6 ? 4 : 3;
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * bpp;
  const out = Buffer.alloc(height * stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    for (let x = 0; x < stride; x++) {
      const r = raw[y * (stride + 1) + 1 + x];
      const a = x >= bpp ? out[y * stride + x - bpp] : 0;
      const b = y > 0 ? out[(y - 1) * stride + x] : 0;
      const c = x >= bpp && y > 0 ? out[(y - 1) * stride + x - bpp] : 0;
      let v;
      if (filter === 0) v = r;
      else if (filter === 1) v = r + a;
      else if (filter === 2) v = r + b;
      else if (filter === 3) v = r + ((a + b) >> 1);
      else {
        const p = a + b - c;
        const pa = Math.abs(p - a),
          pb = Math.abs(p - b),
          pc = Math.abs(p - c);
        v = r + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
      }
      out[y * stride + x] = v & 255;
    }
  }
  return { width, bpp, px: out };
}

const { width, bpp, px } = decodePng(readFileSync(join(dir, 'm.png')));
const isInk = (x, y) => {
  const i = (y * width + x) * bpp;
  return px[i] + px[i + 1] + px[i + 2] < 300;
};

console.log('要素   フォント    文字列               上の余白  下の余白  差（正=上寄り）');
for (const [i, [tag, text, ff]] of rows.entries()) {
  const top = (10 + i * (H + GAP) + 2) * DSF; // 枠線の内側
  const bottom = (10 + i * (H + GAP) + H - 2) * DSF;
  let inkTop = null;
  let inkBottom = null;
  for (let y = top; y < bottom; y++) {
    let hit = false;
    for (let x = 30 * DSF; x < 360 * DSF && !hit; x++) hit = isInk(x, y);
    if (hit) {
      inkTop ??= y;
      inkBottom = y;
    }
  }
  const above = (inkTop - top) / DSF;
  const below = (bottom - inkBottom - 1) / DSF;
  console.log(
    `${tag.padEnd(6)} ${(ff === JP ? '和文のみ' : 'Mulish+和文').padEnd(10)} ${text.padEnd(20)} ${above.toFixed(2).padStart(6)}px ${below.toFixed(2).padStart(7)}px ${(below - above).toFixed(2).padStart(7)}px`
  );
}
