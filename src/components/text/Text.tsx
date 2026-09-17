import type { ComponentProps } from 'react';
import type { VariantProps } from 'tailwind-variants';

import { textLinkSizeReset } from '../../internal/reading/text-link';
import { textStyles } from '../../internal/reading/text';
import { tv } from '../../internal/tv';

// 読む文字（段落・注記）。見た目のクラス列は src/internal/reading/text.ts（Prose も同じものを使う）
const text = tv({
  base: textLinkSizeReset,
  variants: {
    size: textStyles.size,
    tone: textStyles.tone,
  },
  defaultVariants: { size: 'md', tone: 'default' },
});

export interface TextProps extends ComponentProps<'p'>, VariantProps<typeof text> {
  /**
   * 描く要素。段落は p、文の中の一部は span、ほかの部品を含むときは div にします
   * @default 'p'
   */
  as?: 'p' | 'span' | 'div';
  /**
   * 大きさ。md は本文、sm は日付や注記のような本文より小さい文です
   * @default 'md'
   */
  size?: VariantProps<typeof text>['size'];
  /**
   * 濃さ。default は本文、muted は補足、subtle は日付や注記のような目立たせない文です
   * @default 'default'
   */
  tone?: VariantProps<typeof text>['tone'];
}

/**
 * 本文の文字
 */
export function Text({ as: Tag = 'p', size, tone, className, ...props }: TextProps) {
  return <Tag className={text({ size, tone, className })} {...props} />;
}
