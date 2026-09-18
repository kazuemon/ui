// 名前から頭文字を作る（Avatar が、画像がないとき・読み込めないときに出す）
// 和文（漢字・かな）とハングルは 1 文字、欧文は語頭 2 文字まで
//   「かずえもん」→「か」、「宮本一也」→「宮」、'Kazuya Miyamoto' → 'KM'、'Kazuya' → 'K'
// 名前から色を決めることはしない。色は利用者が選ぶ（原則6）

// 1 文字で足りる文字（漢字・ひらがな・カタカナ・ハングル）。長音符と繰り返し記号も同じ扱い
const singleCharScript =
  /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}々〆ー]/u;

// 語の区切り。空白（全角を含む）のほか、和欧の名前でよく使う中黒と読点
const separator = /[\s　・,，、]+/u;

// 先頭の 1 文字。サロゲートペア（絵文字・一部の漢字）を途中で切らないよう、コードポイントで取る
function firstCharacter(text: string) {
  const codePoint = text.codePointAt(0);
  return codePoint === undefined ? '' : String.fromCodePoint(codePoint);
}

/**
 * 名前の頭文字を返します。和文は 1 文字、欧文は語頭 2 文字までです。空の名前には空文字を返します
 */
export function initialsFromName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '';
  const first = firstCharacter(trimmed);
  if (singleCharScript.test(first)) return first;
  const words = trimmed.split(separator).filter(Boolean);
  return words
    .slice(0, 2)
    .map((word) => firstCharacter(word).toUpperCase())
    .join('');
}
