import type { Mask, MaskTokens } from 'maska';

import type { MaskFieldMask } from './MaskField';

// maska の既定の桁の記号と、受け付ける文字
const defaultTokens: Record<string, RegExp> = {
  '#': /[0-9]/,
  '@': /[a-zA-Z]/,
  '*': /[a-zA-Z0-9]/,
};

// 桁の見本の文字。その桁が受け付ける文字のうち、最初に当てはまるものを使う（数字の桁は 0、英字の桁は A）
const sampleChars = ['0', 'A', 'a'];

/**
 * 見本の 1 文字。token は桁（見本の印を描く）、そうでなければ記号（そのまま描く）。
 * sample は、その桁に打てる文字の見本（数字の桁は 0、英字の桁は A）
 */
export interface HintCell {
  char: string;
  token: boolean;
  sample: string;
}

/** 書式の文字を、桁と記号に分ける。「!」は次の 1 文字を記号として扱う（maska と同じ） */
function parse(mask: string, patterns: Record<string, RegExp | undefined>) {
  const cells: HintCell[] = [];
  for (let i = 0; i < mask.length; i++) {
    const char = mask[i];
    if (char === '!' && i + 1 < mask.length) {
      const escaped = mask[++i];
      cells.push({ char: escaped, token: false, sample: escaped });
    } else if (char in patterns) {
      const pattern = patterns[char];
      const sample = sampleChars.find((c) => pattern?.test(c)) ?? '0';
      cells.push({ char, token: true, sample });
    } else {
      cells.push({ char, token: false, sample: char });
    }
  }
  return cells;
}

/**
 * 打った値のあとに続く、残りの桁の見本（'123-4' なら桁 3 つ）
 * 書式が配列のときは、いまの値にその書式を当てると同じ形になる、いちばん短い書式を使う
 */
export function hintRest(
  value: string,
  mask: MaskFieldMask,
  masker: Mask,
  tokens: MaskTokens | undefined
): HintCell[] {
  const patterns: Record<string, RegExp | undefined> = { ...defaultTokens };
  for (const [key, token] of Object.entries(tokens ?? {})) patterns[key] = token.pattern;
  let chosen: string;
  if (typeof mask === 'function') chosen = mask(value);
  else if (typeof mask === 'string') chosen = mask;
  else {
    const unmasked = masker.unmasked(value);
    const sorted = [...mask].sort((a, b) => a.length - b.length);
    chosen =
      sorted.find((m) => {
        const cells = parse(m, patterns);
        return cells.filter((cell) => cell.token).length >= unmasked.length;
      }) ??
      sorted.at(-1) ??
      '';
  }
  return parse(chosen, patterns).slice(value.length);
}
