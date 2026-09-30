import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { day, today } from './DatePickerAxisParts';
import { DatePicker, type DatePickerProps } from '../../src/components/date-picker/DatePicker';
import { CaretDownIcon } from '../../src/internal/icons';

// 軸 396: DatePicker（variant="button"）の印
const meta = {
  title: 'Design Review/396 DatePicker のボタンの印',
  id: 'design-review-396-date-picker-button-icon',
  parameters: {
    layout: 'fullscreen',
    pseudo: {
      rootSelector: 'body',
      focusVisible: ['[data-preview="focus"] button[data-slot="control"]'],
    },
  },
  args: { pick: 'current,A,B' },
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
  A: { iconPlacement: 'start' },
  B: { icon: <CaretDownIcon /> },
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '右端に暦',
    intent:
      '塗りのない暦の印を右端に。Select の ▼ と同じ場所で、ボタン全体が押せる。印は押せない意味の説明',
    spec: [
      ['印', '暦（塗りなし）'],
      ['場所', '右端'],
    ],
    tokens: { '--date-picker-icon-order': '0' },
  },
  {
    id: 'A',
    name: '左端に暦',
    intent: '暦の印を値の前に。何を選ぶ欄かが先に分かる（shadcn の DatePicker の形）',
    spec: [
      ['印', '暦（塗りなし）'],
      ['場所', '左端'],
    ],
    tokens: { '--date-picker-icon-order': '-1' },
  },
  {
    id: 'B',
    name: '右端に ▼',
    intent: 'Select と同じ ▼。開いて選ぶ欄であることを、選択肢の欄とそろえて見せる',
    spec: [
      ['印', '▼（塗りなし）'],
      ['場所', '右端'],
    ],
    tokens: { '--date-picker-icon-order': '0' },
  },
];

const columns: Column[] = [
  { label: '空', note: 'placeholder' },
  { label: '値あり' },
  { label: 'フォーカス', preview: 'focus' },
  { label: '押せない', note: 'disabled' },
];

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={396}
      axis="DatePicker のボタンの印"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => (
        <div className="w-[280px]">
          <DatePicker
            label="予約日"
            variant="button"
            today={today}
            {...rowProps[candidate.id]}
            defaultValue={column.label === '空' ? null : day}
            disabled={column.label === '押せない'}
          />
        </div>
      )}
    >
      <p>
        決定: 現行版（右端に暦。Select
        とそろえる）を既定にし、A（左端に暦。iconPlacement="start"）と B（右端に ▼。icon に ▼
        を渡す）も選べる（ADR は記録のときに振る）
      </p>
      <p>
        打てない表示だけのボタン（<code>variant="button"</code>
        ）で、押すとカレンダーが開くことを示す印です。ボタン全体が押せるので、印は塗りのないアイコン（押せない意味の説明）です。
      </p>
      <p>
        印の形と場所を選んでください。打ち込める欄の右端のボタン（軸
        392）とそろえるかも見てください。
      </p>
    </Comparison>
  ),
};
