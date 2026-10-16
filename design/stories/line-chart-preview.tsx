import {
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { ChartFrame } from '../../src/components/chart/ChartFrame';
import { ChartLegend } from '../../src/components/chart/ChartLegend';
import { ChartDot, ChartLineLabel } from '../../src/components/chart/ChartMarks';
import { ChartTooltip } from '../../src/components/chart/ChartTooltip';

// 線グラフの軸（663〜）の比較で共有する見本。Recipes/LineChart と同じ組み方で、hover した状態を固定して描ける
// 軸が決まったら、比較のストーリーと一緒に消す

const series = [
  { key: 'blog', label: 'ブログ', color: 'var(--color-series-1)' },
  { key: 'docs', label: 'ドキュメント', color: 'var(--color-series-2)' },
  { key: 'storybook', label: 'Storybook', color: 'var(--color-series-3)' },
] as const;

const data = Array.from({ length: 12 }, (_, i) => ({
  week: `${7 + Math.floor((i * 7 + 20) / 30)}/${((i * 7 + 20) % 30) + 1}`,
  blog: Math.round(1200 + i * 90 + Math.sin(i * 0.9) * 260),
  docs: Math.round(800 + i * 140 + Math.cos(i * 0.7) * 180),
  storybook: Math.round(1500 - i * 40 + Math.sin(i * 1.3 + 1) * 220),
}));

const labelOf = (key: unknown) => series.find((s) => s.key === key)?.label ?? String(key);
const formatViews = (value: number) => value.toLocaleString('ja-JP');
const tick = { fill: 'var(--color-chart-tick)' };

export function LineChartPreview({
  activeIndex,
  seriesCount = 3,
  height = 220,
}: {
  /** hover した状態を固定する位置。渡さないときは hover していない */
  activeIndex?: number;
  seriesCount?: 1 | 2 | 3;
  height?: number;
}) {
  const shown = series.slice(0, seriesCount);
  const last = data.length - 1;
  return (
    <div className="w-[560px]">
      <ChartFrame
        title="週ごとの閲覧数"
        description="直近 12 週"
        height={height}
        legend={shown.length > 1 ? <ChartLegend items={shown} /> : undefined}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 88, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--color-chart-grid)" />
            <XAxis
              dataKey="week"
              tick={tick}
              tickLine={false}
              tickMargin={8}
              interval="preserveStartEnd"
              axisLine={{ stroke: 'var(--color-chart-axis)' }}
            />
            <YAxis
              tick={tick}
              tickLine={false}
              axisLine={false}
              width={48}
              tickFormatter={formatViews}
            />
            <Tooltip
              defaultIndex={activeIndex}
              active={activeIndex != null ? true : undefined}
              cursor={{
                stroke: 'var(--color-chart-cursor)',
                strokeWidth: 1,
              }}
              isAnimationActive={false}
              content={({ active, payload, label }) =>
                active && payload?.length ? (
                  <ChartTooltip
                    title={label}
                    items={payload.map((entry) => ({
                      label: labelOf(entry.dataKey),
                      value: formatViews(Number(entry.value)),
                      color: entry.color,
                    }))}
                  />
                ) : null
              }
            />
            {shown.map((s) => (
              <Line
                key={s.key}
                dataKey={s.key}
                stroke={s.color}
                strokeWidth="var(--border-width-thick)"
                dot={false}
                activeDot={(props) => (
                  <ChartDot key={props.key} cx={props.cx} cy={props.cy} color={s.color} />
                )}
                isAnimationActive={false}
              >
                <LabelList
                  dataKey={s.key}
                  content={(props) =>
                    props.index === last ? (
                      <ChartLineLabel x={props.x} y={props.y} color={s.color}>
                        {s.label}
                      </ChartLineLabel>
                    ) : null
                  }
                />
              </Line>
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartFrame>
    </div>
  );
}
