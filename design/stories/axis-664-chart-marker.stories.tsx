import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { LineChartPreview } from './line-chart-preview';

// 決定: 現行版（丸）を既定にし、短い線（A）と四角（B）も markerType で選べる — ADR-0536
// 軸 664: 凡例と hover のカードの、系列の色の印の形。--chart-marker-width・-height・-radius で行ごとに変える
const meta = {
  title: 'Design Review/664 グラフの色の印の形',
  id: 'design-review-664-chart-marker',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current,A,B' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '丸',
    intent:
      'MeterGroup の凡例と同じ丸。グラフの種類（線・棒・円）によらず同じ印になる。線グラフでは、線と印の形はつながらない',
    spec: [
      ['形', '丸'],
      ['大きさ', '10×10px'],
    ],
    tokens: {
      '--chart-marker-width': 'calc(var(--spacing) * 2.5)',
      '--chart-marker-height': 'calc(var(--spacing) * 2.5)',
      '--chart-marker-radius': 'var(--radius-pill)',
    },
  },
  {
    id: 'A',
    name: '短い線',
    intent:
      '線グラフの線を短く切った形。凡例を見て、どの線のことかがすぐ結びつく。棒や円のグラフでは形が合わないので、グラフの種類ごとに印を変えることになる',
    spec: [
      ['形', '角の丸い線'],
      ['大きさ', '14×4px'],
    ],
    tokens: {
      '--chart-marker-width': 'calc(var(--spacing) * 3.5)',
      '--chart-marker-height': 'var(--spacing)',
      '--chart-marker-radius': 'var(--radius-pill)',
    },
  },
  {
    id: 'B',
    name: '角の丸い四角',
    intent:
      '少し角を丸めた四角。棒や円の一切れと形が近く、面が大きいので色が読みやすい。丸よりかっちりして見える',
    spec: [
      ['形', '四角（角 2px）'],
      ['大きさ', '10×10px'],
    ],
    tokens: {
      '--chart-marker-width': 'calc(var(--spacing) * 2.5)',
      '--chart-marker-height': 'calc(var(--spacing) * 2.5)',
      '--chart-marker-radius': 'var(--radius-xs)',
    },
  },
];

const columns: Column[] = [
  { label: '通常' },
  { label: 'hover', note: '9/17 に載せたところを固定' },
];

export const Candidates: Story = {
  name: '比較',
  render: ({ pick }) => (
    <Comparison
      index={664}
      axis="グラフの色の印の形"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => (
        <LineChartPreview activeIndex={column.label === 'hover' ? 8 : undefined} />
      )}
    >
      <p>
        凡例と hover
        のカードで、系列の色を示す印の形を決めます。印は、棒や円のグラフでも同じ部品（ChartLegend・ChartTooltip）を使います。
      </p>
      <p>
        推し: 現行版（丸）。MeterGroup
        の凡例と同じで、グラフの種類が変わっても印が変わりません。短い線（A）は線グラフでは結びつきがよいものの、棒や円では合わないので、グラフの種類ごとに印を選ぶ
        props が要ります。
      </p>
    </Comparison>
  ),
};
