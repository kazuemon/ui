// 貼り付けた文字から日付・時刻を読む（DateField・TimeField）。DOM も React も使わない
// 全角の数字・記号は NFKC で半角にそろえてから読む。読めないときは null（呼ぶ側は値を変えない）
import { Temporal } from 'temporal-polyfill';

export interface ParsedDateParts {
  year: number;
  month: number;
  day: number;
}

export interface ParsedTimeParts {
  /** 0〜23 */
  hour: number;
  minute: number;
  second?: number;
}

// 和暦の元年の前の年（元年 = この年 + 1）
const ERAS: Record<string, number> = {
  令和: 2018,
  r: 2018,
  平成: 1988,
  h: 1988,
  昭和: 1925,
  s: 1925,
  大正: 1911,
  t: 1911,
  明治: 1867,
  m: 1867,
};

// 年・月・日のあいだの記号。「2026/9/20」「2026-09-20」「2026.9.20」「2026年9月20日」「2026 9 20」
const SEP = String.raw`\s*[\/\-.年月\s]\s*`;

function normalize(text: string): string {
  return (
    text
      .normalize('NFKC')
      // 長音やダッシュのたぐいを「-」にそろえる
      .replace(/[‐‑‒–—―−ー]/g, '-')
      .trim()
      .toLowerCase()
  );
}

function validDate(year: number, month: number, day: number): ParsedDateParts | null {
  try {
    const date = Temporal.PlainDate.from({ year, month, day }, { overflow: 'reject' });
    return { year: date.year, month: date.month, day: date.day };
  } catch {
    return null;
  }
}

/**
 * 貼り付けた文字を日付として読む。「2026/09/20」「2026-9-20」「20260920」「令和8年9月20日」「R8.9.20」
 * 年が後ろの「9/20/2026」「20.09.2026」は、ロケールの並び（monthFirst）で月と日を決める
 * ISO の日時（「2026-09-20T10:00」）は日付の部分だけを読む
 */
export function parseDateText(text: string, monthFirst = false): ParsedDateParts | null {
  const s = normalize(text).replace(/t\d{1,2}:\d{2}.*$/, '');
  let match = new RegExp(`^(\\d{4})${SEP}(\\d{1,2})${SEP}(\\d{1,2})\\s*日?$`).exec(s);
  if (match) return validDate(Number(match[1]), Number(match[2]), Number(match[3]));
  match = /^(\d{4})(\d{2})(\d{2})$/.exec(s);
  if (match) return validDate(Number(match[1]), Number(match[2]), Number(match[3]));
  match = new RegExp(
    `^(令和|平成|昭和|大正|明治|[rhstm])\\.?\\s*(元|\\d{1,2})${SEP}(\\d{1,2})${SEP}(\\d{1,2})\\s*日?$`
  ).exec(s);
  if (match) {
    const eraYear = match[2] === '元' ? 1 : Number(match[2]);
    return validDate(ERAS[match[1]] + eraYear, Number(match[3]), Number(match[4]));
  }
  match = /^(\d{1,2})\s*[/\-.]\s*(\d{1,2})\s*[/\-.]\s*(\d{4})$/.exec(s);
  if (match) {
    const [a, b] = [Number(match[1]), Number(match[2])];
    return monthFirst ? validDate(Number(match[3]), a, b) : validDate(Number(match[3]), b, a);
  }
  return null;
}

function validTime(hour: number, minute: number, second?: number): ParsedTimeParts | null {
  if (hour > 23 || minute > 59 || (second != null && second > 59)) return null;
  return second == null ? { hour, minute } : { hour, minute, second };
}

/**
 * 貼り付けた文字を時刻として読む。「9:05」「09:05:30」「0905」「午後3時」「午後3時半」「3:05 PM」「15時5分」
 * 午前・午後（AM・PM）が付くときは、時を 12 時間制として読む
 */
export function parseTimeText(text: string): ParsedTimeParts | null {
  let s = normalize(text)
    // ISO の日時は時刻の部分だけを読む
    .replace(/^\d{4}-\d{2}-\d{2}t/, '')
    .replace(/(z|[+-]\d{2}:?\d{2})$/, '')
    .replace(/\s+/g, '');
  let period: 'am' | 'pm' | null = null;
  const periodMatch = /^(午前|午後|am|pm|a\.m\.|p\.m\.)|(午前|午後|am|pm|a\.m\.|p\.m\.)$/.exec(s);
  if (periodMatch) {
    const word = periodMatch[1] ?? periodMatch[2];
    period = word === '午前' || word.startsWith('a') ? 'am' : 'pm';
    s = s.replace(word, '');
  }
  let parts: [number, number, number | undefined] | null = null;
  let match = /^(\d{1,2})(?::|時)(\d{1,2}|半)?分?(?::?(\d{1,2})秒?)?$/.exec(s);
  if (match) {
    const minute = match[2] === '半' ? 30 : match[2] ? Number(match[2]) : 0;
    parts = [Number(match[1]), minute, match[3] ? Number(match[3]) : undefined];
  } else if ((match = /^(\d{1,2})(\d{2})(\d{2})?$/.exec(s))) {
    // 数字だけ: 「905」「0905」は 時・分、「090530」は 時・分・秒
    parts = [Number(match[1]), Number(match[2]), match[3] ? Number(match[3]) : undefined];
  } else if (period && (match = /^(\d{1,2})$/.exec(s))) {
    parts = [Number(match[1]), 0, undefined];
  }
  if (!parts) return null;
  let [hour] = parts;
  if (period) {
    if (hour > 12) return null;
    hour = (hour % 12) + (period === 'pm' ? 12 : 0);
  }
  return validTime(hour, parts[1], parts[2]);
}
