import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Frame, type Placement } from './sidebar-parts';

// 軸 303: Sidebar の置き方と、畳んだときの形
//   Sidebar の部品はまだない。ここは並べ方だけを見比べる仮の部品（sidebar-parts.tsx）で、中身は Navbar と平らな行
//   置き方 placement: full（Header も横へ押しのける）・below（Header の下に出て、本文だけ押しのける）
//   畳み方 rail: 幅を 56px に縮め、アイコンだけ残す。入れ子は hover で横に出す（ステージ＞リーグ＞グループの 3 段）
const meta = {
  title: 'Design Review/303 Sidebar の置き方と畳み方',
  id: 'design-review-303-sidebar-placement',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'B' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'A', 'B', 'A,B'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const candidates: (Candidate & { placement: Placement })[] = [
  {
    id: 'A',
    name: 'Header ごと押しのける',
    intent:
      '列が画面の上から下まで通り、Header は本文の側に入る。開閉すると Header の幅も変わる。列がページの骨組みになり、Header は「本文の見出し帯」になる。開閉のボタンは Header の左端で、列の右隣に並ぶ',
    spec: [
      ['placement', 'full'],
      ['列の幅（開）', '224px'],
      ['列の幅（畳）', '56px'],
    ],
    placement: 'full',
  },
  {
    id: 'B',
    name: '本文だけ押しのける（Header の下）',
    intent:
      'Header は画面いっぱいの幅のまま動かず、その下の列と本文が横に並ぶ。開閉のボタンは Header の左端で、開閉しても動かない。サイト全体の Header を持つアプリ向き',
    spec: [
      ['placement', 'below'],
      ['列の幅（開）', '224px'],
      ['列の幅（畳）', '56px'],
    ],
    placement: 'below',
  },
];

const columns: Column[] = [
  { label: '開いた', note: 'アイコンとラベル。入れ子は、つなぎの線で 3 段まで示す' },
  { label: '畳んだ（rail）', note: 'アイコンだけ。入れ子は隠れる' },
  { label: '畳んだ＋入れ子を横に出す', note: 'ステージのアイコンに hover した状態' },
];

export const Layout: Story = {
  name: '置き方と畳み方',
  render: ({ pick }) => (
    <Comparison
      pick={pick}
      index={303}
      axis="Sidebar の置き方と畳み方"
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const found = candidates.find((c) => c.id === candidate.id);
        const at = columns.indexOf(column);
        return (
          <Frame
            placement={found?.placement ?? 'below'}
            collapsed={at > 0}
            flyout={at === 2}
            label={`${candidate.name}・${column.label}`}
          />
        );
      }}
    >
      <p>
        <strong>
          決定: B（Header の下で、本文だけ押しのける）を既定にする。A（Header ごと押しのける）も
          placement で選べる。畳んだ形はどちらも、アイコンだけ残す rail で、入れ子は hover
          で横に出す。
        </strong>
      </p>
      <p>
        Sidebar
        を、ページの横に並ぶ列として作ります。重ねて出す面（Drawer）は今のままで、狭い画面では同じ中身を
        Drawer に切り替えます。ここでは、広い画面での「置き方」と「畳んだ形」を見比べます。
      </p>
      <p>
        見てほしい点: A は Header が本文の帯になり、開閉のたびに Header の幅も動く。B は Header
        が動かず、開閉ボタンの位置が変わらない。rail の入れ子は、ステージ＞リーグ＞グループの 3
        段を、パネルを横に重ねて出しています。
      </p>
    </Comparison>
  ),
};
