import type { ComponentProps } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

// タグ（ユーザーの呼び方は「チップ」）。原則5: 小物は pill
// 淡い面に、同じ色相の濃い文字を載せる（design/adr/0007 の塗り方）。色は利用者が選ぶ（原則6）
// 指定しないときはグレー（neutral）— design/adr/0028。大きさは仮
const tag = tv({
  base: 'inline-flex items-center rounded-pill px-2 py-0.5 text-(length:--text-caption) leading-(--leading-caption) font-bold whitespace-nowrap',
  variants: {
    color: {
      primary: 'bg-tag-primary text-on-tag-primary',
      secondary: 'bg-tag-secondary text-on-tag-secondary',
      neutral: 'bg-tag-neutral text-on-tag-neutral',
    },
  },
  defaultVariants: { color: 'neutral' },
});

export interface TagProps extends Omit<ComponentProps<'span'>, 'color'>, VariantProps<typeof tag> {}

/**
 * タグ
 */
export function Tag({ color, className, ...props }: TagProps) {
  return <span className={tag({ color, className })} {...props} />;
}
