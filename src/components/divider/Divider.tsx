import type { ComponentProps, ReactNode } from 'react';
import type { VariantProps } from 'tailwind-variants';

import { dividerStyles } from '../../internal/reading/blocks';
import { tv } from '../../internal/tv';

// 区切り線（軸 58）。Markdown の --- と同じ <hr> を出す。上下の余白は置く側（Prose・ページ）が決める
// 既定は幅いっぱいの細い境界線（現行版）。短い線を中央に置く short（A）と、色のある短い太い線 accent（D）も選べる
// accent の色は color で選ぶ。ほかの色にするときは --divider-accent を上書きする
// 左右の端から空ける inset（--divider-inset。軸 410 で比べている途中）は、パネルの中の区切りに使う
// ページと同じレイヤーなので影は付けない（原則1）
// 既定の見た目（full）のクラス列は src/internal/reading/blocks.ts（Prose も同じものを使う）
const divider = tv({
  base: dividerStyles.base,
  variants: {
    variant: {
      full: dividerStyles.full,
      short: 'w-16 border-line',
      accent: 'w-12 border-t-(length:--border-width-thick) border-(color:--divider-accent)',
      inset: 'mx-(--divider-inset) w-auto border-line',
    },
    color: {
      brand: '[--divider-accent:var(--color-brand)]',
      primary: '[--divider-accent:var(--color-primary)]',
      secondary: '[--divider-accent:var(--color-secondary)]',
    },
  },
  defaultVariants: { variant: 'full', color: 'brand' },
});

// ラベル付きの線（軸 409 で比べている途中）。左右の細い線のあいだに、文字を真ん中に置く
//   文字が長くて折り返すときも、左右の線は短く残す（min-w-6）
//   文字の大きさ・色・太さ・線とのあいだは --divider-label-*
const labeled = tv({
  slots: {
    root: 'flex w-full min-w-0 items-center gap-(--divider-label-gap)',
    line: 'h-0 min-w-6 flex-1 border-0 border-t-(length:--border-width-thin) border-solid border-line',
    label: [
      'max-w-full shrink text-center text-(length:--divider-label-size) leading-(--divider-label-leading)',
      '[font-weight:var(--divider-label-weight)] text-(color:--divider-label-color)',
    ],
  },
});

// 縦の線（軸 410 で比べている途中）。横に並べた行の中に置く。長さと置き方は --divider-vertical-*
//   文の中（p の中）にも置けるよう span で描く。行の外では、周りの文字の高さの線にする
const vertical =
  'inline-block min-h-[1em] w-0 shrink-0 border-0 border-l-(length:--border-width-thin) border-solid border-line align-middle [align-self:var(--divider-vertical-align)] h-(--divider-vertical-length)';

/** 区切り線の見た目 */
export type DividerVariant = NonNullable<VariantProps<typeof divider>['variant']>;
/** accent の線の色 */
export type DividerColor = NonNullable<VariantProps<typeof divider>['color']>;
/** 線の向き */
export type DividerOrientation = 'horizontal' | 'vertical';

export interface DividerProps extends Omit<ComponentProps<'hr'>, 'color'> {
  /**
   * 見た目。full は幅いっぱいの細い線、short は中央に置く短い細い線、accent は中央に置く色のある短い太い線、
   * inset は左右の端を少し空けた細い線です。label があるときと、縦の線では使いません
   * @default 'full'
   */
  variant?: DividerVariant;
  /**
   * accent の線の色。brand は水色、primary・secondary は利用者が選ぶ色です。ほかの色は style で --divider-accent を上書きします
   * @default 'brand'
   */
  color?: DividerColor;
  /**
   * 線の向き。vertical は、横に並べたもの（ツールバー、リンクの並び、メタ情報の行）のあいだに置く縦の線です
   * @default 'horizontal'
   */
  orientation?: DividerOrientation;
  /**
   * 線の真ん中に置く文字（「または」など）。渡すと、左右の細い線のあいだに文字を置きます。
   * 文字は読み上げでもそのまま読まれ、線は読み上げから外れます。横の線だけで使えます
   */
  label?: ReactNode;
  /**
   * 見た目だけの区切りにします。true のときは読み上げで区切りと伝えません（話題の切れ目ではなく、飾りとして置くとき）
   * @default false
   */
  decorative?: boolean;
  /** 線の要素（hr。label があるときは外の要素、縦の線は span）に付きます */
  className?: string;
}

/**
 * 区切り線。文章の話題の切れ目や、横に並べたもののあいだに置きます
 */
export function Divider({
  variant,
  color,
  orientation = 'horizontal',
  label,
  decorative = false,
  className,
  ...props
}: DividerProps) {
  const hidden = decorative ? { role: 'presentation', 'aria-hidden': true as const } : {};
  if (orientation === 'vertical') {
    return (
      <span
        role="separator"
        aria-orientation="vertical"
        data-slot="divider"
        className={[vertical, className].filter(Boolean).join(' ')}
        {...hidden}
        {...props}
      />
    );
  }
  if (label != null && label !== false) {
    const s = labeled();
    // 区切りの役割（separator）は中身を読ませないので付けない。文字だけを読み、線は飾りとして外す
    return (
      <div data-slot="divider" className={s.root({ className })} {...props}>
        <span aria-hidden className={s.line()} />
        <span className={s.label()}>{label}</span>
        <span aria-hidden className={s.line()} />
      </div>
    );
  }
  return <hr className={divider({ variant, color, className })} {...hidden} {...props} />;
}
