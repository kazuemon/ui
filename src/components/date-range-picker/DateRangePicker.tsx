'use client';

import { Field as BaseField } from '@base-ui/react/field';
import { type ComponentProps, type ReactElement, type ReactNode, useId, useState } from 'react';

import { DateRangeFields } from './DateRangeFields';
import {
  type DateRangePickerCalendarProps,
  DateRangePickerPanel,
  type DateRangePickerPresetsPlacement,
  type DateRangePreset,
  type DateRangeValue,
} from './DateRangePickerPanel';
import type { CalendarRange } from '../calendar/Calendar';
import type { DateFieldBaseProps } from '../date-field/DateField';
import { DEFAULT_DATE_FORMAT } from '../../internal/date/format-date';
import { type PlainDate, Temporal, toDate, todayIn } from '../../internal/date/plain-date';
import { isDateOutOfRange } from '../../internal/date/range';
import { useLocale } from '../../internal/date/use-locale';
import { dateSegmentColorClass } from '../../internal/date-segments/colors';
import type { DateFieldControlProps } from '../../internal/date-segments/DateFieldControl';
import { Field, useFieldControlKind, useFieldState } from '../../internal/field/Field';
import { controlBox } from '../../internal/field/field-styles';
import { type FieldNamed, splitFieldProps } from '../../internal/field/input-field-props';
import { HalfWidthNoticedContext, useHalfWidthNotice } from '../../internal/half-width';
import { CalendarBlankIcon, XIcon } from '../../internal/icons';
import type { PopupProps, PositionerProps } from '../../internal/overlay/overlay-props';
import {
  PickerOverlay,
  PickerTriggerButton,
  pickerOpenLook,
} from '../../internal/picker/PickerOverlay';
import {
  type OverlayPresentation,
  useSheetPresentation,
} from '../../internal/sheet/use-narrow-screen';
import { cn } from '../../internal/tv';
import { useControlled } from '../../internal/use-controlled';

export type {
  DateRangePickerCalendarProps,
  DateRangePickerPresetsPlacement,
  DateRangePreset,
  DateRangeValue,
} from './DateRangePickerPanel';

// 期間（始まりと終わりの日）を選ぶ欄。DatePicker の期間の形
//   本体は DateRangePickerControl（組み立て用）。DateRangePicker はそれを Field で包む（DatePicker と同じ）
//   欄・カレンダーを開くボタン・面（浮かべる形とシート）は DatePicker と同じ（PickerOverlay）
//   variant="field" は、1 つの欄に始まりと終わりの区切り（DateField と同じ）を並べる。間の記号は separator（既定は「〜」）
//   variant="button" は、打てない表示だけのボタン（DatePicker の variant="button" と同じ）
// 面の中は期間の Calendar。既定は 1 か月で、浮かべるときは 2 か月も選べる（numberOfMonths）。シートではいつも 1 か月（狭い画面に 2 か月は入らない）
//   1 回目に押した日が始まり、2 回目が終わり。終わりを選ぶと面を閉じる。始まりを選んだあとは、載せた日まで薄い帯（ADR-0141）
//   期間の候補（presets）は、カレンダーの左の列（既定）か下の行。シートではいつも下の行
// 終わりが始まりより前のとき（打ち込んだとき）と、どちらかの端が min・max の外のときは、欄をエラーの見た目にする

/** 見た目の型。field は 1 つの欄に始まりと終わりを並べ、button は打てない表示のボタンです */
export type DateRangePickerVariant = 'field' | 'button';

interface DateRangePickerOwnProps {
  /**
   * 見た目の型。field は 1 つの欄に始まりと終わりの日を並べ、右端のボタンでカレンダーを開きます。
   * button は打てない表示だけのボタンで、押すとカレンダーを開きます
   * @default 'field'
   */
  variant?: DateRangePickerVariant;
  /** 選んだ期間（制御）。何も選んでいないときは null */
  value?: DateRangeValue | null;
  /** はじめに選んでいる期間（非制御） */
  defaultValue?: DateRangeValue | null;
  /** 期間が変わるときに、次の値を渡して呼びます。始まりだけを選んだところでも呼びます（end が null） */
  onValueChange?: (value: DateRangeValue | null) => void;
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
  /**
   * 期間のいちばん短い日数。始まりと終わりの日を両方数えます（1 泊 2 日なら 2）。始まりを選んだあと、これより短くなる日は選べません
   */
  minRangeDays?: number;
  /** 期間のいちばん長い日数。始まりと終わりの日を両方数えます */
  maxRangeDays?: number;
  /**
   * 期間の中に押せない日（min・max の外、isDateDisabled）を含めない
   * @default false
   */
  excludeDisabled?: boolean;
  /**
   * カレンダーに並べる月の数（浮かべるとき）。2 では見せている月と次の月を横に並べ、前後の月の日を隠します。シートでは、いつも 1 か月です
   * @default 1
   */
  numberOfMonths?: 1 | 2;
  /** 期間の候補（「過去 7 日」など）。押すと、その期間を欄に入れて閉じます */
  presets?: DateRangePreset[];
  /**
   * 期間の候補の置き場所（浮かべるとき）。start はカレンダーの左の列、bottom はカレンダーの下の行です。シートでは、いつも下の行です
   * @default 'start'
   */
  presetsPlacement?: DateRangePickerPresetsPlacement;
  /**
   * カレンダーの見た目（日の形・曜日の色・月送りの置き方・ほかの月の日・月を送る動き・読み上げの文言）。
   * ほかの月の日（hideOutsideDays）は、2 か月を並べるときは既定で隠します
   */
  calendarProps?: DateRangePickerCalendarProps;
  /**
   * 今日として扱う日。サーバーで描くときに、サーバーとブラウザで今日をそろえるのに使います
   * @default timeZone での今日
   */
  today?: PlainDate;
  /**
   * 値を消すボタン（×）を出すか。どちらかの端に値があるときだけ、暦のボタンの左に出します（variant="field" のとき）。読み取り専用の欄では出しません
   * @default false
   */
  clearable?: boolean;
  /**
   * 値を消すボタンの読み上げの名前
   * @default '期間を消去'
   */
  clearName?: string;
  /**
   * カレンダーを開くボタンの読み上げの名前（variant="field" のとき）
   * @default 'カレンダーを開く'
   */
  triggerName?: string;
  /**
   * 始まりの日の区切りの読み上げの名前（variant="field" のとき）。欄のラベルに続けて読みます
   * @default '開始日'
   */
  startName?: string;
  /**
   * 終わりの日の区切りの読み上げの名前（variant="field" のとき）
   * @default '終了日'
   */
  endName?: string;
  /**
   * 始まりと終わりの日のあいだに置くもの。文字（「–」「から」）のほか、アイコンも渡せます。見た目だけで、読み上げには出しません
   * （欄では区切りの名前の startName・endName、ボタンでは separatorName で始まりと終わりを読み分けます）
   * @default '〜'
   */
  separator?: ReactNode;
  /**
   * ボタン（variant="button"）の読み上げで、始まりと終わりの日のあいだに挟む言葉。separator は読み上げないので、こちらで読ませます
   * @default 'から'
   */
  separatorName?: string;
  /**
   * カレンダーを開く印のアイコン。既定は暦のアイコンです。
   * variant="field" では `<Icon icon={…} standalone />`、variant="button" では `<Icon icon={…} />` の形で渡します
   * @default 暦のアイコン（CalendarBlank）
   */
  icon?: ReactNode;
  /**
   * 印の場所（variant="button" のとき）。end は右端、start は値の前です
   * @default 'end'
   */
  iconPlacement?: 'start' | 'end';
  /**
   * 値がないときにボタンに出す文字（variant="button" のとき）
   * @default '期間を選ぶ'
   */
  placeholder?: string;
  /** 選んだ日の書き方（variant="button" のとき）。指定しないときは「2026/09/20」です */
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
  /** 位置を決める要素（Positioner）に足す props。位置の基準は、書かないときは欄の外枠です */
  positionerProps?: PositionerProps;
  /**
   * カレンダーの面を閉じるボタンの読み上げの名前（シートの × と、面の中に置く読み上げ用の閉じる手段）
   * @default '閉じる'
   */
  closeName?: string;
}

// 区切りの欄から引き継ぐ props（値の三つ組・id・ref・inputProps・suffix は期間の形で持ち直す）
type InheritedControlProps = Omit<
  DateFieldControlProps,
  'value' | 'defaultValue' | 'onValueChange' | 'id' | 'ref' | 'inputProps' | 'suffix'
>;

/** DateRangePicker の本体（DateRangePickerControl）の props。ラベル・キャプション・状態の文は、包む Field に渡します */
export interface DateRangePickerControlProps
  extends InheritedControlProps, DateRangePickerOwnProps {}

/** DateRangePicker の props から、label・accessibleName の組み合わせの決まりを外したもの */
export type DateRangePickerBaseProps = Omit<
  DateFieldBaseProps,
  'value' | 'defaultValue' | 'onValueChange' | 'id' | 'ref' | 'inputProps' | 'suffix'
> &
  DateRangePickerOwnProps;

/** DateRangePicker の props。label か accessibleName のどちらかが要ります */
export type DateRangePickerProps = FieldNamed<DateRangePickerBaseProps>;

const EMPTY: DateRangeValue = { start: null, end: null };

/** 期間が逆（終わりが始まりより前）か */
function isReversed(value: DateRangeValue | null) {
  return Boolean(
    value?.start && value.end && Temporal.PlainDate.compare(value.end, value.start) < 0
  );
}

/** 範囲の外か、前後が逆か。欄をエラーの見た目にする */
function isRangeInvalid(value: DateRangeValue | null, min?: PlainDate, max?: PlainDate) {
  return (
    isReversed(value) ||
    isDateOutOfRange(value?.start ?? null, min, max) ||
    isDateOutOfRange(value?.end ?? null, min, max)
  );
}

/**
 * 期間を打つ欄に、カレンダーを開くボタンを付けた本体（組み立て用）。Field の中に置き、ラベル・キャプション・状態の行は FieldLabel などで並べます。
 * 押せない・待っている・エラー・必須の状態と、説明のつながりは、包む Field から受け取ります。カレンダーの面の名前は Field のラベルです
 */
export function DateRangePickerControl({
  variant = 'field',
  value: valueProp,
  defaultValue,
  onValueChange,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  isDateDisabled,
  getHoliday,
  minRangeDays,
  maxRangeDays,
  excludeDisabled,
  numberOfMonths = 1,
  presets,
  presetsPlacement = 'start',
  calendarProps,
  today: todayProp,
  clearable = false,
  clearName = '期間を消去',
  triggerName = 'カレンダーを開く',
  startName = '開始日',
  endName = '終了日',
  separator = '〜',
  separatorName = 'から',
  icon: iconProp,
  iconPlacement = 'end',
  placeholder = '期間を選ぶ',
  dateStyle,
  format,
  presentation,
  portalContainer,
  popupProps,
  positionerProps,
  closeName = '閉じる',
  min,
  max,
  readOnly,
  color = 'neutral',
  locale: localeProp,
  timeZone: timeZoneProp,
  prefix,
  addonShape = 'attached',
  loadingIndicator = 'spinner',
  hideSuccessMark = false,
  autoFocus,
  segmentPlaceholder = 'letters',
  onParseFailed,
  form,
  className,
  'aria-describedby': ariaDescribedBy,
}: DateRangePickerControlProps) {
  const field = useFieldState();
  const { locale, timeZone } = useLocale(localeProp, timeZoneProp);
  const today = todayProp ?? todayIn(timeZone);
  const sheet = useSheetPresentation(presentation);
  // 欄の端のボタンはアイコン単体なので太い線、ボタンの中の印は文字と並ぶので細い線（ADR-0018）
  const icon = iconProp ?? <CalendarBlankIcon standalone={variant !== 'button'} />;
  const [value, changeValue] = useControlled<DateRangeValue | null>(
    valueProp,
    defaultValue ?? null,
    onValueChange
  );
  const current = value ?? EMPTY;
  // 両端とも空なら null にする
  const setRange = (next: DateRangeValue) =>
    changeValue(next.start == null && next.end == null ? null : next);

  // 読み取り専用・押せない・待っているあいだ止める欄・Form の送信中は開かない（DatePicker と同じ）
  const locked = Boolean(readOnly || field?.disabled || field?.blocking);
  const [openState, setOpenState] = useState(defaultOpen);
  const open = (openProp ?? openState) && !locked;
  // 開く口を押して開いたときだけ、カレンダーの日へフォーカスを移す
  const [openedByUser, setOpenedByUser] = useState(false);
  const changeOpen = (next: boolean) => {
    if (next && locked) return;
    setOpenedByUser(next);
    setOpenState(next);
    onOpenChange?.(next);
  };

  // カレンダーで端を選んだとき。始まりだけなら開いたまま、終わりまで選んだら閉じる
  const pickFromCalendar = (range: CalendarRange | null) => {
    setRange(range ? { start: range.start, end: range.end } : EMPTY);
    if (range?.end) changeOpen(false);
  };

  const hasValue = current.start != null || current.end != null;
  const clearButton = clearable && hasValue && (
    <PickerTriggerButton
      aria-label={clearName}
      onClick={(event) => {
        // 消したあとは、欄の最初の区切りへ戻す（ボタンは値が空になると消えるため）
        const segment = event.currentTarget
          .closest('[data-slot="date-range"]')
          ?.querySelector<HTMLElement>('[role="spinbutton"]');
        setRange(EMPTY);
        segment?.focus();
      }}
    >
      <XIcon standalone />
    </PickerTriggerButton>
  );

  const panel = (
    <DateRangePickerPanel
      value={value}
      onCalendarChange={pickFromCalendar}
      onPresetPick={(preset) => {
        setRange(preset);
        changeOpen(false);
      }}
      autoFocus={openedByUser}
      color={color}
      numberOfMonths={sheet ? 1 : numberOfMonths}
      min={min}
      max={max}
      isDateDisabled={isDateDisabled}
      getHoliday={getHoliday}
      minRangeDays={minRangeDays}
      maxRangeDays={maxRangeDays}
      excludeDisabled={excludeDisabled}
      locale={locale}
      timeZone={timeZone}
      today={today}
      calendarProps={calendarProps}
      presets={presets}
      presetsPlacement={sheet ? 'bottom' : presetsPlacement}
    />
  );

  const describedBy = [ariaDescribedBy, field?.describedBy].filter(Boolean).join(' ') || undefined;
  const dateFormat = new Intl.DateTimeFormat(
    locale,
    format ?? (dateStyle ? { dateStyle } : DEFAULT_DATE_FORMAT)
  );

  return (
    <PickerOverlay
      open={open}
      onOpenChange={changeOpen}
      title={field?.label ?? field?.accessibleName ?? triggerName}
      presentation={presentation}
      portalContainer={portalContainer}
      popupProps={popupProps}
      positionerProps={positionerProps}
      popoverClassName="p-(--date-range-picker-popup-padding)"
      panel={panel}
      closeName={closeName}
      trapFocus
    >
      {(renderTrigger) =>
        variant === 'button' ? (
          <DateRangePickerButton
            value={current}
            readOnly={readOnly}
            color={color}
            placeholder={placeholder}
            icon={icon}
            iconPlacement={iconPlacement}
            className={className}
            form={form}
            describedBy={describedBy}
            startText={current.start ? dateFormat.format(toDate(current.start)) : null}
            endText={current.end ? dateFormat.format(toDate(current.end)) : null}
            separator={separator}
            separatorName={separatorName}
            renderTrigger={renderTrigger}
          />
        ) : (
          <DateRangeFields
            value={current}
            onStartChange={(start) => setRange({ ...current, start })}
            onEndChange={(end) => setRange({ ...current, end })}
            startName={startName}
            endName={endName}
            invalidStart={isDateOutOfRange(current.start, min, max)}
            invalidEnd={isDateOutOfRange(current.end, min, max) || isReversed(current)}
            separator={separator}
            prefix={prefix}
            suffix={
              readOnly ? null : (
                <>
                  {clearButton}
                  {renderTrigger(
                    <PickerTriggerButton aria-label={triggerName}>{icon}</PickerTriggerButton>
                  )}
                </>
              )
            }
            addonShape={addonShape}
            loadingIndicator={loadingIndicator}
            hideSuccessMark={hideSuccessMark}
            readOnly={readOnly}
            autoFocus={autoFocus}
            segmentPlaceholder={segmentPlaceholder}
            locale={locale}
            timeZone={timeZone}
            color={color}
            onParseFailed={onParseFailed}
            form={form}
            aria-describedby={ariaDescribedBy}
            className={className}
          />
        )
      }
    </PickerOverlay>
  );
}

/**
 * 期間（始まりと終わりの日）を選ぶ欄。年・月・日を打ち込むことも、右端のボタンで開くカレンダーから選ぶこともできます。
 * variant="button" では、打てない表示だけのボタンにし、押すとカレンダーを開きます
 */
export function DateRangePicker(props: DateRangePickerProps) {
  const [field, { halfWidthNotice = false, ...control }] = splitFieldProps(
    props as DateRangePickerBaseProps
  );
  const { notice, noticed } = useHalfWidthNotice(halfWidthNotice);
  // 範囲の外・前後が逆のときは欄をエラーの見た目にする。いまの値を外枠でも持つ（DatePicker と同じ）
  const [value, setValue] = useControlled<DateRangeValue | null>(
    control.value,
    control.defaultValue ?? null,
    control.onValueChange
  );
  return (
    <Field
      {...field}
      className={cn(pickerOpenLook, field.className)}
      info={field.info ?? notice}
      invalid={isRangeInvalid(value, control.min, control.max)}
      nativeLabel={false}
    >
      {() => (
        <HalfWidthNoticedContext value={noticed}>
          <DateRangePickerControl {...control} value={value} onValueChange={setValue} />
        </HalfWidthNoticedContext>
      )}
    </Field>
  );
}

interface DateRangePickerButtonProps {
  value: DateRangeValue;
  readOnly: boolean | undefined;
  color: NonNullable<DateRangePickerControlProps['color']>;
  placeholder: string;
  icon: ReactNode;
  iconPlacement: 'start' | 'end';
  startText: string | null;
  endText: string | null;
  separator: ReactNode;
  separatorName: string;
  className: string | undefined;
  describedBy: string | undefined;
  form: string | undefined;
  renderTrigger: (element: ReactElement<ComponentProps<'button'>>) => ReactElement;
}

// variant="button": 打てない表示だけのボタン（DatePicker の variant="button" と同じ見た目）
function DateRangePickerButton({
  value,
  startText,
  endText,
  separator,
  separatorName,
  placeholder,
  icon,
  iconPlacement,
  readOnly,
  color,
  className,
  describedBy,
  form,
  renderTrigger,
}: DateRangePickerButtonProps) {
  useFieldControlKind({ nativeLabel: false });
  const field = useFieldState();
  const valueId = useId();
  const blocking = field?.blocking ?? false;
  const empty = startText == null && endText == null;
  const formValue =
    value.start && value.end ? `${value.start.toString()}/${value.end.toString()}` : '';
  return (
    <BaseField.Control
      value={formValue}
      disabled={field?.disabled}
      render={(controlProps) => (
        <>
          {renderTrigger(
            <button
              type="button"
              id={controlProps.id}
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
                  className,
                ],
              })}
            >
              <span
                id={valueId}
                className={cn(
                  'min-w-0 flex-1 truncate',
                  empty && 'text-(color:--field-placeholder)'
                )}
              >
                {empty ? (
                  placeholder
                ) : (
                  <>
                    {startText ?? ''}
                    {/* 間の記号は見た目だけ。読み上げでは separatorName（「から」）を挟む */}
                    <span aria-hidden className="px-(--date-range-picker-separator-gap)">
                      {separator}
                    </span>
                    <span className="sr-only">{` ${separatorName} `}</span>
                    {endText ?? ''}
                  </>
                )}
              </span>
              <span
                aria-hidden
                className={cn(
                  'flex group-data-disabled/field:text-fg-subtle',
                  iconPlacement === 'start' && '-order-1',
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
            name={(controlProps as { name?: string }).name}
            form={form}
            value={formValue}
            disabled={field?.disabled}
          />
        </>
      )}
    />
  );
}
