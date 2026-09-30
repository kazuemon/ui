import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { day, OpenPicker } from './DatePickerAxisParts';

// 軸 393: DatePicker のカレンダーの面の内側の余白
const meta = {
  title: 'Design Review/393 DatePicker の面の余白',
  id: 'design-review-393-date-picker-popup-padding',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'A' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '8px',
    intent: 'Popover（16px）より詰める。月送りのボタンと日の角が、面の角に近すぎず離れすぎない',
    spec: [['面の内側の余白', '8px（--spacing × 2）']],
    tokens: { '--date-picker-popup-padding': 'calc(var(--spacing) * 2)' },
  },
  {
    id: 'A',
    name: '16px（Popover と同じ）',
    intent: '押して開く面（Popover）の余白にそろえる。面が一回り大きくなる',
    spec: [['面の内側の余白', '16px（--popover-padding）']],
    tokens: { '--date-picker-popup-padding': 'var(--popover-padding)' },
  },
  {
    id: 'B',
    name: '4px（Select の一覧と同じ）',
    intent: '選択肢の一覧（Select・Combobox）の余白にそろえる。日のマスが面の縁に近づく',
    spec: [['面の内側の余白', '4px（--select-popup-padding）']],
    tokens: { '--date-picker-popup-padding': 'var(--select-popup-padding)' },
  },
];

const columns: Column[] = [
  { label: '開いた面', note: '値あり' },
  { label: '「今日」のボタンあり', note: 'showTodayButton' },
];

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={393}
      axis="DatePicker の面の余白"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => (
        <OpenPicker value={day} showTodayButton={column.label === '「今日」のボタンあり'} />
      )}
    >
      <p>決定: A（16px。Popover と同じ余白）を既定にする（ADR は記録のときに振る）</p>
      <p>
        カレンダーを浮かべる面の内側の余白です。面そのもの（白・細い輪郭・影）は Popover
        と同じで、余白だけを比べます。
      </p>
      <p>
        月送りのボタン・日のマスと、面の縁とのあいだを見てください。Popover
        にそろえるか、選択肢の一覧に寄せるか、そのあいだにするかです。
      </p>
    </Comparison>
  ),
};
