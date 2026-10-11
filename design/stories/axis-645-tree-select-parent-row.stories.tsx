import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { OpenFrame, scrollableDecorator } from './tree-select-axis-parts';

// 軸 645: TreeSelect（1 つ選ぶ形）で、親の行を押したときの働き
const meta = {
  title: 'Design Review/645 TreeSelect の親の行',
  id: 'design-review-645-tree-select-parent-row',
  parameters: { layout: 'fullscreen' },
  decorators: [scrollableDecorator],
  args: { pick: '' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const parentSelectable: Record<string, boolean> = { 現行版: true, A: false };

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '親も選べる',
    intent:
      '行を押すと、親でも葉でも選ぶ。開け閉めは左の山形を押す（載せると山形のまわりに塗りが出て、押せる範囲を見せる）か、→・← で行う。複数選ぶ形（親を押すと中もすべて選ぶ）と押し方がそろう',
    spec: [
      ['親の行を押す', '選んで閉じる'],
      ['開け閉め', '山形・→・←'],
      ['選べる行', '親と葉'],
    ],
  },
  {
    id: 'A',
    name: '親は開くだけ',
    intent:
      '親の行を押すと開け閉めだけをし、葉だけを選べる。行のどこを押しても開くので、指でも押し分けに迷わない。親（「デザイン」など）そのものは値にできない',
    spec: [
      ['親の行を押す', '開け閉め'],
      ['開け閉め', '行・山形・→・←'],
      ['選べる行', '葉だけ'],
    ],
  },
];

const columns: Column[] = [
  { label: 'マウス', note: '開いたままの面。親の行（デザイン・部品）と山形を押してみてください' },
  { label: '指の密度', note: '行の高さ 44px。山形の押せる範囲は印の大きさのままです' },
];

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={645}
      axis="TreeSelect の親の行（1 つ選ぶ形）"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => (
        <OpenFrame
          density={column.label === 'マウス' ? 'fine' : 'coarse'}
          props={{ defaultValue: 'principles', parentSelectable: parentSelectable[candidate.id] }}
        />
      )}
    >
      <p>
        1
        つ選ぶ形で、子を持つ行（親）を押したときに、選ぶか開け閉めするかを選びます。キーボードはどちらも同じで、→・←
        で開け閉め、Enter で選びます（A の親の行では Enter も開け閉め）。
      </p>
      <p>
        迷う点は、現行版では 1 つの行の中に「選ぶ」と「開け閉め」の 2
        つの押せる場所があることです。山形は印の大きさ（20px）なので、指では押しにくくなります。見えない広がりは付けない決まり（原則
        17）なので、広げるなら山形の塗りごと大きくすることになります。
      </p>
      <p>
        おすすめは現行版（親も選べる）を既定にし、A（親は開くだけ）を選べるようにする形です。分類を選ぶ欄では「デザイン全体」を選びたいことが多く、複数選ぶ形とも押し方がそろいます。葉だけが意味を持つ木（ファイル・個別の項目）では
        A を使います。
      </p>
    </Comparison>
  ),
};
