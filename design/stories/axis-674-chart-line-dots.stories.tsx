import type { Meta, StoryObj } from '@storybook/react-vite';

import { type LookCandidate, type LookColumn, LookComparison, pickArg } from './line-chart-look';

// 軸 674: グラフの線の上の点。レシピの look を行（案）ごとに変えて描く
const meta = {
  title: 'Design Review/674 グラフの線の上の点',
  id: 'design-review-674-chart-line-dots',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current' },
  argTypes: pickArg(['current', 'A', 'B']),
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const candidates: LookCandidate[] = [
  {
    id: '現行版',
    name: '置かない',
    intent: '線だけを描き、値の点は hover したときだけ出す。いちばん軽く、線の形がよく見える',
    spec: [['点', 'hover のときだけ']],
    look: { dots: 'none' },
  },
  {
    id: 'A',
    name: 'すべての値',
    intent: '値のある所すべてに小さな点を置く。どこに値があるかが分かる。系列が多いと点が混み合う',
    spec: [['点', 'すべて・半径 3px']],
    look: { dots: 'all' },
  },
  {
    id: 'B',
    name: '最後の値だけ',
    intent:
      '線の右端（いまの値）にだけ点を置く。Sparkline と同じ考えで、いまの値と線の端の名前が結びつく',
    spec: [['点', '最後の値だけ・半径 3px']],
    look: { dots: 'last' },
  },
];

const columns: LookColumn[] = [
  { label: 'ふつうの幅' },
  { label: '狭い幅', note: '幅 320px', width: 320 },
];

export const Candidates: Story = {
  name: '比較',
  render: ({ pick }) => (
    <LookComparison
      index={674}
      axis="グラフの線の上の点"
      pick={pick}
      candidates={candidates}
      columns={columns}
    >
      <p>
        線の上に、値のある所の点をいつも置くかを決めます。hover した値の点（ChartDot の
        md）は、どの案でも出ます。いつも置く点は ChartDot の sm です。
      </p>
      <p>
        推し: 現行版（置かない）。線が 3
        本あると、点が並んで線の形が読みにくくなります。値が少ないグラフ（月ごとなど）では
        A、いまの値を示したいときは B を選べるようにします。
      </p>
    </LookComparison>
  ),
};
