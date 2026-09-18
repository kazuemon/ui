import type { Meta, StoryObj } from '@storybook/react-vite';

import { CalendarSample } from './calendar-samples';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 110: Calendar の月送りの置き方
// --calendar-head-columns・--calendar-caption-order・--calendar-prev-order・--calendar-caption-align

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '両側に置く',
    intent: '前の月を左、次の月を右に置き、月の名前を中央に置く。押す向きと送る向きが一致する。',
    spec: [
      ['並び', '‹ 月の名前 ›'],
      ['月の名前', '中央'],
    ],
    tokens: {
      '--calendar-head-columns': 'auto 1fr auto',
      '--calendar-caption-order': '1',
      '--calendar-prev-order': '0',
      '--calendar-caption-align': 'center',
    },
  },
  {
    id: 'A',
    name: '右にまとめる',
    intent:
      '月の名前を左に寄せ、送るボタンを右にまとめる。見出しを左から読める。2 つのボタンが近く、続けて押すときに指やマウスの移動が少ない。',
    spec: [
      ['並び', '月の名前 ‹ ›'],
      ['月の名前', '左寄せ'],
    ],
    tokens: {
      '--calendar-head-columns': '1fr auto auto',
      '--calendar-caption-order': '0',
      '--calendar-prev-order': '1',
      '--calendar-caption-align': 'start',
    },
  },
];

const columns: Column[] = [
  { label: 'グレー', note: '24 日を選んだところ' },
  { label: '前へ送れないとき', note: '9 月 10 日より前は選べない（日曜も）' },
];

const meta = {
  title: 'Design Review/110 Calendar の月送り',
  id: 'design-review-110-calendar-nav',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current,A' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'current,A'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;

export const Candidates: StoryObj<{ pick: string }> = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={110}
      axis="Calendar の月送りの置き方"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) =>
        column.label === 'グレー' ? (
          <CalendarSample sample="single" />
        ) : (
          <CalendarSample sample="limits" />
        )
      }
    >
      <p>
        <strong>
          決定（ADR-0138）:
          現行版（両側に置く）を既定にし、A（右にまとめる）も選べるようにしました。
        </strong>
      </p>
      <p>
        月を送るボタンは、アイコンだけの枠線のボタンです（いちばん進めたい操作ではないため）。置き方を決めます。
      </p>
    </Comparison>
  ),
};
