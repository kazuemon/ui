// 配布物の CSS を dist/ に作る。pnpm build が tsdown（JS と型）のあとに流す
//
//   dist/tailwind.css  Tailwind v4 を使うアプリ向け。src/styles/tailwind.css の @import を 1 ファイルにまとめ、
//                      クラス名を探す場所を dist の JS に差し替える。使う側の Tailwind が処理する
//   dist/fonts.css     欧文と等幅のフォント（@fontsource の CSS を読む）
//   dist/fonts-ja.css  和文フォント。縦の寸法を補正した @font-face（design/adr/0032）。
//                      フォントのファイルは使う側が入れた @fontsource/ibm-plex-sans-jp を指す
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
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

mkdirSync(DIST, { recursive: true });

// クラス名を探す場所を、配布する JS（dist の中）だけにする
const tailwind =
  inline(join(STYLES, 'tailwind.css')).replace(/^@source .*;\n/gm, '') +
  "\n/* クラス名を探す場所: 部品の JS（このファイルと同じ dist の中） */\n@source './**/*.js';\n";
if (tailwind.includes('../../'))
  throw new Error('dist/tailwind.css に dist の外を指すパスが残っています');
writeFileSync(join(DIST, 'tailwind.css'), tailwind);

// フォント
writeFileSync(join(DIST, 'fonts.css'), readFileSync(join(STYLES, 'fonts.css'), 'utf8'));
const fontsJa = readFileSync(join(STYLES, 'ibm-plex-sans-jp.css'), 'utf8').replaceAll(
  'url(../../node_modules/',
  'url('
);
if (fontsJa.includes('node_modules'))
  throw new Error('dist/fonts-ja.css に node_modules のパスが残っています');
writeFileSync(join(DIST, 'fonts-ja.css'), fontsJa);

console.log('dist/ に tailwind.css・fonts.css・fonts-ja.css を作りました');
