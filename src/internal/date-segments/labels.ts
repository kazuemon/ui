// 区切りの見本（空の区切りに出す文字）と、読み上げの名前・値の文（DateField・TimeField）
import type { SegmentLayout, SegmentRange, SegmentType } from './segments';
import { segmentDigits } from './segments';

/**
 * 空の区切りに出す見本の書き方
 * letters: 「yyyy/mm/dd」「hh:mm」。units: 「年/月/日」「時:分」（単位の名前が 1〜2 文字の言語だけ。ほかは letters）。
 * dashes: 「----/--/--」
 */
export type SegmentPlaceholder = 'letters' | 'units' | 'dashes';

const LETTERS: Record<SegmentType, string> = {
  year: 'yyyy',
  month: 'mm',
  day: 'dd',
  hour: 'hh',
  minute: 'mm',
  second: 'ss',
  dayPeriod: '',
};

function fieldName(locale: string, type: SegmentType): string | undefined {
  try {
    return new Intl.DisplayNames(locale, { type: 'dateTimeField' }).of(type);
  } catch {
    return undefined;
  }
}

/** 空の区切りの見本。午前・午後は、どの書き方でも「午前/午後」（dashes では「--」） */
export function segmentPlaceholder(
  type: SegmentType,
  style: SegmentPlaceholder,
  locale: string,
  range: SegmentRange
): string {
  if (style === 'dashes') return '-'.repeat(type === 'dayPeriod' ? 2 : segmentDigits(type, range));
  if (type === 'dayPeriod') return fieldName(locale, type) ?? 'AM/PM';
  if (style === 'units') {
    const name = fieldName(locale, type);
    if (name && name.length <= 2) return name;
  }
  return LETTERS[type];
}

/** 区切りの読み上げの名前。ja では「年」「月」「日」「時」「分」「秒」「午前/午後」 */
export function segmentLabel(type: SegmentType, locale: string): string {
  return fieldName(locale, type) ?? type;
}

/** 空の区切りの読み上げ */
export function emptyLabel(locale: string): string {
  return locale.startsWith('ja') ? '未入力' : 'Empty';
}

/** 区切りの値の読み上げ（aria-valuetext）。年・月・日はロケールの書き方（「2026年」「9月」「20日」） */
export function segmentValueText(
  type: SegmentType,
  value: number,
  locale: string,
  layout: SegmentLayout
): string {
  if (type === 'year' || type === 'month' || type === 'day') {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'UTC',
      [type]: type === 'month' ? 'long' : 'numeric',
    };
    const date = new Date(0);
    date.setUTCFullYear(type === 'year' ? value : 2026, type === 'month' ? value - 1 : 0, 1);
    if (type === 'day') date.setUTCDate(value);
    return new Intl.DateTimeFormat(locale, options).format(date);
  }
  if (type === 'dayPeriod') return layout.kind === 'time' ? layout.dayPeriods[value] : '';
  return String(value);
}
