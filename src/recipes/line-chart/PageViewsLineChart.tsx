'use client';

// レシピ: 線グラフを Recharts（recharts 3.10.1）でつなぐ見本。利用者が自分のアプリに写して使う
// 線・軸・目盛り・hover の判定は Recharts が描き、枠・凡例・hover のカード・点・軸の名前・線の端の名前は部品が描く
// 色と線の太さは、トークンを CSS 変数のまま Recharts の props に渡す
// look は見本の Controls で見た目を切り替えるための口。写すときは、使う形を直接書いて消してよい
import { useState } from 'react';
import {
  type ActiveDotProps,
  type CartesianViewBox,
  CartesianGrid,
  type DotItemDotProps,
  LabelList,
  type LabelProps,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  type TooltipContentProps,
  type TooltipValueType as ValueType,
  XAxis,
  YAxis,
} from 'recharts';

import { ChartFrame, type ChartFrameProps } from '../../components/chart/ChartFrame';
import { ChartLegend, type ChartLegendHiddenVariant } from '../../components/chart/ChartLegend';
import { type ChartMarkerType } from '../../components/chart/ChartMarker';
import {
  ChartAxisLabel,
  ChartDot,
  ChartLineLabel,
  type ChartLineLabelVariant,
  ChartReferenceLabel,
  type ChartReferenceLabelVariant,
} from '../../components/chart/ChartMarks';
import {
  ChartTooltip,
  type ChartTooltipSize,
  type ChartTooltipVariant,
} from '../../components/chart/ChartTooltip';
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

/** 見本の Controls で切り替える見た目。どれも省くと既定の形になる */
export interface LineChartLook extends Pick<
  ChartFrameProps,
  | 'titleSize'
  | 'legendPlacement'
  | 'legendAlign'
  | 'viewToggle'
  | 'viewToggleSize'
  | 'tableHeight'
  | 'loadingIndicator'
  | 'emptyVariant'
> {
  /** 見本の状態。data は値あり、loading は読み込み中、empty はデータなし */
  state?: 'data' | 'loading' | 'empty';
  markerType?: ChartMarkerType;
  tooltipVariant?: ChartTooltipVariant;
  tooltipSize?: ChartTooltipSize;
  lineLabelVariant?: ChartLineLabelVariant;
  /** 線の右端に名前を書くか。4 系列までは書く */
  showLineLabels?: boolean;
  /** 線の結び方。linear は折れ線、monotone は値を行き過ぎないなめらかな線 */
  curve?: 'linear' | 'monotone';
  /** グリッドの線。solid は淡い実線、dashed は破線、none は引かない */
  grid?: 'solid' | 'dashed' | 'none';
  /** 軸の名前。none は書かない、top は縦の名前を目盛りの上に横書き、vertical は縦の名前を 90 度回す */
  axisTitles?: 'none' | 'top' | 'vertical';
  /** 縦の目盛り。zero は 0 から 5 本、auto は値に合わせた範囲、few は 0 から 3 本 */
  yTicks?: 'zero' | 'auto' | 'few';
  /** 線の上の点。none は hover したときだけ、all はすべての値、last は最後の値だけ */
  dots?: 'none' | 'all' | 'last';
  /** 基準の線（目標）。none は引かない、dashed は破線、solid は実線 */
  referenceLine?: 'none' | 'dashed' | 'solid';
  referenceLabel?: ChartReferenceLabelVariant;
  /** 凡例を押して系列を出し入れできるようにする */
  legendToggle?: boolean;
  legendHiddenVariant?: ChartLegendHiddenVariant;
}

// 系列の色は、系列について回る。絞り込みで系列が減っても色を付け直さない
const series = [
  { key: 'blog', label: 'ブログ', color: 'var(--color-series-1)' },
  { key: 'docs', label: 'ドキュメント', color: 'var(--color-series-2)' },
  { key: 'storybook', label: 'Storybook', color: 'var(--color-series-3)' },
] as const;
type SeriesKey = (typeof series)[number]['key'];

const target = 2000;
const labelOf = (key: unknown) => series.find((s) => s.key === key)?.label ?? String(key);
const formatViews = (value: number) => value.toLocaleString('ja-JP');

// 目盛りの文字の色。大きさは ChartFrame が敷いたキャプションの大きさを継ぐ
const tick = { fill: 'var(--color-chart-tick)' };

// hover した点。Recharts は点の塗り（fill）に線の色を渡す
const renderActiveDot = ({ key, cx, cy, fill }: ActiveDotProps) => (
  <ChartDot key={key ?? undefined} cx={cx} cy={cy} color={fill} />
);
// 線の上にいつも置く点。Recharts は線の色を stroke に渡す
const renderDot = ({ key, cx, cy, stroke }: DotItemDotProps) => (
  <ChartDot key={key ?? undefined} cx={cx} cy={cy} color={stroke} size="sm" />
);

export function PageViewsLineChart({
  data,
  look = {},
}: {
  data: WeeklyViews[];
  look?: LineChartLook;
}) {
  const {
    state = 'data',
    markerType,
    tooltipVariant,
    tooltipSize,
    lineLabelVariant,
    showLineLabels = true,
    curve = 'linear',
    grid = 'solid',
    axisTitles = 'none',
    yTicks = 'zero',
    dots = 'none',
    referenceLine = 'none',
    referenceLabel,
    legendToggle = false,
    legendHiddenVariant,
    ...frameLook
  } = look;
  const last = data.length - 1;
  // 凡例で消した系列。消しても色は付け直さない
  const [hidden, setHidden] = useState<ReadonlySet<SeriesKey>>(new Set());
  const toggleSeries = (index: number, hide: boolean) => {
    const next = new Set(hidden);
    if (hide) next.add(series[index].key);
    else next.delete(series[index].key);
    setHidden(next);
  };

  const renderTooltip = ({
    active,
    payload,
    label,
  }: TooltipContentProps<ValueType, string | number>) =>
    active && payload?.length ? (
      <ChartTooltip
        title={label}
        markerType={markerType}
        variant={tooltipVariant}
        size={tooltipSize}
        items={payload.map((entry) => ({
          label: labelOf(entry.dataKey),
          value: formatViews(Number(entry.value)),
          color: entry.color,
        }))}
      />
    ) : null;

  // 線の右端（最後の値）にだけ名前を書く
  const endLabel = (s: (typeof series)[number]) => (props: LabelProps) =>
    props.index === last ? (
      <ChartLineLabel x={props.x} y={props.y} color={s.color} variant={lineLabelVariant}>
        {s.label}
      </ChartLineLabel>
    ) : null;

  // 軸の名前。縦は目盛りの上に横書き（top）か、目盛りの左に 90 度回す（vertical）。横は目盛りの下の右端
  const yTitle = ({ viewBox }: LabelProps) => {
    const box = viewBox as CartesianViewBox;
    return axisTitles === 'vertical' ? (
      <ChartAxisLabel
        x={(box.x ?? 0) + 8}
        y={(box.y ?? 0) + (box.height ?? 0) / 2}
        textAnchor="middle"
        orientation="vertical"
      >
        閲覧数（回）
      </ChartAxisLabel>
    ) : (
      <ChartAxisLabel x={box.x} y={(box.y ?? 0) - 16}>
        閲覧数（回）
      </ChartAxisLabel>
    );
  };
  const xTitle = ({ viewBox }: LabelProps) => {
    const box = viewBox as CartesianViewBox;
    return (
      <ChartAxisLabel
        x={(box.x ?? 0) + (box.width ?? 0)}
        y={(box.y ?? 0) + (box.height ?? 0) - 8}
        textAnchor="end"
      >
        週
      </ChartAxisLabel>
    );
  };
  const referenceName = ({ viewBox }: LabelProps) => {
    const box = viewBox as CartesianViewBox;
    return (
      <ChartReferenceLabel x={(box.x ?? 0) + (box.width ?? 0)} y={box.y} variant={referenceLabel}>
        目標 {formatViews(target)}
      </ChartReferenceLabel>
    );
  };

  return (
    <ChartFrame
      title="週ごとの閲覧数"
      description="直近 12 週"
      loading={state === 'loading'}
      empty={state === 'empty'}
      legend={
        <ChartLegend
          items={series.map((s) => ({ ...s, hidden: hidden.has(s.key) }))}
          markerType={markerType}
          onHiddenChange={legendToggle ? toggleSeries : undefined}
          hiddenVariant={legendHiddenVariant}
        />
      }
      {...frameLook}
      table={
        // 表の高さをグラフのときにそろえる（tableHeight="chart"）ため、maxHeight に ChartFrame の値を渡す
        <Table accessibleName="週ごとの閲覧数" maxHeight="var(--chart-table-max-height)">
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
        {/* 右は、線の端の名前が入る分を空ける。上は、縦の軸の名前（top）が入る分を空ける */}
        <LineChart
          data={data}
          margin={{
            top: axisTitles === 'top' ? 28 : 8,
            right: showLineLabels ? 88 : 8,
            bottom: 0,
            left: 0,
          }}
        >
          {grid !== 'none' ? (
            <CartesianGrid
              vertical={false}
              stroke="var(--color-chart-grid)"
              strokeDasharray={grid === 'dashed' ? '2 4' : undefined}
            />
          ) : null}
          <XAxis
            dataKey="week"
            tick={tick}
            tickLine={false}
            tickMargin={8}
            height={axisTitles === 'none' ? 30 : 52}
            axisLine={{ stroke: 'var(--color-chart-axis)' }}
            label={axisTitles === 'none' ? undefined : { content: xTitle }}
          />
          <YAxis
            tick={tick}
            tickLine={false}
            axisLine={false}
            width={axisTitles === 'vertical' ? 68 : 48}
            tickFormatter={formatViews}
            domain={yTicks === 'auto' ? ['auto', 'auto'] : [0, 'auto']}
            tickCount={yTicks === 'few' ? 3 : 5}
            label={axisTitles === 'none' ? undefined : { content: yTitle }}
          />
          {referenceLine !== 'none' ? (
            <ReferenceLine
              y={target}
              stroke="var(--color-chart-reference)"
              strokeDasharray={referenceLine === 'dashed' ? '4 4' : undefined}
              label={{ content: referenceName }}
            />
          ) : null}
          <Tooltip
            cursor={{ stroke: 'var(--color-chart-cursor)', strokeWidth: 1 }}
            isAnimationActive={false}
            content={renderTooltip}
          />
          {series.map((s) => (
            <Line
              key={s.key}
              type={curve}
              dataKey={s.key}
              hide={hidden.has(s.key)}
              stroke={s.color}
              strokeWidth="var(--border-width-thick)"
              dot={
                dots === 'all'
                  ? renderDot
                  : dots === 'last'
                    ? (props: DotItemDotProps) => (props.index === last ? renderDot(props) : null)
                    : false
              }
              activeDot={renderActiveDot}
              isAnimationActive={false}
            >
              {showLineLabels ? <LabelList dataKey={s.key} content={endLabel(s)} /> : null}
            </Line>
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
