import type { ComponentProps } from 'react';
import type { VariantProps } from 'tailwind-variants';

import { dividerStyles } from '../../internal/reading/blocks';
import { tv } from '../../internal/tv';

// 区切り線（軸 58）。Markdown の --- と同じ <hr> を出す。上下の余白は置く側（Prose・ページ）が決める
// 既定は幅いっぱいの細い境界線（現行版）。短い線を中央に置く short（A）と、色のある短い太い線 accent（D）も選べる
// accent の色は color で選ぶ。ほかの色にするときは --divider-accent を上書きする
// ページと同じレイヤーなので影は付けない（原則1）
// 既定の見た目（full）のクラス列は src/internal/reading/blocks.ts（Prose も同じものを使う）
const divider = tv({
  base: dividerStyles.base,
  variants: {
    appearance: {
      full: dividerStyles.full,
      short: 'w-16 border-line',
      accent: 'w-12 border-t-(length:--border-width-thick) border-(color:--divider-accent)',
    },
    color: {
      brand: '[--divider-accent:var(--color-brand)]',
      primary: '[--divider-accent:var(--color-primary)]',
      secondary: '[--divider-accent:var(--color-secondary)]',
    },
  },
  defaultVariants: { appearance: 'full', color: 'brand' },
});

export interface DividerProps
  extends Omit<ComponentProps<'hr'>, 'color'>, VariantProps<typeof divider> {
  /**
   * 見た目。full は幅いっぱいの細い線、short は中央に置く短い細い線、accent は中央に置く色のある短い太い線です
   * @default 'full'
   */
  appearance?: VariantProps<typeof divider>['appearance'];
  /**
   * accent の線の色。brand は水色、primary・secondary は利用者が選ぶ色です。ほかの色は style で --divider-accent を上書きします
   * @default 'brand'
   */
  color?: VariantProps<typeof divider>['color'];
  /**
   * 見た目だけの区切りにします。true のときは読み上げで区切りと伝えません（話題の切れ目ではなく、飾りとして置くとき）
   * @default false
   */
  decorative?: boolean;
}

/**
 * 区切り線。文章の話題の切れ目に置きます
 */
export function Divider({
  appearance,
  color,
  decorative = false,
  className,
  ...props
}: DividerProps) {
  return (
    <hr
      className={divider({ appearance, color, className })}
      {...(decorative ? { role: 'presentation', 'aria-hidden': true } : {})}
      {...props}
    />
  );
}
