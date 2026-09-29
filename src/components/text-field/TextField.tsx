'use client';

import { Field as BaseField } from '@base-ui/react/field';
import type { ComponentProps } from 'react';

import { Field, useFieldState } from '../../internal/field/Field';
import { FieldBox, fieldInset } from '../../internal/field/FieldBox';
import {
  type FieldNamed,
  type InputFieldProps,
  splitFieldProps,
} from '../../internal/field/input-field-props';
import { cn } from '../../internal/tv';

/** TextField の本体（TextFieldControl）の props。ラベル・キャプション・状態の文は、包む Field に渡します */
export interface TextFieldControlProps
  extends
    Omit<
      ComponentProps<'input'>,
      'className' | 'prefix' | 'value' | 'defaultValue' | 'disabled' | 'required' | 'name'
    >,
    Pick<
      InputFieldProps,
      'placeholder' | 'prefix' | 'suffix' | 'addonShape' | 'loadingIndicator' | 'hideSuccessMark'
    > {
  /** 値（制御） */
  value?: string;
  /** はじめの値（非制御） */
  defaultValue?: string;
  /** 値が変わるときに、次の値を渡して呼びます */
  onValueChange?: (value: string) => void;
  /** 中の input に渡すもの（class・data-*・autoComplete など） */
  inputProps?: ComponentProps<'input'>;
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
  onValueChange,
  inputProps,
  className,
  'aria-describedby': ariaDescribedBy,
  'aria-disabled': ariaDisabled,
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
  return (
    <FieldBox
      prefix={prefix}
      suffix={suffix}
      addonShape={addonShape}
      readOnly={readOnly}
      disabled={disabled}
      loading={loading}
      loadingIndicator={loadingIndicator}
      success={field?.messages.success}
      successMark={!hideSuccessMark}
      error={field?.messages.error}
      describedBy={ariaDescribedBy}
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
          aria-busy={loading || ariaBusy}
          {...restInputProps}
          {...props}
          // 説明のつながりは部品が決める（prefix・suffix・キャプション・下の行の順）
          aria-describedby={describedBy}
          onValueChange={onValueChange && ((value) => onValueChange(value))}
        />
      )}
    </FieldBox>
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
  return <Field {...field}>{() => <TextFieldControl {...control} />}</Field>;
}
