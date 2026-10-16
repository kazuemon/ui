import type { Meta, StoryObj } from '@storybook/react-vite';

import { type LookCandidate, type LookColumn, LookComparison, pickArg } from './line-chart-look';

// 軸 676: グラフのデータがないとき。レシピの look を行（案）ごとに変えて描く
const meta = {
  title: 'Design Review/676 グラフのデータがないとき',
  id: 'design-review-676-chart-empty',
  parameters: { layout: 'fullscreen' },
  args: { pick: '' },
  argTypes: pickArg(['A', 'B', 'C']),
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const candidates: LookCandidate[] = [
  {
    id: 'A',
    name: '淡い文字だけ',
    intent:
      '描く場所の真ん中に、淡い文字で「データがありません」と書く。いちばん静か。何もない白い場所が広く残る',
    spec: [['見せ方', '文字だけ']],
    look: { state: 'empty', emptyVariant: 'text' },
  },
  {
    id: 'B',
    name: 'StatusPanel',
    intent:
      'StatusPanel の小を置き、文を見出しの太さで出す。空状態のほかの画面とそろうが、グラフ 1 つには強い',
    spec: [['見せ方', 'StatusPanel（sm）']],
    look: { state: 'empty', emptyVariant: 'panel' },
  },
  {
    id: 'C',
    name: '淡いグリッドの上に文字',
    intent: 'グリッドと同じ淡い横線を引き、その上に文字を置く。グラフの場所だという形が残る',
    spec: [['見せ方', '淡いグリッド＋文字']],
    look: { state: 'empty', emptyVariant: 'grid' },
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
      index={676}
      axis="グラフのデータがないとき"
      pick={pick}
      candidates={candidates}
      columns={columns}
    >
      <p>
        期間に値がないなど、描くものがないときの見せ方を決めます（ChartFrame の
        empty・emptyText）。凡例と「グラフ・表」の切り替えは隠し、描く場所の高さは変えません。
      </p>
      <p>
        推し:
        C（淡いグリッドの上に文字）。グラフの場所だと分かる形が残り、ダッシュボードに並べても枠がそろいます。B
        の StatusPanel は、グラフ 1 つには重く見えます。
      </p>
    </LookComparison>
  ),
};
