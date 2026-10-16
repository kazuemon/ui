import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { LineChartPreview } from './line-chart-preview';

// 決定: B（グラフの下・中央）を既定にし、上と左寄せも legendPlacement・legendAlign で選べる — ADR-0542
// 軸 670: 凡例の場所。--chart-legend-order・--chart-legend-justify（比較用）で行ごとに変える
const meta = {
  title: 'Design Review/670 グラフの凡例の場所',
  id: 'design-review-670-chart-legend-place',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'B,current,A' },
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
    name: '題の下・左寄せ',
    intent:
      '題の下、グラフの上に左寄せで置く。題・凡例・グラフの順に上から読め、グラフを見る前に系列が分かる。題とグラフのあいだが広がる',
    spec: [
      ['場所', 'グラフの上'],
      ['寄せ', '左'],
    ],
    tokens: { '--chart-legend-order': '0', '--chart-legend-justify': 'flex-start' },
  },
  {
    id: 'A',
    name: 'グラフの下・左寄せ',
    intent:
      '下の目盛りの下に左寄せで置く。題とグラフが近づき、グラフが主役になる。凡例は補足の位置になり、4 系列までは線の端の名前で足りる',
    spec: [
      ['場所', 'グラフの下'],
      ['寄せ', '左'],
    ],
    tokens: { '--chart-legend-order': '1', '--chart-legend-justify': 'flex-start' },
  },
  {
    id: 'B',
    name: 'グラフの下・中央',
    intent:
      'A を中央に寄せる。グラフの幅の真ん中に並び、図の注記のように見える。左の題とは寄せがそろわない',
    spec: [
      ['場所', 'グラフの下'],
      ['寄せ', '中央'],
    ],
    tokens: { '--chart-legend-order': '1', '--chart-legend-justify': 'center' },
  },
];

const columns: Column[] = [{ label: '3 系列' }, { label: '3 系列・狭い幅', note: '幅 320px' }];

export const Candidates: Story = {
  name: '比較',
  render: ({ pick }) => (
    <Comparison
      index={670}
      axis="グラフの凡例の場所"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => <LineChartPreview width={column.label === '3 系列' ? 560 : 320} />}
    >
      <p>
        ChartFrame
        の中で、凡例（ChartLegend）をどこに置くかを決めます。題の行の右には「グラフ・表」の切り替えが入るので、候補は題の下とグラフの下です。
      </p>
      <p>
        推し:
        現行版（題の下・左寄せ）。グラフを見る前に系列と色の対応が分かり、線の端の名前を書かない 5
        系列以上のグラフでも読み始めで迷いません。A
        は題とグラフが近くまとまりますが、凡例を読むのが最後になります。
      </p>
    </Comparison>
  ),
};
