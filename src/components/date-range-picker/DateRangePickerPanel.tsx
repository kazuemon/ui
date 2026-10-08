'use client';

import { Button } from '../button/Button';
import { Calendar, type CalendarRange, type CalendarRangeProps } from '../calendar/Calendar';
import type { PlainDate } from '../../internal/date/plain-date';
import { tv } from '../../internal/tv';

/** DateRangePicker が Calendar に渡す見た目の props */
export type DateRangePickerCalendarProps = Pick<
  CalendarRangeProps,
  'shape' | 'weekendColor' | 'navPlacement' | 'hideOutsideDays' | 'monthTransition' | 'labels'
>;

/** 期間。まだ選んでいない端は null */
export interface DateRangeValue {
  start: PlainDate | null;
  end: PlainDate | null;
}

/** 期間の候補（「過去 7 日」など）。押すと、その期間を欄に入れて閉じます */
export interface DateRangePreset {
  /** ボタンの文字 */
  label: string;
  /** 入れる期間。今日から数える候補は、使う側が今日から作って渡します */
  value: { start: PlainDate; end: PlainDate };
}

/** 期間の候補の置き場所。start はカレンダーの左の列、bottom はカレンダーの下の行 */
export type DateRangePickerPresetsPlacement = 'start' | 'bottom';

// 面の中身の並び。候補（presets）はカレンダーの左の列か、下の行
//   左の列: 候補を縦に積む。カレンダーとのあいだに細い線を引く（領域の中の区切り — 原則1）
//   下の行: 候補を折り返して並べる
// 間は --date-range-picker-*
const panel = tv({
  slots: {
    root: 'flex gap-(--date-range-picker-presets-gap)',
    presets: 'flex',
  },
  variants: {
    placement: {
      start: {
        root: 'flex-row items-start',
        presets: [
          'flex-col items-stretch gap-(--date-range-picker-presets-item-gap)',
          'self-stretch border-e-(length:--border-width-thin) border-line pe-(--date-range-picker-presets-gap)',
        ],
      },
      bottom: {
        root: 'flex-col',
        presets: 'flex-row flex-wrap gap-(--date-range-picker-presets-item-gap)',
      },
    },
  },
});

interface DateRangePickerPanelProps {
  value: DateRangeValue | null;
  /** カレンダーで端を選んだとき */
  onCalendarChange: (range: CalendarRange | null) => void;
  /** 候補を選んだとき */
  onPresetPick: (value: { start: PlainDate; end: PlainDate }) => void;
  autoFocus: boolean;
  color: CalendarRangeProps['color'];
  numberOfMonths: 1 | 2;
  min?: PlainDate;
  max?: PlainDate;
  isDateDisabled?: (date: PlainDate) => boolean;
  getHoliday?: (date: PlainDate) => string | undefined;
  minRangeDays?: number;
  maxRangeDays?: number;
  excludeDisabled?: boolean;
  locale: string;
  timeZone: string;
  today: PlainDate;
  calendarProps?: DateRangePickerCalendarProps;
  presets?: DateRangePreset[];
  presetsPlacement: DateRangePickerPresetsPlacement;
}

// 選ぶ面の中身。期間の Calendar と、期間の候補
export function DateRangePickerPanel({
  value,
  onCalendarChange,
  onPresetPick,
  autoFocus,
  color,
  numberOfMonths,
  min,
  max,
  isDateDisabled,
  getHoliday,
  minRangeDays,
  maxRangeDays,
  excludeDisabled,
  locale,
  timeZone,
  today,
  calendarProps,
  presets,
  presetsPlacement,
}: DateRangePickerPanelProps) {
  const styles = panel({ placement: presetsPlacement });
  // 始まりがないときは、カレンダーでは何も選んでいない（終わりだけ打ったときも、カレンダーは始まりから選ぶ）
  const range: CalendarRange | null = value?.start ? { start: value.start, end: value.end } : null;
  const calendar = (
    <Calendar
      {...calendarProps}
      // 2 か月を並べるときは、前後の月の日を隠す（同じ日が 2 か所に出て、期間の帯が二重に見えるため）
      hideOutsideDays={calendarProps?.hideOutsideDays ?? numberOfMonths === 2}
      mode="range"
      value={range}
      onValueChange={onCalendarChange}
      // 終わりだけを打ったときは、その月から見せる
      defaultMonth={(value?.start ?? value?.end ?? undefined)?.toPlainYearMonth()}
      numberOfMonths={numberOfMonths}
      color={color}
      min={min}
      max={max}
      isDateDisabled={isDateDisabled}
      getHoliday={getHoliday}
      minRangeDays={minRangeDays}
      maxRangeDays={maxRangeDays}
      excludeDisabled={excludeDisabled}
      locale={locale}
      timeZone={timeZone}
      today={today}
      autoFocus={autoFocus}
    />
  );
  if (!presets?.length) return calendar;
  const presetList = (
    <div className={styles.presets()} data-slot="date-range-presets">
      {presets.map((preset) => (
        <Button
          key={preset.label}
          size="sm"
          variant={presetsPlacement === 'start' ? 'underline' : 'outline'}
          // 左の列では、文字を左にそろえる
          className={presetsPlacement === 'start' ? 'justify-start' : undefined}
          onClick={() => onPresetPick(preset.value)}
        >
          {preset.label}
        </Button>
      ))}
    </div>
  );
  return (
    <div className={styles.root()}>
      {presetsPlacement === 'start' ? (
        <>
          {presetList}
          {calendar}
        </>
      ) : (
        <>
          {calendar}
          {presetList}
        </>
      )}
    </div>
  );
}
