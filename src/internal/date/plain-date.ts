// 暦の日付（Temporal.PlainDate）と、react-day-picker が使う Date のあいだの変換（Calendar・DatePicker）
// Temporal は temporal-polyfill から読む。ネイティブの Temporal があればそれを返し、ない環境（Safari）でだけ polyfill を使う
// グローバル（globalThis.Temporal）は書き換えない。利用者は、この Temporal を @kazuemon/ui から読める
import { Temporal } from 'temporal-polyfill';

export { Temporal };

/** 時刻もタイムゾーンも持たない暦の日付 */
export type PlainDate = Temporal.PlainDate;
/** 年と月 */
export type PlainYearMonth = Temporal.PlainYearMonth;
/** 時刻もタイムゾーンも持たない、1 日の中の時刻 */
export type PlainTime = Temporal.PlainTime;

// Date はローカル時刻の正午にする。0 時だと、夏時間に切り替わる日に 0 時がない地域で前の日になる
export function toDate(date: PlainDate): Date {
  return new Date(date.year, date.month - 1, date.day, 12);
}

// 年・月・日だけを読むので、別の Temporal の実装（ほかの polyfill）で作った値でも受け取れる
export function fromDate(date: Date): PlainDate {
  return Temporal.PlainDate.from({
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  });
}

export function monthToDate(month: PlainYearMonth): Date {
  return new Date(month.year, month.month - 1, 1, 12);
}

export function monthFromDate(date: Date): PlainYearMonth {
  return Temporal.PlainYearMonth.from({ year: date.getFullYear(), month: date.getMonth() + 1 });
}

/** タイムゾーンでの今日 */
export function todayIn(timeZone: string): PlainDate {
  return Temporal.Now.plainDateISO(timeZone);
}

/**
 * 週の始まりの曜日（0 が日曜）。Intl.Locale の週の情報を読み、読めない環境（Firefox）では日曜にする
 * 週の情報の firstDay は 1 が月曜、7 が日曜
 */
export function weekStartOf(locale: string): 0 | 1 | 2 | 3 | 4 | 5 | 6 {
  try {
    const intlLocale = new Intl.Locale(locale) as Intl.Locale & {
      getWeekInfo?: () => { firstDay: number };
      weekInfo?: { firstDay: number };
    };
    const firstDay = intlLocale.getWeekInfo?.().firstDay ?? intlLocale.weekInfo?.firstDay;
    if (firstDay) return (firstDay % 7) as 0 | 1 | 2 | 3 | 4 | 5 | 6;
  } catch {
    // 読めない言語の指定は日曜にする
  }
  return 0;
}
