// ADR 用の比較画像を撮る。1つの ADR につき1枚（design/adr/README.md）。
// 現行版と全候補の同じ部品を横に並べ、採用した案に印を付ける。
//
//   node design/tools/compare.mjs design/rounds/r01 \
//     --parts buttons,tags --pick A --title "ADR-0006 ボタンの影" \
//     --out design/adr/assets/0006-button-shadow.png
//
// parts: buttons / fields / switches / tags / card（render.mjs の parts）

import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { parseArgs, styleText } from 'node:util';
import { pathToFileURL } from 'node:url';
import {
  beginArtboard,
  CHROME,
  DENSITY,
  FONT_STACK,
  loadRound,
  localFontLinks,
  parts,
  rootVars,
  SHARED_CSS,
} from './render.mjs';

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    parts: { type: 'string' },
    spec: { type: 'string' }, // 既定は <round>/candidates.mjs。ADR 専用の比較を作るときに差し替える
    pick: { type: 'string' },
    title: { type: 'string' },
    note: { type: 'string', default: '' },
    out: { type: 'string' },
    density: { type: 'string', default: 'coarse' },
    height: { type: 'string', default: '640' },
  },
});

const roundDir = resolve(positionals[0] ?? '');
const repoDir = resolve(import.meta.dirname, '../..');
const specFile = values.spec ? resolve(values.spec) : join(roundDir, 'candidates.mjs');
const spec = (await import(pathToFileURL(specFile).href)).default;
const variants = await loadRound(roundDir, spec);
const d = DENSITY[values.density];
const names = values.parts.split(',');

beginArtboard('preview');
const COL_W = 400;
const cols = variants
  .map((v) => {
    const picked = v.id === values.pick;
    return `<div style="display: flex; flex-direction: column; gap: 12px; width: ${COL_W + 48}px">
  <div style="display: flex; align-items: baseline; gap: 10px; height: 28px; font-family: ${FONT_STACK}">
    <span style="font-size: 18px; font-weight: 800; color: #1F2F37">${v.id === '現行版' ? v.name : `${v.id} ${v.name}`}</span>
    ${picked ? '<span style="font-size: 12px; font-weight: 800; color: #FFFFFF; background: #1F2F37; padding: 2px 10px; border-radius: 9999px">採用</span>' : ''}
  </div>
  <div class="kz" style="${rootVars(v.t)}; display: flex; flex-direction: column; gap: ${d.stack}px; padding: 24px; background-color: ${v.t.color.bg}; border-radius: 12px; box-shadow: ${picked ? '0 0 0 3px #1F2F37' : '0 0 0 1px rgb(31 47 55 / 0.10)'}">
    ${names.map((n) => parts[n](v.t, d)).join('\n')}
  </div>
</div>`;
  })
  .join('\n');

const width = variants.length * (COL_W + 48) + (variants.length - 1) * 24 + 80;
const html = `<!doctype html><html><head><meta charset="utf-8">${localFontLinks(join(repoDir, 'node_modules'))}
<style>body { margin: 0; background: #EEF0F1; } ${SHARED_CSS}</style></head>
<body><div style="padding: 32px 40px; font-family: ${FONT_STACK}; color: #1F2F37">
  <div style="font-size: 22px; font-weight: 800">${values.title}</div>
  <div style="margin: 4px 0 24px; font-size: 13px; color: #525C60">ラウンド ${spec.round}・${d.name}の密度（${d.h}px）${values.note ? `・${values.note}` : ''}</div>
  <div style="display: flex; gap: 24px; align-items: flex-start">${cols}</div>
</div></body></html>`;

const dir = mkdtempSync(join(tmpdir(), 'kz-compare-'));
const file = join(dir, 'compare.html');
writeFileSync(file, html);
execFileSync(
  CHROME,
  [
    '--no-sandbox',
    '--hide-scrollbars',
    '--allow-file-access-from-files',
    '--virtual-time-budget=4000',
    '--force-device-scale-factor=1',
    `--window-size=${width},${values.height}`,
    `--screenshot=${resolve(values.out)}`,
    pathToFileURL(file).href,
  ],
  { stdio: 'ignore' }
);
console.log(styleText('green', '✓'), values.out, `${width}×${values.height}`);
