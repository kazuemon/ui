// 文字数の数え方。見えている 1 文字（書記素）で数える
// 絵文字（👨‍👩‍👧‍👦・🇯🇵）や濁点を分けて書いた文字は、JavaScript の文字数（String.length）では 2 つ以上になる。
// 見えている数と違う数を出すと、打った人には減り方が読めないので、Intl.Segmenter で書記素に切って数える
let cached: Intl.Segmenter | null | undefined;

function segmenter() {
  if (cached === undefined) {
    cached =
      typeof Intl.Segmenter === 'function'
        ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
        : null;
  }
  return cached;
}

/** 見えている文字（書記素）の数。Intl.Segmenter がないときは、コードポイントで数える */
export function countGraphemes(text: string): number {
  const segments = segmenter();
  if (!segments) return Array.from(text).length;
  let count = 0;
  for (const _ of segments.segment(text)) count++;
  return count;
}
