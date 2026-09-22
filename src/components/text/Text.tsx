import type { ComponentProps } from 'react';
import type { VariantProps } from 'tailwind-variants';

import { inlineStyles } from '../../internal/reading/inline';
import { textLinkSizeReset } from '../../internal/reading/text-link';
import { textStyles } from '../../internal/reading/text';
import { tv } from '../../internal/tv';

// 読む文字（段落・注記）。見た目のクラス列は src/internal/reading/text.ts（Prose も同じものを使う）
// variant は濃さ（body・muted・subtle）と、欄と同じ見た目の組（label・caption）。label・caption は大きさ・太さ・色をまとめて決めるので、
//   size より後ろに置いて勝たせる（weight はさらに後ろ。太さだけを上書きできる）
// as に strong・em・del を選ぶと、Prose が素の HTML に当てるのと同じ飾り（src/internal/reading/inline.ts）が付く
const inline = inlineStyles();

const text = tv({
  base: textLinkSizeReset,
  variants: {
    size: textStyles.size,
    variant: { ...textStyles.variant, ...textStyles.fieldVariant },
    weight: textStyles.weight,
    as: {
      p: '',
      span: '',
      div: '',
      strong: inline.strong(),
      em: inline.em(),
      del: inline.del(),
    },
  },
  defaultVariants: { size: 'md', variant: 'body' },
});

/** 描く要素 */
export type TextAs = 'p' | 'span' | 'div' | 'strong' | 'em' | 'del';
/** 大きさの段 */
export type TextSize = NonNullable<VariantProps<typeof text>['size']>;
/** 文字の見た目の型 */
export type TextVariant = NonNullable<VariantProps<typeof text>['variant']>;
/** 文字の太さ */
export type TextWeight = NonNullable<VariantProps<typeof text>['weight']>;

export interface TextProps extends ComponentProps<'p'> {
  /**
   * 描く要素。段落は p、文の中の一部は span、ほかの部品を含むときは div にします。
   * strong・em・del は、文の中の強調・強勢・打ち消しです（記事の本文と同じ飾りが付きます）
   * @default 'p'
   */
  as?: TextAs;
  /**
   * 大きさ。md は本文、sm は日付や注記のような本文より小さい文です。
   * variant が label・caption のときは、その段の大きさになります
   * @default 'md'
   */
  size?: TextSize;
  /**
   * 見た目。body は本文、muted は補足、subtle は日付や注記のような目立たせない文です。
   * label は欄のラベルと同じ大きさ・太さ・色、caption は欄のキャプションと同じ大きさ・色です
   * @default 'body'
   */
  variant?: TextVariant;
  /**
   * 文字の太さ。書かないと、variant と要素の既定の太さのままです（label は太字、strong は太字）
   */
  weight?: TextWeight;
  /** 読む文字。文の中の一部にするときは as を span にします */
  children?: ComponentProps<'p'>['children'];
  /** 描いた要素に付きます */
  className?: string;
}

/**
 * 本文の文字
 */
export function Text({ as = 'p', size, variant, weight, className, ...props }: TextProps) {
  // props は段落（p）の型で受ける。描く要素だけが変わる
  const Tag = as as 'p';
  return <Tag className={text({ size, variant, weight, as, className })} {...props} />;
}
