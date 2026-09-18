import {
  type DateRange,
  type DayProps,
  DayPicker,
  type Matcher,
  type PreviousMonthButtonProps,
  type WeekdayProps,
} from '@daypicker/react';
import { createContext, type ReactNode, use, useMemo, useState } from 'react';
import type { VariantProps } from 'tailwind-variants';

import { Button } from '../button/Button';
import { CaretLeftIcon, CaretRightIcon } from '../../internal/icons';
import {
  fromDate,
  Temporal,
  monthFromDate,
  monthToDate,
  type PlainDate,
  type PlainYearMonth,
  toDate,
  todayIn,
  weekStartOf,
} from '../../internal/date/plain-date';
import { useLocale } from '../../internal/date/use-locale';
import { focusRing } from '../../internal/focus-styles';
import { tv } from '../../internal/tv';

// 月の日を並べて、日か期間を選ぶ。振る舞い（キーボード・読み上げ・範囲の選び方）は react-day-picker（@daypicker/react）
// 値は Temporal.PlainDate で受け渡し、react-day-picker との境界で Date（ローカル時刻の正午）に変える（src/internal/date/plain-date.ts）
// 日は部品の高さの正方形（原則7・11）。平らな押すもの（原則3）で、hover と押下で文字の色を淡く敷き、押すと沈む
// 選んだ日の印は部品の色（原則6）。範囲の中の日は、淡い面の帯でつなぐ
// 比べている途中の見た目（軸 106〜111）は design/tokens.css の --calendar-* で決める
//
// 日の見た目は、セル（td）が置く変数だけで決める。どの状態も別の変数を置くので、状態が重なっても当てる順に左右されない
//   --day-base・--day-ink   日の塗りと文字（data-look: selected・band・outside・disabled・plain のどれか 1 つ）
//   --day-weekend(-k)       日曜・土曜の色と、その色を混ぜる割合（data-weekday）
//   --day-dot・--day-weight-today・今日の塗り   今日の印（data-today）
//   --day-hover・--day-press・--day-focus       ボタンが置く、文字の色を敷く濃さ。いちばん濃いものを使う
const calendar = tv({
  slots: {
    root: [
      // 幅は日 7 つ分（部品の高さの正方形 × 7）。入れ物が狭いときは入れ物の幅まで縮み、日は正方形のまま小さくなる
      'inline-block w-[calc(var(--spacing-control)*7)] max-w-full text-fg',
      // 選んだ日の塗りと文字。濃い塗り（部品の色）と淡い面（部品の色の淡い面）を --calendar-selected-strong で切り替える
      '[--cal-selected-bg:color-mix(in_oklab,var(--cal-accent)_calc(var(--calendar-selected-strong)*100%),var(--cal-subtle))]',
      '[--cal-selected-fg:color-mix(in_oklab,var(--cal-on-accent)_calc(var(--calendar-selected-strong)*100%),var(--cal-on-subtle))]',
      // セルが置かないときの値（セルの変数はここから継ぐ）
      '[--day-dot:0] [--day-weekend-k:0] [--day-weekend:var(--color-fg)] [--day-weight-look:400] [--day-weight-today:400]',
      '[--day-focus:0%] [--day-hover:0%] [--day-press:0%]',
      // 動きを減らす設定では、月を送っても動かさない（軸 114）
      'motion-reduce:[--calendar-motion-duration:1ms]',
      '[--day-ring-color:var(--color-calendar-today-ring)] [--day-ring:0]',
      '[--day-circle-allow:1] [--day-circle:0]',
    ],
    months: 'relative',
    // 見出しの行（前の月・月の名前・次の月）と日の表。並ぶ順と列は --calendar-head-columns などで決める（軸 110）
    // 月を送る動きのあいだ、react-day-picker は前の月の写しを重ねる（position: absolute）。幅を今の月にそろえる
    month:
      'grid grid-cols-(--calendar-head-columns) items-center gap-y-2 [&>[data-animated-month]]:inset-x-0 [&>[data-animated-month]]:top-0',
    // 月を送るときの動き（軸 114）。新しい月は送る向きから入り、前の月は反対へ出る
    // react-day-picker はこのクラスを 1 つの名前として足し外しするので、空白を含まない 1 つのクラスにする
    enterFromNext:
      'animate-[calendar-month-enter-next_var(--calendar-motion-duration)_var(--ease-sheet)_both]',
    enterFromPrevious:
      'animate-[calendar-month-enter-previous_var(--calendar-motion-duration)_var(--ease-sheet)_both]',
    exitToPrevious:
      'animate-[calendar-month-exit-previous_var(--calendar-motion-duration)_var(--ease-sheet)_both]',
    exitToNext:
      'animate-[calendar-month-exit-next_var(--calendar-motion-duration)_var(--ease-sheet)_both]',
    // その月の祝日の名前（軸 112）。日の数字は祝日の色
    holidayList: [
      '[display:var(--calendar-holiday-list)] flex-wrap gap-x-3 gap-y-1 px-3 pt-3',
      'text-(length:--text-caption) leading-(--leading-caption) text-fg-subtle',
    ],
    holidayDay:
      'me-1 font-bold text-[color:color-mix(in_oklab,var(--color-calendar-sunday)_calc(var(--calendar-weekend-color)*100%),var(--color-fg))]',
    caption: [
      'order-(--calendar-caption-order) flex h-(--spacing-control) items-center [justify-self:var(--calendar-caption-align)] px-3',
      // 月を送るとき、月の名前は自分の箱の中で動かす（月送りのボタンの上を通らない）。react-day-picker が付ける印のクラスで、中の文字を動かす
      //   動きの終わり（animationend）は中の文字から箱へ伝わるので、react-day-picker の片付けはそのまま動く
      'overflow-hidden',
      '[&.cal-caption-enter-next>*]:animate-[calendar-month-enter-next_var(--calendar-motion-duration)_var(--ease-sheet)_both]',
      '[&.cal-caption-enter-previous>*]:animate-[calendar-month-enter-previous_var(--calendar-motion-duration)_var(--ease-sheet)_both]',
      '[&.cal-caption-exit-previous>*]:animate-[calendar-month-exit-previous_var(--calendar-motion-duration)_var(--ease-sheet)_both]',
      '[&.cal-caption-exit-next>*]:animate-[calendar-month-exit-next_var(--calendar-motion-duration)_var(--ease-sheet)_both]',
    ],
    captionLabel: 'text-(length:--text-control) leading-(--leading-control) font-bold',
    previous: 'order-(--calendar-prev-order)',
    next: 'order-2',
    grid: 'order-3 col-span-full w-full table-fixed border-separate border-spacing-0',
    weekday: [
      'h-8 p-0 text-center align-middle font-normal',
      'text-(length:--text-caption) leading-(--leading-caption)',
      'text-[color:color-mix(in_oklab,var(--day-weekend)_calc(var(--day-weekend-k)*100%),var(--color-fg-subtle))]',
      'data-[weekday=0]:[--day-weekend-k:var(--calendar-weekend-color)] data-[weekday=0]:[--day-weekend:var(--color-calendar-sunday)]',
      'data-[weekday=6]:[--day-weekend-k:var(--calendar-weekend-color)] data-[weekday=6]:[--day-weekend:var(--color-calendar-saturday)]',
    ],
    day: [
      'group/day relative p-0 text-center',
      // 状態ごとの塗りと文字（どれか 1 つ）
      'data-[look=plain]:[--day-base:transparent] data-[look=plain]:[--day-ink:color-mix(in_oklab,var(--day-weekend)_calc(var(--day-weekend-k)*100%),var(--color-fg))]',
      'data-[look=selected]:[--day-base:var(--cal-selected-bg)] data-[look=selected]:[--day-ink:var(--cal-selected-fg)] data-[look=selected]:[--day-weight-look:700]',
      'data-[look=band]:[--day-base:transparent] data-[look=band]:[--day-ink:var(--cal-on-subtle)]',
      'data-[look=outside]:[--day-base:transparent] data-[look=outside]:[--day-ink:var(--color-fg-subtle)]',
      // ほかの月の日（軸 111）。範囲の帯に入っていても同じ
      'data-outside:opacity-(--calendar-outside-visible)',
      'data-[look=disabled]:[--day-base:transparent] data-[look=disabled]:[--day-ink:var(--color-on-field-disabled)]',
      // 日曜・祝日と土曜（軸 109・112）。祝日の土曜は日曜の色
      'data-[tone=sun]:[--day-weekend-k:var(--calendar-weekend-color)] data-[tone=sun]:[--day-weekend:var(--color-calendar-sunday)]',
      'data-[tone=sat]:[--day-weekend-k:var(--calendar-weekend-color)] data-[tone=sat]:[--day-weekend:var(--color-calendar-saturday)]',
      // 今日（軸 107）: 数字の太さ・下の点・後ろの塗り
      'data-today:[--day-dot:var(--calendar-today-dot)] data-today:[--day-weight-today:var(--calendar-today-weight)]',
      'data-today:[--day-circle:var(--calendar-today-circle)] data-[look=disabled]:[--day-circle-allow:0] data-[look=selected]:[--day-circle-allow:0]',
      'data-today:[--day-ring:var(--calendar-today-ring)] data-[look=selected]:[--day-ring-color:color-mix(in_oklab,var(--cal-selected-fg)_50%,transparent)]',
      'rounded-(--calendar-day-radius) data-today:bg-[color-mix(in_oklab,var(--color-field)_calc(var(--calendar-today-fill)*100%),transparent)]',
      // 範囲の帯。始まりと終わりの日は、日の中央から外へ伸ばす。週の端では日の角で丸める
      'before:pointer-events-none before:absolute before:inset-y-0 before:bg-(--cal-subtle)',
      'before:hidden data-band:before:block',
      'data-[band=end]:before:start-0 data-[band=end]:before:end-1/2 data-[band=middle]:before:inset-x-0 data-[band=start]:before:start-1/2 data-[band=start]:before:end-0',
      'first:before:rounded-s-(--calendar-day-radius) last:before:rounded-e-(--calendar-day-radius)',
      'data-[band=cap-end]:before:inset-x-0 data-[band=cap-end]:before:rounded-e-(--calendar-day-radius) data-[band=cap-start]:before:inset-x-0 data-[band=cap-start]:before:rounded-s-(--calendar-day-radius)',
      // 期間を選んでいる途中の仮の帯（軸 113）
      'data-tentative:before:opacity-(--calendar-preview-opacity)',
    ],
    dayButton: [
      'relative flex aspect-square w-full cursor-pointer items-center justify-center rounded-(--calendar-day-radius) select-none',
      'text-(length:--text-control) leading-(--leading-control) text-(color:--day-ink)',
      '[font-weight:max(var(--day-weight-look),var(--day-weight-today))]',
      'bg-[color-mix(in_oklab,var(--day-base),var(--day-ink)_max(var(--day-hover),var(--day-press),var(--day-focus)))]',
      // 今日の小さな丸（軸 107）。数字の後ろに敷く。選んだ日と押せない日には出さない
      'isolate before:absolute before:top-1/2 before:left-1/2 before:-z-10 before:size-(--calendar-today-circle-size) before:-translate-1/2 before:rounded-full before:bg-(--color-calendar-today-circle) before:opacity-[calc(var(--day-circle)*var(--day-circle-allow))]',
      // 今日の枠線（軸 107）。日の内側に細く引く。フォーカスの線（外に離して太く引く）とは別の線
      'shadow-[inset_0_0_0_calc(var(--day-ring)*var(--border-width-thin))_var(--day-ring-color)]',
      // 今日の点（軸 107）。文字の色で、数字の下に置く
      'after:absolute after:bottom-[5px] after:left-1/2 after:h-(--calendar-today-mark-height) after:w-(--calendar-today-mark-width) after:-translate-x-1/2 after:rounded-full after:bg-current after:opacity-(--day-dot)',
      'enabled:hover:[--day-hover:var(--flat-hover-mix)] enabled:active:translate-y-(--flat-press-depth) enabled:active:[--day-press:var(--flat-press-mix)]',
      '[transition:translate_var(--duration-press)_var(--ease-press),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)] motion-reduce:[transition:none]',
      // キーボードで日を動かしたとき（軸 108）: 線の太さに --calendar-focus-ring を掛け、0 のときは hover と同じ塗りにする
      ...focusRing,
      'focus-visible:[outline-width:calc(var(--focus-ring-width)*var(--calendar-focus-ring))]',
      'focus-visible:[--day-focus:calc((1-var(--calendar-focus-ring))*var(--flat-hover-mix))]',
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
  },
  defaultVariants: { color: 'neutral' },
});

const styles = calendar();

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
  color?: VariantProps<typeof calendar>['color'];
  /** 選べるいちばん前の日。これより前の日は押せず、前の月へも送れません */
  min?: PlainDate;
  /** 選べるいちばん後の日。これより後の日は押せず、次の月へも送れません */
  max?: PlainDate;
  /** 日ごとに押せなくする。true を返した日は押せません */
  isDateDisabled?: (date: PlainDate) => boolean;
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
  /**
   * 祝日の名前を返す。名前を返した日は日曜と同じ色になり、名前が読み上げに入ります。祝日のデータは部品に含みません
   */
  getHoliday?: (date: PlainDate) => string | undefined;
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
  /** 期間を選んだとき。1 回目で始まりの日、2 回目で終わりの日が決まります */
  onValueChange?: (value: CalendarRange | null) => void;
  /** 選んだ日を押しても外れないようにする */
  required?: boolean;
}

export type CalendarProps = CalendarSingleProps | CalendarRangeProps;

// 部品の中の部分（日のセル・曜日の見出し・月送り）が読む値。部分は react-day-picker に渡すので、props ではなくここから読む
interface CalendarContextValue {
  /** 期間の両端が決まっているか。始まりだけのときは帯を出さない */
  rangeComplete: boolean;
  /** 曜日の名前（読み上げの名前）から、曜日（0 が日曜）を引く */
  weekdayOf: Map<string, number>;
  /** 日（YYYY-MM-DD）の祝日の名前 */
  holidayOf: (iso: string) => string | undefined;
  /** 期間の始まりだけを選び、別の日にマウスを載せているときの仮の期間（YYYY-MM-DD。from が前） */
  tentative: { from: string; to: string; pointed: 'from' | 'to' } | null;
}

const CalendarContext = createContext<CalendarContextValue>({
  rangeComplete: false,
  weekdayOf: new Map(),
  holidayOf: () => undefined,
  tentative: null,
});

// 日のセル。状態を 1 つの data-look にまとめ、範囲の帯（data-band）と曜日（data-weekday）を足す
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
  // 始まりの日（塗ってある）は日の中央から、マウスを載せた日（塗っていない）は日いっぱいに帯を引き、端を日の角で丸める
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
  return (
    <Button
      iconOnly
      appearance="outline"
      aria-label={props['aria-label'] ?? ''}
      className={direction === 'previous' ? styles.previous() : styles.next()}
      disabled={ariaDisabled === true || ariaDisabled === 'true'}
      onClick={props.onClick}
    >
      {direction === 'previous' ? <CaretLeftIcon standalone /> : <CaretRightIcon standalone />}
    </Button>
  );
}

// react-day-picker の footer は読み上げで知らせる（aria-live）。祝日の一覧は月の名前と一緒に知らせなくてよいので、ただの箱にする
function CalendarFooter({ className, children }: { className?: string; children?: ReactNode }) {
  return <div className={className}>{children}</div>;
}

const components = {
  Day: CalendarDay,
  Footer: CalendarFooter,
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
    min,
    max,
    isDateDisabled,
    month,
    defaultMonth,
    onMonthChange,
    labels: labelsProp,
    today: todayProp,
    getHoliday,
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
  // 期間の始まりだけを選んだあと、マウスを載せた日・キーボードで移った日（軸 113）
  const [pointed, setPointed] = useState<string | null>(null);

  const holidayOf = (iso: string) => getHoliday?.(Temporal.PlainDate.from(iso));
  const holidays: [day: number, name: string][] = [];
  if (getHoliday) {
    for (let d = 1; d <= shownMonth.daysInMonth; d++) {
      const name = getHoliday(shownMonth.toPlainDate({ day: d }));
      if (name) holidays.push([d, name]);
    }
  }

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

  const shared = {
    lang: locale,
    weekStartsOn: weekStartOf(locale),
    today: toDate(today),
    navLayout: 'around' as const,
    fixedWeeks: true,
    showOutsideDays: true,
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
    animate: true,
    footer: holidays.length ? (
      <ul className={styles.holidayList()}>
        {holidays.map(([d, name]) => (
          <li key={d}>
            <span className={styles.holidayDay()}>{d}</span>
            {name}
          </li>
        ))}
      </ul>
    ) : undefined,
    components,
    classNames: {
      root: styles.root({ color, className }),
      months: styles.months(),
      month: styles.month(),
      month_caption: styles.caption(),
      caption_label: styles.captionLabel(),
      month_grid: styles.grid(),
      day_button: styles.dayButton(),
      weeks_after_enter: styles.enterFromNext(),
      caption_after_enter: 'cal-caption-enter-next',
      weeks_before_enter: styles.enterFromPrevious(),
      caption_before_enter: 'cal-caption-enter-previous',
      weeks_before_exit: styles.exitToPrevious(),
      caption_before_exit: 'cal-caption-exit-previous',
      weeks_after_exit: styles.exitToNext(),
      caption_after_exit: 'cal-caption-exit-next',
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
  const context = {
    rangeComplete: Boolean(range?.start && range.end),
    weekdayOf: intl.weekdayOf,
    holidayOf,
    tentative:
      rangeStart && pointed && pointed !== rangeStart
        ? pointed < rangeStart
          ? { from: pointed, to: rangeStart, pointed: 'from' as const }
          : { from: rangeStart, to: pointed, pointed: 'to' as const }
        : null,
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
    const onSelect = (next: DateRange | undefined) => {
      const value = next?.from
        ? { start: fromDate(next.from), end: next.to ? fromDate(next.to) : null }
        : null;
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
