import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { LineChartPreview } from './line-chart-preview';

// 決定: C（線の色を濃くした色）を既定にし、ほかの案も variant で選べる — ADR-0538
// 軸 666: 線の右端に書く系列の名前の色。--chart-label-base（地の文字の色）と --chart-label-tint（線の色を混ぜる割合）で行ごとに変える
const meta = {
  title: 'Design Review/666 グラフの線の端の名前の色',
  id: 'design-review-666-chart-line-label',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'C,current,A,B' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '淡い文字',
    intent:
      '目盛りより一段濃い、淡い本文の色。線とは位置で結びつける。どの名前も同じ色なので静かだが、線が交わる近くでは、どの線の名前かを位置だけで読むことになる',
    spec: [
      ['色', 'fg-muted'],
      ['白地', '6.87'],
    ],
    tokens: { '--chart-label-base': 'var(--color-fg-muted)', '--chart-label-tint': '0%' },
  },
  {
    id: 'A',
    name: '線と同じ色',
    intent:
      '線とまったく同じ色。どの線の名前かが色でもすぐ分かる。系列の色は白地で 3.1〜3.6 なので、キャプションの大きさの文字では 4.5:1 に届かない',
    spec: [
      ['色', '系列の色そのまま'],
      ['白地', '3.1〜3.6'],
    ],
    tokens: { '--chart-label-base': 'var(--color-fg-muted)', '--chart-label-tint': '100%' },
  },
  {
    id: 'B',
    name: '本文の色',
    intent: '本文と同じ濃紺。いちばん読みやすいが、線の名前が目盛りより強く、グラフの上で目立つ',
    spec: [
      ['色', 'fg'],
      ['白地', '13.8'],
    ],
    tokens: { '--chart-label-base': 'var(--color-fg)', '--chart-label-tint': '0%' },
  },
  {
    id: 'C',
    name: '線の色を濃くした色',
    intent:
      '線の色に濃紺を 3 割混ぜて濃くする。色相は線と同じなので結びつきが残り、8 色すべてで 4.5:1 を満たす。線よりくすんで見える',
    spec: [
      ['色', '系列の色 70%・fg 30%（oklab）'],
      ['白地', '4.70〜5.56'],
    ],
    tokens: { '--chart-label-base': 'var(--color-fg)', '--chart-label-tint': '70%' },
  },
];

const columns: Column[] = [
  { label: '3 系列' },
  { label: '1 系列', note: '凡例を出さず、名前は線の端だけ' },
];

export const Candidates: Story = {
  name: '比較',
  render: ({ pick }) => (
    <Comparison
      index={666}
      axis="グラフの線の端の名前の色"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => <LineChartPreview seriesCount={column.label === '1 系列' ? 1 : 3} />}
    >
      <p>
        4
        系列までのグラフで、線の右端に書く系列の名前の色を決めます。名前は凡例と同じことを伝えるので、どの線の名前かが分かり、文字として読めることが要ります。
      </p>
      <p>
        推し: C（線の色を濃くした色）。色相で線と結びつき、どの色でも小さな文字の 4.5:1
        を満たします。A
        は結びつきがいちばん強いものの、文字として薄すぎます。現行版は静かですが、線が交わるところでは位置だけが頼りです。
      </p>
    </Comparison>
  ),
};
