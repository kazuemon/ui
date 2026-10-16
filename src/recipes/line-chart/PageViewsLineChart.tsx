'use client';

// レシピ: 線グラフを Recharts（recharts 3.10.1）でつなぐ見本。利用者が自分のアプリに写して使う
// 線・軸・目盛り・hover の判定は Recharts が描き、枠・凡例・hover のカード・点・線の端の名前は部品が描く
// 色と線の太さは、トークンを CSS 変数のまま Recharts の props に渡す
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

import { ChartFrame } from '../../components/chart/ChartFrame';
import { ChartLegend } from '../../components/chart/ChartLegend';
import { ChartDot, ChartLineLabel } from '../../components/chart/ChartMarks';
import { ChartTooltip } from '../../components/chart/ChartTooltip';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/table/Table';

export interface WeeklyViews {
  week: string;
  blog: number;
  docs: number;
  storybook: number;
}

// 系列の色は、系列について回る。絞り込みで系列が減っても色を付け直さない
const series = [
  { key: 'blog', label: 'ブログ', color: 'var(--color-series-1)' },
  { key: 'docs', label: 'ドキュメント', color: 'var(--color-series-2)' },
  { key: 'storybook', label: 'Storybook', color: 'var(--color-series-3)' },
] as const;

const labelOf = (key: unknown) => series.find((s) => s.key === key)?.label ?? String(key);
const formatViews = (value: number) => value.toLocaleString('ja-JP');

// 目盛りの文字の色。大きさは ChartFrame が敷いたキャプションの大きさを継ぐ
const tick = { fill: 'var(--color-chart-tick)' };

export function PageViewsLineChart({ data }: { data: WeeklyViews[] }) {
  const last = data.length - 1;
  return (
    <ChartFrame
      title="週ごとの閲覧数"
      description="直近 12 週"
      legend={<ChartLegend items={series} />}
      table={
        <Table accessibleName="週ごとの閲覧数">
          <TableHead>
            <TableRow>
              <TableHeader>週</TableHeader>
              {series.map((s) => (
                <TableHeader key={s.key} align="end">
                  {s.label}
                </TableHeader>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.week}>
                <TableCell>{row.week}</TableCell>
                {series.map((s) => (
                  <TableCell key={s.key} align="end">
                    {formatViews(row[s.key])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        {/* 右は、線の端の名前が入る分を空ける */}
        <LineChart data={data} margin={{ top: 8, right: 88, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--color-chart-grid)" />
          <XAxis
            dataKey="week"
            tick={tick}
            tickLine={false}
            tickMargin={8}
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
            cursor={{ stroke: 'var(--color-chart-cursor)', strokeWidth: 1 }}
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
          {series.map((s) => (
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
                    <ChartLineLabel x={props.x} y={props.y}>
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
  );
}
