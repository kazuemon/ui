'use client';

import { Field as BaseField } from '@base-ui/react/field';
import { type ComponentProps, useState } from 'react';

import { countGraphemes } from '../../internal/field/count-graphemes';
import { Field, useFieldState } from '../../internal/field/Field';
import { FieldBox, fieldInset } from '../../internal/field/FieldBox';
import { FieldClearButton } from '../../internal/field/FieldClearButton';
import { FieldCount } from '../../internal/field/FieldCount';
import { useFormReset } from '../../internal/field/use-form-reset';
import {
  type FieldCountProps,
  isOverCount,
  useFieldCount,
  useTypedCount,
} from '../../internal/field/use-field-count';
import {
  type FieldNamed,
  type InputFieldProps,
  splitFieldProps,
} from '../../internal/field/input-field-props';
import { warnOnce } from '../../internal/link-parts';
import { useMergedRefs } from '../../internal/use-merged-refs';
import { cn } from '../../internal/tv';

/** TextField の本体（TextFieldControl）の props。ラベル・キャプション・状態の文は、包む Field に渡します */
export interface TextFieldControlProps
  extends
    Omit<
      ComponentProps<'input'>,
      'className' | 'prefix' | 'value' | 'defaultValue' | 'disabled' | 'required' | 'name' | 'size'
    >,
    Pick<
      InputFieldProps,
      'placeholder' | 'prefix' | 'suffix' | 'addonShape' | 'loadingIndicator' | 'hideSuccessMark'
    >,
    FieldCountProps {
  /** 値（制御） */
  value?: string;
  /** はじめの値（非制御） */
  defaultValue?: string;
  /** 値が変わるときに、次の値を渡して呼びます */
  onValueChange?: (value: string) => void;
  /** 中の input に渡すもの（class・data-*・autoComplete など） */
  inputProps?: ComponentProps<'input'>;
  /**
   * 文字を消すボタン（×）を欄の右端に出すか。文字があるあいだだけ出し、読み取り専用の欄では出しません。
   * 押すと onValueChange('') で知らせ、欄にフォーカスを戻します。suffix と一緒には使えません（suffix があるときは出しません）
   * @default false
   */
  clearable?: boolean;
  /**
   * 消すボタンの読み上げの名前
   * @default '入力内容を消去'
   */
  clearName?: string;
  /** 本体（灰色の欄）に付くクラス */
  className?: string;
}

/**
 * 1 行のテキスト入力の本体（組み立て用）。Field の中に置き、ラベル・キャプション・状態の行は FieldLabel などで並べます。
 * 押せない・待っている・エラー・成功の状態と、説明のつながり（aria-describedby）は、包む Field から受け取ります
 */
export function TextFieldControl({
  prefix,
  suffix,
  addonShape = 'attached',
  loadingIndicator = 'spinner',
  hideSuccessMark = false,
  readOnly,
  value: valueProp,
  defaultValue,
  onValueChange,
  inputProps,
  maxCount,
  overCountInvalid = true,
  warnRemaining,
  showCount,
  clearable = false,
  clearName,
  className,
  'aria-describedby': ariaDescribedBy,
  'aria-disabled': ariaDisabled,
  'aria-invalid': ariaInvalid,
  'aria-busy': ariaBusy,
  ...props
}: TextFieldControlProps) {
  const field = useFieldState();
  const disabled = field?.disabled ?? false;
  const loading = field?.loading ?? false;
  // 止めているあいだは、Disabled と同じく書き換えられない。disabled 属性は付けないので、フォーカスは外れない
  // （loadingBehavior="blocking" で待っているとき、Form の送信中 — 後半の軸 38）
  const blocking = field?.blocking ?? false;
  const { className: inputClassName, ...restInputProps } = inputProps ?? {};
  // いまの文字。消すボタンと文字数が読む。値を渡されたときはその値、渡されないときは打った文字
  const [innerValue, setInnerValue] = useState(defaultValue ?? '');
  const value = valueProp ?? innerValue;
  const change = (next: string) => {
    if (valueProp === undefined) setInnerValue(next);
    onValueChange?.(next);
  };
  // 値を渡されないときは、form を戻したらはじめの値に戻す。消すボタン・文字数と、包む TextField の数え方も戻すよう、
  // onValueChange でも知らせる（ブラウザの reset は input の change を起こさない）
  const resetRef = useFormReset(() => change(defaultValue ?? ''), valueProp === undefined);
  const inputRef = useMergedRefs(restInputProps.ref, props.ref, resetRef);
  // 文字数（Textarea と同じ）。数えるのは見えている文字（書記素）
  const {
    over,
    describedBy: countDescribedBy,
    count,
  } = useFieldCount({
    length: countGraphemes(value),
    maxCount,
    maxLength: props.maxLength,
    warnRemaining,
    showCount,
  });
  if (clearable && suffix != null)
    warnOnce(
      'TextField の clearable は suffix と一緒には使えません。suffix があるときは消すボタンを出しません'
    );
  const clearButton =
    clearable && suffix == null ? (
      <FieldClearButton
        value={value}
        onClear={() => change('')}
        readOnly={readOnly}
        disabled={Boolean(field?.loading && field.loadingBehavior === 'blocking')}
        aria-label={clearName}
      />
    ) : null;
  const box = (
    <FieldBox
      prefix={prefix}
      suffix={clearButton ?? suffix}
      addonShape={addonShape}
      readOnly={readOnly}
      disabled={disabled}
      loading={loading}
      loadingIndicator={loadingIndicator}
      success={field?.messages.success}
      successMark={!hideSuccessMark}
      error={field?.messages.error}
      describedBy={[ariaDescribedBy, countDescribedBy].filter(Boolean).join(' ') || undefined}
      messageIds={field?.describedBy}
      className={className}
    >
      {(describedBy) => (
        <BaseField.Control
          className={cn(
            'h-full w-full min-w-0 bg-transparent outline-none placeholder:text-(color:--field-placeholder) disabled:cursor-not-allowed',
            fieldInset,
            blocking && 'cursor-progress',
            inputClassName
          )}
          disabled={disabled}
          // required はブラウザのネイティブな検証（送信を止め、ブラウザの文を出す）を起こすので渡さない
          // （design/adr/0255 の影響）。aria-required だけで必須であることを伝える
          required={false}
          aria-required={field?.required || undefined}
          readOnly={blocking || readOnly}
          aria-disabled={blocking || ariaDisabled}
          aria-invalid={(over && overCountInvalid) || ariaInvalid}
          aria-busy={loading || ariaBusy}
          {...restInputProps}
          {...props}
          // 消すボタンは値を空にするので、消せるときは値を部品が持つ
          {...(clearable ? { value } : { value: valueProp, defaultValue })}
          // 説明のつながりは部品が決める（prefix・suffix・文字数・キャプション・下の行の順）
          aria-describedby={describedBy}
          ref={inputRef}
          onValueChange={(next) => change(next)}
        />
      )}
    </FieldBox>
  );
  return (
    <>
      {box}
      <FieldCount {...count} />
    </>
  );
}

/** TextField の props から、label・accessibleName の組み合わせの決まりを外したもの。TextField を包む部品が継ぎます */
export type TextFieldBaseProps = Omit<TextFieldControlProps, 'className'> &
  InputFieldProps & {
    /** 中の input に渡すもの（class・data-*・autoComplete など）。欄の外枠には className を使います */
    inputProps?: ComponentProps<'input'>;
  };

/** TextField の props。label か accessibleName のどちらかが要ります */
export type TextFieldProps = FieldNamed<TextFieldBaseProps>;

/**
 * 1行のテキスト入力
 */
export function TextField(props: TextFieldProps) {
  const [field, control] = splitFieldProps(props);
  // 文字数の上限（maxCount）を超えたら、欄をエラーの状態にする（overCountInvalid。Textarea と同じ）
  const { length, onTyped } = useTypedCount(control.value, control.defaultValue);
  const over = isOverCount(length, control.maxCount);
  const { onValueChange } = control;
  return (
    <Field {...field} invalid={over && (control.overCountInvalid ?? true)}>
      {() => (
        <TextFieldControl
          {...control}
          onValueChange={(next) => {
            onTyped(next);
            onValueChange?.(next);
          }}
        />
      )}
    </Field>
  );
}
