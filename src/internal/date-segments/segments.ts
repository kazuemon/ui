// 日付・時刻の欄の区切り（年・月・日・時・分・秒・午前午後）の計算。DOM も React も使わない（DateField・TimeField）
import { Temporal } from 'temporal-polyfill';

export type DateSegmentType = 'year' | 'month' | 'day';
export type TimeSegmentType = 'hour' | 'minute' | 'second' | 'dayPeriod';
export type SegmentType = DateSegmentType | TimeSegmentType;

/** 区切りに入っている値。見えている数（12 時間制の時は 12 時間制のまま）。dayPeriod は 0 が午前、1 が午後 */
export type SegmentValues = Partial<Record<SegmentType, number>>;

/** 区切りと、そのあいだの記号（「/」「:」など）の並び */
export type LayoutPart = { kind: 'segment'; type: SegmentType } | { kind: 'literal'; text: string };

/** 12 時間制の時の数え方。h11 は 0〜11（ja の「午後0時」）、h12 は 1〜12（en の「12 PM」） */
export type HourCycle = 'h11' | 'h12' | 'h23';

export interface TimeLayoutOptions {
  /** 12 か 24。省略するとロケールの既定 */
  hourCycle?: 12 | 24;
  showSeconds?: boolean;
}

export interface DateLayout {
  kind: 'date';
  parts: LayoutPart[];
}

export interface TimeLayout {
  kind: 'time';
  parts: LayoutPart[];
  hourCycle: HourCycle;
  /** 午前・午後の書き方（ロケールの文字） */
  dayPeriods: [am: string, pm: string];
}

export type SegmentLayout = DateLayout | TimeLayout;

// formatToParts の型から、区切りの型へ。relatedYear など使わないものは記号として扱わない（捨てる）
const PART_TYPES: Record<string, SegmentType | undefined> = {
  year: 'year',
  month: 'month',
  day: 'day',
  hour: 'hour',
  minute: 'minute',
  second: 'second',
  dayPeriod: 'dayPeriod',
};

function toLayoutParts(parts: Intl.DateTimeFormatPart[]): LayoutPart[] {
  const result: LayoutPart[] = [];
  for (const part of parts) {
    const type = PART_TYPES[part.type];
    if (type) result.push({ kind: 'segment', type });
    else if (part.type === 'literal') {
      // 区切りの外の前後の空白は捨てる。区切りどうしのあいだの記号だけを残す
      const text = part.value;
      const last = result.at(-1);
      if (last?.kind === 'literal') last.text += text;
      else result.push({ kind: 'literal', text });
    }
  }
  while (result[0]?.kind === 'literal') result.shift();
  while (result.at(-1)?.kind === 'literal') result.pop();
  return result;
}

/** 日付の並びと記号。ja-JP で 年 / 月 / 日 */
export function dateLayout(locale: string): DateLayout {
  const format = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC',
  });
  return { kind: 'date', parts: toLayoutParts(format.formatToParts(Date.UTC(2026, 8, 20))) };
}

/** 時刻の並びと記号。ja-JP の 24 時間制で 時 : 分 */
export function timeLayout(locale: string, options: TimeLayoutOptions = {}): TimeLayout {
  const base: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    ...(options.showSeconds && { second: '2-digit' }),
    timeZone: 'UTC',
  };
  // 12 時間制の数え方（h11・h12）はロケールに従う
  const hourCycle: HourCycle =
    options.hourCycle === 24
      ? 'h23'
      : options.hourCycle === 12
        ? twelveHourCycle(locale)
        : localeHourCycle(locale);
  const format = new Intl.DateTimeFormat(locale, { ...base, hourCycle });
  const am = dayPeriodText(locale, hourCycle, 9);
  const pm = dayPeriodText(locale, hourCycle, 15);
  return {
    kind: 'time',
    parts: toLayoutParts(format.formatToParts(Date.UTC(2026, 8, 20, 15, 5, 30))),
    hourCycle,
    dayPeriods: [am, pm],
  };
}

function localeHourCycle(locale: string): HourCycle {
  const cycle = new Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions().hourCycle;
  if (cycle === 'h11' || cycle === 'h12') return cycle;
  return 'h23';
}

function twelveHourCycle(locale: string): HourCycle {
  const cycle = new Intl.DateTimeFormat(locale, { hour: 'numeric', hour12: true }).resolvedOptions()
    .hourCycle;
  return cycle === 'h11' ? 'h11' : 'h12';
}

function dayPeriodText(locale: string, hourCycle: HourCycle, hour: number): string {
  if (hourCycle === 'h23') return '';
  const parts = new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    hourCycle,
    timeZone: 'UTC',
  }).formatToParts(Date.UTC(2026, 8, 20, hour));
  return parts.find((part) => part.type === 'dayPeriod')?.value ?? (hour < 12 ? 'AM' : 'PM');
}

export function segmentTypes(layout: SegmentLayout): SegmentType[] {
  return layout.parts.flatMap((part) => (part.kind === 'segment' ? [part.type] : []));
}

export interface SegmentRange {
  min: number;
  max: number;
}

/** 区切りが取れる範囲。日は、年と月が入っていればその月の日数まで */
export function segmentRange(
  type: SegmentType,
  values: SegmentValues,
  layout: SegmentLayout
): SegmentRange {
  switch (type) {
    case 'year':
      return { min: 1, max: 9999 };
    case 'month':
      return { min: 1, max: 12 };
    case 'day':
      return { min: 1, max: daysInMonth(values.year, values.month) };
    case 'hour': {
      const cycle = layout.kind === 'time' ? layout.hourCycle : 'h23';
      if (cycle === 'h11') return { min: 0, max: 11 };
      if (cycle === 'h12') return { min: 1, max: 12 };
      return { min: 0, max: 23 };
    }
    case 'minute':
    case 'second':
      return { min: 0, max: 59 };
    default:
      // 午前・午後
      return { min: 0, max: 1 };
  }
}

function daysInMonth(year: number | undefined, month: number | undefined): number {
  if (month == null) return 31;
  // 年がまだないときは、うるう年とみなして 2 月 29 日まで打てるようにする
  return Temporal.PlainYearMonth.from({ year: year ?? 2024, month }).daysInMonth;
}

/** 区切りに打てる桁の数 */
export function segmentDigits(type: SegmentType, range: SegmentRange): number {
  return type === 'year' ? 4 : String(range.max).length;
}

/** ↑↓ で 1 つ（分は step）ずつ増減する。範囲の端を越えたら反対の端へ回る */
export function stepSegment(value: number, delta: number, range: SegmentRange, step = 1): number {
  if (step > 1) {
    // 刻みにそろっていないときは、まず押した向きの刻みへ寄せる（7 分で ↑ なら 10 分）
    const snapped = delta > 0 ? Math.ceil(value / step) * step : Math.floor(value / step) * step;
    if (snapped !== value) {
      return snapped > range.max ? range.min : snapped < range.min ? range.max : snapped;
    }
  }
  const size = range.max - range.min + 1;
  const next = value + delta * step;
  return ((((next - range.min) % size) + size) % size) + range.min;
}

export interface TypedDigit {
  /** 打っている途中の文字（まだその区切りに桁を足せるとき） */
  buffer: string;
  /** 区切りの値。範囲に入らない途中の文字（月の「0」）のときは undefined */
  value: number | undefined;
  /** 次の区切りへ進むか */
  advance: boolean;
}

/**
 * 区切りに数字を 1 つ打つ。打った数が範囲を越えたら、その数字から打ち直す
 * それ以上桁を足すと範囲を越えるとき（月の「2」から先）か、桁が埋まったら、次の区切りへ進む
 */
export function typeDigit(
  type: SegmentType,
  buffer: string,
  digit: string,
  range: SegmentRange
): TypedDigit {
  const digits = segmentDigits(type, range);
  let text = buffer + digit;
  if (Number(text) > range.max || text.length > digits) text = digit;
  const number = Number(text);
  const value = number >= range.min && number <= range.max ? number : undefined;
  const advance = text.length >= digits || (type !== 'year' && number * 10 > range.max);
  return { buffer: advance ? '' : text, value, advance };
}

/** 区切りに見せる文字。月・日・分・秒は 2 桁、24 時間制の時も 2 桁 */
export function formatSegment(type: SegmentType, value: number, layout: SegmentLayout): string {
  if (type === 'dayPeriod') return layout.kind === 'time' ? layout.dayPeriods[value] : '';
  if (type === 'year') return String(value).padStart(4, '0');
  if (type === 'hour' && layout.kind === 'time' && layout.hourCycle !== 'h23') {
    return String(value);
  }
  return String(value).padStart(2, '0');
}

/** 日付がそろっていれば PlainDate。ありえない日（2 月 30 日）は null */
export function toPlainDate(values: SegmentValues): Temporal.PlainDate | null {
  const { year, month, day } = values;
  if (year == null || month == null || day == null) return null;
  try {
    return Temporal.PlainDate.from({ year, month, day }, { overflow: 'reject' });
  } catch {
    return null;
  }
}

export function fromPlainDate(date: Temporal.PlainDate | null | undefined): SegmentValues {
  return date ? { year: date.year, month: date.month, day: date.day } : {};
}

/** 時刻がそろっていれば PlainTime。秒の区切りがないときは 0 秒 */
export function toPlainTime(values: SegmentValues, layout: TimeLayout): Temporal.PlainTime | null {
  const types = segmentTypes(layout);
  if (types.some((type) => values[type] == null)) return null;
  const hour = to24Hour(values.hour!, values.dayPeriod ?? 0, layout.hourCycle);
  return Temporal.PlainTime.from({ hour, minute: values.minute!, second: values.second ?? 0 });
}

export function fromPlainTime(
  time: { hour: number; minute: number; second?: number } | null | undefined,
  layout: TimeLayout
): SegmentValues {
  if (!time) return {};
  const values: SegmentValues = { minute: time.minute };
  if (segmentTypes(layout).includes('second')) values.second = time.second ?? 0;
  if (layout.hourCycle === 'h23') values.hour = time.hour;
  else {
    values.dayPeriod = time.hour >= 12 ? 1 : 0;
    const hour = time.hour % 12;
    values.hour = layout.hourCycle === 'h12' && hour === 0 ? 12 : hour;
  }
  return values;
}

function to24Hour(hour: number, dayPeriod: number, cycle: HourCycle): number {
  if (cycle === 'h23') return hour;
  return (hour % 12) + (dayPeriod ? 12 : 0);
}

/** 月や年を変えて日がその月にない日になったら、月末に寄せる（1 月 31 日 → 2 月） */
export function constrainDay(values: SegmentValues): SegmentValues {
  if (values.day == null) return values;
  const max = daysInMonth(values.year, values.month);
  return values.day > max ? { ...values, day: max } : values;
}
