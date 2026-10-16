import type { ComponentProps, CSSProperties, ReactNode } from 'react';
import type { VariantProps } from 'tailwind-variants';

import { tv } from '../../internal/tv';
import { chartMarker, type ChartMarkerType, seriesColor } from './ChartMarker';

// hover した位置の値を見せるカード。グラフのライブラリが hover の判定と置き場所を持ち、この部品は中身の見た目だけを持つ
//   Recharts なら <Tooltip content={...}> に渡す。出す・出さないもライブラリが決める
// 面は Tooltip と同じ（白・細い輪郭・小さく淡い影・部品の角）。重なる面の仲間（原則1）
// 中身は、題（日付など）の下に「色の印・系列の名前・値」の行を並べる。値は右にそろえ、桁を等幅にする
// 色だけで伝えない（原則6）: 行ごとに名前を書く
// 中身の濃さは variant で選ぶ（ADR-0541）
//   value: 題を淡い文字のふつうの太さに下げ、値を太字にする。既定。hover して見たいのは数字なので、数字が先に目に入る
//   even: 題と値をやや太く、名前を淡くする
//   divided: 題を太字にし、下に細い線を引いて行と分ける
// 文字の大きさは size。sm はキャプション（既定）、md はラベルの大きさで、カードが大きくなり線を広く隠す
const chartTooltip = tv({
  slots: {
    root: [
      'pointer-events-none min-w-(--chart-tooltip-min-width) rounded-control border-(length:--border-width-thin) border-surface-line bg-surface',
      'px-(--chart-tooltip-padding-x) py-(--chart-tooltip-padding-y) [box-shadow:var(--shadow-tooltip)]',
      'text-fg',
    ],
    title: 'mb-(--chart-tooltip-row-gap)',
    list: 'm-0 grid list-none grid-cols-[auto_minmax(0,1fr)_auto] gap-x-2 gap-y-(--chart-tooltip-row-gap) p-0',
    row: 'col-span-full grid grid-cols-subgrid items-center',
    label: 'min-w-0 truncate text-fg-muted',
    value: 'text-end whitespace-nowrap tabular-nums',
  },
  variants: {
    variant: {
      value: { title: 'font-normal text-fg-muted', value: 'font-bold' },
      even: { title: 'font-medium text-fg', value: 'font-medium' },
      divided: {
        title: [
          'mb-(--chart-tooltip-divider-gap) border-b-(length:--border-width-thin) border-line pb-(--chart-tooltip-divider-pad)',
          'font-bold text-fg',
        ],
        value: 'font-medium',
      },
    },
    size: {
      sm: { root: 'text-(length:--text-caption) leading-(--leading-caption)' },
      md: { root: 'text-(length:--text-label) leading-(--leading-label)' },
    },
  },
  defaultVariants: { variant: 'value', size: 'sm' },
});

/** 中身の濃さ。value は値を太く題を淡く、even は題と値をやや太く、divided は題を太字にして下に線を引く */
export type ChartTooltipVariant = NonNullable<VariantProps<typeof chartTooltip>['variant']>;
/** 文字の大きさ。sm はキャプション、md はラベルの大きさ */
export type ChartTooltipSize = NonNullable<VariantProps<typeof chartTooltip>['size']>;

/** カードの 1 行 */
export interface ChartTooltipItem {
  /** 系列の名前 */
  label: ReactNode;
  /** 値。整えた文字（「1,240 件」など）を渡します */
  value: ReactNode;
  /**
   * 印の色（CSS の色）。グラフの線に渡した色と同じものを渡します。Recharts なら payload の color です。
   * 渡さないときは、並びの順に系列の色（1 番から）です
   */
  color?: string;
}

export interface ChartTooltipProps extends Omit<ComponentProps<'div'>, 'children' | 'title'> {
  /** 題。hover した位置の横軸の値（日付など）を渡します */
  title?: ReactNode;
  /** 行。上から順に並べます */
  items: readonly ChartTooltipItem[];
  /**
   * 色の印の形。dot は丸、dash は短い線（線グラフ向き）、square は角の丸い四角（棒・円のグラフ向き）
   * @default 'dot'
   */
  markerType?: ChartMarkerType;
  /**
   * 中身の濃さ。value は値を太く題を淡く、even は題と値をやや太く、divided は題を太字にして下に線を引きます
   * @default 'value'
   */
  variant?: ChartTooltipVariant;
  /**
   * 文字の大きさ。sm はキャプション、md はラベルの大きさです
   * @default 'sm'
   */
  size?: ChartTooltipSize;
  /** いちばん外の要素に付きます */
  className?: string;
}

/**
 * hover した位置の値を見せるカードです。グラフのライブラリの、hover で出す中身として渡します
 */
export function ChartTooltip({
  title,
  items,
  markerType = 'dot',
  variant = 'value',
  size = 'sm',
  className,
  ...props
}: ChartTooltipProps) {
  const styles = chartTooltip({ variant, size });
  return (
    <div
      data-slot="chart-tooltip"
      data-marker-type={markerType}
      data-variant={variant}
      className={styles.root({ className })}
      {...props}
    >
      {title != null ? <div className={styles.title()}>{title}</div> : null}
      <ul className={styles.list()}>
        {items.map((item, i) => (
          <li key={i} className={styles.row()}>
            <span
              aria-hidden
              className={chartMarker({ markerType })}
              style={{ '--chart-marker-color': seriesColor(item.color, i) } as CSSProperties}
            />
            <span className={styles.label()}>{item.label}</span>
            <span className={styles.value()}>{item.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
