import { tv } from '../../internal/tv';

// 凡例とカードで、系列の色を示す小さな印。MeterGroup の凡例と同じ丸
// 大きさと角は --chart-marker-*（線の形・四角にもトークンで変えられる）
export const chartMarker = tv({
  base: [
    'inline-block h-(--chart-marker-height) w-(--chart-marker-width) shrink-0 rounded-(--chart-marker-radius)',
    'bg-(color:--chart-marker-color)',
  ],
});

/** 項目の色。渡さないときは、並びの順に系列の色（1 番から）を当てる */
export function seriesColor(color: string | undefined, index: number) {
  return color ?? `var(--color-series-${(index % 8) + 1})`;
}
