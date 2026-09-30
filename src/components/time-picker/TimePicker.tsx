'use client';

import { useMemo, useState } from 'react';

import {
  TimeFieldControlInner,
  type TimeFieldControlInnerProps,
  type TimeFieldControlProps,
} from '../time-field/TimeField';
import { TimePickerPanel, type TimePickerVariant } from './TimePickerPanel';
import { DEFAULT_COLUMN_NAMES, isOutOfRange, type TimePickerColumnNames } from './time-options';
import { timeLayout } from '../../internal/date-segments/segments';
import { type PlainTime, Temporal } from '../../internal/date/plain-date';
import { useLocale } from '../../internal/date/use-locale';
import { Field } from '../../internal/field/Field';
import { type HalfWidthNoticeProps, useHalfWidthNotice } from '../../internal/half-width';
import {
  type FieldNamed,
  type InputFieldProps,
  splitFieldProps,
} from '../../internal/field/input-field-props';
import { ClockIcon } from '../../internal/icons';
import { warnOnce } from '../../internal/link-parts';
import { selectedTokens } from '../../internal/listbox/listbox-colors';
import type { PopupProps, PositionerProps } from '../../internal/overlay/overlay-props';
import {
  PickerOverlay,
  PickerTriggerButton,
  pickerOpenLook,
} from '../../internal/picker/PickerOverlay';
import type { OverlayPresentation } from '../../internal/sheet/use-narrow-screen';
import { cn } from '../../internal/tv';

export type { TimePickerVariant } from './TimePickerPanel';
export type { TimePickerColumnNames } from './time-options';

/** TimePicker の本体（TimePickerControl）の props。ラベル・キャプション・状態の文は、包む Field に渡します */
export interface TimePickerControlProps extends Omit<
  TimeFieldControlProps,
  'suffix' | 'minuteStep'
> {
  /**
   * 一覧の出し方。list は刻み（minuteStep）ごとの時刻を 1 列に並べ、選ぶと閉じます。
   * columns は時・分（12 時間制では午前・午後、showSeconds では秒も）を別々の列にし、列ごとに選びます
   * @default 'list'
   */
  variant?: TimePickerVariant;
  /**
   * 刻み（分）。list では一覧の時刻の間隔、columns では分の列の間隔です。欄の分を ↑↓ で増減するときの刻みにもなります。
   * 打てる値は刻みに縛りません。list で 5 分より細かくすると一覧が重くなるので、columns を使います（開発中は警告を出します）
   * @default 15
   */
  minuteStep?: number;
  /** 開いているか（制御） */
  open?: boolean;
  /**
   * はじめに開いているか（非制御）
   * @default false
   */
  defaultOpen?: boolean;
  /** 開閉が変わるときに、次の値を渡して呼びます */
  onOpenChange?: (open: boolean) => void;
  /**
   * 右端のボタンと、開いた面の読み上げの名前
   * @default '時刻を選ぶ'
   */
  pickerName?: string;
  /**
   * columns の列ごとの読み上げの名前
   * @default { hour: '時', minute: '分', second: '秒', dayPeriod: '午前・午後' }
   */
  columnNames?: TimePickerColumnNames;
  /**
   * 選んだら面を閉じるか。list は時刻を選んだとき、columns はいちばん小さい単位（分、showSeconds では秒）を選んだときに閉じます。
   * false では選んでも開いたままで、外を押すか Esc（columns で showDoneButton のときは「完了」）で閉じます
   * @default true
   */
  closeOnSelect?: boolean;
  /**
   * columns の下に、面を閉じる「完了」のボタンを出します。時だけを選び直したときにも、閉じる手段が見えます
   * @default false
   */
  showDoneButton?: boolean;
  /**
   * columns の列のあいだの細い縦線を消します
   * @default false
   */
  hideColumnDivider?: boolean;
  /**
   * columns の列の上に「時」「分」などの見出し（columnNames）を出します。見出しがなくても、読み上げでは列の名前が届きます
   * @default false
   */
  showColumnHeading?: boolean;
  /**
   * columns の showDoneButton で出すボタンの文字
   * @default '完了'
   */
  doneLabel?: string;
  /**
   * 出し方。auto は指で操作していて画面が狭いときだけ、画面の下から出すシートにします。popover はいつも欄のそばに浮かべ、sheet はいつもシートにします
   * 書かないときは ThemeProvider の presentation に従います
   * @default 'auto'
   */
  presentation?: OverlayPresentation;
  /**
   * 描く場所。まとめて決めるときは ThemeProvider の portalContainer を使います
   * @default document.body
   */
  portalContainer?: HTMLElement | null;
  /** 面（Popup）に足す props（id・data-*・aria-*・ref など） */
  popupProps?: PopupProps;
  /** 位置を決める要素（Positioner）に足す props。位置の基準は、書かないときは欄の外枠です */
  positionerProps?: PositionerProps;
}

type TimePickerControlInnerProps = TimePickerControlProps &
  Pick<TimeFieldControlInnerProps, 'onHalfWidth'>;

/** 値（制御・非制御）をまとめて持つ */
function useTimeValue(
  value: PlainTime | null | undefined,
  defaultValue: PlainTime | null | undefined,
  onValueChange?: (value: PlainTime | null) => void
) {
  const [inner, setInner] = useState<PlainTime | null>(defaultValue ?? null);
  const current = value !== undefined ? value : inner;
  const change = (next: PlainTime | null) => {
    setInner(next);
    onValueChange?.(next);
  };
  return [current, change] as const;
}

/**
 * 時刻を打つ欄に、一覧から選ぶボタンを付けた本体（組み立て用）。Field の中に置き、ラベル・キャプション・状態の行は FieldLabel などで並べます
 */
export function TimePickerControl(props: TimePickerControlProps) {
  return <TimePickerControlInner {...props} />;
}

function TimePickerControlInner({
  variant = 'list',
  minuteStep = 15,
  value: valueProp,
  defaultValue,
  onValueChange,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  pickerName = '時刻を選ぶ',
  columnNames,
  closeOnSelect,
  showDoneButton,
  hideColumnDivider,
  showColumnHeading,
  doneLabel = '完了',
  presentation,
  portalContainer,
  popupProps,
  positionerProps,
  color = 'neutral',
  readOnly,
  hourCycle,
  showSeconds = false,
  min,
  max,
  locale: localeProp,
  ...field
}: TimePickerControlInnerProps) {
  // 1 列の形は刻みごとの時刻をすべて描く。5 分より細かいと項目が多すぎて重いので、列の形を勧める
  if (variant === 'list' && minuteStep < 5)
    warnOnce(
      `TimePicker: minuteStep={${minuteStep}} の一覧は項目が多く重くなります。細かい刻みでは variant="columns" を使ってください`
    );
  const [value, setValue] = useTimeValue(valueProp, defaultValue, onValueChange);
  const [openState, setOpenState] = useState(defaultOpen);
  const open = openProp ?? openState;
  const changeOpen = (next: boolean) => {
    setOpenState(next);
    onOpenChange?.(next);
  };
  const { locale, timeZone } = useLocale(localeProp);
  const layout = useMemo(
    () => timeLayout(locale, { hourCycle, showSeconds }),
    [locale, hourCycle, showSeconds]
  );
  const listLayout = useMemo(() => timeLayout(locale, { hourCycle }), [locale, hourCycle]);
  const names = { ...DEFAULT_COLUMN_NAMES, ...columnNames };
  const { className: popupClassName, style: popupStyle, ...restPopupProps } = popupProps ?? {};

  const panel = (
    <TimePickerPanel
      variant={variant}
      layout={layout}
      listLayout={listLayout}
      value={value}
      now={Temporal.Now.plainTimeISO(timeZone)}
      minuteStep={minuteStep}
      showSeconds={showSeconds}
      min={min}
      max={max}
      columnNames={names}
      listName={pickerName}
      doneLabel={doneLabel}
      closeOnSelect={closeOnSelect}
      showDoneButton={showDoneButton}
      hideColumnDivider={hideColumnDivider}
      showColumnHeading={showColumnHeading}
      onPick={(next, close) => {
        setValue(next);
        if (close) changeOpen(false);
      }}
      onDone={() => changeOpen(false)}
    />
  );

  return (
    <PickerOverlay
      open={open}
      onOpenChange={changeOpen}
      title={pickerName}
      presentation={presentation}
      portalContainer={portalContainer}
      positionerProps={positionerProps}
      // 欄の右端（開いたボタンの側）にそろえる
      align="end"
      // 開いたら、選んでいる時刻（なければいまの時刻の近く）の項目へ Base UI がフォーカスを移す（その項目だけが tabIndex=0）
      moveFocus
      popupProps={{
        ...restPopupProps,
        style: { ...selectedTokens(color), ...popupStyle },
        // 余白は項目の一覧が持つ（Select の浮かぶ選択肢と同じ）
        // 幅は中身の幅で、--time-picker-popup-fill が 1 のときは欄の幅まで広げる（--anchor-width は Base UI が面の外側に置く）
        className: cn(
          'w-max min-w-[calc(var(--anchor-width)*var(--time-picker-popup-fill))] overflow-clip',
          popupClassName
        ),
      }}
      panel={panel}
      closeName="閉じる"
    >
      {(renderTrigger) => (
        <TimeFieldControlInner
          {...field}
          value={value}
          onValueChange={setValue}
          color={color}
          readOnly={readOnly}
          hourCycle={hourCycle}
          showSeconds={showSeconds}
          minuteStep={minuteStep}
          min={min}
          max={max}
          locale={localeProp}
          // 読み取り専用では、値を変える一覧を開くボタンを置かない（消去のボタンと同じ — ADR-0168・0187）
          suffix={
            readOnly
              ? undefined
              : renderTrigger(
                  <PickerTriggerButton aria-label={pickerName}>
                    <ClockIcon standalone />
                  </PickerTriggerButton>
                )
          }
        />
      )}
    </PickerOverlay>
  );
}

/** TimePicker の props から、label・accessibleName の組み合わせの決まりを外したもの */
export type TimePickerBaseProps = Omit<TimePickerControlProps, 'className'> &
  Omit<InputFieldProps, 'placeholder' | 'suffix'> &
  HalfWidthNoticeProps & {
    /** フォームに送る名前。値は ISO 8601 の時刻（「15:05」、秒を出すときは「15:05:30」）で、そろっていないときは空 */
    name?: string;
    /**
     * 必須にします。欄に aria-required を付け、ラベルの後ろに印（既定は「必須」のタグ）を出します。印は読み上げから外れます
     * @default false
     */
    required?: boolean;
  };

/** TimePicker の props。label か accessibleName のどちらかが要ります */
export type TimePickerProps = FieldNamed<TimePickerBaseProps>;

/**
 * 時刻を打つ欄に、一覧から選ぶボタンを付けたもの。打つことも、右端のボタンで開いた一覧から選ぶこともできます
 */
export function TimePicker(props: TimePickerProps) {
  const [field, { halfWidthNotice = false, ...control }] = splitFieldProps(
    props as TimePickerBaseProps
  );
  const { notice, noticed } = useHalfWidthNotice(halfWidthNotice);
  // 範囲の外のときは欄をエラーの見た目にする。いまの値を外枠でも持つ（TimeField と同じ）
  const [value, setValue] = useTimeValue(
    control.value,
    control.defaultValue,
    control.onValueChange
  );
  const outOfRange = isOutOfRange(value, control.min, control.max);
  return (
    <Field
      {...field}
      // 開いているあいだ、欄をフォーカス中と同じ見た目にする（DatePicker・Select と同じ）
      className={cn(pickerOpenLook, field.className)}
      info={field.info ?? notice}
      invalid={outOfRange}
      nativeLabel={false}
    >
      {() => (
        <TimePickerControlInner
          {...control}
          value={value}
          onValueChange={setValue}
          onHalfWidth={noticed}
        />
      )}
    </Field>
  );
}
