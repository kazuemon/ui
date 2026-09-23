import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Frame, type Indicator } from './sidebar-parts';

// 軸 306: Sidebar の、いまいる場所の印
//   開いた列では、いまいる行（Aグループ）に印を付ける。畳んだ列では入れ子が隠れるので、いまいる行を含む親（ステージ）のアイコンに同じ印を付ける
//   仮の部品は sidebar-parts.tsx。行の高さ・字下げ・つなぎの線は、どの案も同じ
const meta = {
  title: 'Design Review/306 Sidebar のいまいる場所の印',
  id: 'design-review-306-sidebar-current',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'A' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'A', 'B', 'C'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const candidates: (Candidate & { indicator: Indicator })[] = [
  {
    id: 'A',
    name: 'グレーの面と太字',
    intent:
      '行を淡いグレーで敷き、文字を太くする。Tree の fill と同じ見た目で、色を使わないので、青い操作（ボタン・リンク）と混ざらない。畳んだ列では、アイコンの後ろがグレーになる',
    spec: [['currentIndicator', 'fill']],
    indicator: 'fill',
  },
  {
    id: 'B',
    name: '左端の線と太字',
    intent:
      '行の左端に細い青い線を引き、文字を太くする。面を敷かないので、行が軽く、入れ子が深くても目立ちすぎない。線が列の左の端に並ぶので、どこにいるかを縦に目で追いやすい',
    spec: [['currentIndicator', 'bar']],
    indicator: 'bar',
  },
  {
    id: 'C',
    name: '淡い青の面と青い文字',
    intent:
      '行を淡い青で敷き、文字とアイコンを青にする。いまいる場所がいちばん強く見える。代わりに、青が「押せる」の色と近く、行が多いと画面が青っぽくなる',
    spec: [['currentIndicator', 'tint']],
    indicator: 'tint',
  },
];

const columns: Column[] = [
  { label: '開いた', note: 'いまいる行は「Aグループ」' },
  { label: '畳んだ（rail）', note: '親の「ステージ」のアイコンに印が付く' },
];

export const Current: Story = {
  name: 'いまいる場所の印',
  render: ({ pick }) => (
    <Comparison
      pick={pick}
      index={306}
      axis="Sidebar のいまいる場所の印"
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const found = candidates.find((c) => c.id === candidate.id);
        return (
          <Frame
            placement="below"
            collapsed={columns.indexOf(column) === 1}
            indicator={found?.indicator}
            label={`${candidate.name}・${column.label}`}
          />
        );
      }}
    >
      <p>
        <strong>
          決定: A（グレーの面と太字）を既定にする。Tree と同じ
          color（neutral・primary・secondary）で、いまいる行の色を選べる。primary は
          C（淡い青の面と青い文字）と同じ見た目になる。B（左端の線）は作らない。
        </strong>
      </p>
      <p>
        いまいる場所の印を選びます。Tree と Navbar
        の印（fill・text・primary・underline）に合わせるか、Sidebar
        だけ別にするかも、ここで決められます。
      </p>
      <p>
        「A を既定にして、B・C
        も選べる」のように決められます。他の部分（行の高さ・字下げ・つなぎの線・「＋」）は、
        どの案も同じです。「＋」のような行の末尾の操作は、指で操作する環境には hover
        がないので、いつも見せる形で作ります。
      </p>
    </Comparison>
  ),
};
