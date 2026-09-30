import { type PlainDate, type PlainTime, Temporal } from './plain-date';

// 値が min・max の中か。日付の欄（DateField・DatePicker）と時刻の欄（TimeField・TimePicker）が、欄をエラーの見た目にするか・一覧の項目を止めるかに使う

/** 日付が min・max の外か（値がないときは外ではない） */
export function isDateOutOfRange(value: PlainDate | null, min?: PlainDate, max?: PlainDate) {
  return (
    value != null &&
    ((min != null && Temporal.PlainDate.compare(value, min) < 0) ||
      (max != null && Temporal.PlainDate.compare(value, max) > 0))
  );
}

/** 時刻が min・max の中か */
export function isTimeInRange(value: PlainTime, min?: PlainTime, max?: PlainTime) {
  return (
    (min == null || Temporal.PlainTime.compare(value, min) >= 0) &&
    (max == null || Temporal.PlainTime.compare(value, max) <= 0)
  );
}

/** 時刻が min・max の外か（値がないときは外ではない） */
export function isTimeOutOfRange(value: PlainTime | null, min?: PlainTime, max?: PlainTime) {
  return value != null && !isTimeInRange(value, min, max);
}
