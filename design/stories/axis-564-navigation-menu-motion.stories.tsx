import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { NavbarSample, SwitchingSample } from './navigation-menu-axis-parts';

// 軸 564: NavigationMenu で項目を移ったときの動き（面の大きさと中身の入れ替わり）
const meta = {
  title: 'Design Review/564 NavigationMenu の項目を移る動き',
  id: 'design-review-564-navigation-menu-motion',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current' },
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
    name: '浮かぶ面と同じ長さで、少し滑って入れ替わる',
    intent:
      '面の大きさと位置は、浮かぶ面が開く長さ（200ms）でシートと同じ緩急で変わる。中身は移った向きから 24px 滑りながら、濃さで入れ替わる',
    spec: [
      ['大きさ・位置', '200ms'],
      ['中身', '200ms・24px 滑る'],
    ],
    tokens: {
      '--navigation-menu-resize-duration': 'var(--duration-normal)',
      '--navigation-menu-content-duration': 'var(--duration-normal)',
      '--navigation-menu-content-shift': 'calc(var(--spacing) * 6)',
    },
  },
  {
    id: 'A',
    name: '動かさない',
    intent: '面の大きさも中身も、移った瞬間に切り替える。開閉の動き（滑って出る）だけは残す',
    spec: [
      ['大きさ・位置', '0ms'],
      ['中身', '0ms'],
    ],
    tokens: {
      '--navigation-menu-resize-duration': '0ms',
      '--navigation-menu-content-duration': '0ms',
      '--navigation-menu-content-shift': '0px',
    },
  },
  {
    id: 'B',
    name: '大きさだけ変え、中身は濃さで',
    intent: '面の大きさは現行版と同じ。中身は滑らせず、その場で濃さだけで入れ替える',
    spec: [
      ['大きさ・位置', '200ms'],
      ['中身', '200ms・滑らない'],
    ],
    tokens: {
      '--navigation-menu-resize-duration': 'var(--duration-normal)',
      '--navigation-menu-content-duration': 'var(--duration-normal)',
      '--navigation-menu-content-shift': '0px',
    },
  },
  {
    id: 'C',
    name: 'シートと同じ長さで、大きく滑る',
    intent:
      '面の大きさと位置はシートの長さ（250ms）。中身は移った向きから 64px 滑り、どちらへ移ったかをはっきり見せる',
    spec: [
      ['大きさ・位置', '250ms'],
      ['中身', '250ms・64px 滑る'],
    ],
    tokens: {
      '--navigation-menu-resize-duration': 'var(--duration-sheet)',
      '--navigation-menu-content-duration': 'var(--duration-sheet)',
      '--navigation-menu-content-shift': 'calc(var(--spacing) * 16)',
    },
  },
];

const columns: Column[] = [
  { label: '自動で切り替え', note: 'Works と Blog を 1.6 秒ごとに入れ替える' },
  { label: '自分で試す', note: '帯の項目に載せて移る' },
];

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={564}
      axis="NavigationMenu の項目を移る動き"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) =>
        column.label === '自動で切り替え' ? <SwitchingSample /> : <NavbarSample open={null} />
      }
    >
      <p>
        決定: 既定は現行版（200ms で滑る）。動かさない形（A）を props で選べ、動きを減らす設定でも A
        になる（ADR-0488）。「現行版が一番違和感がないなと思いました。動きを減らす設定同様、A
        にするオプションも必要そうですね。」
      </p>
      <p>
        面を開いたまま隣の項目へ移ったときに、面の大きさ・位置と中身をどう変えるかを選びます。開くとき・閉じるときの動き（本体の側から滑って出る）は、どの案も浮かぶ面と同じです。
      </p>
      <p>
        左の列は、開く項目を自動で入れ替え続けます。右の列では、帯の項目に載せて Works と Blog
        を行き来して確かめます。動きを減らす設定では、どの案も動かしません。
      </p>
    </Comparison>
  ),
};
