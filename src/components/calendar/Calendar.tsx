'use client';

import {
  DayButton as BaseDayButton,
  type DayButtonProps,
  type DateRange,
  type DayProps,
  DayPicker,
  type Matcher,
  type PreviousMonthButtonProps,
  type RootProps,
  type WeekdayProps,
} from '@daypicker/react';
import { createContext, type ReactNode, type Ref, use, useMemo, useState } from 'react';
import type { VariantProps } from 'tailwind-variants';

import { Button } from '../button/Button';
import { CaretLeftIcon, CaretRightIcon } from '../../internal/icons';
import {
  fromDate,
  monthFromDate,
  monthToDate,
  type PlainDate,
  type PlainYearMonth,
  Temporal,
  toDate,
  todayIn,
  weekStartOf,
} from '../../internal/date/plain-date';
import { useLocale } from '../../internal/date/use-locale';
import { focusRing } from '../../internal/focus-styles';
import { tv } from '../../internal/tv';
import { useControlled } from '../../internal/use-controlled';
import { useMergedRefs } from '../../internal/use-merged-refs';

// 月の日を並べて、日か期間を選ぶ。振る舞い（キーボード・読み上げ・範囲の選び方）は react-day-picker（@daypicker/react）— ADR-0133
// 値は Temporal.PlainDate で受け渡し、react-day-picker との境界で Date（ローカル時刻の正午）に変える（src/internal/date/plain-date.ts）
// 日は部品の高さの正方形（原則7・11）。入れ物が狭いときは、正方形のまま縮む
// 日は平らな押すもの（原則3）で、hover と押下で文字の色を淡く敷き、押すと沈む。キーボードではフォーカスの線（ADR-0136）
// 選んだ日は部品の色の濃い塗り（ADR-0134）。期間の中の日は淡い面の帯でつなぎ、選んでいる途中は半分の濃さの帯（ADR-0141）
// 今日は太字と短い下線（ADR-0135）。日曜と祝日は危険の赤、土曜は情報の青（ADR-0137・0140）
//
// 日の見た目は、セル（td）が置く変数だけで決める。どの状態も別の変数を置くので、状態が重なっても当てる順に左右されない
//   --day-base・--day-ink       日の塗りと文字（data-look: selected・band・outside・disabled・plain のどれか 1 つ）
//   --day-weekend(-k)           日曜・祝日と土曜の色と、その色を混ぜる割合（data-tone）
//   --day-mark・--day-weight-*  今日の下線と、数字の太さ（data-today・data-look）
//   --day-hover・--day-press    ボタンが置く、文字の色を敷く濃さ。濃いほうを使う
//   --day-strike                選べない日（期間の長さの制約で選べない日）の取り消し線
//
// 日ごとの印（renderDayContent）は、日のボタンの下の中央に重ねる。印を持つ日がある月は、すべての日の数字を印の分だけ上へずらし、
// 数字の高さを横でそろえる。今日の下線は数字のすぐ下（数字と印のあいだ）に引く
const calendar = tv({
  slots: {
    root: [
      // 幅は日 7 つ分（部品の高さの正方形 × 7）。入れ物が狭いときは入れ物の幅まで縮み、日は正方形のまま小さくなる
      'inline-block w-[calc(var(--spacing-control)*7)] max-w-full text-fg',
      // セルが置かないときの値（セルの変数はここから継ぐ）
      '[--day-mark:0] [--day-weekend-k:0] [--day-weekend:var(--color-fg)] [--day-weight-look:400] [--day-weight-today:400]',
      '[--cal-month-content:0] [--day-hover:0%] [--day-press:0%] [--day-strike:none]',
      // 動きを減らす設定では、月を送っても動かさない（ADR-0142）
      'motion-reduce:[--calendar-month-fade-duration:1ms]',
    ],
    months: 'relative',
    // 見出しの行（前の月・月の名前・次の月）と日の表。並ぶ順と列は navPlacement で決める（ADR-0138）
    // 月を送る動きのあいだ、react-day-picker は前の月の写しを重ねる（position: absolute）。幅を今の月にそろえる
    month:
      'grid items-center gap-y-2 [&>[data-animated-month]]:inset-x-0 [&>[data-animated-month]]:top-0',
    caption: 'flex h-(--spacing-control) items-center px-3',
    captionLabel: 'text-(length:--text-control) leading-(--leading-control) font-bold',
    previous: '',
    next: 'order-2',
    grid: [
      'order-3 col-span-full w-full table-fixed border-separate border-spacing-0',
      // 日ごとの印を持つ日がある月。印のない日も含め、すべての日の数字を印の分ずらす
      'has-[[data-has-content]]:[--cal-month-content:1]',
    ],
    // 月を送るとき、その場でふわっと入れ替える（monthTransition="fade" — ADR-0142）
    // react-day-picker はこのクラスを 1 つの名前として足し外しするので、空白を含まない 1 つのクラスにする
    fadeIn:
      'animate-[calendar-month-fade-in_var(--calendar-month-fade-duration)_var(--ease-sheet)_both]',
    fadeOut:
      'animate-[calendar-month-fade-out_var(--calendar-month-fade-duration)_var(--ease-sheet)_both]',
    weekday: [
      'h-8 p-0 text-center align-middle font-normal',
      'text-(length:--text-caption) leading-(--leading-caption)',
      'text-[color:color-mix(in_oklab,var(--day-weekend)_calc(var(--day-weekend-k)*100%),var(--color-fg-subtle))]',
      'data-[weekday=0]:[--day-weekend-k:var(--cal-weekend-k)] data-[weekday=0]:[--day-weekend:var(--color-fg-danger)]',
      'data-[weekday=6]:[--day-weekend-k:var(--cal-weekend-k)] data-[weekday=6]:[--day-weekend:var(--color-fg-info)]',
    ],
    day: [
      'group/day relative rounded-(--cal-radius) p-0 text-center',
      // 状態ごとの塗りと文字（どれか 1 つ）
      'data-[look=plain]:[--day-base:transparent] data-[look=plain]:[--day-ink:color-mix(in_oklab,var(--day-weekend)_calc(var(--day-weekend-k)*100%),var(--color-fg))]',
      'data-[look=selected]:[--day-base:var(--cal-accent)] data-[look=selected]:[--day-ink:var(--cal-on-accent)] data-[look=selected]:[--day-weight-look:700]',
      'data-[look=band]:[--day-base:transparent] data-[look=band]:[--day-ink:var(--cal-on-subtle)]',
      'data-[look=outside]:[--day-base:transparent] data-[look=outside]:[--day-ink:var(--color-fg-subtle)]',
      'data-[look=disabled]:[--day-base:transparent] data-[look=disabled]:[--day-ink:var(--color-on-field-disabled)]',
      // 期間の始まりを選んだあと、長さの制約（minRangeDays・maxRangeDays・excludeDisabled）で選べない日
      // 押せない日と同じ色に取り消し線を足し、もとから押せない日（isDateDisabled など）と見分ける
      'data-[look=constrained]:[--day-base:transparent] data-[look=constrained]:[--day-ink:var(--color-on-field-disabled)] data-[look=constrained]:[--day-strike:line-through]',
      // 日曜・祝日と土曜（ADR-0137・0140）。祝日の土曜は日曜の色。weekendColor={false} のときは色を混ぜない
      'data-[tone=sun]:[--day-weekend-k:var(--cal-weekend-k)] data-[tone=sun]:[--day-weekend:var(--color-fg-danger)]',
      'data-[tone=sat]:[--day-weekend-k:var(--cal-weekend-k)] data-[tone=sat]:[--day-weekend:var(--color-fg-info)]',
      // 今日（ADR-0135）: 太字と、数字の下の短い線
      'data-today:[--day-mark:1] data-today:[--day-weight-today:700]',
      // 期間の帯。始まりと終わりの日は、日の中央から外へ伸ばす。週の端では日の角で丸める
      'before:pointer-events-none before:absolute before:inset-y-0 before:bg-(--cal-subtle)',
      'before:hidden data-band:before:block',
      'data-[band=end]:before:start-0 data-[band=end]:before:end-1/2 data-[band=middle]:before:inset-x-0 data-[band=start]:before:start-1/2 data-[band=start]:before:end-0',
      'first:before:rounded-s-(--cal-radius) last:before:rounded-e-(--cal-radius)',
      // 選んでいる途中の帯（ADR-0141）: 半分の濃さ。マウスを載せた日（塗っていない）は日いっぱいに引き、端を丸める
      'data-[band=cap-end]:before:inset-x-0 data-[band=cap-end]:before:rounded-e-(--cal-radius) data-[band=cap-start]:before:inset-x-0 data-[band=cap-start]:before:rounded-s-(--cal-radius)',
      'data-tentative:before:opacity-50',
    ],
    dayButton: [
      'relative flex aspect-square w-full cursor-pointer items-center justify-center rounded-(--cal-radius) select-none',
      'text-(length:--text-control) leading-(--leading-control) text-(color:--day-ink)',
      '[font-weight:max(var(--day-weight-look),var(--day-weight-today))]',
      'bg-[color-mix(in_oklab,var(--day-base),var(--day-ink)_max(var(--day-hover),var(--day-press)))]',
      // 今日の下線（ADR-0135）。文字の色なので、選んだ日の上では白くなる
      // 印を持つ日がある月では、下線は数字のすぐ下（数字と印のあいだ）に引く（dayNumber）
      'after:absolute after:bottom-(--calendar-today-mark-bottom) after:left-1/2 after:h-0.5 after:w-3.5 after:-translate-x-1/2 after:rounded-full after:bg-current after:opacity-[calc(var(--day-mark)*(1-var(--cal-month-content)))]',
      'enabled:hover:[--day-hover:var(--flat-hover-mix)] enabled:active:translate-y-(--flat-press-depth) enabled:active:[--day-press:var(--flat-press-mix)]',
      '[transition:translate_var(--duration-press)_var(--ease-press),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)] motion-reduce:[transition:none]',
      // キーボードで日を動かしたとき（ADR-0136）: ボタンと同じフォーカスの線。フォーカスそのものが日から日へ移るため
      ...focusRing,
      'disabled:cursor-not-allowed',
      '[text-decoration-line:var(--day-strike)] [text-decoration-thickness:var(--border-width-thin)]',
    ],
    // 日の数字。印（renderDayContent）を持つ日がある月は、印のない日も含めて印の分だけ上へずらす
    dayNumber: [
      'relative [translate:0_calc(var(--calendar-day-number-shift)*var(--cal-month-content))]',
      'after:absolute after:top-[calc(100%+var(--calendar-today-mark-offset))] after:left-1/2 after:h-0.5 after:w-3.5 after:-translate-x-1/2 after:rounded-full after:bg-current after:opacity-[calc(var(--day-mark)*var(--cal-month-content))]',
    ],
    // 日ごとの印。日のボタンの下の中央に置く。押すのは日のボタン
    dayContent: [
      'pointer-events-none absolute inset-x-0 bottom-(--calendar-day-content-bottom) flex items-end justify-center',
      'text-(length:--calendar-day-content-text) leading-none font-normal',
    ],
  },
  variants: {
    // 利用者が選ぶ色（原則6）。指定しないときはグレー。濃い塗り・その上の文字・淡い面・その上の文字・フォーカスの線の色
    color: {
      primary: {
        root: '[--cal-accent:var(--color-primary)] [--cal-on-accent:var(--color-on-primary)] [--cal-on-subtle:var(--color-on-primary-subtle)] [--cal-subtle:var(--color-primary-subtle)] [--color-own-focus:var(--color-primary)]',
      },
      // 白文字を載せるので、ピンクは前景用（原則12）
      secondary: {
        root: '[--cal-accent:var(--color-fg-secondary)] [--cal-on-accent:var(--color-on-secondary)] [--cal-on-subtle:var(--color-on-secondary-subtle)] [--cal-subtle:var(--color-secondary-subtle)] [--color-own-focus:var(--color-fg-secondary)]',
      },
      neutral: {
        root: '[--cal-accent:var(--color-neutral-strong)] [--cal-on-accent:var(--color-on-neutral-strong)] [--cal-on-subtle:var(--color-fg)] [--cal-subtle:var(--palette-gray-200)]',
      },
    },
    // 日の形（ADR-0134）。square は部品の角（既定）、circle は丸
    shape: {
      square: { root: '[--cal-radius:var(--radius-control)]' },
      circle: { root: '[--cal-radius:var(--radius-pill)]' },
    },
    // 日曜・祝日を赤、土曜を青にするか（ADR-0137）
    weekendColor: {
      true: { root: '[--cal-weekend-k:1]' },
      false: { root: '[--cal-weekend-k:0]' },
    },
    // 月送りの置き方（ADR-0138）。sides は ‹ 月の名前 ›（既定）、end は 月の名前 ‹ ›
    // 並べる月の数。2 は DateRangePicker が期間を見渡すために使う。月のあいだは --calendar-months-gap
    // 2 か月では、月送りが前の月は左の月に、次の月は右の月にだけ付く。列を決めておき、月の名前を月の中央にそろえる
    numberOfMonths: {
      1: {},
      2: {
        root: 'w-[calc(var(--spacing-control)*14+var(--calendar-months-gap))]',
        months: 'flex gap-(--calendar-months-gap)',
        month: 'min-w-0 flex-1',
      },
    },
    navPlacement: {
      sides: {
        month: 'grid-cols-[auto_1fr_auto]',
        caption: 'order-1 justify-self-center',
        previous: 'order-0',
      },
      end: {
        month: 'grid-cols-[1fr_auto_auto]',
        caption: 'order-0 justify-self-start',
        previous: 'order-1',
      },
    },
  },
  compoundVariants: [
    {
      numberOfMonths: 2,
      navPlacement: 'sides',
      class: {
        month:
          'grid-cols-[minmax(var(--spacing-control),auto)_1fr_minmax(var(--spacing-control),auto)]',
        caption: 'col-start-2 row-start-1',
        previous: 'col-start-1 row-start-1',
        next: 'col-start-3 row-start-1',
      },
    },
  ],
  defaultVariants: {
    color: 'neutral',
    shape: 'square',
    weekendColor: true,
    navPlacement: 'sides',
    numberOfMonths: 1,
  },
});

const styles = calendar();

type CalendarVariants = VariantProps<typeof calendar>;

/** 日の形 */
export type CalendarShape = NonNullable<CalendarVariants['shape']>;
/** 月送りのボタンの置き方 */
export type CalendarNavPlacement = NonNullable<CalendarVariants['navPlacement']>;

/** 期間。end が null のときは、始まりの日だけを選んだところ */
export interface CalendarRange {
  start: PlainDate;
  end: PlainDate | null;
}

/** 読み上げの文言 */
export interface CalendarLabels {
  /** @default '前の月' */
  previousMonth: string;
  /** @default '次の月' */
  nextMonth: string;
  /** 今日の日の名前の先頭に付ける。@default '今日' */
  today: string;
  /** 選んだ日の名前の後ろに付ける。@default '選択中' */
  selected: string;
}

const DEFAULT_LABELS: CalendarLabels = {
  previousMonth: '前の月',
  nextMonth: '次の月',
  today: '今日',
  selected: '選択中',
};

interface CalendarBaseProps {
  /**
   * 選んだ日の色。primary・secondary は利用者が選ぶ色、neutral は色を持たないグレーです
   * @default 'neutral'
   */
  color?: CalendarVariants['color'];
  /**
   * 日の形。square はボタンと同じ角、circle は丸です
   * @default 'square'
   */
  shape?: CalendarShape;
  /**
   * 日曜と祝日を赤、土曜を青にする。false のときは、どの曜日も同じ色です
   * @default true
   */
  weekendColor?: boolean;
  /**
   * 月送りのボタンの置き方。sides は月の名前の両側、end は右にまとめます
   * @default 'sides'
   */
  navPlacement?: CalendarNavPlacement;
  /**
   * 前後の月の日を隠します。ふだんは灰色で見せます。どちらも表はいつも 6 週です
   * @default false
   */
  hideOutsideDays?: boolean;
  /**
   * 月を送るときの動き。none はすぐに切り替え、fade はその場でふわっと入れ替えます
   * @default 'none'
   */
  monthTransition?: 'none' | 'fade';
  /**
   * 並べる月の数。2 では見せている月とその次の月を横に並べます。期間を選ぶときに、月をまたぐ期間を見渡せます
   * @default 1
   */
  numberOfMonths?: 1 | 2;
  /** 選べるいちばん前の日。これより前の日は押せず、前の月へも送れません */
  min?: PlainDate;
  /** 選べるいちばん後の日。これより後の日は押せず、次の月へも送れません */
  max?: PlainDate;
  /** 日ごとに押せなくする。true を返した日は押せません */
  isDateDisabled?: (date: PlainDate) => boolean;
  /**
   * 日ごとの印（空きの有無の点、値段など）を返す。返したものを日の数字に添えて出します。
   * 印そのものは読み上げられないので、意味を伝えるときは getDayContentLabel で同じ意味の文も返してください
   */
  renderDayContent?: (date: PlainDate) => ReactNode;
  /**
   * 日ごとの印（renderDayContent）の意味を、読み上げの文で返す。返した文は、日のボタンの読み上げで日付（祝日の名前）のあとに読まれます。
   * renderDayContent と組で使い、印を出す日には同じ意味の文を返してください。渡さないとき、または undefined を返した日は、印を読み上げません
   */
  getDayContentLabel?: (date: PlainDate) => string | undefined;
  /**
   * 祝日の名前を返す。名前を返した日は日曜と同じ色になり、名前が読み上げに入ります。祝日のデータは部品に含みません
   */
  getHoliday?: (date: PlainDate) => string | undefined;
  /** 見せている月（制御） */
  month?: PlainYearMonth;
  /** はじめに見せる月（非制御）。指定しないときは選んだ日の月、なければ今日の月です */
  defaultMonth?: PlainYearMonth;
  /** 見せている月が変わるときに、次の値を渡して呼びます */
  onMonthChange?: (month: PlainYearMonth) => void;
  /**
   * 言語。曜日と月の名前、週の始まりの曜日がこれに従います
   * @default ThemeProvider の locale、なければ 'ja-JP'
   */
  locale?: string;
  /**
   * 週の始まりの曜日。0 が日曜、1 が月曜です
   * @default locale の週の始まり（読めない環境では日曜）
   */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /**
   * 今日を決めるタイムゾーン
   * @default ThemeProvider の timeZone、なければ 'Asia/Tokyo'
   */
  timeZone?: string;
  /**
   * 今日として扱う日。サーバーで描くときに、サーバーとブラウザで今日をそろえるのに使います
   * @default timeZone での今日
   */
  today?: PlainDate;
  /** 読み上げの文言 */
  labels?: Partial<CalendarLabels>;
  /** 読み上げの名前。見出しなどで名前が付いていないときに付けます */
  'aria-label'?: string;
  /** はじめに日へフォーカスを移す */
  autoFocus?: boolean;
  /** いちばん外の要素に付きます */
  className?: string;
  /** いちばん外の要素に付きます */
  ref?: Ref<HTMLDivElement>;
}

export interface CalendarSingleProps extends CalendarBaseProps {
  /**
   * 1 日を選ぶか、期間を選ぶか
   * @default 'single'
   */
  mode?: 'single';
  /** 選んだ日（制御）。選んでいないときは null */
  value?: PlainDate | null;
  /** はじめに選んでいる日（非制御） */
  defaultValue?: PlainDate | null;
  /** 日を選んだとき。選んだ日をもう一度押すと null になります（required のときはなりません） */
  onValueChange?: (value: PlainDate | null) => void;
  /** 選んだ日を押しても外れないようにする */
  required?: boolean;
}

export interface CalendarRangeProps extends CalendarBaseProps {
  /** 期間を選びます */
  mode: 'range';
  /** 選んだ期間（制御）。選んでいないときは null */
  value?: CalendarRange | null;
  /** はじめに選んでいる期間（非制御） */
  defaultValue?: CalendarRange | null;
  /**
   * 期間を選んだとき。1 回目で始まりの日、2 回目で終わりの日が決まります。
   * 始まりを選んだあとは、マウスを載せた日（キーボードで移った日）まで薄い帯が出ます
   */
  onValueChange?: (value: CalendarRange | null) => void;
  /** 選んだ日を押しても外れないようにする */
  required?: boolean;
  /**
   * 期間のいちばん短い日数。始まりと終わりの日を両方数えます（1 泊 2 日なら 2）。
   * 始まりを選んだあと、これより短くなる日は選べません。
   * 選んだ始まりの日をもう一度押すと、始まりが外れ、別の日を始まりに選び直せます（required のときも外れます。終わりを選ぶ前の途中の状態なので）
   */
  minRangeDays?: number;
  /**
   * 期間のいちばん長い日数。始まりと終わりの日を両方数えます。
   * 始まりを選んだあと、これより長くなる日は選べません
   */
  maxRangeDays?: number;
  /**
   * 期間の中に押せない日（min・max の外、isDateDisabled）を含めない。
   * 始まりを選んだあと、押せない日をまたぐ日は選べません
   * @default false
   */
  excludeDisabled?: boolean;
}

export type CalendarProps = CalendarSingleProps | CalendarRangeProps;

// 部品の中の部分（日のセル・曜日の見出し・月送り）が読む値。部分は react-day-picker に渡すので、props ではなくここから読む
interface CalendarContextValue {
  /** 期間の両端が決まっているか。始まりだけのときは決まった帯を出さない */
  rangeComplete: boolean;
  /** 曜日の名前（読み上げの名前）から、曜日（0 が日曜）を引く */
  weekdayOf: Map<string, number>;
  /** 日（YYYY-MM-DD）の祝日の名前 */
  holidayOf: (iso: string) => string | undefined;
  /** 期間の始まりだけを選び、別の日を指しているときの仮の期間（YYYY-MM-DD。from が前）。pointed は指している側 */
  tentative: { from: string; to: string; pointed: 'from' | 'to' } | null;
  navPlacement: CalendarNavPlacement;
  numberOfMonths: 1 | 2;
  /** 日ごとの印 */
  renderDayContent?: (date: PlainDate) => ReactNode;
  /** 期間の長さの制約で選べない日か（始まりだけを選んだあいだ） */
  isConstrained: (iso: string) => boolean;
  /** 利用者が渡した、いちばん外の要素の ref */
  rootRef?: Ref<HTMLDivElement>;
}

const CalendarContext = createContext<CalendarContextValue>({
  rangeComplete: false,
  weekdayOf: new Map(),
  holidayOf: () => undefined,
  tentative: null,
  navPlacement: 'sides',
  numberOfMonths: 1,
  isConstrained: () => false,
});

// 日のセル。状態を 1 つの data-look にまとめ、範囲の帯（data-band）と色（data-tone）を足す
// 押せないことは、選んでいることより先に見せる（原則1）
function CalendarDay({ day, modifiers, className, ...props }: DayProps) {
  const { rangeComplete, holidayOf, tentative, isConstrained } = use(CalendarContext);
  const iso = day.isoDate;
  const look = modifiers.disabled
    ? isConstrained(iso)
      ? 'constrained'
      : 'disabled'
    : modifiers.range_middle
      ? 'band'
      : modifiers.selected
        ? 'selected'
        : day.outside
          ? 'outside'
          : 'plain';
  // 隠した前後の月の日（hideOutsideDays）には、期間の帯を引かない
  const band =
    !rangeComplete || modifiers.hidden
      ? undefined
      : modifiers.range_middle
        ? 'middle'
        : modifiers.range_start && !modifiers.range_end
          ? 'start'
          : modifiers.range_end && !modifiers.range_start
            ? 'end'
            : undefined;
  // 仮の期間の帯。両端が決まるまでのあいだだけ
  // 始まりの日（塗ってある）は日の中央から、指している日（塗っていない）は日いっぱいに帯を引き、端を日の角で丸める
  const tentativeBand =
    rangeComplete || !tentative || modifiers.hidden
      ? undefined
      : iso > tentative.from && iso < tentative.to
        ? 'middle'
        : iso === tentative.from
          ? tentative.pointed === 'from'
            ? 'cap-start'
            : 'start'
          : iso === tentative.to
            ? tentative.pointed === 'to'
              ? 'cap-end'
              : 'end'
            : undefined;
  const weekday = day.date.getDay();
  const tone = weekday === 0 || holidayOf(iso) ? 'sun' : weekday === 6 ? 'sat' : undefined;
  return (
    <td
      {...props}
      className={styles.day({ className })}
      data-look={look}
      data-band={band ?? tentativeBand}
      data-tentative={tentativeBand ? '' : undefined}
      data-tone={tone}
    />
  );
}

// 日のボタン。react-day-picker のボタン（フォーカスを移す仕組み）に、数字と日ごとの印を入れる
function CalendarDayButton({ children, ...props }: DayButtonProps) {
  const { renderDayContent } = use(CalendarContext);
  const content = renderDayContent?.(fromDate(props.day.date));
  const hasContent = content != null && content !== false;
  // 隣の月の日（外側の日）の印は、この月の印として数えない（数字をずらすのは、この月の日に印があるときだけ）
  const marksMonth = hasContent && !props.modifiers.outside;
  return (
    <BaseDayButton {...props} data-has-content={marksMonth ? '' : undefined}>
      <span className={styles.dayNumber()}>{children}</span>
      {hasContent && <span className={styles.dayContent()}>{content}</span>}
    </BaseDayButton>
  );
}

function CalendarWeekday({ className, ...props }: WeekdayProps) {
  const { weekdayOf } = use(CalendarContext);
  const label = props['aria-label'];
  return (
    <th
      {...props}
      className={styles.weekday({ className })}
      data-weekday={label ? weekdayOf.get(label) : undefined}
    />
  );
}

// 月送りは、アイコンだけの枠線のボタン（原則7: いちばん進めたい操作ではない）
// react-day-picker が渡す className・tabIndex は使わない（見た目は Button、押せないときは disabled）
function MonthButton({
  direction,
  'aria-disabled': ariaDisabled,
  ...props
}: PreviousMonthButtonProps & { direction: 'previous' | 'next' }) {
  const { navPlacement, numberOfMonths } = use(CalendarContext);
  return (
    <Button
      iconOnly
      variant="outline"
      aria-label={props['aria-label'] ?? ''}
      className={
        direction === 'previous'
          ? styles.previous({ navPlacement, numberOfMonths })
          : styles.next({ navPlacement, numberOfMonths })
      }
      disabled={ariaDisabled === true || ariaDisabled === 'true'}
      onClick={props.onClick}
    >
      {direction === 'previous' ? <CaretLeftIcon standalone /> : <CaretRightIcon standalone />}
    </Button>
  );
}

// いちばん外の要素。react-day-picker の rootRef（動きに使う）と、利用者が渡した ref をつなぐ（ADR-0250）
function CalendarRoot({ rootRef, ...props }: RootProps) {
  const { rootRef: ownRef } = use(CalendarContext);
  const ref = useMergedRefs(rootRef, ownRef);
  return <div ref={ref} {...props} />;
}

const components = {
  Root: CalendarRoot,
  Day: CalendarDay,
  DayButton: CalendarDayButton,
  Weekday: CalendarWeekday,
  PreviousMonthButton: (props: PreviousMonthButtonProps) => (
    <MonthButton direction="previous" {...props} />
  ),
  NextMonthButton: (props: PreviousMonthButtonProps) => <MonthButton direction="next" {...props} />,
};

// 期間の始まりから数えて、長さの制約（minRangeDays・maxRangeDays・excludeDisabled）で選べない日か。YYYY-MM-DD で受ける
// 始まりの日そのものと、もとから押せない日は含めない（押せない日の見た目のまま）
function constrainedDays(
  start: PlainDate | null,
  {
    minRangeDays,
    maxRangeDays,
    excludeDisabled,
  }: Pick<CalendarRangeProps, 'minRangeDays' | 'maxRangeDays' | 'excludeDisabled'>,
  baseDisabled: (date: PlainDate) => boolean
): (iso: string) => boolean {
  if (!start || (!minRangeDays && !maxRangeDays && !excludeDisabled)) return () => false;
  // 押せない日をまたがない: 始まりから前後に、最初の押せない日までの日数を数える
  // 確かめる日の手前まで、必要になった分だけ数え進める（見る範囲に上限を置かない。遠い日でも、間の押せない日を見落とさない）
  const scans = {
    1: { checked: 0, found: null as number | null },
    [-1]: { checked: 0, found: null as number | null },
  };
  const firstDisabledBefore = (step: 1 | -1, distance: number) => {
    const scan = scans[step];
    while (scan.found === null && scan.checked < distance - 1) {
      scan.checked += 1;
      if (baseDisabled(start.add({ days: scan.checked * step }))) scan.found = scan.checked;
    }
    return scan.found;
  };
  return (iso) => {
    const date = Temporal.PlainDate.from(iso);
    const offset = start.until(date).days;
    if (offset === 0 || baseDisabled(date)) return false;
    const length = Math.abs(offset) + 1;
    if (minRangeDays && length < minRangeDays) return true;
    if (maxRangeDays && length > maxRangeDays) return true;
    if (!excludeDisabled) return false;
    const step = offset > 0 ? 1 : -1;
    const found = firstDisabledBefore(step, Math.abs(offset));
    return found !== null && found < Math.abs(offset);
  };
}

/**
 * 月の日を並べて、1 日か期間を選ぶカレンダー。値は Temporal.PlainDate で受け渡します
 */
export function Calendar(props: CalendarProps) {
  const {
    color,
    shape,
    weekendColor = true,
    navPlacement = 'sides',
    hideOutsideDays = false,
    monthTransition = 'none',
    numberOfMonths = 1,
    min,
    max,
    isDateDisabled,
    getHoliday,
    renderDayContent,
    getDayContentLabel,
    weekStartsOn,
    month,
    defaultMonth,
    onMonthChange,
    labels: labelsProp,
    today: todayProp,
    autoFocus,
    className,
    ref,
  } = props;
  const { locale, timeZone } = useLocale(props.locale, props.timeZone);
  const labels = { ...DEFAULT_LABELS, ...labelsProp };

  const [single, setSingle] = useControlled<PlainDate | null>(
    props.mode === 'range' ? undefined : props.value,
    props.mode === 'range' ? null : (props.defaultValue ?? null),
    props.mode === 'range' ? undefined : props.onValueChange
  );
  const [range, setRange] = useControlled<CalendarRange | null>(
    props.mode === 'range' ? props.value : undefined,
    props.mode === 'range' ? (props.defaultValue ?? null) : null,
    props.mode === 'range' ? props.onValueChange : undefined
  );

  const today = todayProp ?? todayIn(timeZone);
  const [shownMonth, setShownMonth] = useControlled<PlainYearMonth>(
    month,
    defaultMonth ??
      (props.mode === 'range' ? range?.start : single)?.toPlainYearMonth() ??
      today.toPlainYearMonth(),
    onMonthChange
  );
  // 期間の始まりだけを選んだあと、マウスを載せた日・キーボードで移った日（ADR-0141）
  const [pointed, setPointed] = useState<string | null>(null);

  const intl = useMemo(() => {
    const caption = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long' });
    const weekdayShort = new Intl.DateTimeFormat(locale, { weekday: 'narrow' });
    const weekdayLong = new Intl.DateTimeFormat(locale, { weekday: 'long' });
    const full = new Intl.DateTimeFormat(locale, { dateStyle: 'full' });
    // 2026-09-13 は日曜。そこから 7 日の曜日の名前を引けるようにする
    const weekdayOf = new Map<string, number>();
    for (let i = 0; i < 7; i++) weekdayOf.set(weekdayLong.format(new Date(2026, 8, 13 + i, 12)), i);
    return { caption, weekdayShort, weekdayLong, full, weekdayOf };
  }, [locale]);

  const disabled: Matcher[] = [];
  if (min) disabled.push({ before: toDate(min) });
  if (max) disabled.push({ after: toDate(max) });
  if (isDateDisabled) disabled.push((date: Date) => isDateDisabled(fromDate(date)));

  // 期間の始まりだけを選んだあいだ、長さの制約で選べない日を足す
  const rangeStartDate = props.mode === 'range' && range && !range.end ? range.start : null;
  const isConstrained = constrainedDays(
    rangeStartDate,
    props.mode === 'range' ? props : {},
    (date) =>
      (min != null && Temporal.PlainDate.compare(date, min) < 0) ||
      (max != null && Temporal.PlainDate.compare(date, max) > 0) ||
      (isDateDisabled?.(date) ?? false)
  );
  if (rangeStartDate) disabled.push((date: Date) => isConstrained(fromDate(date).toString()));

  // 月を送るときの動き（ADR-0142）。動かさないときは react-day-picker の動きを使わない
  const fade = monthTransition === 'fade';

  const shared = {
    lang: locale,
    weekStartsOn: weekStartsOn ?? weekStartOf(locale),
    today: toDate(today),
    navLayout: 'around' as const,
    fixedWeeks: true,
    showOutsideDays: !hideOutsideDays,
    numberOfMonths,
    autoFocus,
    disabled,
    startMonth: min ? toDate(min) : undefined,
    endMonth: max ? toDate(max) : undefined,
    'aria-label': props['aria-label'],
    month: monthToDate(shownMonth),
    onMonthChange: (date: Date) => setShownMonth(monthFromDate(date)),
    animate: fade,
    components,
    classNames: {
      root: styles.root({ color, shape, weekendColor, numberOfMonths, className }),
      months: styles.months({ numberOfMonths }),
      month: styles.month({ navPlacement, numberOfMonths }),
      month_caption: styles.caption({ navPlacement, numberOfMonths }),
      caption_label: styles.captionLabel(),
      month_grid: styles.grid(),
      day_button: styles.dayButton(),
      ...(fade && {
        weeks_after_enter: styles.fadeIn(),
        weeks_before_enter: styles.fadeIn(),
        caption_after_enter: styles.fadeIn(),
        caption_before_enter: styles.fadeIn(),
        weeks_after_exit: styles.fadeOut(),
        weeks_before_exit: styles.fadeOut(),
        caption_after_exit: styles.fadeOut(),
        caption_before_exit: styles.fadeOut(),
      }),
    },
    formatters: {
      formatCaption: (date: Date) => intl.caption.format(date),
      formatWeekdayName: (date: Date) => intl.weekdayShort.format(date),
      formatDay: (date: Date) => String(date.getDate()),
    },
    labels: {
      labelGrid: (date: Date) => intl.caption.format(date),
      labelWeekday: (date: Date) => intl.weekdayLong.format(date),
      labelDayButton: (date: Date, modifiers: Record<string, boolean>) =>
        [
          modifiers.today ? `${labels.today} ` : '',
          intl.full.format(date),
          getHoliday ? ` ${getHoliday(fromDate(date)) ?? ''}`.trimEnd() : '',
          getDayContentLabel ? ` ${getDayContentLabel(fromDate(date)) ?? ''}`.trimEnd() : '',
          modifiers.selected ? ` ${labels.selected}` : '',
        ].join(''),
      labelPrevious: () => labels.previousMonth,
      labelNext: () => labels.nextMonth,
    },
  };

  const rangeStart = rangeStartDate ? rangeStartDate.toString() : null;
  const context: CalendarContextValue = {
    rangeComplete: Boolean(range?.start && range.end),
    weekdayOf: intl.weekdayOf,
    holidayOf: (iso) => getHoliday?.(Temporal.PlainDate.from(iso)),
    tentative:
      rangeStart && pointed && pointed !== rangeStart
        ? pointed < rangeStart
          ? { from: pointed, to: rangeStart, pointed: 'from' }
          : { from: rangeStart, to: pointed, pointed: 'to' }
        : null,
    navPlacement,
    numberOfMonths,
    renderDayContent,
    isConstrained,
    rootRef: ref,
  };
  // 仮の帯を出すのは、期間の始まりだけを選んだあとだけ
  const pointing = rangeStart
    ? {
        // 選べない日は指さない（仮の帯を、選べない日まで伸ばさない）
        onDayMouseEnter: (date: Date, modifiers: Record<string, boolean>) =>
          setPointed(modifiers.disabled ? null : fromDate(date).toString()),
        onDayMouseLeave: () => setPointed(null),
        onDayFocus: (date: Date) => setPointed(fromDate(date).toString()),
        onDayBlur: () => setPointed(null),
      }
    : {};

  if (props.mode === 'range') {
    const selected: DateRange | undefined = range
      ? { from: toDate(range.start), to: range.end ? toDate(range.end) : undefined }
      : undefined;
    // 選び方は部品で決める。react-day-picker は 1 回目で始まりと終わりを同じ日にし、両端が決まったあとは期間を伸ばすため
    //   期間がないか両端が決まっているとき: 押した日を始まりにして選び直す
    //   始まりだけのとき: 押した日を終わりにする（前の日なら入れ替える。同じ日なら 1 日の期間）
    const onSelect = (_next: DateRange | undefined, triggerDate: Date) => {
      const date = fromDate(triggerDate);
      // 始まりの日をもう一度押すと 1 日の期間になる。それより長い期間が要るときは、始まりを外す
      // （近い日が選べなくなっているので、外さないと始まりを選び直せない）。終わりを選ぶ前の途中なので、required でも外す
      if (range && !range.end && date.equals(range.start) && (props.minRangeDays ?? 1) > 1) {
        setRange(null);
        setPointed(null);
        return;
      }
      const value: CalendarRange =
        range && !range.end
          ? Temporal.PlainDate.compare(date, range.start) < 0
            ? { start: date, end: range.start }
            : { start: range.start, end: date }
          : { start: date, end: null };
      setRange(value);
      setPointed(null);
    };
    return (
      <CalendarContext value={context}>
        {props.required ? (
          <DayPicker
            {...shared}
            {...pointing}
            mode="range"
            required
            selected={selected ?? { from: undefined }}
            onSelect={onSelect}
          />
        ) : (
          <DayPicker
            {...shared}
            {...pointing}
            mode="range"
            selected={selected}
            onSelect={onSelect}
          />
        )}
      </CalendarContext>
    );
  }

  const selected = single ? toDate(single) : undefined;
  const onSelect = (next: Date | undefined) => {
    const value = next ? fromDate(next) : null;
    setSingle(value);
  };
  return (
    <CalendarContext value={context}>
      {props.required ? (
        <DayPicker {...shared} mode="single" required selected={selected} onSelect={onSelect} />
      ) : (
        <DayPicker {...shared} mode="single" selected={selected} onSelect={onSelect} />
      )}
    </CalendarContext>
  );
}
