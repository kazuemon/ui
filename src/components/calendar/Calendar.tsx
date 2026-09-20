'use client';

import {
  type DateRange,
  type DayProps,
  DayPicker,
  type Matcher,
  type PreviousMonthButtonProps,
  type WeekdayProps,
} from '@daypicker/react';
import { createContext, use, useMemo, useState } from 'react';
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
const calendar = tv({
  slots: {
    root: [
      // 幅は日 7 つ分（部品の高さの正方形 × 7）。入れ物が狭いときは入れ物の幅まで縮み、日は正方形のまま小さくなる
      'inline-block w-[calc(var(--spacing-control)*7)] max-w-full text-fg',
      // セルが置かないときの値（セルの変数はここから継ぐ）
      '[--day-mark:0] [--day-weekend-k:0] [--day-weekend:var(--color-fg)] [--day-weight-look:400] [--day-weight-today:400]',
      '[--day-hover:0%] [--day-press:0%]',
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
    grid: 'order-3 col-span-full w-full table-fixed border-separate border-spacing-0',
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
      'data-[weekday=0]:[--day-weekend-k:var(--cal-weekend-k)] data-[weekday=0]:[--day-weekend:var(--color-calendar-sunday)]',
      'data-[weekday=6]:[--day-weekend-k:var(--cal-weekend-k)] data-[weekday=6]:[--day-weekend:var(--color-calendar-saturday)]',
    ],
    day: [
      'group/day relative rounded-(--cal-radius) p-0 text-center',
      // 状態ごとの塗りと文字（どれか 1 つ）
      'data-[look=plain]:[--day-base:transparent] data-[look=plain]:[--day-ink:color-mix(in_oklab,var(--day-weekend)_calc(var(--day-weekend-k)*100%),var(--color-fg))]',
      'data-[look=selected]:[--day-base:var(--cal-accent)] data-[look=selected]:[--day-ink:var(--cal-on-accent)] data-[look=selected]:[--day-weight-look:700]',
      'data-[look=band]:[--day-base:transparent] data-[look=band]:[--day-ink:var(--cal-on-subtle)]',
      'data-[look=outside]:[--day-base:transparent] data-[look=outside]:[--day-ink:var(--color-fg-subtle)]',
      'data-[look=disabled]:[--day-base:transparent] data-[look=disabled]:[--day-ink:var(--color-on-field-disabled)]',
      // 日曜・祝日と土曜（ADR-0137・0140）。祝日の土曜は日曜の色。weekendColor={false} のときは色を混ぜない
      'data-[tone=sun]:[--day-weekend-k:var(--cal-weekend-k)] data-[tone=sun]:[--day-weekend:var(--color-calendar-sunday)]',
      'data-[tone=sat]:[--day-weekend-k:var(--cal-weekend-k)] data-[tone=sat]:[--day-weekend:var(--color-calendar-saturday)]',
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
      'after:absolute after:bottom-[5px] after:left-1/2 after:h-0.5 after:w-3.5 after:-translate-x-1/2 after:rounded-full after:bg-current after:opacity-(--day-mark)',
      'enabled:hover:[--day-hover:var(--flat-hover-mix)] enabled:active:translate-y-(--flat-press-depth) enabled:active:[--day-press:var(--flat-press-mix)]',
      '[transition:translate_var(--duration-press)_var(--ease-press),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)] motion-reduce:[transition:none]',
      // キーボードで日を動かしたとき（ADR-0136）: ボタンと同じフォーカスの線。フォーカスそのものが日から日へ移るため
      ...focusRing,
      'disabled:cursor-not-allowed',
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
        root: '[--cal-accent:var(--color-neutral-strong)] [--cal-on-accent:var(--color-on-neutral-strong)] [--cal-on-subtle:var(--color-fg)] [--cal-subtle:var(--color-calendar-neutral-subtle)]',
      },
    },
    // 日の形（ADR-0134）。square は部品の角（既定）、round は丸
    shape: {
      square: { root: '[--cal-radius:var(--radius-control)]' },
      round: { root: '[--cal-radius:var(--radius-pill)]' },
    },
    // 日曜・祝日を赤、土曜を青にするか（ADR-0137）
    weekendColor: {
      true: { root: '[--cal-weekend-k:1]' },
      false: { root: '[--cal-weekend-k:0]' },
    },
    // 月送りの置き方（ADR-0138）。sides は ‹ 月の名前 ›（既定）、end は 月の名前 ‹ ›
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
  defaultVariants: { color: 'neutral', shape: 'square', weekendColor: true, navPlacement: 'sides' },
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
   * 日の形。square はボタンと同じ角、round は丸です
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
   * 前後の月の日を灰色で見せる。false のときは隠します。どちらも表はいつも 6 週です
   * @default true
   */
  showOutsideDays?: boolean;
  /**
   * 月を送るときの動き。none はすぐに切り替え、fade はその場でふわっと入れ替えます
   * @default 'none'
   */
  monthTransition?: 'none' | 'fade';
  /** 選べるいちばん前の日。これより前の日は押せず、前の月へも送れません */
  min?: PlainDate;
  /** 選べるいちばん後の日。これより後の日は押せず、次の月へも送れません */
  max?: PlainDate;
  /** 日ごとに押せなくする。true を返した日は押せません */
  isDateDisabled?: (date: PlainDate) => boolean;
  /**
   * 祝日の名前を返す。名前を返した日は日曜と同じ色になり、名前が読み上げに入ります。祝日のデータは部品に含みません
   */
  getHoliday?: (date: PlainDate) => string | undefined;
  /** 見せている月（制御するとき）。onMonthChange と組み合わせます */
  month?: PlainYearMonth;
  /** はじめに見せる月。指定しないときは選んだ日の月、なければ今日の月です */
  defaultMonth?: PlainYearMonth;
  /** 月を送ったとき */
  onMonthChange?: (month: PlainYearMonth) => void;
  /**
   * 言語。曜日と月の名前、週の始まりの曜日がこれに従います
   * @default ThemeProvider の locale、なければ 'ja-JP'
   */
  locale?: string;
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
  className?: string;
}

export interface CalendarSingleProps extends CalendarBaseProps {
  /**
   * 1 日を選ぶか、期間を選ぶか
   * @default 'single'
   */
  mode?: 'single';
  /** 選んだ日（制御するとき）。選んでいないときは null */
  value?: PlainDate | null;
  /** はじめに選んでおく日 */
  defaultValue?: PlainDate | null;
  /** 日を選んだとき。選んだ日をもう一度押すと null になります（required のときはなりません） */
  onValueChange?: (value: PlainDate | null) => void;
  /** 選んだ日を押しても外れないようにする */
  required?: boolean;
}

export interface CalendarRangeProps extends CalendarBaseProps {
  mode: 'range';
  /** 選んだ期間（制御するとき）。選んでいないときは null */
  value?: CalendarRange | null;
  /** はじめに選んでおく期間 */
  defaultValue?: CalendarRange | null;
  /**
   * 期間を選んだとき。1 回目で始まりの日、2 回目で終わりの日が決まります。
   * 始まりを選んだあとは、マウスを載せた日（キーボードで移った日）まで薄い帯が出ます
   */
  onValueChange?: (value: CalendarRange | null) => void;
  /** 選んだ日を押しても外れないようにする */
  required?: boolean;
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
}

const CalendarContext = createContext<CalendarContextValue>({
  rangeComplete: false,
  weekdayOf: new Map(),
  holidayOf: () => undefined,
  tentative: null,
  navPlacement: 'sides',
});

// 日のセル。状態を 1 つの data-look にまとめ、範囲の帯（data-band）と色（data-tone）を足す
// 押せないことは、選んでいることより先に見せる（原則1）
function CalendarDay({ day, modifiers, className, ...props }: DayProps) {
  const { rangeComplete, holidayOf, tentative } = use(CalendarContext);
  const iso = day.isoDate;
  const look = modifiers.disabled
    ? 'disabled'
    : modifiers.range_middle
      ? 'band'
      : modifiers.selected
        ? 'selected'
        : day.outside
          ? 'outside'
          : 'plain';
  const band = !rangeComplete
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
    rangeComplete || !tentative
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
  const { navPlacement } = use(CalendarContext);
  return (
    <Button
      iconOnly
      appearance="outline"
      aria-label={props['aria-label'] ?? ''}
      className={direction === 'previous' ? styles.previous({ navPlacement }) : styles.next()}
      disabled={ariaDisabled === true || ariaDisabled === 'true'}
      onClick={props.onClick}
    >
      {direction === 'previous' ? <CaretLeftIcon standalone /> : <CaretRightIcon standalone />}
    </Button>
  );
}

const components = {
  Day: CalendarDay,
  Weekday: CalendarWeekday,
  PreviousMonthButton: (props: PreviousMonthButtonProps) => (
    <MonthButton direction="previous" {...props} />
  ),
  NextMonthButton: (props: PreviousMonthButtonProps) => <MonthButton direction="next" {...props} />,
};

function useControlled<T>(value: T | undefined, defaultValue: T) {
  const [inner, setInner] = useState(defaultValue);
  return [value !== undefined ? value : inner, setInner] as const;
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
    showOutsideDays = true,
    monthTransition = 'none',
    min,
    max,
    isDateDisabled,
    getHoliday,
    month,
    defaultMonth,
    onMonthChange,
    labels: labelsProp,
    today: todayProp,
    autoFocus,
    className,
  } = props;
  const { locale, timeZone } = useLocale(props.locale, props.timeZone);
  const labels = { ...DEFAULT_LABELS, ...labelsProp };

  const [single, setSingle] = useControlled<PlainDate | null>(
    props.mode === 'range' ? undefined : props.value,
    props.mode === 'range' ? null : (props.defaultValue ?? null)
  );
  const [range, setRange] = useControlled<CalendarRange | null>(
    props.mode === 'range' ? props.value : undefined,
    props.mode === 'range' ? (props.defaultValue ?? null) : null
  );

  const today = todayProp ?? todayIn(timeZone);
  const [shownMonth, setShownMonth] = useControlled<PlainYearMonth>(
    month,
    defaultMonth ??
      (props.mode === 'range' ? range?.start : single)?.toPlainYearMonth() ??
      today.toPlainYearMonth()
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

  // 月を送るときの動き（ADR-0142）。動かさないときは react-day-picker の動きを使わない
  const fade = monthTransition === 'fade';

  const shared = {
    lang: locale,
    weekStartsOn: weekStartOf(locale),
    today: toDate(today),
    navLayout: 'around' as const,
    fixedWeeks: true,
    showOutsideDays,
    autoFocus,
    disabled,
    startMonth: min ? toDate(min) : undefined,
    endMonth: max ? toDate(max) : undefined,
    'aria-label': props['aria-label'],
    month: monthToDate(shownMonth),
    onMonthChange: (date: Date) => {
      const next = monthFromDate(date);
      setShownMonth(next);
      onMonthChange?.(next);
    },
    animate: fade,
    components,
    classNames: {
      root: styles.root({ color, shape, weekendColor, className }),
      months: styles.months(),
      month: styles.month({ navPlacement }),
      month_caption: styles.caption({ navPlacement }),
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
          modifiers.selected ? ` ${labels.selected}` : '',
        ].join(''),
      labelPrevious: () => labels.previousMonth,
      labelNext: () => labels.nextMonth,
    },
  };

  const rangeStart = props.mode === 'range' && range && !range.end ? range.start.toString() : null;
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
  };
  // 仮の帯を出すのは、期間の始まりだけを選んだあとだけ
  const pointing = rangeStart
    ? {
        onDayMouseEnter: (date: Date) => setPointed(fromDate(date).toString()),
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
      const value: CalendarRange =
        range && !range.end
          ? Temporal.PlainDate.compare(date, range.start) < 0
            ? { start: date, end: range.start }
            : { start: range.start, end: date }
          : { start: date, end: null };
      setRange(value);
      setPointed(null);
      props.onValueChange?.(value);
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
    props.onValueChange?.(value);
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
