// 日付・時刻を文字にする計算（Time・RelativeTime）。DOM も React も使わない

/** 言語の既定。ThemeProvider の locale・部品の locale が勝つ */
export const DEFAULT_LOCALE = 'ja-JP';
/** 時刻を書くタイムゾーンの既定。サーバーと閲覧者で文字が変わらないよう固定する。ThemeProvider の timeZone・部品の timeZone が勝つ */
export const DEFAULT_TIME_ZONE = 'Asia/Tokyo';

/** 既定の書き方。ja-JP で「2026/09/18」（ゼロ埋めの年/月/日） */
export const DEFAULT_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
};
/** 時刻を付けるときの既定。ja-JP で「2026/09/18 09:30」（日付に合わせて時もゼロ埋め、24 時間） */
export const DEFAULT_DATE_TIME_FORMAT: Intl.DateTimeFormatOptions = {
  ...DEFAULT_DATE_FORMAT,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
};

/** 日付だけの文字列（YYYY-MM-DD）。時刻もタイムゾーンも持たない暦の日付として扱う */
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export interface ParsedDate {
  date: Date;
  /** <time datetime> に書く機械向けの値 */
  machine: string;
  /** 日付だけの文字列で渡されたか。そのときは UTC で書き、どの環境でも同じ日になる */
  dateOnly: boolean;
}

export function parseDate(value: Date | string | number): ParsedDate | null {
  if (typeof value === 'string' && DATE_ONLY.test(value)) {
    const date = new Date(`${value}T00:00:00Z`);
    return Number.isNaN(date.getTime()) ? null : { date, machine: value, dateOnly: true };
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return { date, machine: date.toISOString(), dateOnly: false };
}

// 相対の書き方の単位。短い順に、この秒数に満たなければこの単位で書く
const RELATIVE_UNITS: [unit: Intl.RelativeTimeFormatUnit, seconds: number, limit: number][] = [
  ['second', 1, 45],
  ['minute', 60, 60 * 45],
  ['hour', 60 * 60, 60 * 60 * 22],
  ['day', 60 * 60 * 24, 60 * 60 * 24 * 26],
  ['month', 60 * 60 * 24 * 30, 60 * 60 * 24 * 320],
  ['year', 60 * 60 * 24 * 365, Number.POSITIVE_INFINITY],
];

/** timeZone の暦で見た、年・月・日 */
function calendarYMD(date: Date, timeZone: string): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  return { year: get('year'), month: get('month'), day: get('day') };
}

/**
 * timeZone の暦で、date が now から何日・何か月・何年へだたっているか
 * 「昨日」「今月」などの言い回しの境界（0 の扱い）は、この暦の日付が変わったかどうかで決まる
 */
function calendarDiff(date: Date, now: number, timeZone: string) {
  const a = calendarYMD(date, timeZone);
  const b = calendarYMD(new Date(now), timeZone);
  const days = Math.round(
    (Date.UTC(a.year, a.month - 1, a.day) - Date.UTC(b.year, b.month - 1, b.day)) / 86_400_000
  );
  const months = (a.year - b.year) * 12 + (a.month - b.month);
  return { days, months, years: a.year - b.year };
}

/**
 * 「3 日前」「昨日」「今」のように、now からの隔たりを書く
 * 秒・分・時間は経った時間そのもの、日・か月・年は timeZone の暦の差（「昨日」「今月」などの境界がその暦の日付替わりになる）
 */
export function formatRelative(date: Date, now: number, locale: string, timeZone: string): string {
  const diff = (date.getTime() - now) / 1000;
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const calendar = calendarDiff(date, now, timeZone);
  for (const [unit, seconds, limit] of RELATIVE_UNITS) {
    if (abs < limit) {
      // 45 秒に満たないときは「今」にする
      if (unit === 'second') return rtf.format(0, 'second');
      if (unit === 'minute' || unit === 'hour') return rtf.format(Math.round(diff / seconds), unit);
      if (unit === 'day') return rtf.format(calendar.days, 'day');
      if (unit === 'month') return rtf.format(calendar.months, 'month');
      return rtf.format(calendar.years, 'year');
    }
  }
  return rtf.format(calendar.years, 'year');
}

/** 日付だけの値は UTC で、それ以外は timeZone で書く */
export function formatAbsolute(
  parsed: ParsedDate,
  options: Intl.DateTimeFormatOptions,
  locale: string,
  timeZone: string
): string {
  return new Intl.DateTimeFormat(locale, {
    ...options,
    timeZone: parsed.dateOnly ? 'UTC' : timeZone,
  }).format(parsed.date);
}

/** Time・RelativeTime の書き方の props から、Intl の指定を決める。format > dateStyle・timeStyle > 既定（withTime で時刻も） */
export function dateTimeOptions({
  withTime,
  dateStyle,
  timeStyle,
  format,
}: {
  withTime?: boolean;
  dateStyle?: Intl.DateTimeFormatOptions['dateStyle'];
  timeStyle?: Intl.DateTimeFormatOptions['timeStyle'];
  format?: Intl.DateTimeFormatOptions;
}): Intl.DateTimeFormatOptions {
  if (format) return format;
  if (dateStyle || timeStyle) return { dateStyle, timeStyle };
  return withTime ? DEFAULT_DATE_TIME_FORMAT : DEFAULT_DATE_FORMAT;
}
