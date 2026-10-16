import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { LineChartPreview } from './line-chart-preview';

// 決定: A（題の行の右に小さな切り替え）を既定にし、ふつうの大きさと、下線のボタン（題の行の右に置く）も選べる — ADR-0539
// 軸 667: 「グラフ・表」の切り替えの形と場所。--chart-toggle-header・--chart-toggle-footer（比較用）と、部品の高さのトークンで行ごとに変える
const meta = {
  title: 'Design Review/667 グラフと表の切り替え',
  id: 'design-review-667-chart-view-toggle',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'A,current,B' },
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
    name: '題の行の右に、ふつうの大きさの切り替え',
    intent:
      '題の行の右に、SegmentedControl をほかの欄と同じ大きさで置く。どちらの形で見ているかがいつも分かる。題より目立ち、グラフの上が重い',
    spec: [
      ['場所', '題の行の右'],
      ['形', 'SegmentedControl（ふつう）'],
    ],
    tokens: { '--chart-toggle-header': 'block', '--chart-toggle-footer': 'none' },
  },
  {
    id: 'A',
    name: '題の行の右に、小さな切り替え',
    intent:
      '現行版と同じ場所で、ボタンの小（sm）と同じ高さ・文字にする。題の大きさとつり合い、いまの形も分かる。指では少し押しにくい',
    spec: [
      ['場所', '題の行の右'],
      ['形', 'SegmentedControl（高さ 36px・文字 14px）'],
    ],
    tokens: {
      '--chart-toggle-header': 'block',
      '--chart-toggle-footer': 'none',
      '--spacing-control': 'var(--spacing-control-sm)',
      '--spacing-control-x': 'var(--spacing-control-x-sm)',
      '--text-control': 'var(--text-control-sm)',
      '--leading-control': 'var(--leading-control-sm)',
    },
  },
  {
    id: 'B',
    name: 'グラフの下に、もう一方へ移るボタン',
    intent:
      'グラフの下の右に、下線のボタン「表で見る」を置く。グラフの上がいちばん軽い。表は補助の形として扱われ、見ている形はボタンの文言で分かる',
    spec: [
      ['場所', 'グラフの下の右'],
      ['形', '下線のボタン（小）'],
    ],
    tokens: { '--chart-toggle-header': 'none', '--chart-toggle-footer': 'flex' },
  },
];

const columns: Column[] = [
  { label: 'グラフ', note: '押すと切り替わる' },
  { label: '表', note: 'はじめに表を見せたところ' },
];

export const Candidates: Story = {
  name: '比較',
  render: ({ pick }) => (
    <Comparison
      index={667}
      axis="グラフと表の切り替え"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => (
        <LineChartPreview showTable defaultView={column.label === '表' ? 'table' : 'chart'} />
      )}
    >
      <p>
        同じ値を表で読めるようにする切り替え（ChartFrame の
        table）の、形と場所を決めます。表は、数値を読みたい人と、読み上げで使う人のための形です。
      </p>
      <p>
        推し:
        A（題の行の右に、小さな切り替え）。いまどちらの形かが分かり、題の大きさともつり合います。B
        はグラフの上が軽くなりますが、表に移れることに気づきにくくなります。どの案を既定にするか、決めてください（ほかの案も選べるようにします）。
      </p>
    </Comparison>
  ),
};
