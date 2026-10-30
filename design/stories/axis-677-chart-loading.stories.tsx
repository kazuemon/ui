import type { Meta, StoryObj } from '@storybook/react-vite';

import { type LookCandidate, type LookColumn, LookComparison, pickArg } from './line-chart-look';

// 軸 677: グラフの読み込み中。レシピの look を行（案）ごとに変えて描く
const meta = {
  title: 'Design Review/677 グラフの読み込み中',
  id: 'design-review-677-chart-loading',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'B' },
  argTypes: pickArg(['A', 'B', 'C']),
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const candidates: LookCandidate[] = [
  {
    id: 'A',
    name: 'Skeleton',
    intent: '描く場所を Skeleton の面で埋め、ゆっくり光らせる。出てくるものの大きさが分かる',
    spec: [['印', 'Skeleton（面）']],
    look: { state: 'loading', loadingIndicator: 'skeleton' },
  },
  {
    id: 'B',
    name: '回る円',
    intent: '描く場所の真ん中に、大きな回る円を置く。待っていることがはっきり伝わる',
    spec: [['印', 'Spinner（lg）']],
    look: { state: 'loading', loadingIndicator: 'spinner' },
  },
  {
    id: 'C',
    name: '淡いグリッドと文字',
    intent:
      '淡いグリッドの上に「読み込んでいます」と書く。データなし（C）と同じ形で、文言だけが違う',
    spec: [['印', '淡いグリッド＋文字']],
    look: { state: 'loading', loadingIndicator: 'grid' },
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
      index={677}
      axis="グラフの読み込み中"
      pick={pick}
      candidates={candidates}
      columns={columns}
    >
      <p>
        値を読み込んでいるあいだの見せ方を決めます（ChartFrame の
        loading・loadingIndicator）。凡例と切り替えは隠し、描く場所の高さは変えません。
      </p>
      <p>
        推し: A（Skeleton）。ほかの部品の読み込み中と同じ印で、ここに何かが出ると分かります。B
        の回る円は、待っていることは伝わりますが、出てくるものの大きさが分かりません。
      </p>
    </LookComparison>
  ),
};
