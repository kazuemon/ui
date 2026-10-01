import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Calendar } from '../../src/components/calendar/Calendar';
import { type PlainDate, Temporal } from '../../src/internal/date/plain-date';

// 軸 471: Calendar の日ごとの印（renderDayContent）の置き場と大きさ
const meta = {
  title: 'Design Review/471 カレンダーの日ごとの印',
  id: 'design-review-471-calendar-day-content',
  parameters: { layout: 'fullscreen' },
  args: { pick: '' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'E'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const today = Temporal.PlainDate.from('2026-09-19');
const day = (iso: string) => Temporal.PlainDate.from(iso);

// 見本の印: 空きのある日に点、残りわずかな日に「残 n」
const open = new Set([3, 4, 8, 10, 11, 12, 15, 17, 19, 22, 24, 25, 29]);
const few: Record<number, number> = { 5: 2, 9: 1, 16: 3, 19: 2, 23: 1, 26: 2 };
const inMonth = (date: PlainDate) => date.month === 9;
const dot = (date: PlainDate): ReactNode =>
  inMonth(date) && open.has(date.day) ? (
    <span className="size-1.5 rounded-full bg-current" />
  ) : null;
const text = (date: PlainDate): ReactNode =>
  inMonth(date) && few[date.day] ? `残${few[date.day]}` : null;

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '印なし',
    intent: 'いまのカレンダー。日ごとの印を持たない。比べるための基準',
    spec: [
      ['置き場', '—'],
      ['文字の大きさ', '—'],
      ['数字のずらし', '—'],
    ],
  },
  {
    id: 'A',
    name: '数字の下・小さい文字',
    intent:
      '印を数字の下の中央に置き、数字を少し上へずらす。今日の下線は印の下に残る。文字は 10px で、2 文字までなら日の幅に収まる',
    spec: [
      ['置き場', '数字の下の中央（下から 8px）'],
      ['文字の大きさ', '10px'],
      ['数字のずらし', '上へ 6px'],
    ],
    tokens: {
      '--calendar-day-content-inset': 'auto 0 calc(var(--spacing) * 2) 0',
      '--calendar-day-content-justify': 'center',
      '--calendar-day-content-align': 'flex-end',
      '--calendar-day-content-text': '10px',
      '--calendar-day-number-shift': 'calc(var(--spacing) * -1.5)',
      '--calendar-day-content-reserve': '0',
      '--calendar-today-mark-on-number': '0',
      '--calendar-today-mark-offset': 'calc(var(--spacing) * 0.75)',
    },
  },
  {
    id: 'B',
    name: '数字の下・キャプションの文字',
    intent:
      'A と同じ置き場で、印の文字をキャプションと同じ 12px にする。読みやすいが、数字をさらに上へずらすので日の中が詰まり、今日の下線が文字の印に重なる',
    spec: [
      ['置き場', '数字の下の中央（下から 6px）'],
      ['文字の大きさ', '12px（キャプション）'],
      ['数字のずらし', '上へ 8px'],
    ],
    tokens: {
      '--calendar-day-content-inset': 'auto 0 calc(var(--spacing) * 1.5) 0',
      '--calendar-day-content-justify': 'center',
      '--calendar-day-content-align': 'flex-end',
      '--calendar-day-content-text': 'var(--text-caption)',
      '--calendar-day-number-shift': 'calc(var(--spacing) * -2)',
      '--calendar-day-content-reserve': '0',
      '--calendar-today-mark-on-number': '0',
      '--calendar-today-mark-offset': 'calc(var(--spacing) * 0.75)',
    },
  },
  {
    id: 'C',
    name: '右上の角',
    intent:
      '印を日の右上の角に置き、数字は動かさない。印のない日とある日で数字の位置がそろう。文字の印は角に寄るので、数字に近づいて見える',
    spec: [
      ['置き場', '右上の角（上と右から 4px）'],
      ['文字の大きさ', '10px'],
      ['数字のずらし', 'なし'],
    ],
    tokens: {
      '--calendar-day-content-inset': 'var(--spacing) var(--spacing) auto auto',
      '--calendar-day-content-justify': 'flex-end',
      '--calendar-day-content-align': 'flex-start',
      '--calendar-day-content-text': '10px',
      '--calendar-day-number-shift': '0px',
      '--calendar-day-content-reserve': '0',
      '--calendar-today-mark-on-number': '0',
      '--calendar-today-mark-offset': 'calc(var(--spacing) * 0.75)',
    },
  },
  {
    id: 'E',
    name: '月の全部の日に印の余白',
    intent:
      '印を持つ日がある月は、印のない日も含めてすべての日の数字を印の分だけ上へずらし、数字の高さを横でそろえる。印は日の下の中央。今日の下線はいつも数字のすぐ下に引き、数字と印のあいだに来る',
    spec: [
      ['置き場', '数字の下の中央（下から 7px）'],
      ['文字の大きさ', '10px'],
      ['数字のずらし', '上へ 9px（月のすべての日）'],
      ['今日の下線', '数字のすぐ下（印の上）'],
    ],
    tokens: {
      '--calendar-day-content-inset': 'auto 0 calc(var(--spacing) * 1.75) 0',
      '--calendar-day-content-justify': 'center',
      '--calendar-day-content-align': 'flex-end',
      '--calendar-day-content-text': '10px',
      '--calendar-day-number-shift': 'calc(var(--spacing) * -2.25)',
      '--calendar-day-content-reserve': '1',
      '--calendar-today-mark-on-number': '1',
      '--calendar-today-mark-offset': 'calc(var(--spacing) * -0.75)',
    },
  },
];

const columns: Column[] = [
  { label: '点の印', note: '空きのある日。今日（19 日）は選んでいない' },
  { label: '文字の印', note: '「残 n」。選んだ日（16 日）と今日' },
  { label: '期間の中', note: '8〜12 日を選んだところ。primary' },
];

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={471}
      axis="カレンダーの日ごとの印"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        // 現行版は印を渡さない
        const content = (fn: (date: PlainDate) => ReactNode) =>
          candidate.id === '現行版' ? undefined : fn;
        switch (column.label) {
          case '点の印':
            return <Calendar today={today} renderDayContent={content(dot)} />;
          case '文字の印':
            return (
              <Calendar
                today={today}
                defaultValue={day('2026-09-16')}
                renderDayContent={content(text)}
              />
            );
          default:
            return (
              <Calendar
                mode="range"
                color="primary"
                today={today}
                defaultValue={{ start: day('2026-09-08'), end: day('2026-09-12') }}
                renderDayContent={content(dot)}
              />
            );
        }
      }}
    >
      <p>
        Calendar に、日ごとの印を出す renderDayContent
        を足しました。日付を受け取って、点や短い文字（空きの有無、残りの数、値段）を返すと、日の数字に添えて出します。印の色は、返したものの色です（ここでは数字と同じ色なので、選んだ日の上では白くなります）。
      </p>
      <p>
        E
        は、返事（「全体として下に点や文字の余白が入り、横で数字が揃う」「今日を表す印は常に数字と付加要素の間」）から足した案です。印を持つ日がある月は、すべての日の下に印の分の余白を取ります。
      </p>
      <p>
        選ぶのは、印の置き場（数字の下か、角か）と文字の大きさです。密度はツールバーで切り替えて見てください（指では数字が
        14px になります）。
      </p>
    </Comparison>
  ),
};
