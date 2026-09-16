// IBM Plex Sans JP の @font-face に、縦の寸法の補正を足した CSS を作る — design/adr/0032
//   pnpm run fonts
//
// 和文フォントの、行の位置を決める寸法（hhea: 上 1.06em・下 0.44em）の中心は、漢字の枠（上 0.88em・下 0.12em）の
// 中心より 0.07em 低い。そのため、和文フォントが行の位置を決める場所（入力欄の値）で、漢字が約 1px 上に寄る。
// 寸法を漢字の枠（フォントの typo の寸法）に合わせると、漢字が行の中央に来る。
// @fontsource の CSS は書き換えられないので、同じ @font-face を補正付きで書き出し、src/styles/globals.css から読む。
// @fontsource/ibm-plex-sans-jp を更新したら、これを流し直す。
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const PKG = '@fontsource/ibm-plex-sans-jp';
const WEIGHTS = [400, 500, 600, 700];
const FAMILY = "font-family: 'IBM Plex Sans JP';";
// 漢字の枠（上 0.88em・下 0.12em）。行の高さを足す寸法（line gap）は 0
const OVERRIDES = ['ascent-override: 88%;', 'descent-override: 12%;', 'line-gap-override: 0%;'];
const OUT = 'src/styles/ibm-plex-sans-jp.css';

let count = 0;
const faces = WEIGHTS.map((weight) =>
  readFileSync(resolve(ROOT, 'node_modules', PKG, `${weight}.css`), 'utf8')
    // src/styles から見た位置に直す
    .replaceAll('url(./files/', `url(../../node_modules/${PKG}/files/`)
    .replaceAll(FAMILY, () => {
      count++;
      return [FAMILY, ...OVERRIDES].join('\n  ');
    })
);

const header = `/* scripts/generate-fonts.mjs が作るファイル。手で書き換えない — design/adr/0032
   ${PKG} の @font-face に、縦の寸法の補正（漢字の枠に合わせる）を足したもの */
`;
writeFileSync(resolve(ROOT, OUT), header + faces.join('\n'));
console.log(`${OUT}: ${count} 個の @font-face に補正を足しました`);
