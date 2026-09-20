import { NumberField as BaseNumberField } from '@base-ui/react/number-field';
import { type ReactNode, useId } from 'react';

import { ArrowsHorizontalIcon } from '../../internal/icons';
import { SplitStepButton, StackedStepper, type StepperLabels } from './NumberFieldStepper';
import { FieldAddon } from '../field-addon/FieldAddon';
import { Field } from '../../internal/field/Field';
import { FieldBox, fieldInset } from '../../internal/field/FieldBox';
import {
  type HalfWidthNoticeProps,
  halfWidthKind,
  useHalfWidthNotice,
} from '../../internal/half-width';
import type { InputFieldProps } from '../../internal/field/input-field-props';
import { useFormSubmittingLock } from '../../internal/form-context';

/** 増減ボタンの置き方。stacked: 右端に上下で縦積み、split: 左に −・右に ＋、none: ボタンなし */
export type NumberFieldStepper = 'stacked' | 'split' | 'none';

type RootProps = BaseNumberField.Root.Props;

export interface NumberFieldProps extends InputFieldProps, HalfWidthNoticeProps {
  /** 値（制御する）。空のときは null */
  value?: number | null;
  /** はじめの値（制御しない） */
  defaultValue?: number;
  /** 値が変わったとき。打っている途中でも、数として読めるたびに呼ばれる */
  onValueChange?: RootProps['onValueChange'];
  /** 値が決まったとき（フォーカスが外れた・ボタンを離した・キーで増減した） */
  onValueCommitted?: RootProps['onValueCommitted'];
  /** 下限。届くと、減らすボタンが押せなくなる */
  min?: number;
  /** 上限。届くと、増やすボタンが押せなくなる */
  max?: number;
  /**
   * ボタンと ↑↓ キーで増減する幅
   * @default 1
   */
  step?: number | 'any';
  /**
   * Alt（Option）を押しながら増減する幅
   * @default 0.1
   */
  smallStep?: number;
  /**
   * Shift を押しながら増減する幅
   * @default 10
   */
  largeStep?: number;
  /** 表示の形（通貨・%・桁区切り・小数の桁）。Intl.NumberFormat のオプション */
  format?: Intl.NumberFormatOptions;
  /** 表示と読み取りの地域（'ja-JP' など）。既定は、使っている人の環境の地域 */
  locale?: Intl.LocalesArgument;
  /**
   * 増減ボタンの置き方
   * - `split`: 左に −、右に ＋。値は中央に寄せる
   * - `stacked`: 右端に ▲ と ▼ を縦に積む。幅は細いが、1 つのボタンは本体の半分の高さ
   * - `none`: ボタンを置かない。↑↓ キー・ホイール・ラベルを左右に動かして増減する
   * @default 'split'
   */
  stepper?: NumberFieldStepper;
  /**
   * ラベルを左右に動かして（押したまま横に動かして）値を変えられるようにするか
   * @default stepper === 'none'
   */
  scrub?: boolean;
  /**
   * フォーカスしているあいだ、ホイールで値を変えられるようにするか
   * @default stepper === 'none'
   */
  allowWheelScrub?: boolean;
  /**
   * 増減ボタンの読み上げの名前
   * @default { increment: '増やす', decrement: '減らす' }
   */
  stepperLabels?: StepperLabels;
  /** ボタン・キーで増減したとき、step の倍数にそろえるか */
  snapOnStep?: boolean;
  /** 打った値が min・max の外でも、そのまま残すか（フォームの検証で範囲外として知らせる） */
  allowOutOfRange?: boolean;
  name?: string;
  id?: string;
  /**
   * 必須にします。欄に required を付け、ラベルの後ろに印（既定は「必須」のタグ）を出します。印は読み上げから外れます
   * @default false
   */
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
  'aria-describedby'?: string;
  'aria-disabled'?: boolean | 'true' | 'false';
  'aria-busy'?: boolean | 'true' | 'false';
}

const defaultLabels: StepperLabels = { increment: '増やす', decrement: '減らす' };

/**
 * 数を入力する欄。増減ボタン・↑↓ キーで増減し、表示の形（通貨・%・桁区切り）をそろえる
 */
export function NumberField({
  label,
  caption,
  captionPlacement,
  error,
  warning,
  success,
  successMark = true,
  info,
  disabled,
  className,
  prefix,
  suffix,
  addonShape = 'attached',
  loading = false,
  loadingBehavior = 'non-blocking',
  loadingIndicator = 'spinner',
  readOnly,
  placeholder,
  stepper = 'split',
  scrub = stepper === 'none',
  allowWheelScrub = stepper === 'none',
  stepperLabels = defaultLabels,
  value,
  defaultValue,
  onValueChange,
  onValueCommitted,
  min,
  max,
  step,
  smallStep,
  largeStep,
  format,
  locale,
  snapOnStep,
  allowOutOfRange,
  name,
  id,
  required,
  requiredMark,
  optionalMark,
  autoFocus,
  halfWidthNotice = false,
  'aria-describedby': ariaDescribedBy,
  'aria-disabled': ariaDisabled,
  'aria-busy': ariaBusy,
}: NumberFieldProps) {
  const uid = useId();
  // 全角を半角に直したことの知らせ（既定は知らせない）。直すのは Base UI（フォーカスが外れたときに半角の形になる）なので、
  //   打った文字に全角の英数字が入っていたかだけを見る。値が空になったら知らせを消す
  const { notice, noticed } = useHalfWidthNotice(halfWidthNotice);
  // Form の送信中・blocking の待ちは、TextField と同じく書き換えを止める（フォーカスは外さない）
  const formLock = useFormSubmittingLock();
  const blocking = (loading && loadingBehavior === 'blocking') || formLock.blocking;
  // 読み取り専用ではボタンを出さない（押せないボタンを並べても、値を読む邪魔になる）
  const showStepper = stepper !== 'none' && !readOnly;
  // split の並び（値を中央に寄せ、prefix・suffix を値の横に置く）は、読み取り専用でボタンを外しても変えない
  const split = stepper === 'split';

  // B（split）では、prefix・suffix の文字を塊にせず、値のすぐ横に淡い文字で置く（両端の塊はボタン）
  //   A（stacked）では、suffix の文字の塊の後ろにボタンの塊を置く（1200 [円][▲▼]）
  const inlineText = (node: ReactNode, key: 'prefix' | 'suffix') =>
    typeof node === 'string' || typeof node === 'number' ? (
      <span
        id={`${uid}${key}`}
        aria-hidden
        data-slot="field-addon"
        className="shrink-0 text-fg-muted group-data-disabled/field:text-(color:--color-on-field-disabled)"
      >
        {node}
      </span>
    ) : (
      node
    );
  const isText = (node: ReactNode) => typeof node === 'string' || typeof node === 'number';
  const ownDescribedBy: (string | undefined)[] = [];
  let boxPrefix: ReactNode = prefix;
  let boxSuffix: ReactNode = suffix;
  let innerPrefix: ReactNode = null;
  let innerSuffix: ReactNode = null;
  if (split) {
    innerPrefix = inlineText(prefix, 'prefix');
    innerSuffix = inlineText(suffix, 'suffix');
    if (isText(prefix)) ownDescribedBy.push(`${uid}prefix`);
    if (isText(suffix)) ownDescribedBy.push(`${uid}suffix`);
    boxPrefix = showStepper && (
      <SplitStepButton direction="decrement" label={stepperLabels.decrement} locked={blocking} />
    );
    boxSuffix = showStepper && (
      <SplitStepButton direction="increment" label={stepperLabels.increment} locked={blocking} />
    );
  } else if (showStepper) {
    // FieldBox は文字の suffix を説明につなぐが、ボタンと並べると渡せないので、ここでつなぐ
    const suffixNode = isText(suffix) ? (
      <FieldAddon id={`${uid}suffix`} aria-hidden>
        {suffix}
      </FieldAddon>
    ) : (
      suffix
    );
    if (isText(suffix)) ownDescribedBy.push(`${uid}suffix`);
    boxSuffix = (
      <>
        {suffixNode}
        <StackedStepper labels={stepperLabels} locked={blocking} />
      </>
    );
  }
  const hasInlineText = split && (innerPrefix != null || innerSuffix != null);

  return (
    <Field
      label={label}
      caption={caption}
      captionPlacement={captionPlacement}
      error={error}
      warning={warning}
      success={success}
      info={info ?? notice}
      disabled={disabled}
      loading={loading}
      loadingBehavior={loadingBehavior}
      required={required}
      requiredMark={requiredMark}
      optionalMark={optionalMark}
      className={[scrub && 'relative', className].filter(Boolean).join(' ') || undefined}
    >
      {(messageIds) => (
        <BaseNumberField.Root
          id={id}
          name={name}
          value={value}
          defaultValue={defaultValue}
          onValueChange={(next, details) => {
            // 値が空になったら、全角を直したことの知らせも消す
            if (next === null) noticed(null, true);
            onValueChange?.(next, details);
          }}
          onValueCommitted={onValueCommitted}
          min={min}
          max={max}
          step={step}
          smallStep={smallStep}
          largeStep={largeStep}
          format={format}
          locale={locale}
          snapOnStep={snapOnStep}
          allowOutOfRange={allowOutOfRange}
          allowWheelScrub={allowWheelScrub}
          required={required}
          disabled={disabled}
          readOnly={readOnly || blocking}
          data-stepper={stepper}
        >
          {scrub && (
            // ラベルの上に、ラベルと同じ大きさの押せる範囲を重ねる（見えない写しで大きさをそろえる）
            // Field のラベルは NumberField の外にあり、ScrubArea で包めないため
            <BaseNumberField.ScrubArea
              data-slot="number-field-scrub"
              className="absolute top-0 left-0 max-w-full cursor-ew-resize text-(length:--text-label) leading-(--leading-label) font-bold data-disabled:cursor-not-allowed data-readonly:cursor-default"
            >
              <span aria-hidden className="invisible">
                {label}
              </span>
              <BaseNumberField.ScrubAreaCursor className="text-fg drop-shadow-sm">
                <ArrowsHorizontalIcon standalone />
              </BaseNumberField.ScrubAreaCursor>
            </BaseNumberField.ScrubArea>
          )}
          <FieldBox
            prefix={boxPrefix}
            suffix={boxSuffix}
            addonShape={addonShape}
            readOnly={readOnly}
            disabled={disabled}
            loading={loading}
            loadingIndicator={loadingIndicator}
            success={success}
            successMark={successMark}
            error={error}
            describedBy={
              [...ownDescribedBy, ariaDescribedBy].filter(Boolean).join(' ') || undefined
            }
            messageIds={messageIds}
          >
            {(describedBy) => {
              const input = (
                <BaseNumberField.Input
                  placeholder={placeholder}
                  autoFocus={autoFocus}
                  aria-disabled={blocking || ariaDisabled}
                  aria-busy={loading || ariaBusy}
                  aria-describedby={describedBy}
                  onChange={(event) => {
                    const raw = event.currentTarget.value;
                    noticed(halfWidthKind(raw), raw === '');
                  }}
                  // 値の文字の幅はそろえる（桁がそろい、増減で文字が揺れない）
                  className={[
                    'h-full min-w-0 bg-transparent tabular-nums outline-none placeholder:text-(color:--field-placeholder) disabled:cursor-not-allowed',
                    split && 'text-center',
                    hasInlineText ? 'max-w-full' : ['w-full', !split && fieldInset],
                    blocking && 'cursor-progress',
                  ]
                    .flat()
                    .filter(Boolean)
                    .join(' ')}
                  // 値の横に文字を置くときは、欄の幅を値の長さに合わせ、値と文字をまとめて中央に置く
                  style={
                    hasInlineText
                      ? (state) => ({
                          width: `calc(${Math.max(state.inputValue.length, placeholder?.length ?? 0, 1)}ch + 2px)`,
                        })
                      : undefined
                  }
                />
              );
              return hasInlineText ? (
                <div className="flex h-full min-w-0 flex-1 items-center justify-center gap-1 px-2">
                  {innerPrefix}
                  {input}
                  {innerSuffix}
                </div>
              ) : (
                input
              );
            }}
          </FieldBox>
        </BaseNumberField.Root>
      )}
    </Field>
  );
}
