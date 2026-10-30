import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Gallery, Specimen } from '../../stories/story-parts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../table/Table';
import { ChartFrame, type ChartFrameProps } from './ChartFrame';
import { ChartLegend, type ChartLegendItem } from './ChartLegend';
import { ChartAxisLabel, ChartDot, ChartLineLabel, ChartReferenceLabel } from './ChartMarks';
import { ChartTooltip } from './ChartTooltip';

// 部品だけを見せるため、グラフの線はライブラリを使わずに SVG で描く（つなぎ方はレシピの線グラフにある）
const series: ChartLegendItem[] = [
  { label: 'ブログ', color: 'var(--color-series-1)' },
  { label: 'ドキュメント', color: 'var(--color-series-2)' },
  { label: 'Storybook', color: 'var(--color-series-3)' },
];
const lines = [
  [40, 70, 60, 110, 130, 150],
  [20, 30, 45, 80, 140, 170],
  [90, 80, 60, 50, 70, 60],
];
const weeks = ['9/3', '9/10', '9/17', '9/24', '10/1', '10/8'];

function SampleChart({ hidden = [] }: { hidden?: readonly number[] }) {
  const x = (i: number) => 40 + i * 50;
  const y = (v: number) => 210 - v;
  return (
    <svg viewBox="0 0 372 240" width="100%" height="100%" aria-hidden>
      {[210, 160, 110, 60].map((v) => (
        <line key={v} x1={40} x2={290} y1={v} y2={v} stroke="var(--color-chart-grid)" />
      ))}
      <line x1={40} x2={290} y1={210} y2={210} stroke="var(--color-chart-axis)" />
      <line
        x1={40}
        x2={290}
        y1={y(120)}
        y2={y(120)}
        stroke="var(--color-chart-reference)"
        strokeDasharray="4 4"
      />
      <ChartReferenceLabel x={40} y={y(120)}>
        目標 120
      </ChartReferenceLabel>
      {lines.map((values, s) =>
        hidden.includes(s) ? null : (
          <g key={s}>
            <polyline
              fill="none"
              stroke={series[s].color}
              strokeWidth="var(--border-width-thick)"
              points={values.map((v, i) => `${x(i)},${y(v)}`).join(' ')}
            />
            <ChartLineLabel x={x(5)} y={y(values[5])} color={series[s].color}>
              {series[s].label}
            </ChartLineLabel>
          </g>
        )
      )}
      <line x1={x(3)} x2={x(3)} y1={30} y2={210} stroke="var(--color-chart-cursor)" />
      {lines.map((values, s) =>
        hidden.includes(s) ? null : (
          <ChartDot key={s} cx={x(3)} cy={y(values[3])} color={series[s].color} />
        )
      )}
      <ChartAxisLabel x={12} y={120} textAnchor="middle" orientation="vertical">
        閲覧数（回）
      </ChartAxisLabel>
      {weeks.map((w, i) => (
        <text
          key={w}
          x={x(i)}
          y={230}
          textAnchor="middle"
          fill="var(--color-chart-tick)"
          fontSize="var(--text-caption)"
        >
          {w}
        </text>
      ))}
    </svg>
  );
}

const table = (
  <Table accessibleName="週ごとの閲覧数" maxHeight="var(--chart-table-max-height)">
    <TableHead>
      <TableRow>
        <TableHeader>週</TableHeader>
        {series.map((s) => (
          <TableHeader key={s.color} align="end">
            {s.label}
          </TableHeader>
        ))}
      </TableRow>
    </TableHead>
    <TableBody>
      {weeks.map((w, i) => (
        <TableRow key={w}>
          <TableCell>{w}</TableCell>
          {lines.map((values, s) => (
            <TableCell key={s} align="end">
              {values[i]}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

const meta = {
  title: 'Components/Chart',
  component: ChartFrame,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'グラフの周りの見た目をそろえる部品です。線・軸・目盛りはグラフのライブラリ（Recharts など）が描き、ここにある部品は枠・凡例・hover のカード・点・名前を描きます。ライブラリとのつなぎ方は、レシピの線グラフにあります。',
          '',
          '- `ChartFrame` は、題・説明・凡例・描く場所を並べる枠です。`table` に同じ値の表を渡すと、題の行の右に「グラフ・表」の切り替えを置きます。色の線だけで値を伝えないよう、表はなるべく渡してください。',
          '- 凡例はグラフの下の中央に置きます（`legendPlacement`・`legendAlign` で上や左寄せにできます）。読み込み中（`loading`）とデータがないとき（`empty`）は、描く場所の高さを保ったまま、凡例と切り替えを隠します。',
          '- `ChartLegend` は色の印と系列の名前を並べます。`onHiddenChange` を渡すと、項目が系列を出し入れするボタンになり、名前に淡い下線が付きます。',
          '- `ChartTooltip` は、ライブラリの hover の中身として渡すカードです。',
          '- `ChartDot`・`ChartLineLabel`・`ChartAxisLabel`・`ChartReferenceLabel` は、グラフの SVG の中に置く点と文字です。',
          '- 系列の色は、`var(--color-series-1)` から順に、系列について回るように渡します。',
        ].join('\n'),
      },
    },
  },
  args: {
    title: '週ごとの閲覧数',
    description: '直近 6 週',
    legend: <ChartLegend items={series} />,
    table,
    children: <SampleChart />,
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-[560px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChartFrame>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
};

const frame = (args: ChartFrameProps, props: Partial<ChartFrameProps>, label: string) => (
  <Specimen key={label} label={label}>
    <ChartFrame {...args} {...props} />
  </Specimen>
);

export const States: Story = {
  tags: ['visual'],
  name: '読み込み中・データなし',
  decorators: [
    (Story) => (
      <div className="w-[1180px] max-w-none">
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <Gallery columnWidth="22rem">
      {(['spinner', 'skeleton', 'grid'] as const).map((loadingIndicator) =>
        frame(args, { loading: true, loadingIndicator }, `loading · ${loadingIndicator}`)
      )}
      {(['text', 'panel', 'grid'] as const).map((emptyVariant) =>
        frame(args, { empty: true, emptyVariant }, `empty · ${emptyVariant}`)
      )}
    </Gallery>
  ),
};

export const Layouts: Story = {
  tags: ['visual'],
  name: '題・凡例・切り替え',
  decorators: [
    (Story) => (
      <div className="w-[1180px] max-w-none">
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <Gallery columnWidth="22rem">
      {(['sm', 'md', 'lg'] as const).map((titleSize) =>
        frame(args, { titleSize }, `titleSize="${titleSize}"`)
      )}
      {frame(args, { legendPlacement: 'top', legendAlign: 'start' }, '凡例 · 上・左寄せ')}
      {frame(args, { viewToggleSize: 'md' }, 'viewToggleSize="md"')}
      {frame(args, { viewToggle: 'button' }, 'viewToggle="button"')}
    </Gallery>
  ),
};

export const Legends: Story = {
  tags: ['visual'],
  name: '凡例',
  render: () => (
    <Gallery columnWidth="24rem">
      {(['dot', 'dash', 'square'] as const).map((markerType) => (
        <Specimen key={markerType} label={`markerType="${markerType}"`}>
          <ChartLegend items={series} markerType={markerType} />
        </Specimen>
      ))}
      <Specimen label="value">
        <ChartLegend items={series.map((s, i) => ({ ...s, value: lines[i][5] }))} />
      </Specimen>
      {(['faded', 'ring', 'strike'] as const).map((hiddenVariant) => (
        <Specimen key={hiddenVariant} label={`押せる · hiddenVariant="${hiddenVariant}"`}>
          <ChartLegend
            items={series.map((s, i) => ({ ...s, hidden: i === 1 }))}
            hiddenVariant={hiddenVariant}
            onHiddenChange={() => {}}
          />
        </Specimen>
      ))}
    </Gallery>
  ),
};

export const Tooltips: Story = {
  tags: ['visual'],
  name: 'hover のカード',
  render: () => {
    const items = series.map((s, i) => ({ ...s, value: `${lines[i][3]} 回` }));
    return (
      <Gallery columnWidth="12rem">
        {(['value', 'balanced', 'divided'] as const).flatMap((variant) =>
          (['sm', 'md'] as const).map((size) => (
            <Specimen key={`${variant}-${size}`} label={`${variant} · ${size}`}>
              <ChartTooltip title="9/24" items={items} variant={variant} size={size} />
            </Specimen>
          ))
        )}
      </Gallery>
    );
  },
};

export const Marks: Story = {
  tags: ['visual'],
  name: '点と文字',
  render: () => (
    <Gallery columnWidth="12rem">
      {(['tinted', 'series', 'body', 'muted'] as const).map((variant) => (
        <Specimen key={variant} label={`ChartLineLabel · ${variant}`}>
          <svg width={160} height={40} aria-hidden>
            <line x1={0} x2={60} y1={20} y2={20} stroke={series[1].color} strokeWidth={2} />
            <ChartLineLabel x={60} y={20} color={series[1].color} variant={variant}>
              ドキュメント
            </ChartLineLabel>
          </svg>
        </Specimen>
      ))}
      {(['plain', 'halo'] as const).map((variant) => (
        <Specimen key={variant} label={`ChartReferenceLabel · ${variant}`}>
          <svg width={160} height={40} aria-hidden>
            <line
              x1={0}
              x2={160}
              y1={24}
              y2={24}
              stroke="var(--color-chart-reference)"
              strokeDasharray="4 4"
            />
            <ChartReferenceLabel x={0} y={24} variant={variant}>
              目標 2,000
            </ChartReferenceLabel>
          </svg>
        </Specimen>
      ))}
      {(['md', 'sm'] as const).map((size) => (
        <Specimen key={size} label={`ChartDot · ${size}`}>
          <svg width={160} height={40} aria-hidden>
            <line x1={0} x2={160} y1={20} y2={20} stroke={series[0].color} strokeWidth={2} />
            <ChartDot cx={80} cy={20} color={series[0].color} size={size} />
          </svg>
        </Specimen>
      ))}
    </Gallery>
  ),
};

function ToggleLegendChart(args: ChartFrameProps) {
  const [hidden, setHidden] = useState<readonly number[]>([]);
  return (
    <ChartFrame
      {...args}
      legend={
        <ChartLegend
          items={series.map((s, i) => ({ ...s, hidden: hidden.includes(i) }))}
          onHiddenChange={(index, hide) =>
            setHidden(hide ? [...hidden, index] : hidden.filter((i) => i !== index))
          }
        />
      }
    >
      <SampleChart hidden={hidden} />
    </ChartFrame>
  );
}

export const Interactions: Story = {
  name: '切り替えと出し入れ',
  render: (args) => <ToggleLegendChart {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('figure', { name: '週ごとの閲覧数' })).toBeVisible();
    // 凡例の項目は、出しているかを押された状態で読む
    const docs = canvas.getByRole('button', { name: 'ドキュメント' });
    await expect(docs).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(docs);
    await expect(docs).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(docs);
    await expect(docs).toHaveAttribute('aria-pressed', 'true');
    // 表に切り替えると、同じ値を表で読める
    await userEvent.click(canvas.getByRole('radio', { name: '表' }));
    await waitFor(() =>
      expect(canvas.getByRole('table', { name: '週ごとの閲覧数' })).toBeVisible()
    );
    await userEvent.click(canvas.getByRole('radio', { name: 'グラフ' }));
    await waitFor(() => expect(canvas.queryByRole('table')).toBeNull());
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  },
};

export const Loading: Story = {
  name: '読み込み中の読み上げ',
  args: { loading: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('figure')).toHaveAttribute('aria-busy', 'true');
    await expect(canvas.getByRole('status')).toHaveTextContent('読み込んでいます');
    // 読み込み中は、凡例と切り替えを隠す
    await expect(canvas.queryByRole('radio')).toBeNull();
    await expect(canvas.queryByRole('list')).toBeNull();
  },
};
