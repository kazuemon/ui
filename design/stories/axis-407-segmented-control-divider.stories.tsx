import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '../../src/components/segmented-control/SegmentedControl';

// 軸 407: SegmentedControl の、選んでいない項目どうしのあいだの仕切りの線
const meta = {
  title: 'Design Review/407 SegmentedControl の仕切りの線',
  id: 'design-review-407-segmented-control-divider',
  parameters: { layout: 'fullscreen' },
  args: { pick: '現行版,A' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', '現行版,A'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '線なし',
    intent: '項目のあいだには何も引かない。項目の区切りは、文字の間と hover の塗りで分かる',
    spec: [['仕切り', 'なし']],
    tokens: { '--segmented-control-divider-width': '0px' },
  },
  {
    id: 'A',
    name: '選んでいない項目のあいだに細い線',
    intent:
      '選んでいない項目どうしのあいだに、高さの半分の細い線を引く。つまみの両隣では消す。項目が多いときに、どこまでが 1 つか分かりやすい',
    spec: [
      ['仕切り', '細い境界線・高さの半分'],
      ['つまみの両隣', '消す'],
    ],
    tokens: { '--segmented-control-divider-width': 'var(--border-width-thin)' },
  },
];

const columns: Column[] = [
  { label: '3 つ', note: '先頭を選ぶ' },
  { label: '4 つ', note: '2 つめを選ぶ' },
];

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={407}
      axis="SegmentedControl の仕切りの線"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) =>
        column.label === '3 つ' ? (
          <SegmentedControl<string> accessibleName="期間" defaultValue="day">
            <SegmentedControlItem value="day">日</SegmentedControlItem>
            <SegmentedControlItem value="week">週</SegmentedControlItem>
            <SegmentedControlItem value="month">月</SegmentedControlItem>
          </SegmentedControl>
        ) : (
          <SegmentedControl<string> accessibleName="絞り込み" defaultValue="unread">
            <SegmentedControlItem value="all">すべて</SegmentedControlItem>
            <SegmentedControlItem value="unread">未読</SegmentedControlItem>
            <SegmentedControlItem value="flagged">フラグ付き</SegmentedControlItem>
            <SegmentedControlItem value="trash">ゴミ箱</SegmentedControlItem>
          </SegmentedControl>
        )
      }
    >
      <p>
        決定: 現行版（線なし）を既定にし、A（選んでいない項目のあいだに細い線）も showDivider
        で選べる（ADR は記録のときに振る）。
      </p>
      <p>
        選んでいない項目どうしのあいだに、仕切りの線を引くかを選びます。線はつまみの両隣では消えます。項目を押して、つまみが動いたときの線の出入りも見てください。
      </p>
    </Comparison>
  ),
};
