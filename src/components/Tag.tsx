import type { ComponentProps } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

// タグ（ユーザーの呼び方は「チップ」）。原則5: 小物は pill
// 淡い面に、同じ色相の濃い文字を載せる（design/adr/0007 の塗り方）。色は利用者が選ぶ（原則6）
// 指定しないときはグレー（neutral）— design/adr/0028。大きさは仮
// 状態を表す色（info・success・warning・danger）は、利用者が選ぶ色とは別。お知らせの soft と同じ面と文字
//   warning — design/adr/0038。info・success・danger — design/adr/0043（info は primary と同じ値）
const tag = tv({
  base: 'inline-flex items-center rounded-pill px-2 py-0.5 text-(length:--text-caption) leading-(--leading-caption) font-bold whitespace-nowrap',
  variants: {
    color: {
      primary: 'bg-tag-primary text-on-tag-primary',
      secondary: 'bg-tag-secondary text-on-tag-secondary',
      neutral: 'bg-tag-neutral text-on-tag-neutral',
      info: 'bg-tag-info text-on-tag-info',
      success: 'bg-tag-success text-on-tag-success',
      warning: 'bg-tag-warning text-on-tag-warning',
      danger: 'bg-tag-danger text-on-tag-danger',
    },
  },
  defaultVariants: { color: 'neutral' },
});

export interface TagProps extends Omit<ComponentProps<'span'>, 'color'>, VariantProps<typeof tag> {
  /**
   * 色。primary・secondary・neutral は利用者が選ぶ色（原則6）で、指定しないときは既定のグレー（neutral）になります。
   * info・success・warning・danger は状態を表す色で、淡い面のお知らせ（soft）の面と題と同じ値です（design/adr/0038・0043）
   * @default 'neutral'
   */
  color?: VariantProps<typeof tag>['color'];
}

/**
 * タグ
 */
export function Tag({ color, className, ...props }: TagProps) {
  return <span className={tag({ color, className })} {...props} />;
}
