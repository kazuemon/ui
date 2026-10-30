import type { Meta, StoryObj } from '@storybook/react-vite';

import { type LookCandidate, type LookColumn, LookComparison, pickArg } from './line-chart-look';

// 軸 675: グラフの基準の線。レシピの look を行（案）ごとに変えて描く
const meta = {
  title: 'Design Review/675 グラフの基準の線',
  id: 'design-review-675-chart-reference',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'A' },
  argTypes: pickArg(['A', 'B', 'C']),
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const candidates: LookCandidate[] = [
  {
    id: 'A',
    name: '破線・線の上に文字',
    intent:
      'グレーの破線を引き、名前を線の上の左端に淡い文字で置く（右端には線の端の名前が並ぶ）。系列の線と種類が違うので、基準だと分かる',
    spec: [
      ['線', '破線 4・4・gray-500'],
      ['名前', '線の上・左端'],
    ],
    look: { referenceLine: 'dashed', referenceLabel: 'plain' },
  },
  {
    id: 'B',
    name: '破線・線に重ねて縁取り',
    intent: '名前を線に重ね、文字の周りを面の色で縁取って線を切る。線と名前がひとまとまりに見える',
    spec: [
      ['線', '破線 4・4・gray-500'],
      ['名前', '線に重ねる・縁取り'],
    ],
    look: { referenceLine: 'dashed', referenceLabel: 'halo' },
  },
  {
    id: 'C',
    name: '実線・線の上に文字',
    intent:
      'A の線を実線にする。グリッドより濃い実線なので、境目としてはっきりする。系列の線と形が同じになる',
    spec: [
      ['線', '実線・gray-500'],
      ['名前', '線の上・左端'],
    ],
    look: { referenceLine: 'solid', referenceLabel: 'plain' },
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
      index={675}
      axis="グラフの基準の線"
      pick={pick}
      candidates={candidates}
      columns={columns}
    >
      <p>
        目標や平均のような、基準の値に引く横の線と、その名前の置き方を決めます。線は Recharts の
        ReferenceLine が --color-chart-reference で引き、名前は ChartReferenceLabel が描きます。
      </p>
      <p>
        推し:
        A（破線と、線の上の淡い文字）。破線は系列の線（実線）と見分けやすく、文字が線を隠しません。B
        は線と名前がひとまとまりに見えますが、線が途中で切れます。
      </p>
    </LookComparison>
  ),
};
