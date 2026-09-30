import {
  formatSegment,
  fromPlainTime,
  type TimeLayout,
  type TimeSegmentType,
} from '../../internal/date-segments/segments';
import { type PlainTime, Temporal } from '../../internal/date/plain-date';

/** 列の形の、列ごとの読み上げの名前（と、見出しを出すときの文字） */
export type TimePickerColumnNames = Partial<Record<TimeSegmentType, string>>;

export const DEFAULT_COLUMN_NAMES: Record<TimeSegmentType, string> = {
  hour: '時',
  minute: '分',
  second: '秒',
  dayPeriod: '午前・午後',
};

/** 一覧の 1 項目。key は同じ一覧の中で一意 */
export interface TimeOption {
  key: string;
  label: string;
  /** 押せない（min・max の外） */
  disabled: boolean;
}

const MINUTES_PER_DAY = 24 * 60;

/** 刻みを 1〜1440 分の整数に収める（0 や負の数で止まらないように） */
export function normalizeStep(step: number) {
  return Math.min(MINUTES_PER_DAY, Math.max(1, Math.round(step) || 1));
}

function inRange(time: PlainTime, min?: PlainTime, max?: PlainTime) {
  return (
    (min == null || Temporal.PlainTime.compare(time, min) >= 0) &&
    (max == null || Temporal.PlainTime.compare(time, max) <= 0)
  );
}

/** 欄と同じ並び・記号で、時刻を文字にする（ja-JP の 24 時間制で「09:30」、12 時間制で「午前9:30」） */
export function formatTime(time: PlainTime, layout: TimeLayout, showSeconds: boolean) {
  const values = fromPlainTime(time, layout);
  return layout.parts
    .map((part) => {
      if (part.kind === 'literal') return part.text;
      if (part.type === 'second' && !showSeconds) return '';
      const value = values[part.type];
      return value == null ? '' : formatSegment(part.type, value, layout);
    })
    .join('')
    .replace(/[:：.]$/, '');
}

/** 1 列の一覧の項目。0:00 から step 分ごとに 1 日分。key は「HH:mm」 */
export function listOptions(
  layout: TimeLayout,
  step: number,
  min?: PlainTime,
  max?: PlainTime
): (TimeOption & { time: PlainTime })[] {
  const options: (TimeOption & { time: PlainTime })[] = [];
  const minutes = normalizeStep(step);
  for (let total = 0; total < MINUTES_PER_DAY; total += minutes) {
    const time = Temporal.PlainTime.from({ hour: Math.floor(total / 60), minute: total % 60 });
    options.push({
      key: time.toString({ smallestUnit: 'minute' }),
      label: formatTime(time, layout, false),
      disabled: !inRange(time, min, max),
      time,
    });
  }
  return options;
}

/** 一覧の中で、値と同じ時刻の項目の key。秒は見ない。刻みに乗らない値は null */
export function listKeyOf(value: PlainTime | null) {
  return value ? value.toString({ smallestUnit: 'minute' }) : null;
}

/** 値にいちばん近い項目の位置（刻みに乗らない値や、値がないときに一覧を送る先） */
export function nearestIndex(options: { time: PlainTime }[], target: PlainTime) {
  const minutes = target.hour * 60 + target.minute;
  let best = 0;
  let bestDistance = Infinity;
  options.forEach((option, index) => {
    const distance = Math.abs(option.time.hour * 60 + option.time.minute - minutes);
    if (distance < bestDistance) {
      best = index;
      bestDistance = distance;
    }
  });
  return best;
}

/** 列の形の 1 列 */
export interface TimeColumn {
  type: TimeSegmentType;
  options: TimeOption[];
  /** いまの値のこの列の key（値がないときは null） */
  selectedKey: string | null;
}

/** 列の形の列。時・分（秒）・午前午後を、欄と同じ並びで返す */
export function timeColumns(
  layout: TimeLayout,
  value: PlainTime | null,
  minuteStep: number,
  showSeconds: boolean
): TimeColumn[] {
  const values = fromPlainTime(value, layout);
  const types = layout.parts.flatMap((part) =>
    part.kind === 'segment' && isTimeSegment(part.type) && (part.type !== 'second' || showSeconds)
      ? [part.type]
      : []
  );
  return types.map((type) => {
    const numbers = columnNumbers(type, layout, minuteStep);
    return {
      type,
      options: numbers.map((number) => ({
        key: String(number),
        label: formatSegment(type, number, layout),
        disabled: false,
      })),
      selectedKey: values[type] == null ? null : String(values[type]),
    };
  });
}

function isTimeSegment(type: string): type is TimeSegmentType {
  return type === 'hour' || type === 'minute' || type === 'second' || type === 'dayPeriod';
}

function columnNumbers(type: TimeSegmentType, layout: TimeLayout, minuteStep: number) {
  const range = (from: number, to: number, step = 1) =>
    Array.from({ length: Math.floor((to - from) / step) + 1 }, (_, i) => from + i * step);
  if (type === 'dayPeriod') return [0, 1];
  if (type === 'second') return range(0, 59);
  if (type === 'minute') return range(0, 59, Math.min(60, normalizeStep(minuteStep)));
  if (layout.hourCycle === 'h23') return range(0, 23);
  if (layout.hourCycle === 'h11') return range(0, 11);
  // h12 は 12・1・2…11 の順（午前 12 時が 0 時）
  return [12, ...range(1, 11)];
}

/** 列で 1 つを選んだあとの値。ほかの列が空なら、0（午前・0 時・0 分）で埋める */
export function withColumn(
  value: PlainTime | null,
  type: TimeSegmentType,
  number: number,
  layout: TimeLayout
): PlainTime {
  const values = { ...fromPlainTime(value ?? { hour: 0, minute: 0, second: 0 }, layout) };
  values[type] = number;
  let hour = values.hour ?? 0;
  if (layout.hourCycle !== 'h23') {
    const base = layout.hourCycle === 'h12' && hour === 12 ? 0 : hour;
    hour = base + (values.dayPeriod === 1 ? 12 : 0);
  }
  return Temporal.PlainTime.from({ hour, minute: values.minute ?? 0, second: values.second ?? 0 });
}

/** 範囲の外か（列の形は項目を止めず、選んだ結果が外なら欄をエラーの見た目にする） */
export function isOutOfRange(value: PlainTime | null, min?: PlainTime, max?: PlainTime) {
  return value != null && !inRange(value, min, max);
}
