import type { ComponentProps, CSSProperties, ReactNode } from 'react';

import { tv } from '../../internal/tv';
import { chartMarker, type ChartMarkerType, seriesColor } from './ChartMarker';

// グラフの凡例。色の印と系列の名前を横に並べ、入りきらなければ折り返す
// 2 系列以上のグラフにはいつも置く（原則6: 色だけで系列を伝えない）。印は読み上げず、名前を読む
// 見た目は MeterGroup の凡例と同じ（丸い印・ラベルの大きさ・名前は本文の色、値は淡い色）
const chartLegend = tv({
  slots: {
    root: [
      'm-0 flex list-none flex-wrap gap-x-(--chart-legend-gap-x) gap-y-(--chart-legend-gap-y) p-0',
      'text-(length:--text-label) leading-(--leading-label)',
    ],
    item: 'inline-flex min-w-0 items-center gap-1.5',
    label: 'text-fg',
    value: 'text-fg-muted tabular-nums',
  },
});

/** 凡例の 1 項目 */
export interface ChartLegendItem {
  /** 系列の名前 */
  label: ReactNode;
  /**
   * 印の色（CSS の色。`var(--color-series-2)` など）。グラフの線に渡した色と同じものを渡します。
   * 渡さないときは、並びの順に系列の色（1 番から）です
   */
  color?: string;
  /** 名前のあとに淡く添える値（合計や最新の値） */
  value?: ReactNode;
}

export interface ChartLegendProps extends Omit<ComponentProps<'ul'>, 'children'> {
  /** 項目。左から順に並べます */
  items: readonly ChartLegendItem[];
  /**
   * 色の印の形。dot は丸、dash は短い線（線グラフ向き）、square は角の丸い四角（棒・円のグラフ向き）
   * @default 'dot'
   */
  markerType?: ChartMarkerType;
  /** いちばん外の要素に付きます */
  className?: string;
}

/**
 * グラフの凡例です。色の印と系列の名前を並べます。ChartFrame の legend に置きます
 */
export function ChartLegend({ items, markerType = 'dot', className, ...props }: ChartLegendProps) {
  const styles = chartLegend();
  return (
    <ul
      data-slot="chart-legend"
      data-marker-type={markerType}
      className={styles.root({ className })}
      {...props}
    >
      {items.map((item, i) => (
        // 並びは系列の順で、入れ替わらない
        <li key={i} className={styles.item()}>
          <span
            aria-hidden
            className={chartMarker({ markerType })}
            style={{ '--chart-marker-color': seriesColor(item.color, i) } as CSSProperties}
          />
          <span className={styles.label()}>{item.label}</span>
          {item.value != null ? <span className={styles.value()}>{item.value}</span> : null}
        </li>
      ))}
    </ul>
  );
}
