import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { day, today } from './DatePickerAxisParts';
import { DatePicker, type DatePickerProps } from '../../src/components/date-picker/DatePicker';

// 軸 395: DatePicker（variant="button"）の選んだ日の書き方
const meta = {
  title: 'Design Review/395 DatePicker のボタンの日付の書き方',
  id: 'design-review-395-date-picker-button-format',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current' },
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

// 案ごとの props（部品の指定を行ごとに変える軸）
const rowProps: Record<string, Partial<DatePickerProps>> = {
  現行版: {},
  A: { dateStyle: 'long' },
  B: { format: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' } },
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '2026/09/20',
    intent: '打ち込む欄・Time の既定と同じ、ゼロ埋めの 年/月/日。欄の形を変えても値の見え方が同じ',
    spec: [['書き方', 'Time の既定（year numeric・month 2-digit・day 2-digit）']],
  },
  {
    id: 'A',
    name: '2026年9月20日',
    intent: '文として読める書き方。打てないボタンなので、打つ形に合わせなくてよい',
    spec: [['書き方', "dateStyle: 'long'"]],
  },
  {
    id: 'B',
    name: '2026年9月20日(日)',
    intent: 'A に曜日を足す。予約のように曜日で決める場面で、もう一度カレンダーを開かずに済む',
    spec: [['書き方', 'year・month long・day・weekday short']],
  },
];

const columns: Column[] = [
  { label: '値あり', note: '幅 280px' },
  { label: '狭い欄', note: '幅 176px' },
  { label: '空', note: 'placeholder' },
];

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={395}
      axis="DatePicker のボタンの日付の書き方"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => (
        <div className={column.label === '狭い欄' ? 'w-44' : 'w-[280px]'}>
          <DatePicker
            label="予約日"
            variant="button"
            today={today}
            {...rowProps[candidate.id]}
            defaultValue={column.label === '空' ? null : day}
          />
        </div>
      )}
    >
      <p>
        決定: 現行版（2026/09/20）を既定のままにする。書き方は dateStyle・format で変えられる（ADR
        は記録のときに振る）
      </p>
      <p>
        打てない表示だけのボタン（<code>variant="button"</code>
        ）に、選んだ日をどう書くかです。書き方は <code>dateStyle</code>・<code>format</code>{' '}
        でいつでも変えられます。ここでは既定を決めます。
      </p>
    </Comparison>
  ),
};
