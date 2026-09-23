import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { NarrowFrame } from './sidebar-parts';

// 軸 304: 狭い画面（スマートフォン）での Sidebar の出し方
//   狭い画面では列をやめ、Drawer と同じ挙動（後ろを暗くする・外を押す／Esc／はじくで閉じる・焦点を面に閉じ込める）にする
//   比べるのは、出す向き。side: left（横から出すパネル）・bottom（下から出すシート）
//   仮の部品は sidebar-parts.tsx。中身の入れ子は、面の中でその場に開く（Tree と同じ）
const meta = {
  title: 'Design Review/304 Sidebar の狭い画面',
  id: 'design-review-304-sidebar-narrow',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'A' },
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

const candidates: (Candidate & { variant: 'panel' | 'sheet' })[] = [
  {
    id: 'A',
    name: '横から出すパネル',
    intent:
      '左の端から、画面の 9 割ほどまでの幅のパネルが出る。広い画面の列と同じ左の位置なので、「列が重なって出た」と読める。Header のボタンを押した指のすぐ近くから出る。はじいて閉じる向きは左',
    spec: [
      ['side', 'left'],
      ['幅', '280px（画面が狭いときは画面に収める）'],
    ],
    variant: 'panel',
  },
  {
    id: 'B',
    name: '下から出すシート',
    intent:
      '下から、画面の 8 割ほどの高さのシートが出る。片手で親指が届く位置に項目が来る。3 段の入れ子を開くと縦に長くなるので、高さに余裕がある。つまみを引いて閉じる。Navbar のメニューと同じ出し方（指で操作していて画面が狭いとき）',
    spec: [
      ['side', 'bottom'],
      ['高さ', '画面の 78%'],
    ],
    variant: 'sheet',
  },
];

const columns: Column[] = [
  { label: '閉じている', note: 'Header のボタンだけが見える' },
  { label: '開いた', note: '入れ子を 3 段まで開いた状態' },
];

export const Narrow: Story = {
  name: '狭い画面の出し方',
  render: ({ pick }) => (
    <Comparison
      pick={pick}
      index={304}
      axis="Sidebar の狭い画面での出し方"
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const found = candidates.find((c) => c.id === candidate.id);
        return (
          <NarrowFrame
            variant={found?.variant ?? 'panel'}
            open={columns.indexOf(column) === 1}
            label={`${candidate.name}・${column.label}`}
          />
        );
      }}
    >
      <p>
        <strong>
          決定:
          A（横から出すパネル）を既定にし、B（下から出すシート）も選べる。出す向きは、操作方法（指か、マウスか）に応じて切り替える設定も付ける。
        </strong>
      </p>
      <p>
        狭い画面では、列の代わりに Drawer と同じ挙動で出します。開閉のボタンは Header
        の同じボタンで、広い画面と押す場所は変わりません。切り替える幅は、Navbar
        と同じく画面ではなく置かれた面の幅で決め、 48rem（Navbar の畳む幅と同じ）より狭いときに
        Drawer にする案です。
      </p>
      <p>
        選ぶのは出す向きです。「A を既定にして、B も side で選べる」、または Navbar
        と同じく「指で操作していて画面が狭いときだけ下から」という決め方もできます。
      </p>
    </Comparison>
  ),
};
