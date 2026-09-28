import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Frame } from './sidebar-axis-parts';

// 軸 380: Sidebar の行の件数
//   未入力の結果・承認待ちのチーム・お問い合わせの件数を、行の右端に出す。畳んだ列では、アイコンの右上に重ねる
const meta = {
  title: 'Design Review/380 Sidebar の行の件数',
  id: 'design-review-380-sidebar-count',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'B,C,D' },
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
    name: '淡い数字・畳むと点',
    intent:
      '開いた列では、札を敷かず淡い数字だけを出す。畳んだ列では、アイコンの右上に青い点を付ける（数は出さない）。いちばん静か',
    spec: [
      ['開いた列', '淡い数字'],
      ['畳んだ列', '青い点'],
    ],
    tokens: {
      '--sidebar-count-bg': 'transparent',
      '--sidebar-count-fg': 'var(--color-fg-subtle)',
      '--sidebar-count-px': '0px',
      '--sidebar-rail-dot-display': 'block',
      '--sidebar-rail-count-display': 'none',
      '--sidebar-rail-mark-bg': 'var(--color-primary)',
    },
  },
  {
    id: 'B',
    name: '灰色の札・畳むと数字の札',
    intent:
      '開いた列では、淡いグレーの札に数字を入れる。畳んだ列でも数を残し、濃いグレーの小さな札にする。色を使わないので、いまいる行の印や青い操作と混ざらない',
    spec: [
      ['開いた列', '淡いグレーの札'],
      ['畳んだ列', '濃いグレーの数字の札'],
    ],
    tokens: {
      '--sidebar-count-bg': 'var(--color-select-neutral-selected)',
      '--sidebar-count-fg': 'var(--color-fg-muted)',
      '--sidebar-count-px': 'calc(var(--spacing) * 1.5)',
      '--sidebar-rail-dot-display': 'none',
      '--sidebar-rail-count-display': 'block',
      '--sidebar-rail-mark-bg': 'var(--color-neutral-strong)',
      '--sidebar-rail-mark-fg': 'var(--color-on-neutral-strong)',
    },
  },
  {
    id: 'C',
    name: '青い札・畳むと青い数字の札',
    intent:
      '開いた列・畳んだ列とも、青い札に白い数字。いちばん目に留まる。件数の多い行が並ぶと列が青っぽくなる',
    spec: [
      ['開いた列', '青い札'],
      ['畳んだ列', '青い数字の札'],
    ],
    tokens: {
      '--sidebar-count-bg': 'var(--color-primary)',
      '--sidebar-count-fg': 'var(--color-on-primary)',
      '--sidebar-count-px': 'calc(var(--spacing) * 1.5)',
      '--sidebar-rail-dot-display': 'none',
      '--sidebar-rail-count-display': 'block',
      '--sidebar-rail-mark-bg': 'var(--color-primary)',
      '--sidebar-rail-mark-fg': 'var(--color-on-primary)',
    },
  },
  {
    id: 'D',
    name: '灰色の札・畳むと点',
    intent:
      '開いた列は B と同じ灰色の札。畳んだ列では数を出さず青い点にする（細い列に数字の札が並ぶとうるさいため）',
    spec: [
      ['開いた列', '淡いグレーの札'],
      ['畳んだ列', '青い点'],
    ],
    tokens: {
      '--sidebar-count-bg': 'var(--color-select-neutral-selected)',
      '--sidebar-count-fg': 'var(--color-fg-muted)',
      '--sidebar-count-px': 'calc(var(--spacing) * 1.5)',
      '--sidebar-rail-dot-display': 'block',
      '--sidebar-rail-count-display': 'none',
      '--sidebar-rail-mark-bg': 'var(--color-primary)',
    },
  },
];

const columns: Column[] = [
  {
    label: '開いた列',
    note: 'ステージ 2・Bグループ 2・参加チーム 3・お問い合わせ 128（99+）・お知らせ 5',
  },
  { label: '畳んだ列（rail）' },
];

export const Axis: Story = {
  name: 'Sidebar の行の件数',
  render: ({ pick }) => (
    <Comparison
      index={380}
      axis="Sidebar の行の件数"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => (
        <Frame
          features={{ edges: true, counts: true }}
          width={column.label.includes('畳んだ') ? 200 : 360}
          height={640}
          collapsed={column.label.includes('畳んだ')}
        />
      )}
    >
      <p className="font-bold text-fg">
        決定（ADR-0359）: 既定は B（数字の札。色はグレー、color
        で変えられる）。畳んだ列で点にするのも選べる（D）。数字のない点だけの行も置ける。
      </p>
      <p>
        行の右端に件数を出します（SidebarItem の count）。100 以上は「99+」にします。0
        のときは出しません。
      </p>
      <p>
        畳んだ列ではアイコンの右上に重ねます。点にするか数字を残すかも、この軸で決めます。点の色（青）も含めて見てください。
      </p>
    </Comparison>
  ),
};
