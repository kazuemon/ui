'use client';

import { Button } from '../button/Button';
import { Calendar, type CalendarSingleProps } from '../calendar/Calendar';
import { type PlainDate, Temporal } from '../../internal/date/plain-date';

/** DatePicker が Calendar に渡す見た目の props */
export type DatePickerCalendarProps = Pick<
  CalendarSingleProps,
  'shape' | 'weekendColor' | 'navPlacement' | 'hideOutsideDays' | 'monthTransition' | 'labels'
>;

interface DatePickerPanelProps {
  value: PlainDate | null;
  /** 日を選んだとき（カレンダーの日・「今日」のボタン） */
  onPick: (date: PlainDate) => void;
  /** 開いたときに、選んだ日（なければ今日）へフォーカスを移す */
  autoFocus: boolean;
  color: CalendarSingleProps['color'];
  min?: PlainDate;
  max?: PlainDate;
  isDateDisabled?: (date: PlainDate) => boolean;
  getHoliday?: (date: PlainDate) => string | undefined;
  locale: string;
  timeZone: string;
  today: PlainDate;
  calendarProps?: DatePickerCalendarProps;
  showTodayButton: boolean;
  todayLabel: string;
}

// 選ぶ面の中身。Calendar と、下の行（「今日」のボタン）
// 下の行の寄せと、カレンダーとのあいだはトークン（--date-picker-footer-*）で決める
export function DatePickerPanel({
  value,
  onPick,
  autoFocus,
  color,
  min,
  max,
  isDateDisabled,
  getHoliday,
  locale,
  timeZone,
  today,
  calendarProps,
  showTodayButton,
  todayLabel,
}: DatePickerPanelProps) {
  // 今日が選べない日（範囲の外・押せない日）なら、「今日」のボタンも押せない
  const todayDisabled =
    (min != null && Temporal.PlainDate.compare(today, min) < 0) ||
    (max != null && Temporal.PlainDate.compare(today, max) > 0) ||
    (isDateDisabled?.(today) ?? false);
  return (
    <div className="flex flex-col gap-(--date-picker-footer-gap)">
      <Calendar
        {...calendarProps}
        mode="single"
        // 選んだ日をもう一度押しても外さない（外すのは欄の消去で行う）
        required
        value={value}
        onValueChange={(next) => {
          if (next) onPick(next);
        }}
        color={color}
        min={min}
        max={max}
        isDateDisabled={isDateDisabled}
        getHoliday={getHoliday}
        locale={locale}
        timeZone={timeZone}
        today={today}
        autoFocus={autoFocus}
      />
      {showTodayButton && (
        <div className="grid [justify-items:var(--date-picker-footer-justify)]">
          <Button variant="outline" disabled={todayDisabled} onClick={() => onPick(today)}>
            {todayLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
