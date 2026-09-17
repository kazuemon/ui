import type { ComponentProps, ReactNode } from 'react';
import type { VariantProps } from 'tailwind-variants';

import { blockquoteStyles } from '../../internal/reading/blocks';
import { tv } from '../../internal/tv';

// 引用（軸 54）。ページと同じレイヤーなので影は付けない（原則1）
// 既定は左の線（line）。入力欄の塗りの面（surface）も選べる。面の角は部品の角（原則5）
// 線とアイコンの色は color で選ぶ。neutral は細い境界線のグレーの線と、キャプションと同じグレーのアイコン
// icon は、お知らせと同じく 1 行目の中央にそろえる（行の高さとアイコンの差の半分だけ下げる）
// 引用の要素（body）の既定の見た目（line・neutral）のクラス列は src/internal/reading/blocks.ts（Prose も同じものを使う）
const blockquote = tv({
  slots: {
    root: 'flex flex-col gap-2',
    body: blockquoteStyles.body,
    icon: 'mt-[calc((var(--leading-body)-var(--spacing-icon))/2)] flex shrink-0 text-(color:--blockquote-icon) [&_svg]:size-(--spacing-icon)',
    content: 'min-w-0 flex-1',
    cite: 'text-body-sm text-fg-subtle',
  },
  variants: {
    appearance: {
      line: {
        body: blockquoteStyles.line,
        cite: 'pl-4',
      },
      surface: {
        body: 'rounded-control bg-field px-4 py-3',
        cite: 'px-4',
      },
    },
    color: {
      neutral: {
        body: blockquoteStyles.neutral,
      },
      brand: {
        body: '[--blockquote-icon:var(--color-fg-brand)] [--blockquote-line:var(--color-brand)]',
      },
      primary: {
        body: '[--blockquote-icon:var(--color-primary)] [--blockquote-line:var(--color-primary)]',
      },
      secondary: {
        body: '[--blockquote-icon:var(--color-fg-secondary)] [--blockquote-line:var(--color-secondary)]',
      },
    },
  },
  defaultVariants: { appearance: 'line', color: 'neutral' },
});

export interface BlockquoteProps
  extends Omit<ComponentProps<'blockquote'>, 'color'>, VariantProps<typeof blockquote> {
  /**
   * 見た目。line は左に線、surface は入力欄と同じグレーの面です
   * @default 'line'
   */
  appearance?: VariantProps<typeof blockquote>['appearance'];
  /**
   * 線とアイコンの色。neutral はグレー、brand は水色、primary・secondary は利用者が選ぶ色です。
   * surface では面の色は変わらず、アイコンの色だけが変わります
   * @default 'neutral'
   */
  color?: VariantProps<typeof blockquote>['color'];
  /** 1 行目の左に置くアイコン（引用符など）。文と並ぶので、線の細い形を使います */
  icon?: ReactNode;
  /** 出典。引用の下に小さく出します。URL は cite 属性に渡します */
  source?: ReactNode;
}

/**
 * 引用
 */
export function Blockquote({
  appearance,
  color,
  icon,
  source,
  className,
  children,
  ...props
}: BlockquoteProps) {
  const styles = blockquote({ appearance, color });
  const quote = (
    <blockquote
      className={styles.body({ className: source == null ? className : undefined })}
      {...props}
    >
      {icon ? (
        <span aria-hidden="true" className={styles.icon()}>
          {icon}
        </span>
      ) : null}
      <div className={styles.content()}>{children}</div>
    </blockquote>
  );
  if (source == null) return quote;
  return (
    <figure className={styles.root({ className })}>
      {quote}
      <figcaption className={styles.cite()}>{source}</figcaption>
    </figure>
  );
}
