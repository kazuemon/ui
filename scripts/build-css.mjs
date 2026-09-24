// 配布物の CSS を dist/ に作る。pnpm build が tsdown（JS と型）のあとに流す
//
//   dist/tailwind.css  Tailwind v4 を使うアプリ向け。src/styles/tailwind.css の @import を 1 ファイルにまとめ、
//                      クラス名を探す場所を dist の JS に差し替える。使う側の Tailwind が処理する
//   dist/styles.css    Tailwind を使わないアプリ向け。src/styles/standalone.css を、ここで Tailwind に通して作る。
//                      ページ全体のリセット（preflight）は入れない（部品の中だけのリセットは reset.css）。全体を @layer kazuemon に入れ、使う側の CSS が勝つようにする
//   dist/fonts.css     欧文と等幅のフォント（@fontsource の CSS を読む）
//   dist/fonts-ja.css  和文フォント。縦の寸法を補正した @font-face（design/adr/0032）。
//                      フォントのファイルは使う側が入れた @fontsource/ibm-plex-sans-jp を指す
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const STYLES = join(ROOT, 'src/styles');
const DIST = join(ROOT, 'dist');

/** 相対パスの @import を中身に置き換える（パッケージの @import はそのまま残す） */
function inline(path) {
  return readFileSync(path, 'utf8').replace(/^@import '(\.[^']+)';$/gm, (_, specifier) =>
    inline(join(dirname(path), specifier))
  );
}

/** クラス名を探す場所を、配布する JS（dist の中）だけにする */
const withDistSource = (css) =>
  css.replace(/^@source .*;\n/gm, '') +
  "\n/* クラス名を探す場所: 部品の JS（このファイルと同じ dist の中） */\n@source './**/*.js';\n";

mkdirSync(DIST, { recursive: true });

// Tailwind あり
const tailwind = withDistSource(inline(join(STYLES, 'tailwind.css')));
if (tailwind.includes('../../'))
  throw new Error('dist/tailwind.css に dist の外を指すパスが残っています');
writeFileSync(join(DIST, 'tailwind.css'), tailwind);

// Tailwind なし: src/styles/standalone.css（リセットを除いた Tailwind ＋ tailwind.css）を Tailwind に通す
const input = join(DIST, '.styles-input.css');
writeFileSync(input, withDistSource(inline(join(STYLES, 'standalone.css'))));
const output = join(DIST, 'styles.css');
try {
  execFileSync(
    join(ROOT, 'node_modules/.bin/tailwindcss'),
    ['--input', input, '--output', output, '--minify'],
    { cwd: ROOT, stdio: ['ignore', 'ignore', 'inherit'] }
  );
} finally {
  rmSync(input, { force: true });
}
const compiled = readFileSync(output, 'utf8');
const license = compiled.match(/^\/\*![\s\S]*?\*\//)?.[0] ?? '';
writeFileSync(
  output,
  `${license}\n/* @kazuemon/ui（Tailwind を使わないアプリ向け）。全体を @layer kazuemon に入れている */\n` +
    `@layer kazuemon{${compiled.slice(license.length).trim()}}\n`
);

// フォント
writeFileSync(join(DIST, 'fonts.css'), readFileSync(join(STYLES, 'fonts.css'), 'utf8'));
const fontsJa = readFileSync(join(STYLES, 'ibm-plex-sans-jp.css'), 'utf8').replaceAll(
  'url(../../node_modules/',
  'url('
);
if (fontsJa.includes('node_modules'))
  throw new Error('dist/fonts-ja.css に node_modules のパスが残っています');
writeFileSync(join(DIST, 'fonts-ja.css'), fontsJa);

console.log('dist/ に tailwind.css・styles.css・fonts.css・fonts-ja.css を作りました');
