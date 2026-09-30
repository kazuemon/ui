import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { day, OpenPicker } from './DatePickerAxisParts';

// 軸 394: DatePicker の「今日」のボタン
const meta = {
  title: 'Design Review/394 DatePicker の「今日」のボタン',
  id: 'design-review-394-date-picker-today-button',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'C' },
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
    name: '出さない',
    intent:
      '今日は日の太字と下線で分かる。空の区切りで ↑↓ を押すと今日が入るので、ボタンは置かない（showTodayButton で出せる）',
    spec: [
      ['既定', 'なし'],
      ['出したとき', '左寄せ'],
    ],
    tokens: { '--date-picker-footer-justify': 'start' },
  },
  {
    id: 'A',
    name: '左下に「今日」',
    intent: 'カレンダーの下に枠線のボタン。月送りのボタンと同じ見た目で、左端にそろえる',
    spec: [
      ['既定', '出す'],
      ['寄せ', '左'],
    ],
    tokens: { '--date-picker-footer-justify': 'start' },
  },
  {
    id: 'B',
    name: '右下に「今日」',
    intent: '同じボタンを右下に。ダイアログの下の操作と同じ、右に寄せる並び',
    spec: [
      ['既定', '出す'],
      ['寄せ', '右'],
    ],
    tokens: { '--date-picker-footer-justify': 'end' },
  },
  {
    id: 'C',
    name: '幅いっぱいの「今日」',
    intent: 'カレンダーと同じ幅のボタン。指で押しやすく、面の下端がそろう',
    spec: [
      ['既定', '出す'],
      ['寄せ', '幅いっぱい'],
    ],
    tokens: { '--date-picker-footer-justify': 'stretch' },
  },
];

const columns: Column[] = [
  { label: '値なし', note: '今日は 9 月 30 日' },
  { label: '別の月の値', note: '2026-08-10 を選んでいる' },
];

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={394}
      axis="DatePicker の「今日」のボタン"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => (
        <OpenPicker
          value={column.label === '値なし' ? null : day.subtract({ days: 41 })}
          showTodayButton={candidate.id !== '現行版'}
        />
      )}
    >
      <p>
        決定: C（幅いっぱいの「今日」）を既定で出す。showTodayButton を false にすると外せる（ADR
        は記録のときに振る）
      </p>
      <p>
        カレンダーの下に、今日を選ぶボタンを置くかどうかです。押すと今日が欄に入り、カレンダーは閉じます。今日が選べない日（範囲の外）なら押せません。
      </p>
      <p>
        既定で出すか、出すならどこに置くかを選んでください。出さない案（現行版）でも、props
        で出せるようにします。
      </p>
    </Comparison>
  ),
};
