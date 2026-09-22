import type { ComponentProps, ReactNode } from 'react';
import type { VariantProps } from 'tailwind-variants';

import { type SmallPartsSize, tagSizeClass } from '../../internal/small-parts-size';
import { tv } from '../../internal/tv';

// タグ（分類や「公開中」などの状態を表す、押せない文字のラベル）。原則5: 小物は pill
// 数と小さな状態の点は Badge、押せる・消せる小物は Chip として分ける
// 淡い面に、同じ色相の濃い文字を載せる（design/adr/0007 の塗り方）。色は利用者が選ぶ（原則6）
// 指定しないときはグレー（neutral）— design/adr/0028
// 状態を表す色（info・success・warning・danger）は、利用者が選ぶ色とは別。お知らせの soft と同じ面と文字
//   warning — design/adr/0038。info・success・danger — design/adr/0043（info は primary と同じ値）
// 大きさ（sm・md・lg・inherit）は Tag・Badge・Chip 共通の 1 本の軸 — ADR-0259（値は src/internal/small-parts-size.ts）
const tag = tv({
  base: [
    'inline-flex items-center rounded-pill font-bold whitespace-nowrap',
    // 大きさは size 変化が --tag-*（src/internal/small-parts-size.ts）を差し替える
    'h-[var(--tag-height)]',
    'px-[var(--tag-pad-x)]',
    'text-[length:var(--tag-font)]',
    'leading-[var(--tag-leading)]',
  ],
  variants: {
    color: {
      primary: 'bg-primary-subtle text-on-primary-subtle',
      secondary: 'bg-secondary-subtle text-on-secondary-subtle',
      neutral: 'bg-neutral text-fg-muted',
      info: 'bg-info-subtle text-fg-info',
      success: 'bg-success-subtle text-fg-success',
      warning: 'bg-warning-subtle text-fg-warning',
      danger: 'bg-danger-subtle text-fg-danger',
    },
    size: tagSizeClass,
  },
  defaultVariants: { color: 'neutral', size: 'sm' },
});

export interface TagProps extends Omit<ComponentProps<'span'>, 'color'>, VariantProps<typeof tag> {
  /**
   * 色。primary・secondary・neutral は利用者が選ぶ色（原則6）で、指定しないときは既定のグレー（neutral）になります。
   * info・success・warning・danger は状態を表す色で、淡い面のお知らせ（soft）の面と題と同じ値です（design/adr/0038・0043）
   * @default 'neutral'
   */
  color?: VariantProps<typeof tag>['color'];
  /**
   * 大きさ。sm は今までの高さ（20px）、md は欄の中のチップと同じ高さ、lg は部品の高さと同じです。
   * inherit は段を持たず、周りの文字の大きさ（em）に従います。Tag・Badge・Chip で共通の軸です（ADR-0259）
   * @default 'sm'
   */
  size?: SmallPartsSize;
  /** タグの文字（分類や「公開中」などの状態） */
  children?: ReactNode;
  /** タグ（span）に付きます */
  className?: string;
}

/**
 * タグ
 */
export function Tag({ color, size, className, ...props }: TagProps) {
  return <span className={tag({ color, size, className })} {...props} />;
}
