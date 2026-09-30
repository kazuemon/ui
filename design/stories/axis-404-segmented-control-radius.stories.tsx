import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Button } from '../../src/components/button/Button';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '../../src/components/segmented-control/SegmentedControl';
import { TextField } from '../../src/components/text-field/TextField';

// 軸 404: SegmentedControl の溝の角。つまみと項目の角は、溝の角から内側の余白を引いた同心の角（原則5）
const meta = {
  title: 'Design Review/404 SegmentedControl の角',
  id: 'design-review-404-segmented-control-radius',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'A,現行版' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'A,現行版'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'pill',
    intent:
      '溝もつまみも両端が丸い。Tabs の segmented・スイッチと同じ小物の形で、入力欄やボタンと並べると形で見分けられる',
    spec: [
      ['溝', 'pill'],
      ['つまみ', 'pill（同心）'],
    ],
    tokens: { '--segmented-control-radius': 'var(--radius-pill)' },
  },
  {
    id: 'A',
    name: '部品の角（control）',
    intent:
      '溝を入力欄・ボタン・トグルと同じ角にする（原則5 の「押して切り替わるボタン（トグル）は部品と同じ角」）。つまみは溝の角から余白を引いた同心の角',
    spec: [
      ['溝', 'control（12px）'],
      ['つまみ', '12px − 4px = 8px（同心）'],
    ],
    tokens: { '--segmented-control-radius': 'var(--radius-control)' },
  },
];

const columns: Column[] = [
  { label: '文字の項目', note: '3 つ' },
  { label: 'フォームの中', note: '入力欄・ボタンと並べる' },
];

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={404}
      axis="SegmentedControl の角"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) =>
        column.label === '文字の項目' ? (
          <SegmentedControl<string> accessibleName="期間" defaultValue="week" color="primary">
            <SegmentedControlItem value="day">日</SegmentedControlItem>
            <SegmentedControlItem value="week">週</SegmentedControlItem>
            <SegmentedControlItem value="month">月</SegmentedControlItem>
          </SegmentedControl>
        ) : (
          <div className="flex w-[320px] flex-col gap-4">
            <TextField label="お届け先" defaultValue="東京都渋谷区神宮前 1-2-3" />
            <SegmentedControl<string> label="配送の速さ" defaultValue="normal">
              <SegmentedControlItem value="normal">通常</SegmentedControlItem>
              <SegmentedControlItem value="express">お急ぎ便</SegmentedControlItem>
            </SegmentedControl>
            <Button color="primary">注文を確かめる</Button>
          </div>
        )
      }
    >
      <p>
        決定: A（部品の角・control）を既定にし、現行版（pill）も shape="circle" で選べる（ADR
        は記録のときに振る）。
      </p>
      <p>
        溝の角を選びます。つまみと項目の角は、溝の角から内側の余白を引いた同心の角で、溝に合わせて変わります。
      </p>
      <p>
        pill は Tabs の segmented
        やスイッチに近い小物の形、部品の角はトグル・入力欄・ボタンと同じ形です。フォームの中で並べたときの揃い方も見てください。
      </p>
    </Comparison>
  ),
};
