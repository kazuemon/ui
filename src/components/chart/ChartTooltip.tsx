import type { ComponentProps, CSSProperties, ReactNode } from 'react';

import { tv } from '../../internal/tv';
import { chartMarker, type ChartMarkerType, seriesColor } from './ChartMarker';

// hover した位置の値を見せるカード。グラフのライブラリが hover の判定と置き場所を持ち、この部品は中身の見た目だけを持つ
//   Recharts なら <Tooltip content={...}> に渡す。出す・出さないもライブラリが決める
// 面は Tooltip と同じ（白・細い輪郭・小さく淡い影・部品の角）。重なる面の仲間（原則1）
// 中身は、題（日付など）の下に「色の印・系列の名前・値」の行を並べる。値は右にそろえ、桁を等幅にする
// 色だけで伝えない（原則6）: 行ごとに名前を書く
const chartTooltip = tv({
  slots: {
    root: [
      'pointer-events-none min-w-(--chart-tooltip-min-width) rounded-control border-(length:--border-width-thin) border-surface-line bg-surface',
      'px-(--chart-tooltip-padding-x) py-(--chart-tooltip-padding-y) [box-shadow:var(--shadow-tooltip)]',
      'text-(length:--chart-tooltip-text) leading-(--chart-tooltip-leading) text-fg',
    ],
    // 軸 669 の比較用: 題の色・太さ、題の下の区切り線、値の太さ、文字の大きさを --chart-tooltip-* で変える
    title: [
      'mb-(--chart-tooltip-title-gap) border-b-(length:--chart-tooltip-divider) border-line pb-(--chart-tooltip-title-pad)',
      '[font-weight:var(--chart-tooltip-title-weight)] text-(color:--chart-tooltip-title-color)',
    ],
    list: 'm-0 grid list-none grid-cols-[auto_minmax(0,1fr)_auto] gap-x-2 gap-y-(--chart-tooltip-row-gap) p-0',
    row: 'col-span-full grid grid-cols-subgrid items-center',
    label: 'min-w-0 truncate text-fg-muted',
    value:
      'text-end [font-weight:var(--chart-tooltip-value-weight)] whitespace-nowrap tabular-nums',
  },
});

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
  className,
  ...props
}: ChartTooltipProps) {
  const styles = chartTooltip();
  return (
    <div
      data-slot="chart-tooltip"
      data-marker-type={markerType}
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
