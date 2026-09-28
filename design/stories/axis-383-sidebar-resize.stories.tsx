import type { Meta, StoryObj } from '@storybook/react-vite';

import { statePseudo } from '../../src/stories/story-states';
import { type Candidate, type Column, Comparison } from './Comparison';
import { Frame } from './sidebar-axis-parts';

// 軸 383: Sidebar の幅を変えるつまみ
//   列の端をつかんで幅を変える（SidebarLayout の resizable）。つまみの見せ方を比べる。動き（最小より細くすると畳む・2 回押すと戻る）は案で変えない
const meta = {
  title: 'Design Review/383 Sidebar の幅を変えるつまみ',
  id: 'design-review-383-sidebar-resize',
  parameters: {
    layout: 'fullscreen',
    pseudo: statePseudo({
      hover: '[data-slot="sidebar-resize-handle"]',
      focusVisible: '[data-slot="sidebar-resize-handle"]',
    }),
  },
  args: { pick: 'A,C' },
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

const candidates: Candidate[] = [
  {
    id: 'A',
    name: '載せるとグレーの線',
    intent:
      'ふだんは境の細い線だけ。載せる・動かしているあいだは、境が濃いグレーの太い線になり、カーソルが左右の矢印になる',
    spec: [
      ['ふだん', '境の線だけ'],
      ['載せたとき', '濃いグレーの線'],
    ],
    tokens: {
      '--sidebar-handle-line-color': 'var(--color-line-strong)',
      '--sidebar-handle-grip-display': 'none',
    },
  },
  {
    id: 'B',
    name: '載せると青い線',
    intent:
      'A と同じだが、線を青にする。つかめる場所だとはっきり分かる。フォーカスの線と同じ色になる',
    spec: [
      ['ふだん', '境の線だけ'],
      ['載せたとき', '青い線'],
    ],
    tokens: {
      '--sidebar-handle-line-color': 'var(--color-primary)',
      '--sidebar-handle-grip-display': 'none',
    },
  },
  {
    id: 'C',
    name: 'つまみをいつも見せる',
    intent:
      '境の真ん中に、小さな縦の棒をいつも出す。幅を変えられることが、載せる前から分かる。載せると A と同じ線',
    spec: [
      ['ふだん', '小さなつまみ'],
      ['載せたとき', '濃いグレーの線'],
    ],
    tokens: {
      '--sidebar-handle-line-color': 'var(--color-line-strong)',
      '--sidebar-handle-grip-display': 'block',
    },
  },
];

const columns: Column[] = [
  { label: '通常' },
  { label: 'つまみに載せた', preview: 'hover' },
  { label: 'フォーカス（キーボード）', preview: 'focus' },
];

export const Axis: Story = {
  name: 'Sidebar の幅を変えるつまみ',
  render: ({ pick }) => (
    <Comparison
      index={383}
      axis="Sidebar の幅を変えるつまみ"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={() => (
        <Frame
          features={{ edges: true }}
          height={520}
          width={340}
          layoutProps={{ resizable: true }}
        />
      )}
    >
      <p className="font-bold text-fg">
        決定（ADR-0362）: 既定は
        A（載せるとグレーの線）。C（つまみをいつも見せる）も選べる。最小より細くすると畳む動きは既定でオン、オフにもできる。
      </p>
      <p>
        列の端（本文との境）をつかんで、幅を 200〜480px
        のあいだで変えます。いちばん狭い幅からさらに細くすると列を畳み、2
        回押すとはじめの幅に戻ります。キーボードでは、つまみにフォーカスして ← → で 16px
        ずつ変わります。
      </p>
      <p>
        動きは Controls
        のない下の見本（実際に掴める）でも試せます。「最小より細くすると畳む」を残すかどうかも教えてください。
      </p>
    </Comparison>
  ),
};

/** 実際に掴んで試す。列の端をドラッグ、2 回押して戻す、最小よりさらに細くして畳む */
export const Try: Story = {
  name: '試す',
  render: () => (
    <div className="p-6">
      <Frame
        features={{ edges: true, counts: true }}
        width={800}
        height={600}
        layoutProps={{ resizable: true, motion: 'smooth' }}
      />
    </div>
  ),
};
