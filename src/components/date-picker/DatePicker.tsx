'use client';

import { Field as BaseField } from '@base-ui/react/field';
import { type ComponentProps, type ReactElement, type ReactNode, useId, useState } from 'react';

import type { DateFieldBaseProps } from '../date-field/DateField';
import { type DatePickerCalendarProps, DatePickerPanel } from './DatePickerPanel';
import { DEFAULT_DATE_FORMAT } from '../../internal/date/format-date';
import { type PlainDate, toDate, todayIn } from '../../internal/date/plain-date';
import { isDateOutOfRange } from '../../internal/date/range';
import { useLocale } from '../../internal/date/use-locale';
import { dateSegmentColorClass } from '../../internal/date-segments/colors';
import {
  type DateFieldControlProps,
  DateFieldControlInner,
  type DateFieldControlInnerProps,
} from '../../internal/date-segments/DateFieldControlInner';
import { Field, useFieldControlKind, useFieldState } from '../../internal/field/Field';
import { controlBox } from '../../internal/field/field-styles';
import { type FieldNamed, splitFieldProps } from '../../internal/field/input-field-props';
import { useHalfWidthNotice } from '../../internal/half-width';
import { CalendarBlankIcon, XIcon } from '../../internal/icons';
import type { PopupProps, PositionerProps } from '../../internal/overlay/overlay-props';
import {
  PickerOverlay,
  PickerTriggerButton,
  pickerOpenLook,
} from '../../internal/picker/PickerOverlay';
import type { OverlayPresentation } from '../../internal/sheet/use-narrow-screen';
import { cn } from '../../internal/tv';

export type { DatePickerCalendarProps } from './DatePickerPanel';

// 日付を選ぶ欄。打ち込む欄（DateField の本体）の右端に、カレンダーを開くボタンを置く
//   本体は DatePickerControl（組み立て用）。DatePicker はそれを Field で包む（TimePicker と同じ）。押せない・待っている状態は Field から読む
//   打ち込み（和暦・全角・日本語の書き方の読み取り）は DateField のまま。カレンダーで選んだ日は欄にそのまま入る
//   カレンダーを開くボタンは、欄の値に作用する suffix のボタン（原則8: グレー地＋アイコン＝押せる）
//   読み取り専用では出さない（値を変える操作なので。消去のボタンと同じ — ADR-0168・0197）
//   値を消すボタン（clearable）は、値があるときだけ暦のボタンの左に出す。暦のボタンは右端から動かない
//     並びは DOM の順で決める（CSS の order で入れ替えると、Tab の順と見た目の順がずれる）
// 「今日」のボタンは既定で出す（カレンダーの下に幅いっぱい）
// variant="button" は、打てない表示だけのボタン。押すとカレンダーを開く（Select のボタンと同じ見た目の欄）
//   印は既定で右端の暦（Select の ▼ と同じ場所）。iconPlacement="start" で値の前、icon で ▼ にもできる
// 面は欄の左端にそろえて下に出す（Select・Combobox と同じ）。開いているあいだ、欄はフォーカス中と同じ見た目を保つ
// 面の中の余白と、カレンダーと下の行のあいだは design/tokens.css の --date-picker-*

/** 見た目の型。field は打ち込める欄＋カレンダーのボタン、button は打てない表示のボタン */
export type DatePickerVariant = 'field' | 'button';

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
   * 今日として扱う日。サーバーで描くときに、サーバーとブラウザで今日をそろえるのに使います。
   * 渡さないときは、timeZone での今日です
   * @default 今日
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
   * @default 暦のアイコン（CalendarBlank）
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
  /**
   * Intl.DateTimeFormat の指定をそのまま渡します（variant="button" のとき）。指定すると dateStyle は使いません。
   * 「2026/09/20」は `{ year: 'numeric', month: '2-digit', day: '2-digit' }` です
   */
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

/** DatePicker の本体（DatePickerControl）の props。ラベル・キャプション・状態の文は、包む Field に渡します */
export interface DatePickerControlProps
  extends Omit<DateFieldControlProps, 'suffix'>, DatePickerOwnProps {}

/** DatePicker の props から、label・accessibleName の組み合わせの決まりを外したもの */
export type DatePickerBaseProps = Omit<DateFieldBaseProps, 'suffix'> & DatePickerOwnProps;

/** DatePicker の props。label か accessibleName のどちらかが要ります */
export type DatePickerProps = FieldNamed<DatePickerBaseProps>;

/** 値（制御・非制御）をまとめて持つ */
function useDateValue(
  value: PlainDate | null | undefined,
  defaultValue: PlainDate | null | undefined,
  onValueChange?: (value: PlainDate | null) => void
) {
  const [inner, setInner] = useState<PlainDate | null>(defaultValue ?? null);
  const current = value !== undefined ? value : inner;
  const change = (next: PlainDate | null) => {
    setInner(next);
    onValueChange?.(next);
  };
  return [current, change] as const;
}

/**
 * 日付を打つ欄に、カレンダーを開くボタンを付けた本体（組み立て用）。Field の中に置き、ラベル・キャプション・状態の行は FieldLabel などで並べます。
 * 押せない・待っている・エラー・必須の状態と、説明のつながりは、包む Field から受け取ります。カレンダーの面の名前は Field のラベルです
 */
export function DatePickerControl(props: DatePickerControlProps) {
  return <DatePickerControlInner {...props} />;
}

function DatePickerControlInner({
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
  positionerProps,
  closeName = '閉じる',
  value: valueProp,
  defaultValue,
  onValueChange,
  min,
  max,
  readOnly,
  color = 'neutral',
  locale: localeProp,
  timeZone: timeZoneProp,
  ...control
}: DatePickerControlProps & Pick<DateFieldControlInnerProps, 'onHalfWidth'>) {
  const field = useFieldState();
  const { locale, timeZone } = useLocale(localeProp, timeZoneProp);
  const today = todayProp ?? todayIn(timeZone);
  // 欄の端のボタンはアイコン単体なので太い線、ボタンの中の印は文字と並ぶので細い線（ADR-0018）
  const icon = iconProp ?? <CalendarBlankIcon standalone={variant === 'field'} />;
  const [value, changeValue] = useDateValue(valueProp, defaultValue, onValueChange);

  // 読み取り専用・押せない（Fieldset から受けたものも含む）・待っているあいだ止める欄・Form の送信中は開かない（値を変える操作なので — ADR-0168）
  //   defaultOpen・制御の open で開こうとしても、面を出さない
  const locked = Boolean(readOnly || field?.disabled || field?.blocking);
  const [openState, setOpenState] = useState(defaultOpen);
  const open = (openProp ?? openState) && !locked;
  // 開く口を押して開いたときだけ、カレンダーの日へフォーカスを移す（はじめから開いているときは動かさない）
  const [openedByUser, setOpenedByUser] = useState(false);
  const changeOpen = (next: boolean) => {
    if (next && locked) return;
    setOpenedByUser(next);
    setOpenState(next);
    onOpenChange?.(next);
  };

  const pick = (date: PlainDate) => {
    changeValue(date);
    changeOpen(false);
  };

  // 値を消すボタン。値があるときだけ、暦のボタンの左に出す
  const clearButton = clearable && value != null && (
    <PickerTriggerButton
      aria-label={clearName}
      onClick={(event) => {
        // 消したあとは、欄の最初の区切りへ戻す（ボタンは値が空になると消えるため）
        const segment = event.currentTarget
          .closest('[data-slot="control"]')
          ?.querySelector<HTMLElement>('[role="spinbutton"]');
        changeValue(null);
        segment?.focus();
      }}
    >
      <XIcon standalone />
    </PickerTriggerButton>
  );

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
      // 面の名前は欄のラベル
      title={field?.label ?? field?.accessibleName ?? triggerName}
      presentation={presentation}
      portalContainer={portalContainer}
      popupProps={popupProps}
      positionerProps={positionerProps}
      // 面の余白は浮かべる形だけ（シートは Drawer が余白を持つ）
      popoverClassName="p-(--date-picker-popup-padding)"
      panel={panel}
      closeName={closeName}
      // フォーカスを面の中に閉じ込める（WAI-ARIA の日付選びのダイアログと同じ）。フォーカスはカレンダーが選んだ日か今日へ移す
      trapFocus
    >
      {(renderTrigger) =>
        variant === 'button' ? (
          <DatePickerButton
            value={value}
            readOnly={readOnly}
            color={color}
            placeholder={placeholder}
            icon={icon}
            iconPlacement={iconPlacement}
            className={control.className}
            describedBy={
              [control['aria-describedby'], field?.describedBy].filter(Boolean).join(' ') ||
              undefined
            }
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
          <DateFieldControlInner
            {...control}
            value={value}
            onValueChange={changeValue}
            min={min}
            max={max}
            readOnly={readOnly}
            color={color}
            locale={localeProp}
            timeZone={timeZoneProp}
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
          />
        )
      }
    </PickerOverlay>
  );
}

/**
 * 日付を選ぶ欄。年・月・日を打ち込むことも、右端のボタンで開くカレンダーから選ぶこともできます。
 * variant="button" では、打てない表示だけのボタンにし、押すとカレンダーを開きます
 */
export function DatePicker(props: DatePickerProps) {
  const [field, { halfWidthNotice = false, ...control }] = splitFieldProps(
    props as DatePickerBaseProps
  );
  // 全角を半角に直したことの知らせ（DateField と同じ。既定は知らせない）
  const { notice, noticed } = useHalfWidthNotice(halfWidthNotice);
  // 範囲の外のときは欄をエラーの見た目にする。いまの値を外枠でも持つ（DateField と同じ）
  const [value, setValue] = useDateValue(
    control.value,
    control.defaultValue,
    control.onValueChange
  );
  return (
    <Field
      {...field}
      // 開いているあいだ、欄をフォーカス中と同じ見た目にする（TimePicker・Select と同じ）
      className={cn(pickerOpenLook, field.className)}
      info={field.info ?? notice}
      invalid={isDateOutOfRange(value, control.min, control.max)}
      nativeLabel={false}
    >
      {() => (
        <DatePickerControlInner
          {...control}
          value={value}
          onValueChange={setValue}
          onHalfWidth={noticed}
        />
      )}
    </Field>
  );
}

interface DatePickerButtonProps {
  value: PlainDate | null;
  readOnly: boolean | undefined;
  color: NonNullable<DatePickerControlProps['color']>;
  placeholder: string;
  icon: ReactNode;
  iconPlacement: 'start' | 'end';
  /** 選んだ日の文字。値がないときは null */
  text: string | null;
  className: string | undefined;
  describedBy: string | undefined;
  renderTrigger: (element: ReactElement<ComponentProps<'button'>>) => ReactElement;
}

// variant="button": 打てない表示だけのボタン。ラベル・キャプション・状態の行は、包む Field が並べる
function DatePickerButton({
  value,
  text,
  placeholder,
  icon,
  iconPlacement,
  readOnly,
  color,
  className,
  describedBy,
  renderTrigger,
}: DatePickerButtonProps) {
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
                  className,
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
                  'flex group-data-disabled/field:text-fg-subtle',
                  // start は値の前へ（読み上げから外した印なので、並びは見た目だけで変える）
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
