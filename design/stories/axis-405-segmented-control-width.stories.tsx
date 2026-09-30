import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '../../src/components/segmented-control/SegmentedControl';

// 軸 405: SegmentedControl の項目の幅。溝のグリッドの列の幅（--segmented-control-columns）を変える
const meta = {
  title: 'Design Review/405 SegmentedControl の項目の幅',
  id: 'design-review-405-segmented-control-width',
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
    name: '均等',
    intent:
      'いちばん長い項目に合わせて、すべての項目を同じ幅にする。つまみの大きさが変わらず、滑る動きが一定に見える。短い項目は左右が広く空く',
    spec: [['項目の幅', 'いちばん長い項目にそろえる']],
    tokens: { '--segmented-control-columns': '1fr' },
  },
  {
    id: 'A',
    name: '文字に合わせる',
    intent:
      '項目ごとに文字の幅と左右の余白だけを取る。溝が短くなり、見出しの行に置きやすい。つまみは滑りながら幅も変わる',
    spec: [['項目の幅', '文字の幅＋左右の余白']],
    tokens: { '--segmented-control-columns': 'auto' },
  },
];

const columns: Column[] = [
  { label: '長さが違う', note: '表・ボード・カレンダー' },
  { label: '長さがそろう', note: '日・週・月' },
  { label: '4 つ', note: 'すべて・未読・フラグ付き・ゴミ箱' },
];

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={405}
      axis="SegmentedControl の項目の幅"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => {
        if (column.label === '長さが違う')
          return (
            <SegmentedControl<string> accessibleName="表示" defaultValue="table">
              <SegmentedControlItem value="table">表</SegmentedControlItem>
              <SegmentedControlItem value="board">ボード</SegmentedControlItem>
              <SegmentedControlItem value="calendar">カレンダー</SegmentedControlItem>
            </SegmentedControl>
          );
        if (column.label === '長さがそろう')
          return (
            <SegmentedControl<string> accessibleName="期間" defaultValue="week">
              <SegmentedControlItem value="day">日</SegmentedControlItem>
              <SegmentedControlItem value="week">週</SegmentedControlItem>
              <SegmentedControlItem value="month">月</SegmentedControlItem>
            </SegmentedControl>
          );
        return (
          <SegmentedControl<string> accessibleName="絞り込み" defaultValue="all">
            <SegmentedControlItem value="all">すべて</SegmentedControlItem>
            <SegmentedControlItem value="unread">未読</SegmentedControlItem>
            <SegmentedControlItem value="flagged">フラグ付き</SegmentedControlItem>
            <SegmentedControlItem value="trash">ゴミ箱</SegmentedControlItem>
          </SegmentedControl>
        );
      }}
    >
      <p>
        決定: 現行版（均等）を既定にし、A（文字に合わせる）も itemWidth="fit" で選べる（ADR
        は記録のときに振る）。
      </p>
      <p>
        項目の幅を選びます。項目を押して、つまみが滑るときの見え方（大きさが一定か、幅も変わるか）も見てください。
      </p>
      <p>
        どちらを既定にし、もう一方も選べるようにするかを教えてください。溝を置いた場所の幅いっぱいに広げる形は、どちらの案でも別に足せます。
      </p>
    </Comparison>
  ),
};
