import { type ReactNode, useState } from 'react';

import {
  DateRangePicker,
  type DateRangePickerProps,
} from '../../src/components/date-range-picker/DateRangePicker';
import {
  DateRangePickerPanel,
  type DateRangePickerPresetsPlacement,
  type DateRangePreset,
  type DateRangeValue,
} from '../../src/components/date-range-picker/DateRangePickerPanel';
import { Temporal } from '../../src/internal/date/plain-date';
import { popupSurfaceClass } from '../../src/internal/overlay/popup-styles';

// 軸 610〜613（DateRangePicker）の比較で共有する見本。比べるためだけのもので、決まったら軸のストーリーと一緒に消す

export const today = Temporal.PlainDate.from('2026-09-30');

/** 月をまたぐ期間 */
export const crossMonth: DateRangeValue = {
  start: Temporal.PlainDate.from('2026-09-27'),
  end: Temporal.PlainDate.from('2026-10-03'),
};

export const stay: DateRangeValue = {
  start: Temporal.PlainDate.from('2026-10-05'),
  end: Temporal.PlainDate.from('2026-10-08'),
};

export const presets: DateRangePreset[] = [
  { label: '今日', value: { start: today, end: today } },
  { label: '過去 7 日', value: { start: today.subtract({ days: 6 }), end: today } },
  { label: '過去 30 日', value: { start: today.subtract({ days: 29 }), end: today } },
  {
    label: '今月',
    value: { start: today.with({ day: 1 }), end: today.with({ day: today.daysInMonth }) },
  },
  {
    label: '先月',
    value: {
      start: today.subtract({ months: 1 }).with({ day: 1 }),
      end: today.with({ day: 1 }).subtract({ days: 1 }),
    },
  },
];

/** 開いたまま並べて比べるとき、ページのスクロールを止めないようにする（比べるためだけ） */
export const scrollable = (Story: () => ReactNode) => (
  <>
    <style>{'html, body { overflow: auto !important; }'}</style>
    <Story />
  </>
);

interface LiveRangeProps {
  defaultValue?: DateRangeValue | null;
  numberOfMonths?: 1 | 2;
  hideOutsideDays?: boolean;
  presets?: DateRangePreset[];
  presetsPlacement?: DateRangePickerPresetsPlacement;
  pickerProps?: Partial<DateRangePickerProps>;
}

/**
 * 欄と、開いたときの面の中身を、面の位置に置いたまま並べる。日を押すと欄の値も変わる（操作できる見本）
 * 本物の面（Popover）は 1 つずつしか開けない（外を押すと閉じる）ので、比べるときは面の中身をそのまま置く
 */
export function LiveRange({
  defaultValue = null,
  numberOfMonths = 2,
  hideOutsideDays,
  presets: presetList,
  presetsPlacement = 'start',
  pickerProps,
}: LiveRangeProps) {
  const [value, setValue] = useState<DateRangeValue | null>(defaultValue);
  return (
    <div className="flex flex-col items-start gap-2">
      <DateRangePicker
        label="宿泊の期間"
        className="w-80"
        today={today}
        presentation="popover"
        {...pickerProps}
        value={value}
        onValueChange={setValue}
        numberOfMonths={numberOfMonths}
        presets={presetList}
        presetsPlacement={presetsPlacement}
        calendarProps={hideOutsideDays === undefined ? undefined : { hideOutsideDays }}
      />
      <div className={`${popupSurfaceClass} p-(--date-range-picker-popup-padding) shadow-overlay`}>
        <DateRangePickerPanel
          value={value}
          onCalendarChange={(range) => setValue(range && { start: range.start, end: range.end })}
          onPresetPick={setValue}
          autoFocus={false}
          color="neutral"
          numberOfMonths={numberOfMonths}
          locale="ja-JP"
          timeZone="Asia/Tokyo"
          today={today}
          calendarProps={hideOutsideDays === undefined ? undefined : { hideOutsideDays }}
          presets={presetList}
          presetsPlacement={presetsPlacement}
        />
      </div>
    </div>
  );
}
