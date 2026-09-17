import type { ComponentProps } from 'react';
import type { VariantProps } from 'tailwind-variants';

import { codeStyles } from '../../internal/reading/code';
import { tv } from '../../internal/tv';

// 文中のコード。見た目のクラス列は src/internal/reading/code.ts（Prose も同じものを使う）
const code = tv({
  base: codeStyles.base,
  variants: {
    wrap: codeStyles.wrap,
  },
  defaultVariants: { wrap: 'normal' },
});

export interface CodeProps extends ComponentProps<'code'>, VariantProps<typeof code> {
  /**
   * 折り返し方。normal は空白やハイフンのあとで折り返し、1 行に収まらないときだけ語の途中でも折ります。
   * nowrap は折り返さず、幅に収まらないとはみ出します（短い識別子やキーの名前に使います）
   * @default 'normal'
   */
  wrap?: VariantProps<typeof code>['wrap'];
}

/**
 * 文中のコード
 */
export function Code({ wrap, className, ...props }: CodeProps) {
  return <code className={code({ wrap, className })} {...props} />;
}
