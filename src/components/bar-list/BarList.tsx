import type { ComponentProps, ReactNode } from 'react';
import type { VariantProps } from 'tailwind-variants';

import { tv } from '../../internal/tv';

// 名前と値の並びを、値の大きさの棒で見せる一覧（よく読まれた記事、流入元、使った言語の割合）
// 押さないので hover も影もない。ページと同じレイヤー（原則1）。カードに載せたいときは Card と組み合わせる
// 並び順は部品が決めない（原則20）。渡した順に上から並べる。多い順に見せたいときは、使う側が並べ替えて渡す
// 棒の長さは、いちばん大きい値（または max）を 100% とした割合
// 形は 2 つ（variant）
//   overlay: 名前を棒の上に重ねる。棒は部品の色を透かした淡い面で、名前は本文の色のまま読める
//   below: 名前と値の行の下に、Meter と同じ細い棒を置く。棒は部品の色の濃い塗りで、地は敷かない
// 色は利用者が選ぶ（原則6）。指定しないときは濃いグレー（Meter と同じ）。brand はグラフの系列の 1 番（ADR-0531）
// 読み上げは ul・li で、行ごとに名前と値を読む。棒は値の文字と同じことを示すので読まない（原則6: 色や長さだけで伝えない）
const barList = tv({
  slots: {
    root: 'flex flex-col gap-(--bar-list-row-gap)',
    item: 'grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3',
    label: 'min-w-0 truncate text-(length:--text-body) leading-(--leading-body) text-fg',
    value:
      'text-(length:--text-body) leading-(--leading-body) whitespace-nowrap text-fg-muted tabular-nums',
    bar: 'pointer-events-none',
  },
  variants: {
    variant: {
      overlay: {
        item: 'h-(--bar-list-row-height)',
        label: 'relative col-start-1 row-start-1 px-2',
        value: 'col-start-2 row-start-1',
        bar: [
          'col-start-1 row-start-1 h-full self-stretch rounded-md',
          'bg-[color-mix(in_oklab,var(--bar-list-color)_var(--bar-list-fill-mix),transparent)]',
        ],
      },
      below: {
        item: 'gap-y-(--spacing-field-gap)',
        label: 'col-start-1 row-start-1',
        value: 'col-start-2 row-start-1',
        bar: 'col-span-full row-start-2 h-(--bar-list-bar-height) rounded-pill bg-(color:--bar-list-color)',
      },
    },
    color: {
      brand: { root: '[--bar-list-color:var(--color-series-1)]' },
      primary: { root: '[--bar-list-color:var(--color-primary)]' },
      secondary: { root: '[--bar-list-color:var(--color-secondary)]' },
      neutral: { root: '[--bar-list-color:var(--color-neutral-strong)]' },
    },
  },
  defaultVariants: { variant: 'overlay', color: 'neutral' },
});

/** 棒の色。brand は水色、primary・secondary は利用者が選ぶ色、neutral は濃いグレー */
export type BarListColor = NonNullable<VariantProps<typeof barList>['color']>;
/** 見た目の型。overlay は名前を棒に重ね、below は名前の下に細い棒を置く */
export type BarListVariant = NonNullable<VariantProps<typeof barList>['variant']>;

/** 一覧の 1 行 */
export interface BarListItem {
  /** 行の名前 */
  label: ReactNode;
  /** 行の値。棒の長さになります。0 より小さい値は 0 として描きます */
  value: number;
  /** 行の右に出す値の文字（「1.2 万」など）。書かないときは format で整えた値です */
  valueText?: string;
  /** 行を見分ける key。書かないときは並びの順を使います */
  key?: string | number;
}

export interface BarListProps extends Omit<ComponentProps<'ul'>, 'color' | 'children'> {
  /** 行の並び。渡した順に上から並べます */
  items: readonly BarListItem[];
  /** 棒の長さの 100% にする値。渡さないときは、いちばん大きい値です */
  max?: number;
  /**
   * 見た目の型。overlay は名前を棒に重ね、below は名前の下に細い棒を置きます
   * @default 'overlay'
   */
  variant?: BarListVariant;
  /**
   * 棒の色
   * @default 'neutral'
   */
  color?: BarListColor;
  /** 値を整える Intl.NumberFormat の指定。渡さないときは桁区切りだけを付けます */
  format?: Intl.NumberFormatOptions;
  /** 値を整えるときのロケール。既定はブラウザのロケールです */
  locale?: Intl.LocalesArgument;
  /** いちばん外の要素（ul）に付きます */
  className?: string;
}

/**
 * 名前と値の並びを、値の大きさの棒で見せる一覧です
 */
export function BarList({
  items,
  max,
  variant,
  color,
  format,
  locale,
  className,
  ...props
}: BarListProps) {
  const styles = barList({ variant, color });
  const clamp = (value: number) => (Number.isFinite(value) ? Math.max(value, 0) : 0);
  const upper = max ?? Math.max(0, ...items.map((item) => clamp(item.value)));
  const formatter = new Intl.NumberFormat(locale, format);
  return (
    <ul data-slot="bar-list" className={styles.root({ className })} {...props}>
      {items.map((item, i) => {
        const ratio = upper > 0 ? Math.min(clamp(item.value) / upper, 1) : 0;
        return (
          <li key={item.key ?? i} data-slot="bar-list-item" className={styles.item()}>
            <span
              aria-hidden
              data-slot="bar-list-bar"
              className={styles.bar()}
              style={{ width: `${ratio * 100}%` }}
            />
            <span className={styles.label()}>{item.label}</span>
            <span className={styles.value()}>
              {item.valueText ?? formatter.format(clamp(item.value))}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
