'use client';

import { Field as BaseField } from '@base-ui/react/field';
import {
  type ComponentProps,
  type ReactElement,
  type ReactNode,
  use,
  useId,
  useState,
} from 'react';

import { DateField, type DateFieldBaseProps, type DateFieldProps } from '../date-field/DateField';
import { FieldAddonButton } from '../field-addon/FieldAddon';
import { DatePickerClearLayoutContext } from './clear-layout';
import { type DatePickerCalendarProps, DatePickerPanel } from './DatePickerPanel';
import { PickerOverlay } from './PickerOverlay';
import { DEFAULT_DATE_FORMAT } from '../../internal/date/format-date';
import { type PlainDate, Temporal, toDate, todayIn } from '../../internal/date/plain-date';
import { useLocale } from '../../internal/date/use-locale';
import { dateSegmentColorClass } from '../../internal/date-segments/colors';
import { Field, useFieldControlKind, useFieldState } from '../../internal/field/Field';
import { controlBox } from '../../internal/field/field-styles';
import { type FieldNamed, splitFieldProps } from '../../internal/field/input-field-props';
import { useFormSubmittingLock } from '../../internal/form-context';
import { CalendarBlankIcon, XIcon } from '../../internal/icons';
import type { PopupProps } from '../../internal/overlay/overlay-props';
import type { OverlayPresentation } from '../../internal/sheet/use-narrow-screen';
import { cn } from '../../internal/tv';

export type { DatePickerCalendarProps } from './DatePickerPanel';

// 日付を選ぶ欄。打ち込む欄（DateField）の右端に、カレンダーを開くボタンを置く
//   打ち込み（和暦・全角・日本語の書き方の読み取り）は DateField のまま。カレンダーで選んだ日は欄にそのまま入る
//   カレンダーを開くボタンは、欄の値に作用する suffix のボタン（原則8: グレー地＋アイコン＝押せる）
//   読み取り専用では出さない（値を変える操作なので。消去のボタンと同じ — ADR-0168・0197）
//   値を消すボタン（clearable）の置き方は、軸 392 で比べている途中（clear-layout.ts）。既定は、値があるときだけ右端に出て、カレンダーのボタンが内側へずれる（ADR-0216 と同じ並び）
// 「今日」のボタンは既定で出す（幅いっぱい — 軸 394）
// variant="button" は、打てない表示だけのボタン。押すとカレンダーを開く（Select のボタンと同じ見た目の欄）
//   印は既定で右端の暦（Select の ▼ と同じ場所）。iconPlacement="start" で値の前、icon で ▼ にもできる（軸 396）
// 面は欄の左端にそろえて下に出す（Select・Combobox と同じ）。開いているあいだ、欄はフォーカス中と同じ見た目を保つ
// 面の中の余白・下の行は design/tokens.css の --date-picker-*

/** 見た目の型。field は打ち込める欄＋カレンダーのボタン、button は打てない表示のボタン */
export type DatePickerVariant = 'field' | 'button';

// 開いているあいだ、欄をフォーカス中と同じ見た目にする（Select の開いているあいだと同じ）
//   field: 開く口（suffix のボタン）が aria-expanded を持つ欄の外枠
//   button: 開く口そのものが欄の外枠
const openLook = [
  '[&_[data-slot=control]:has([aria-expanded=true])]:border-[color:var(--control-focus-line,var(--color-focus))]',
  '[&_[data-slot=control]:has([aria-expanded=true])]:[--control-bg:var(--color-field-focus)]',
  '[&_[data-slot=control][aria-expanded=true]]:border-[color:var(--control-focus-line,var(--color-focus))]',
  '[&_[data-slot=control][aria-expanded=true]]:[--control-bg:var(--color-field-focus)]',
];

interface DatePickerOwnProps {
  /**
   * 見た目の型。field は日付を打ち込める欄で、右端のボタンでカレンダーを開きます。
   * button は打てない表示だけのボタンで、押すとカレンダーを開きます
   * @default 'field'
   */
  variant?: DatePickerVariant;
  /** カレンダーが開いているか（制御） */
  open?: boolean;
  /**
   * はじめにカレンダーが開いているか（非制御）
   * @default false
   */
  defaultOpen?: boolean;
  /** 開閉が変わるときに、次の値を渡して呼びます */
  onOpenChange?: (open: boolean) => void;
  /** 日ごとに選べなくする。true を返した日はカレンダーで押せません */
  isDateDisabled?: (date: PlainDate) => boolean;
  /** 祝日の名前を返す。名前を返した日は、カレンダーで日曜と同じ色になり、名前が読み上げに入ります */
  getHoliday?: (date: PlainDate) => string | undefined;
  /** カレンダーの見た目（日の形・曜日の色・月送りの置き方・ほかの月の日・月を送る動き・読み上げの文言） */
  calendarProps?: DatePickerCalendarProps;
  /**
   * 今日として扱う日。サーバーで描くときに、サーバーとブラウザで今日をそろえるのに使います
   * @default timeZone での今日
   */
  today?: PlainDate;
  /**
   * カレンダーの下に、今日を選ぶ幅いっぱいのボタンを出します。false で出しません
   * @default true
   */
  showTodayButton?: boolean;
  /**
   * 「今日」のボタンの文字
   * @default '今日'
   */
  todayLabel?: string;
  /**
   * 値を消すボタン（×）を出すか。値があるときだけ、暦のボタンの左に出します（variant="field" のとき）。読み取り専用の欄では出しません
   * @default false
   */
  clearable?: boolean;
  /**
   * 値を消すボタンの読み上げの名前
   * @default '日付を消去'
   */
  clearName?: string;
  /**
   * カレンダーを開くボタンの読み上げの名前（variant="field" のとき）
   * @default 'カレンダーを開く'
   */
  triggerName?: string;
  /**
   * カレンダーを開く印のアイコン。既定は暦のアイコンです。
   * variant="field" では `<Icon icon={…} standalone />`、variant="button" では `<Icon icon={…} />` の形で渡します。
   * variant="button" で Select と同じ ▼ にするときは、Phosphor の `<Icon icon={CaretDownIcon} />` を渡します
   */
  icon?: ReactNode;
  /**
   * 印の場所（variant="button" のとき）。end は右端（Select の ▼ と同じ場所）、start は値の前です
   * @default 'end'
   */
  iconPlacement?: 'start' | 'end';
  /**
   * 値がないときにボタンに出す文字（variant="button" のとき）。打ち込む欄では、区切りの見本（segmentPlaceholder）を出します
   * @default '日付を選ぶ'
   */
  placeholder?: string;
  /**
   * 選んだ日の書き方（variant="button" のとき）。ja-JP では、full は「2026年9月20日日曜日」、long は「2026年9月20日」です
   * 指定しないときは「2026/09/20」です
   */
  dateStyle?: Intl.DateTimeFormatOptions['dateStyle'];
  /** Intl.DateTimeFormat の指定をそのまま渡します（variant="button" のとき）。指定すると dateStyle は使いません */
  format?: Intl.DateTimeFormatOptions;
  /**
   * 出し方。auto は指で操作していて画面が狭いときだけ、画面の下から出すシートにします。popover はいつも欄のそばに浮かべ、sheet はいつもシートにします
   * 書かないときは ThemeProvider の presentation に従います
   * @default 'auto'
   */
  presentation?: OverlayPresentation;
  /**
   * カレンダーの面を描く場所。まとめて決めるときは ThemeProvider の portalContainer を使います
   * @default document.body
   */
  portalContainer?: HTMLElement | null;
  /** カレンダーの面（Popup）に足す props（id・data-*・aria-*・ref・className など） */
  popupProps?: PopupProps;
  /**
   * カレンダーの面を閉じるボタンの読み上げの名前（シートの × と、面の中に置く読み上げ用の閉じる手段）
   * @default '閉じる'
   */
  closeName?: string;
}

/** DatePicker の props から、label・accessibleName の組み合わせの決まりを外したもの */
export type DatePickerBaseProps = Omit<DateFieldBaseProps, 'suffix'> & DatePickerOwnProps;

/** DatePicker の props。label か accessibleName のどちらかが要ります */
export type DatePickerProps = FieldNamed<DatePickerBaseProps>;

function isOutOfRange(current: PlainDate | null, min?: PlainDate, max?: PlainDate) {
  return (
    current != null &&
    ((min != null && Temporal.PlainDate.compare(current, min) < 0) ||
      (max != null && Temporal.PlainDate.compare(current, max) > 0))
  );
}

/**
 * 日付を選ぶ欄。年・月・日を打ち込むことも、右端のボタンで開くカレンダーから選ぶこともできます。
 * variant="button" では、打てない表示だけのボタンにし、押すとカレンダーを開きます
 */
export function DatePicker(props: DatePickerProps) {
  const {
    variant = 'field',
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    isDateDisabled,
    getHoliday,
    calendarProps,
    today: todayProp,
    showTodayButton = true,
    todayLabel = '今日',
    clearable = false,
    clearName = '日付を消去',
    triggerName = 'カレンダーを開く',
    icon: iconProp,
    iconPlacement = 'end',
    placeholder = '日付を選ぶ',
    dateStyle,
    format,
    presentation,
    portalContainer,
    popupProps,
    closeName = '閉じる',
    ...fieldProps
  } = props as DatePickerBaseProps;
  const { value: valueProp, defaultValue, onValueChange, min, max, readOnly } = fieldProps;
  const color = fieldProps.color ?? 'neutral';
  const { locale, timeZone } = useLocale(fieldProps.locale, fieldProps.timeZone);
  const today = todayProp ?? todayIn(timeZone);
  // 欄の端のボタンはアイコン単体なので太い線、ボタンの中の印は文字と並ぶので細い線（ADR-0018）
  const icon = iconProp ?? <CalendarBlankIcon standalone={variant === 'field'} />;
  // 待っているあいだ止める欄・Form の送信中は開かない（値を変える操作なので — ADR-0168）
  const formLock = useFormSubmittingLock();
  const blocking =
    formLock.blocking || (!!fieldProps.loading && fieldProps.loadingBehavior === 'blocking');

  const [inner, setInner] = useState<PlainDate | null>(defaultValue ?? null);
  const value = valueProp !== undefined ? valueProp : inner;
  const changeValue = (next: PlainDate | null) => {
    setInner(next);
    onValueChange?.(next);
  };

  const [openState, setOpenState] = useState(defaultOpen);
  const open = openProp ?? openState;
  // 開く口を押して開いたときだけ、カレンダーの日へフォーカスを移す（はじめから開いているときは動かさない）
  const [openedByUser, setOpenedByUser] = useState(false);
  const changeOpen = (next: boolean) => {
    if (next && (readOnly || fieldProps.disabled || blocking)) return;
    setOpenedByUser(next);
    setOpenState(next);
    onOpenChange?.(next);
  };

  const pick = (date: PlainDate) => {
    changeValue(date);
    changeOpen(false);
  };

  // 値を消すボタン。置き方は軸 392 で比べている途中（clear-layout.ts）
  const clearLayout = use(DatePickerClearLayoutContext);
  const clearButton = clearable && (value != null || clearLayout.whenEmpty === 'disabled') && (
    <PickerAddonButton
      aria-label={clearName}
      disabled={value == null || undefined}
      onClick={(event) => {
        // 消したあとは、欄の最初の区切りへ戻す（ボタンは値が空になると消えるか、押せなくなるため）
        const segment = event.currentTarget
          .closest('[data-slot="control"]')
          ?.querySelector<HTMLElement>('[role="spinbutton"]');
        changeValue(null);
        segment?.focus();
      }}
    >
      <XIcon standalone />
    </PickerAddonButton>
  );

  const title = props.label ?? props.accessibleName;
  const panel = (
    <DatePickerPanel
      value={value}
      onPick={pick}
      autoFocus={openedByUser}
      color={color}
      min={min}
      max={max}
      isDateDisabled={isDateDisabled}
      getHoliday={getHoliday}
      locale={locale}
      timeZone={timeZone}
      today={today}
      calendarProps={calendarProps}
      showTodayButton={showTodayButton}
      todayLabel={todayLabel}
    />
  );

  return (
    <PickerOverlay
      open={open}
      onOpenChange={changeOpen}
      title={title}
      presentation={presentation}
      portalContainer={portalContainer}
      popupProps={{
        ...popupProps,
        className: cn('p-(--date-picker-popup-padding)', popupProps?.className),
      }}
      panel={panel}
      closeName={closeName}
    >
      {(renderTrigger) =>
        variant === 'button' ? (
          <DatePickerButtonField
            {...fieldProps}
            className={cn(openLook, fieldProps.className)}
            value={value}
            locale={locale}
            placeholder={placeholder}
            icon={icon}
            iconPlacement={iconPlacement}
            text={
              value
                ? new Intl.DateTimeFormat(
                    locale,
                    format ?? (dateStyle ? { dateStyle } : DEFAULT_DATE_FORMAT)
                  ).format(toDate(value))
                : null
            }
            renderTrigger={renderTrigger}
          />
        ) : (
          <DateField
            {...(fieldProps as DateFieldProps)}
            className={cn(openLook, fieldProps.className)}
            value={value}
            onValueChange={changeValue}
            suffix={
              readOnly ? null : (
                <>
                  {clearLayout.position === 'before-trigger' && clearButton}
                  {renderTrigger(
                    <PickerAddonButton aria-label={triggerName}>{icon}</PickerAddonButton>
                  )}
                  {clearLayout.position === 'end' && clearButton}
                </>
              )
            }
          />
        )
      }
    </PickerOverlay>
  );
}

// 欄の端のボタン。欄を止めているあいだ（待っている・送信中）は、値を変えるので一緒に止める（ADR-0168）
function PickerAddonButton({ disabled, ...props }: ComponentProps<typeof FieldAddonButton>) {
  const field = useFieldState();
  return <FieldAddonButton {...props} disabled={disabled || field?.blocking || undefined} />;
}

interface DatePickerButtonFieldProps extends Omit<DatePickerBaseProps, 'value'> {
  value: PlainDate | null;
  locale: string;
  placeholder: string;
  icon: ReactNode;
  iconPlacement: 'start' | 'end';
  /** 選んだ日の文字。値がないときは null */
  text: string | null;
  renderTrigger: (element: ReactElement<ComponentProps<'button'>>) => ReactElement;
}

// variant="button": 打てない表示だけのボタン。ラベル・キャプション・状態の行は Field が並べる
function DatePickerButtonField({ value, min, max, ...props }: DatePickerButtonFieldProps) {
  const [field, control] = splitFieldProps(props);
  return (
    <Field {...field} invalid={isOutOfRange(value, min, max)} nativeLabel={false}>
      {(describedBy) => <DatePickerButton {...control} value={value} describedBy={describedBy} />}
    </Field>
  );
}

function DatePickerButton({
  value,
  text,
  placeholder,
  icon,
  iconPlacement,
  readOnly,
  color = 'neutral',
  describedBy,
  renderTrigger,
}: Pick<
  DatePickerButtonFieldProps,
  | 'value'
  | 'text'
  | 'placeholder'
  | 'icon'
  | 'iconPlacement'
  | 'readOnly'
  | 'color'
  | 'renderTrigger'
> & { describedBy: string | undefined }) {
  // ラベルは <label> にしない（本体はボタンで、ラベルは aria-labelledby でつなぐ）
  useFieldControlKind({ nativeLabel: false });
  const field = useFieldState();
  const valueId = useId();
  const blocking = field?.blocking ?? false;
  return (
    <BaseField.Control
      value={value?.toString() ?? ''}
      disabled={field?.disabled}
      render={(controlProps) => (
        <>
          {renderTrigger(
            <button
              type="button"
              id={controlProps.id}
              // 名前はラベル、続けて選んだ日（または見本の文字）を読む
              aria-labelledby={[controlProps['aria-labelledby'], valueId].filter(Boolean).join(' ')}
              aria-describedby={describedBy}
              aria-required={field?.required || undefined}
              aria-disabled={blocking || undefined}
              aria-readonly={readOnly || undefined}
              aria-busy={field?.loading || undefined}
              disabled={field?.disabled}
              data-slot="control"
              data-field-readonly={readOnly || undefined}
              className={controlBox({
                className: [
                  'text-left',
                  blocking ? 'cursor-progress' : readOnly ? 'cursor-default' : 'cursor-pointer',
                  dateSegmentColorClass[color],
                ],
              })}
            >
              <span
                id={valueId}
                className={cn(
                  'min-w-0 flex-1 truncate',
                  text == null && 'text-(color:--field-placeholder)'
                )}
              >
                {text ?? placeholder}
              </span>
              {/* 印は押せない意味の説明（塗りのないアイコン — 原則8）。ボタン全体が押せる */}
              <span
                aria-hidden
                className={cn(
                  'flex [order:var(--date-picker-icon-order)] group-data-disabled/field:text-fg-subtle',
                  // start は値の前へ（読み上げから外した印なので、並びは見た目だけで変える）
                  iconPlacement === 'start' && '[--date-picker-icon-order:-1]',
                  readOnly ? 'text-fg-subtle' : 'text-fg-muted'
                )}
              >
                {icon}
              </span>
            </button>
          )}
          <input
            ref={controlProps.ref}
            type="hidden"
            // Base UI の Field.Control は、Field.Root の name を render の props に入れる（型の HTMLProps には無い）
            name={(controlProps as { name?: string }).name}
            value={value?.toString() ?? ''}
            disabled={field?.disabled}
          />
        </>
      )}
    />
  );
}
