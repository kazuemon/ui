import type { ComponentProps } from 'react';

import { headingStyles } from '../../internal/reading/heading';
import { textLinkSizeReset } from '../../internal/reading/text-link';
import { tv } from '../../internal/tv';

// 見出し。段（level）は文書の構造、大きさ（size）は見た目で、既定では段と同じ大きさになる
// 読む文字の大きさは密度で変わる（原則11）。行の高さは整数 px（原則10）
// 英語のサブ（原則10 の和欧併記）は持たない。レイアウト層で組む（原則9）
// 折り返し（text-wrap: balance、word-break: auto-phrase など）は部品で決めず、利用者が className で付ける
// 大きさは Text と共有する段の名前（ADR-0369）。md〜2xl は軸 51 の E（マウスで 16・18・22・28、指で 14・16・20・24。読みものの中ではマウスと同じ）、
// 3xl〜5xl は Hero・節の大見出しの段（マウスで 36・44・56、指で 28・32・40 — ADR-0368）。文字は本文と同じ濃紺
// 見た目のクラス列は src/internal/reading/heading.ts（Prose も同じものを使う）
const heading = tv({
  base: [headingStyles.base, textLinkSizeReset],
  variants: {
    size: headingStyles.size,
  },
});

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
/** 見出しの大きさ。Text の size と同じ段の名前で、md が本文と同じ大きさ（ADR-0369） */
export type HeadingSize = 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';

// 段から既定の大きさ。h1 は 2xl、h2 は xl、h3 は lg、h4〜h6 は md。3xl〜5xl は size で選ぶ
const sizeOfLevel = {
  1: '2xl',
  2: 'xl',
  3: 'lg',
  4: 'md',
  5: 'md',
  6: 'md',
} as const satisfies Record<HeadingLevel, HeadingSize>;

export interface HeadingProps extends ComponentProps<'h2'> {
  /**
   * 見出しの段。h1〜h6 のどれで描くかを決めます。文書の構造に合わせ、段を飛ばさないようにします
   * @default 2
   */
  level?: HeadingLevel;
  /**
   * 見た目の大きさ。Text の size と同じ段の名前で、md が本文と同じ大きさです。
   * 指定しないときは段から決まり、h1 は 2xl、h2 は xl、h3 は lg、h4〜h6 は md です。
   * 構造と見た目を分けたいとき（カードの中の h3 を小さく見せるなど）と、Hero や節の大見出し（3xl〜5xl）に使います
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
