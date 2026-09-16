// 部品の雛形。src/components/<kebab-name>/<Name>.tsx に写し、Example を部品の名前に置き換える
// 手順と決まりは CLAUDE.md の「部品を作る」
import type { ComponentProps } from 'react';
import type { VariantProps } from 'tailwind-variants';

import { focusRing } from '../../internal/focus-styles';
import { tv } from '../../internal/tv';

// 部品の見た目の考え（どの原則に従うか、どの ADR で決めたか）をここに短く書く。例: 原則5（小物は pill）、design/adr/NNNN
// 値は書かない。役割のトークン（Tailwind のクラス: bg-surface・text-fg-muted・h-control など）を先に使い、
// 役割にない値だけ、部品のトークン（design/tokens.css の :root、--example-*）を足して読む
const example = tv({
  base: [
    'inline-flex h-(--spacing-control) items-center gap-2 rounded-control px-(--spacing-control-x) text-(length:--text-control) leading-(--leading-control)',
    ...focusRing,
  ],
  variants: {
    // 利用者が選ぶ色（原則6）。指定しないときはグレー
    color: {
      primary: 'bg-primary-subtle text-on-primary-subtle',
      secondary: 'bg-secondary-subtle text-on-secondary-subtle',
      neutral: 'bg-neutral text-fg-muted',
    },
  },
  defaultVariants: { color: 'neutral' },
});

export interface ExampleProps
  extends Omit<ComponentProps<'span'>, 'color'>, VariantProps<typeof example> {
  /**
   * 色。primary・secondary は利用者が選ぶ色、neutral は色を持たないグレーです（原則6）
   * @default 'neutral'
   */
  color?: VariantProps<typeof example>['color'];
}

/**
 * 部品の一行の説明（Storybook の Docs の見出しの下に出る）
 */
export function Example({ color, className, ...props }: ExampleProps) {
  return <span className={example({ color, className })} {...props} />;
}
