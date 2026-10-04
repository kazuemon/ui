'use client';

import { NumberField as BaseNumberField } from '@base-ui/react/number-field';
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  type Ref,
  useContext,
  useId,
  useState,
} from 'react';

import { ArrowsHorizontalIcon } from '../../internal/icons';
import { SplitStepButton, StackedStepper, type StepperNames } from './NumberFieldStepper';
import { FieldAddon } from '../field-addon/FieldAddon';
import { Field, useFieldState } from '../../internal/field/Field';
import { FieldBox, fieldInset } from '../../internal/field/FieldBox';
import {
  type HalfWidthKind,
  type HalfWidthNoticeProps,
  halfWidthKind,
  useHalfWidthNotice,
} from '../../internal/half-width';
import {
  type FieldNamed,
  type InputFieldProps,
  splitFieldProps,
} from '../../internal/field/input-field-props';
import { cn } from '../../internal/tv';
import { useMergedRefs } from '../../internal/use-merged-refs';
import { useFormReset } from '../../internal/field/use-form-reset';

/** 増減ボタンの置き方。stacked: 右端に上下で縦積み、split: 左に −・右に ＋、none: ボタンなし */
export type NumberFieldStepper = 'stacked' | 'split' | 'none';

/**
 * 値が変わったわけ。input- は打った文字から、increment-press・decrement-press はボタン、
 * keyboard は ↑↓ キー、wheel はホイール、scrub はラベルを左右に動かしたとき、none はフォームを戻した（reset）ときなどです
 */
export type NumberFieldChangeReason =
  | 'input-change'
  | 'input-clear'
  | 'input-blur'
  | 'input-paste'
  | 'keyboard'
  | 'increment-press'
  | 'decrement-press'
  | 'wheel'
  | 'scrub'
  | 'none';

/** onValueChange で、次の値と一緒に渡すもの */
export interface NumberFieldValueDetails {
  /** 値が変わったわけ */
  reason: NumberFieldChangeReason;
}

/** NumberField の本体（NumberFieldControl）の props。ラベル・キャプション・状態の文は、包む Field に渡します */
export interface NumberFieldControlProps extends Pick<
  InputFieldProps,
  'placeholder' | 'prefix' | 'suffix' | 'addonShape' | 'loadingIndicator' | 'hideSuccessMark'
> {
  /** 値（制御）。空のときは null */
  value?: number | null;
  /** はじめの値（非制御） */
  defaultValue?: number;
  /** 値が変わるときに、次の値と、変わったわけを渡して呼びます。打っている途中でも、数として読めるたびに呼ばれます */
  onValueChange?: (value: number | null, details: NumberFieldValueDetails) => void;
  /** 値が決まったあと（フォーカスが外れた・ボタンを離した・キーで増減した）に呼びます */
  onValueCommitted?: (value: number | null) => void;
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
  stepperNames?: StepperNames;
  /** ボタン・キーで増減したとき、step の倍数にそろえるか */
  snapOnStep?: boolean;
  /** 打った値が min・max の外でも、そのまま残すか（フォームの検証で範囲外として知らせる） */
  allowOutOfRange?: boolean;
  /** 中の input の id */
  id?: string;
  /** 欄が属するフォームの id。フォームの外に置くときに使います */
  form?: string;
  /** 中の input への ref */
  ref?: Ref<HTMLInputElement>;
  /** 中の input に渡すもの（class・data-*・autoComplete など） */
  inputProps?: ComponentProps<'input'>;
  /** 読み取り専用。値は読めて写せますが、書き換えられません */
  readOnly?: boolean;
  /** 描いたあとに、欄へフォーカスを移します */
  autoFocus?: boolean;
  'aria-describedby'?: string;
  'aria-disabled'?: boolean | 'true' | 'false';
  'aria-busy'?: boolean | 'true' | 'false';
  /** 本体（灰色の欄）に付くクラス */
  className?: string;
}

const defaultStepperNames: StepperNames = { increment: '増やす', decrement: '減らす' };

/**
 * 数を入力する欄の本体（組み立て用）。Field の中に置き、ラベル・キャプション・状態の行は FieldLabel などで並べます。
 * 押せない・待っている・エラー・成功の状態と、説明のつながり（aria-describedby）は、包む Field から受け取ります。
 * scrub（ラベルを左右に動かして値を変える）は、Field の左上に置いたラベルに重ねるので、組み立てでは Field に className="relative" を付け、
 * FieldLabel を先頭に置きます。halfWidthNotice（全角を直したことの知らせ）は内蔵の形（NumberField）だけで出します
 */
export function NumberFieldControl({
  className,
  prefix,
  suffix,
  addonShape = 'attached',
  loadingIndicator = 'spinner',
  hideSuccessMark = false,
  readOnly,
  placeholder,
  stepper = 'split',
  scrub = stepper === 'none',
  allowWheelScrub = stepper === 'none',
  stepperNames = defaultStepperNames,
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
  id,
  form,
  ref,
  inputProps,
  autoFocus,
  'aria-describedby': ariaDescribedBy,
  'aria-disabled': ariaDisabled,
  'aria-busy': ariaBusy,
}: NumberFieldControlProps) {
  const field = useFieldState();
  const disabled = field?.disabled ?? false;
  const loading = field?.loading ?? false;
  const label = field?.label;
  const messageIds = field?.describedBy;
  const uid = useId();
  // 全角を半角に直したことの知らせ（内蔵の形で halfWidthNotice を渡したとき）。直すのは Base UI（フォーカスが外れたときに半角の形になる）なので、
  //   打った文字に全角の英数字が入っていたかだけを見る。値が空になったら知らせを消す
  const noticed = useContext(HalfWidthNoticedContext);
  // Form の送信中・blocking の待ちは、TextField と同じく書き換えを止める（フォーカスは外さない）
  const blocking = field?.blocking ?? false;
  const { className: _inputClassName, ref: inputPropsRef, ...inputPropsRest } = inputProps ?? {};
  // 値を渡されないときも、値はここで持つ（Base UI には制御で渡す）。form を戻したら（reset）はじめの値に戻し、
  //   onValueChange でも知らせる（ブラウザは input の文字だけを戻し、Base UI はそれを拾わない）
  const [innerValue, setInnerValue] = useState<number | null>(defaultValue ?? null);
  const resetRef = useFormReset(() => {
    const next = defaultValue ?? null;
    setInnerValue(next);
    noticed?.(null, true);
    onValueChange?.(next, { reason: 'none' });
  }, value === undefined);
  const inputRef = useMergedRefs(inputPropsRef, ref, resetRef);
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
      <SplitStepButton direction="decrement" label={stepperNames.decrement} locked={blocking} />
    );
    boxSuffix = showStepper && (
      <SplitStepButton direction="increment" label={stepperNames.increment} locked={blocking} />
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
        <StackedStepper names={stepperNames} locked={blocking} />
      </>
    );
  }
  const hasInlineText = split && (innerPrefix != null || innerSuffix != null);

  return (
    <BaseNumberField.Root
      id={id}
      form={form}
      value={value !== undefined ? value : innerValue}
      onValueChange={(next, details) => {
        if (value === undefined) setInnerValue(next);
        // 値が空になったら、全角を直したことの知らせも消す
        if (next === null) noticed?.(null, true);
        onValueChange?.(next, { reason: details.reason });
      }}
      onValueCommitted={onValueCommitted && ((next) => onValueCommitted(next))}
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
      // required はブラウザのネイティブな検証を起こすので渡さない（design/adr/0255 の影響）
      // 下の Input に aria-required を直に付けて、必須であることを伝える
      required={false}
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
        success={field?.messages.success}
        successMark={!hideSuccessMark}
        error={field?.messages.error}
        describedBy={[...ownDescribedBy, ariaDescribedBy].filter(Boolean).join(' ') || undefined}
        messageIds={messageIds}
        className={className}
      >
        {(describedBy) => {
          const input = (
            <BaseNumberField.Input
              placeholder={placeholder}
              autoFocus={autoFocus}
              aria-required={field?.required || undefined}
              aria-disabled={blocking || ariaDisabled}
              aria-busy={loading || ariaBusy}
              {...inputPropsRest}
              ref={inputRef}
              aria-describedby={describedBy}
              onChange={(event) => {
                const raw = event.currentTarget.value;
                noticed?.(halfWidthKind(raw), raw === '');
                inputProps?.onChange?.(event);
              }}
              // 値の文字の幅はそろえる（桁がそろい、増減で文字が揺れない）
              className={cn(
                'h-full min-w-0 bg-transparent tabular-nums outline-none placeholder:text-(color:--field-placeholder) disabled:cursor-not-allowed',
                split && 'text-center',
                hasInlineText ? 'max-w-full' : ['w-full', !split && fieldInset],
                blocking && 'cursor-progress',
                inputProps?.className
              )}
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
  );
}

// 内蔵の形（NumberField）が、全角を直したことの知らせを受け取る口。知らせは Field の情報の行に出す
const HalfWidthNoticedContext = createContext<
  ((kind: HalfWidthKind | null, empty: boolean) => void) | null
>(null);

/** NumberField の props から、label・accessibleName の組み合わせの決まりを外したもの */
export type NumberFieldBaseProps = Omit<NumberFieldControlProps, 'className'> &
  InputFieldProps &
  HalfWidthNoticeProps & {
    /** 中の input に渡すもの（class・data-*・autoComplete など）。欄の外枠には className を使います */
    inputProps?: ComponentProps<'input'>;
  };

/** NumberField の props。label か accessibleName のどちらかが要ります */
export type NumberFieldProps = FieldNamed<NumberFieldBaseProps>;

/**
 * 数を入力する欄。増減ボタン・↑↓ キーで増減し、表示の形（通貨・%・桁区切り）をそろえる
 */
export function NumberField(props: NumberFieldProps) {
  const [field, { halfWidthNotice = false, ...control }] = splitFieldProps(
    props as NumberFieldBaseProps
  );
  // 全角を半角に直したことの知らせ（既定は知らせない）。infoText を渡したときは、そちらを出す
  const { notice, noticed } = useHalfWidthNotice(halfWidthNotice);
  const scrub = control.scrub ?? control.stepper === 'none';
  return (
    <Field
      {...field}
      info={field.info ?? notice}
      className={[scrub && 'relative', field.className].filter(Boolean).join(' ') || undefined}
    >
      {() => (
        <HalfWidthNoticedContext value={noticed}>
          <NumberFieldControl {...control} />
        </HalfWidthNoticedContext>
      )}
    </Field>
  );
}
