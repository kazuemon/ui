import type { ComponentProps } from 'react';
import type { VariantProps } from 'tailwind-variants';

import { CheckCircleIcon, InfoIcon, WarningCircleIcon, WarningIcon } from '../../internal/icons';
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
    color: textStyles.color,
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
/** 意味の色 */
export type TextColor = NonNullable<VariantProps<typeof text>['color']>;

// 意味の色の形（原則6: 色だけでなく形でも見分ける）。お知らせ・欄の下の行と同じ割り当て
// 出すかどうかは --text-status-icon-display（軸 444 で比較中）。大きさと縦の位置は Icon の text と同じ（周りの文字に比例）
const statusIcons = {
  info: InfoIcon,
  success: CheckCircleIcon,
  warning: WarningIcon,
  danger: WarningCircleIcon,
} as const;
const statusIconClass =
  'me-[0.25em] [display:var(--text-status-icon-display)] size-(--icon-size-text) shrink-0 align-[calc(var(--icon-text-center)-var(--icon-size-text)/2)] text-(color:--text-status-color)';

export interface TextProps extends Omit<ComponentProps<'p'>, 'color'> {
  /**
   * 描く要素。段落は p、文の中の一部は span、ほかの部品を含むときは div にします。
   * strong・em・del は、文の中の強調・強勢・打ち消しです（記事の本文と同じ飾りが付きます）
   * @default 'p'
   */
  as?: TextAs;
  /**
   * 大きさ。Heading の size と同じ段の名前です。md は本文、sm は日付や注記のような本文より小さい文、xs はキャプションと同じ大きさです（指で操作するときは sm と同じ大きさで、行の高さだけが詰まります）。
   * lg〜5xl は見出しの段と同じ大きさで、料金の「¥980」のように見出しではない大きな文字に使います（太さは weight で選びます）。
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
  /**
   * 意味の色。期日を過ぎた・保存した・注意が要るといった状態を、文字の色と前に置く形（丸の「!」・丸のチェック・三角・丸の「i」）で示します。
   * 色は白地の状態の色で、warning はオリーブです。書かないときは variant の濃さのままです。色を付けた文字は、variant の濃さより色が勝ちます
   */
  color?: TextColor;
  /** 読む文字。文の中の一部にするときは as を span にします */
  children?: ComponentProps<'p'>['children'];
  /** 描いた要素に付きます */
  className?: string;
}

/**
 * 本文の文字
 */
export function Text({
  as = 'p',
  size,
  variant,
  weight,
  color,
  className,
  children,
  ...props
}: TextProps) {
  // props は段落（p）の型で受ける。描く要素だけが変わる
  const Tag = as as 'p';
  const StatusIcon = color ? statusIcons[color] : undefined;
  return (
    <Tag
      className={text({ size, variant, weight, color, as, className })}
      data-color={color}
      {...props}
    >
      {StatusIcon ? <StatusIcon className={statusIconClass} /> : null}
      {children}
    </Tag>
  );
}
