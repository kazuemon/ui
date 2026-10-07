import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { NavbarSample } from './navigation-menu-axis-parts';

// 軸 563: NavigationMenu の開いている項目の印
const meta = {
  title: 'Design Review/563 NavigationMenu の開いている項目の印',
  id: 'design-review-563-navigation-menu-open-trigger',
  parameters: {
    layout: 'fullscreen',
    pseudo: {
      rootSelector: 'body',
      hover: ['[data-preview="hover"] li:first-child > [data-slot="navigation-menu-trigger"]'],
    },
  },
  args: { pick: 'B' },
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
    name: 'hover の塗りを残し、▼ を上へ',
    intent:
      '開いているあいだ、項目に hover と同じ淡い塗りを残し、文字を濃くして ▼ を上向きにする。マウスが面の中へ移っても、どこから開いたかが分かる',
    spec: [
      ['塗り', 'hover と同じ淡い塗り'],
      ['▼', '上向きに回す'],
      ['下の線', 'なし'],
    ],
    tokens: {
      '--navigation-menu-trigger-open-bg':
        'color-mix(in oklab, var(--color-fg) var(--flat-hover-mix), transparent)',
      '--navigation-menu-caret-open-rotate': '180deg',
      '--navigation-menu-trigger-open-bar': '0',
    },
  },
  {
    id: 'A',
    name: '▼ を上へ回すだけ',
    intent:
      '塗りは敷かず、文字を濃くして ▼ を上向きにするだけ。いちばん軽いが、マウスが面へ移ると hover の塗りが消え、印は ▼ だけになる',
    spec: [
      ['塗り', 'なし'],
      ['▼', '上向きに回す'],
      ['下の線', 'なし'],
    ],
    tokens: {
      '--navigation-menu-trigger-open-bg': 'transparent',
      '--navigation-menu-caret-open-rotate': '180deg',
      '--navigation-menu-trigger-open-bar': '0',
    },
  },
  {
    id: 'B',
    name: '塗りを残し、▼ は回さない',
    intent: '開いていることは塗りと濃い文字で示し、▼ は動かさない',
    spec: [
      ['塗り', 'hover と同じ淡い塗り'],
      ['▼', '回さない'],
      ['下の線', 'なし'],
    ],
    tokens: {
      '--navigation-menu-trigger-open-bg':
        'color-mix(in oklab, var(--color-fg) var(--flat-hover-mix), transparent)',
      '--navigation-menu-caret-open-rotate': '0deg',
      '--navigation-menu-trigger-open-bar': '0',
    },
  },
  {
    id: 'C',
    name: '文字の下に青い線',
    intent:
      'Navbar のいまいるページの印（underline）と同じ青い線を文字の下に引き、▼ を上向きにする。塗りは敷かない。いまいるページの印に underline を選んだ帯では見分けられない',
    spec: [
      ['塗り', 'なし'],
      ['▼', '上向きに回す'],
      ['下の線', '青い線（2px）'],
    ],
    tokens: {
      '--navigation-menu-trigger-open-bg': 'transparent',
      '--navigation-menu-caret-open-rotate': '180deg',
      '--navigation-menu-trigger-open-bar': '1',
    },
  },
];

const columns: Column[] = [
  { label: 'Works を開いたところ', note: 'マウスは面の中にある想定' },
  { label: '閉じていて hover', note: '比べるための hover', preview: 'hover' },
];

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={563}
      axis="NavigationMenu の開いている項目の印"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => (
        <NavbarSample
          open={column.preview === 'hover' ? null : 'works'}
          height={column.preview === 'hover' ? 'h-[120px]' : 'h-[340px]'}
        />
      )}
    >
      <p>
        決定: B（hover の塗りを残し、▼ は回さない）（ADR-0487）。「B
        かなと思いました。クリックではなくホバーで開き、閉じ方はメニューを押すだけじゃなくてホバーを外すでもできるので。」
      </p>
      <p>
        面を開いている項目を、帯の上でどう見せるかを選びます。どの案も、開いているあいだは文字を本文の色に濃くします。
      </p>
      <p>
        右の列は、閉じている項目に載せたときの hover です。開いたときの塗りが hover
        と同じだと、マウスが項目の上にあるあいだは見た目が変わりません。
      </p>
    </Comparison>
  ),
};
