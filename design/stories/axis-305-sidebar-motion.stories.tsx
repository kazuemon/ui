import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { InteractiveFrame, type Motion } from './sidebar-parts';

// 軸 305: Sidebar の開閉の動きと、開閉のボタンの置き場所
//   動き: 列の幅を滑らかに変えるか、切り替えるか。動きは押して確かめる（静止画では分からない）
//   ボタン: Header の左端（B の置き方では、開閉しても動かない）・列の下端の「畳む」
//   幅の動きは duration-normal（200ms）。動きを減らす設定のときは、どの案も切り替えにする
const meta = {
  title: 'Design Review/305 Sidebar の開閉の動き',
  id: 'design-review-305-sidebar-motion',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'B' },
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

const candidates: (Candidate & { motion: Motion })[] = [
  {
    id: 'A',
    name: '切り替える（動かさない）',
    intent:
      '押した瞬間に幅が変わる。本文が一度に動くので、目で追う間がない代わりに、待たされない。動きが苦手な人にも同じ',
    spec: [['幅の動き', 'なし']],
    motion: 'instant',
  },
  {
    id: 'B',
    name: '幅を滑らかに変える',
    intent:
      '列の幅が 200ms で変わり、本文が押されて動く。何が起きたか（列が畳まれた・開いた）が分かる。ラベルは列の幅に切り取られるだけなので、開く途中で文字が途中まで見える',
    spec: [
      ['幅の動き', '200ms（duration-normal）・ease-out'],
      ['ラベル', '幅に切り取られる'],
    ],
    motion: 'smooth',
  },
  {
    id: 'C',
    name: '幅を滑らかに＋ラベルを遅れて出す',
    intent:
      '幅は B と同じ。開くときだけラベルを 100ms 遅らせて淡く出し、畳むときはすぐ消す。文字が途中で切れて見えない代わりに、開ききるまでの間はアイコンだけが見える',
    spec: [
      ['幅の動き', '200ms（duration-normal）・ease-out'],
      ['ラベル', '開くとき 100ms 遅れて 100ms で現れる・畳むときはすぐ消える'],
    ],
    motion: 'smooth-label',
  },
];

const columns: Column[] = [
  { label: 'Header の左端で開閉', note: '開閉しても、ボタンの位置は動かない' },
  { label: '列の下端の「畳む」で開閉', note: '畳むと、ボタンは rail の下端に残る' },
];

export const Opening: Story = {
  name: '開閉の動き',
  render: ({ pick }) => (
    <Comparison
      pick={pick}
      index={305}
      axis="Sidebar の開閉の動きと、開閉のボタンの置き場所"
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const found = candidates.find((c) => c.id === candidate.id);
        return (
          <InteractiveFrame
            motion={found?.motion ?? 'instant'}
            footerToggle={columns.indexOf(column) === 1}
            label={`${candidate.name}・${column.label}`}
          />
        );
      }}
    >
      <p>
        <strong>
          決定: B（幅を滑らかに変える）を既定にし、A（切り替える）も選べる。開閉のボタンは Header
          の左端が既定で、列の下端の「畳む」ボタンもオプションで足せる。
        </strong>
      </p>
      <p>
        列を開く・畳むときの動きと、そのボタンをどこに置くかを選びます。どの枠も、ボタンを押して試せます。
      </p>
      <p>
        ボタンの置き場所は、動きとは別に決められます。Header
        の左端は、列を畳んでも位置が変わらず、スマートフォンでは同じボタンで Drawer
        を開きます。列の下端は、列の中で完結しますが、狭い画面では別にボタンが要ります。
      </p>
    </Comparison>
  ),
};
