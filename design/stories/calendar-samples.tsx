// Calendar の比較（後半の軸 106〜111）で共有する見本。軸がすべて決まったら、比較のストーリーと一緒に消す
import { Calendar, type CalendarProps } from '../../src/components/calendar/Calendar';
import { Temporal } from '../../src/internal/date/plain-date';

export const today = Temporal.PlainDate.from('2026-09-19');
export const date = (iso: string) => Temporal.PlainDate.from(iso);

type Sample =
  | 'plain'
  | 'single'
  | 'range'
  | 'today-selected'
  | 'limits'
  | 'range-across'
  | 'range-start';

const samples: Record<Sample, Partial<CalendarProps>> = {
  plain: {},
  single: { defaultValue: date('2026-09-24') },
  'today-selected': { defaultValue: today },
  range: { mode: 'range', defaultValue: { start: date('2026-09-08'), end: date('2026-09-16') } },
  'range-across': {
    mode: 'range',
    defaultValue: { start: date('2026-09-27'), end: date('2026-10-02') },
  },
  'range-start': { mode: 'range', defaultValue: { start: date('2026-09-08'), end: null } },
  limits: {
    defaultValue: date('2026-09-24'),
    min: date('2026-09-10'),
    isDateDisabled: (d) => d.dayOfWeek === 7,
  },
};

// 2026 年 9〜10 月の祝日（見本のデータ。部品は祝日を持たない）
const holidayNames: Record<string, string> = {
  '2026-09-21': '敬老の日',
  '2026-09-22': '国民の休日',
  '2026-09-23': '秋分の日',
  '2026-10-12': 'スポーツの日',
};
export const getHoliday = (d: Temporal.PlainDate) => holidayNames[d.toString()];

/** 比較の 1 マスに置くカレンダー。今日は 2026-09-19 に固定する */
export function CalendarSample({
  sample,
  color,
  holidays,
}: {
  sample: Sample;
  color?: CalendarProps['color'];
  /** 見本の祝日を渡す */
  holidays?: boolean;
}) {
  return (
    <Calendar
      {...(samples[sample] as CalendarProps)}
      today={today}
      color={color}
      getHoliday={holidays ? getHoliday : undefined}
    />
  );
}

/** 日（YYYY-MM-DD）のボタンを指すセレクタ。状態を固定する列（data-preview）で使う */
export const dayButton = (iso: string) => `td[data-day="${iso}"] button`;

/** storybook-addon-pseudo-states の指定。列ごとに別の日へ状態を当てる */
export function calendarPseudo(targets: { hover?: string[]; focus?: string[] }) {
  return {
    rootSelector: 'body',
    ...(targets.hover && { hover: targets.hover.map((t) => `[data-preview="hover"] ${t}`) }),
    ...(targets.focus && {
      focusVisible: targets.focus.map((t) => `[data-preview="focus"] ${t}`),
    }),
  };
}
