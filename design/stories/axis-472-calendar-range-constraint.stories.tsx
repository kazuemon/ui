import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Calendar } from '../../src/components/calendar/Calendar';
import { type PlainDate, Temporal } from '../../src/internal/date/plain-date';

// 軸 472: Calendar の期間の長さの制約（minRangeDays・maxRangeDays・excludeDisabled）で選べない日の見せ方
const meta = {
  title: 'Design Review/472 期間の制約で選べない日',
  id: 'design-review-472-calendar-range-constraint',
  parameters: { layout: 'fullscreen' },
  args: { pick: '' },
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

const today = Temporal.PlainDate.from('2026-09-01');
const day = (iso: string) => Temporal.PlainDate.from(iso);
// 見本の満室の日（もとから押せない日）
const full = new Set(['2026-09-14', '2026-09-15', '2026-09-24']);
const isFull = (date: PlainDate) => full.has(date.toString());

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '押せない日と同じ',
    intent:
      '制約で選べない日を、もとから押せない日（満室の日）と同じ薄い文字にする。始まりを選んだあとに、どこまで選べるかは薄さの境目で読む',
    spec: [
      ['文字の色', '押せない日と同じ'],
      ['線', 'なし'],
    ],
    tokens: {
      '--color-calendar-constrained': 'var(--color-on-field-disabled)',
      '--calendar-constrained-decoration': 'none',
    },
  },
  {
    id: 'A',
    name: '前後の月の日と同じ灰色',
    intent:
      '制約で選べない日は、押せない日より一段濃い灰色（前後の月の日と同じ）。「満室で押せない」と「この始まりからは選べない」を見分けられる',
    spec: [
      ['文字の色', '前後の月の日と同じ灰色'],
      ['線', 'なし'],
    ],
    tokens: {
      '--color-calendar-constrained': 'var(--color-fg-subtle)',
      '--calendar-constrained-decoration': 'none',
    },
  },
  {
    id: 'B',
    name: '押せない日と同じ＋取り消し線',
    intent:
      '押せない日と同じ薄い文字に、取り消し線を足す。予約のサイトでよく見る形で、選べないことを形でも伝える',
    spec: [
      ['文字の色', '押せない日と同じ'],
      ['線', '取り消し線（細い）'],
    ],
    tokens: {
      '--color-calendar-constrained': 'var(--color-on-field-disabled)',
      '--calendar-constrained-decoration': 'line-through',
    },
  },
  {
    id: 'C',
    name: '灰色＋取り消し線',
    intent:
      'A の灰色に取り消し線を足す。押せない日とは色で、ふつうの日とは線で見分ける',
    spec: [
      ['文字の色', '前後の月の日と同じ灰色'],
      ['線', '取り消し線（細い）'],
    ],
    tokens: {
      '--color-calendar-constrained': 'var(--color-fg-subtle)',
      '--calendar-constrained-decoration': 'line-through',
    },
  },
];

const columns: Column[] = [
  { label: '長さの制約', note: '3〜7 日。10 日を始まりに選んだところ' },
  { label: '押せない日をまたがない', note: '14・15・24 日は満室。10 日を始まりに選んだところ' },
  { label: '両方・丸い日・primary', note: '最長 5 日。17 日を始まりに選んだところ' },
];

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={472}
      axis="期間の制約で選べない日"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => {
        switch (column.label) {
          case '長さの制約':
            return (
              <Calendar
                mode="range"
                today={today}
                minRangeDays={3}
                maxRangeDays={7}
                defaultValue={{ start: day('2026-09-10'), end: null }}
              />
            );
          case '押せない日をまたがない':
            return (
              <Calendar
                mode="range"
                today={today}
                isDateDisabled={isFull}
                excludeDisabled
                defaultValue={{ start: day('2026-09-10'), end: null }}
              />
            );
          default:
            return (
              <Calendar
                mode="range"
                color="primary"
                shape="circle"
                today={today}
                isDateDisabled={isFull}
                excludeDisabled
                maxRangeDays={5}
                defaultValue={{ start: day('2026-09-17'), end: null }}
              />
            );
        }
      }}
    >
      <p>
        期間を選ぶ Calendar に、長さの制約を足しました。minRangeDays・maxRangeDays
        はいちばん短い・長い日数（始まりと終わりの日を両方数える）、excludeDisabled
        は押せない日をまたがない指定です。始まりを選んだあと、制約に合わない日は押せなくなります。
      </p>
      <p>
        選ぶのは、その「この始まりからは選べない日」の見せ方です。もとから押せない日（ここでは満室の日）と同じにするか、見分けられるようにするかを教えてください。
      </p>
    </Comparison>
  ),
};
