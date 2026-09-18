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

/** 「3 日前」「昨日」「今」のように、now からの隔たりを書く */
export function formatRelative(date: Date, now: number, locale: string): string {
  const diff = (date.getTime() - now) / 1000;
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  for (const [unit, seconds, limit] of RELATIVE_UNITS) {
    if (abs < limit) {
      // 45 秒に満たないときは「今」にする
      if (unit === 'second') return rtf.format(0, 'second');
      return rtf.format(Math.round(diff / seconds), unit);
    }
  }
  return rtf.format(Math.round(diff / (60 * 60 * 24 * 365)), 'year');
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
