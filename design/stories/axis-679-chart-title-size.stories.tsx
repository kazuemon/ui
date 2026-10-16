import type { Meta, StoryObj } from '@storybook/react-vite';

import { type LookCandidate, type LookColumn, LookComparison, pickArg } from './line-chart-look';

// 軸 679: グラフの題の大きさ。レシピの look を行（案）ごとに変えて描く
const meta = {
  title: 'Design Review/679 グラフの題の大きさ',
  id: 'design-review-679-chart-title-size',
  parameters: { layout: 'fullscreen' },
  args: { pick: '' },
  argTypes: pickArg(['current', 'A', 'B']),
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const candidates: LookCandidate[] = [
  {
    id: '現行版',
    name: '14px 太字',
    intent: 'Stat のラベルと同じ大きさ。数字のカードと並べてもそろう',
    spec: [['題', 'ラベル（14px）・太字']],
    look: { titleSize: 'sm' },
  },
  {
    id: 'A',
    name: '16px 太字',
    intent: '見出しの md。グラフ 1 つでページの節を作るときに、見出しとして立つ',
    spec: [['題', '見出し md（16px）・太字']],
    look: { titleSize: 'md' },
  },
  {
    id: 'B',
    name: '18px 太字',
    intent: '見出しの lg。題がはっきり立つが、カードの中では大きい',
    spec: [['題', '見出し lg（18px）・太字']],
    look: { titleSize: 'lg' },
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
      index={679}
      axis="グラフの題の大きさ"
      pick={pick}
      candidates={candidates}
      columns={columns}
    >
      <p>
        ChartFrame
        の題の大きさを決めます（titleSize）。カードに載せて並べることが多いので、カードの見出しや
        Stat のラベルとのつり合いで見ます。
      </p>
      <p>
        推し: 現行版（14px 太字）。Stat
        のラベルと同じで、ダッシュボードに数字とグラフを並べたときにそろいます。グラフが画面の主役になるページでは
        A を選べるようにします。
      </p>
    </LookComparison>
  ),
};
