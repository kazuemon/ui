import type { ComponentProps } from 'react';

import { headingStyles } from '../../internal/reading/heading';
import { textLinkSizeReset } from '../../internal/reading/text-link';
import { tv } from '../../internal/tv';

// 見出し。段（level）は文書の構造、大きさ（size）は見た目で、既定では段と同じ大きさになる
// 読む文字の大きさは密度で変わる（原則11）。行の高さは整数 px（原則10）
// 英語のサブ（原則10 の和欧併記）は持たない。レイアウト層で組む（原則9）
// 折り返し（text-wrap: balance、word-break: auto-phrase など）は部品で決めず、利用者が className で付ける
// 大きさは軸 51 の E（マウスで 28・22・18・16、指で 24・20・16・14。読みものの中ではマウスと同じ）。文字は本文と同じ濃紺
// 見た目のクラス列は src/internal/reading/heading.ts（Prose も同じものを使う）
const heading = tv({
  base: [headingStyles.base, textLinkSizeReset],
  variants: {
    size: headingStyles.size,
  },
});

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingSize = 1 | 2 | 3 | 4;

// 段から既定の大きさ。5・6 段は 4
const sizeOfLevel = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 4, 6: 4 } as const satisfies Record<
  HeadingLevel,
  HeadingSize
>;

export interface HeadingProps extends ComponentProps<'h2'> {
  /**
   * 見出しの段。h1〜h6 のどれで描くかを決めます。文書の構造に合わせ、段を飛ばさないようにします
   * @default 2
   */
  level?: HeadingLevel;
  /**
   * 見た目の大きさ（1 が最も大きい）。指定しないときは段と同じで、5・6 段は 4 になります。
   * 構造と見た目を分けたいとき（カードの中の h3 を小さく見せるなど）に使います
   */
  size?: HeadingSize;
}

/**
 * 見出し
 */
export function Heading({ level = 2, size, className, ...props }: HeadingProps) {
  const Tag = `h${level}` as const;
  return <Tag className={heading({ size: size ?? sizeOfLevel[level], className })} {...props} />;
}
