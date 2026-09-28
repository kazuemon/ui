import type { Meta, StoryObj } from '@storybook/react-vite';

import { statePseudo } from '../../src/stories/story-states';
import { type Candidate, type Column, Comparison } from './Comparison';
import { Frame } from './sidebar-axis-parts';

// 軸 384: Sidebar の節を畳む
//   節（SidebarSection）の題を押して、節の行を畳む（collapsible）。開閉の印の位置と見せ方を比べる。畳んだ列（rail）では節を畳まない
const meta = {
  title: 'Design Review/384 Sidebar の節を畳む',
  id: 'design-review-384-sidebar-section-collapse',
  parameters: {
    layout: 'fullscreen',
    pseudo: statePseudo({
      hover: 'li[data-slot="sidebar-section"]:first-child [data-slot="sidebar-section-title"]',
    }),
  },
  args: { pick: 'D,B' },
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
    name: '右端にいつも',
    intent: '題の行の右端に ∨ をいつも出す。入れ子の行の印（右端）と同じ位置にそろう',
    spec: [
      ['印の位置', '右端'],
      ['ふだん', '見せる'],
    ],
    tokens: {
      '--sidebar-section-caret-order': '1',
      '--sidebar-section-caret-rest-opacity': '1',
    },
  },
  {
    id: 'B',
    name: '右端・載せたときだけ',
    intent:
      'A と同じ位置だが、題に載せたとき・フォーカスしたときだけ出す。ふだんは題が静か。閉じた節も印が消えるので、閉じていることは行がないことで読む',
    spec: [
      ['印の位置', '右端'],
      ['ふだん', '隠す'],
    ],
    tokens: {
      '--sidebar-section-caret-order': '1',
      '--sidebar-section-caret-rest-opacity': '0',
    },
  },
  {
    id: 'C',
    name: '題の前にいつも',
    intent:
      '題の文字の前に印を置く。開閉できることが、題を読む前に分かる。入れ子の行の印（右端）とは位置が違う',
    spec: [
      ['印の位置', '題の前'],
      ['ふだん', '見せる'],
    ],
    tokens: {
      '--sidebar-section-caret-order': '-1',
      '--sidebar-section-caret-rest-opacity': '1',
    },
  },
  {
    id: 'D',
    name: '右端・半分の濃さ',
    intent:
      'DataTable の並べ替えの印と同じ見せ方。題の右端に、ふだんから半分の濃さで置き、題に載せる・フォーカスすると濃くする',
    spec: [
      ['印の位置', '右端'],
      ['ふだん', '半分の濃さ'],
    ],
    tokens: {
      '--sidebar-section-caret-order': '1',
      '--sidebar-section-caret-rest-opacity': '0.5',
    },
  },
];

const columns: Column[] = [
  { label: '通常', note: '「関連情報」は閉じている' },
  { label: '「試合管理」の題に載せた', preview: 'hover' },
];

export const Axis: Story = {
  name: 'Sidebar の節を畳む',
  render: ({ pick }) => (
    <Comparison
      index={384}
      axis="Sidebar の節を畳む"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={() => <Frame features={{ collapsible: true }} height={780} />}
    >
      <p className="font-bold text-fg">
        決定（ADR-0363）: 既定は D（DataTable
        の並べ替えの印と同じ。右端に半分の濃さ・載せると濃く）。載せたときだけ出す B
        と、いつも出すも選べる。
      </p>
      <p>
        SidebarSection に collapsible を付けると、題を押して節の行を畳めます（はじめに閉じておくのは
        defaultExpanded を false にします）。
      </p>
      <p>題の文字の大きさ・色は、畳めない節と同じです。</p>
    </Comparison>
  ),
};
