import { tv } from '../../internal/tv';

// 凡例とカードで、系列の色を示す小さな印（ADR-0536）
//   dot: 丸。既定。MeterGroup の凡例と同じで、グラフの種類（線・棒・円）によらず使える
//   dash: 短い線。線グラフの線を短く切った形で、どの線のことかが結びつきやすい
//   square: 角を少し丸めた四角。棒や円の一切れと形が近い
export const chartMarker = tv({
  base: 'inline-block shrink-0 bg-(color:--chart-marker-color)',
  variants: {
    markerType: {
      dot: 'size-(--chart-marker-dot-size) rounded-pill',
      dash: 'h-1 w-(--chart-marker-dash-width) rounded-pill',
      square: 'size-(--chart-marker-square-size) rounded-xs',
    },
  },
  defaultVariants: { markerType: 'dot' },
});

/** 色の印の形。dot は丸、dash は短い線、square は角の丸い四角 */
export type ChartMarkerType = 'dot' | 'dash' | 'square';

/** 項目の色。渡さないときは、並びの順に系列の色（1 番から）を当てる */
export function seriesColor(color: string | undefined, index: number) {
  return color ?? `var(--color-series-${(index % 8) + 1})`;
}
