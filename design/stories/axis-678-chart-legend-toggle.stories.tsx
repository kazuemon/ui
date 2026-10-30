import type { Meta, StoryObj } from '@storybook/react-vite';

import { type LookCandidate, type LookColumn, LookComparison, pickArg } from './line-chart-look';

// 軸 678: グラフの凡例で系列を出し入れ。レシピの look を行（案）ごとに変えて描く
const meta = {
  title: 'Design Review/678 グラフの凡例で系列を出し入れ',
  id: 'design-review-678-chart-legend-toggle',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'B' },
  argTypes: pickArg(['current', 'A', 'B', 'C']),
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const candidates: LookCandidate[] = [
  {
    id: '現行版',
    name: '出し入れしない',
    intent: '凡例はただの説明で、押せない。いちばん単純',
    spec: [['凡例', '押せない']],
    look: { legendToggle: false },
  },
  {
    id: 'A',
    name: '印を輪にする',
    intent:
      '消した系列は、印を色の輪にし、名前を淡くする。色の対応は見えたまま、消していることが分かる',
    spec: [['消した系列', '印を輪・名前を淡く']],
    look: { legendToggle: true, legendHiddenVariant: 'ring', defaultHidden: ['docs'] },
  },
  {
    id: 'B',
    name: '項目ごと淡く',
    intent: '消した系列は、項目全体を押せないときと同じ薄さにする。押せないように見えるのが難点',
    spec: [['消した系列', '全体を 40%']],
    look: { legendToggle: true, legendHiddenVariant: 'faded', defaultHidden: ['docs'] },
  },
  {
    id: 'C',
    name: '取り消し線',
    intent:
      '消した系列は、名前に取り消し線を引き、印をグレーにする。消したことが文字で分かる。少し強い',
    spec: [['消した系列', '取り消し線・印をグレー']],
    look: { legendToggle: true, legendHiddenVariant: 'strike', defaultHidden: ['docs'] },
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
      index={678}
      axis="グラフの凡例で系列を出し入れ"
      pick={pick}
      candidates={candidates}
      columns={columns}
    >
      <p>
        凡例の項目を押して、系列を出したり消したりできるようにするかと、消した系列の見せ方を決めます（ChartLegend
        の
        onHiddenChange・hiddenVariant）。案の行では「ドキュメント」を消してあります。押して確かめられます。
      </p>
      <p>
        推し:
        A（印を輪にする）を、出し入れするときの見せ方の既定に。名前は読めるまま、消していることが印で分かります。出し入れそのものは、レシピの既定ではオフにし、系列が多いグラフで使う形として案内します。
      </p>
    </LookComparison>
  ),
};
