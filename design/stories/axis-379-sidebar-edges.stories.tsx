import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Frame } from './sidebar-axis-parts';

// 軸 379: Sidebar の上下に固定する場所
//   列の上（大会の切り替え）と下（お知らせ・設定・アカウント）を固定し、真ん中の行だけをスクロールさせる。固定の場所とスクロールする中身の分け方を比べる
const meta = {
  title: 'Design Review/379 Sidebar の上下に固定する場所',
  id: 'design-review-379-sidebar-edges',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'A,B,C' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'A', 'B', 'C', 'D'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const candidates: Candidate[] = [
  {
    id: 'A',
    name: '線で区切る',
    intent:
      '固定の場所とスクロールする中身のあいだに、細い線を引く。どこからがスクロールするのかが、はっきり分かる',
    spec: [
      ['境の線', '細い線'],
      ['固定の場所の地', '列と同じ'],
    ],
    tokens: {
      '--sidebar-edge-line-width': 'var(--border-width-thin)',
      '--sidebar-edge-bg': 'transparent',
    },
  },
  {
    id: 'B',
    name: '何も引かない',
    intent:
      '線も面も足さず、余白だけで分ける。いちばん静か。中身がスクロールして固定の場所の下に潜るときだけ、スクロールの影で境が出る',
    spec: [
      ['境の線', 'なし'],
      ['固定の場所の地', '列と同じ'],
    ],
    tokens: {
      '--sidebar-edge-line-width': '0px',
      '--sidebar-edge-bg': 'transparent',
    },
  },
  {
    id: 'C',
    name: '淡い面で分ける',
    intent:
      '固定の場所だけに、入力欄と同じ淡いグレーを敷く。線は引かない。上下が「枠」、真ん中が「中身」と面で読める',
    spec: [
      ['境の線', 'なし'],
      ['固定の場所の地', '淡いグレー'],
    ],
    tokens: {
      '--sidebar-edge-line-width': '0px',
      '--sidebar-edge-bg': 'var(--color-field)',
    },
  },
  {
    id: 'D',
    name: '線と淡い面',
    intent: 'C に線を足す。分け方はいちばん強いが、上下が重く見える',
    spec: [
      ['境の線', '細い線'],
      ['固定の場所の地', '淡いグレー'],
    ],
    tokens: {
      '--sidebar-edge-line-width': 'var(--border-width-thin)',
      '--sidebar-edge-bg': 'var(--color-field)',
    },
  },
];

const columns: Column[] = [
  { label: '開いた列' },
  { label: '開いた列（低い画面）', note: '真ん中の行がスクロールする' },
  { label: '畳んだ列（rail）', note: '上下の行もアイコンだけになる' },
];

export const Axis: Story = {
  name: 'Sidebar の上下に固定する場所',
  render: ({ pick }) => (
    <Comparison
      index={379}
      axis="Sidebar の上下に固定する場所"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => (
        <Frame
          features={{ edges: true }}
          height={column.label.includes('低い') ? 420 : 640}
          width={column.label.includes('畳んだ') ? 200 : 360}
          collapsed={column.label.includes('畳んだ')}
        />
      )}
    >
      <p className="font-bold text-fg">
        決定（ADR-0358）: 既定は
        A（線で区切る）。線をなくすことと、上・下それぞれに淡い面を敷くこと（C
        の上だけ・下だけ）も選べる。
      </p>
      <p>
        列の上に大会の切り替え（入れ子で他の大会を選ぶ）、下にお知らせ・設定・アカウントを固定します。中身の行だけがスクロールします。
      </p>
      <p>
        現行版には固定の場所がありません（列の下端の「畳む」ボタンだけ）。A
        を仮の既定にしています。狭い画面の Drawer では、上下の行も中身と一緒に並びます。
      </p>
    </Comparison>
  ),
};
