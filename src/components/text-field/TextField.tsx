'use client';

import { Field as BaseField } from '@base-ui/react/field';
import type { ComponentProps } from 'react';

import { Field } from '../../internal/field/Field';
import { FieldBox, fieldInset } from '../../internal/field/FieldBox';
import type { InputFieldProps } from '../../internal/field/input-field-props';
import { useFormSubmittingLock } from '../../internal/form-context';
import { cn } from '../../internal/tv';

export interface TextFieldProps
  extends
    Omit<ComponentProps<'input'>, 'className' | 'prefix' | 'value' | 'defaultValue'>,
    InputFieldProps {
  /** 値（制御） */
  value?: string;
  /** はじめの値（非制御） */
  defaultValue?: string;
  /** 値が変わるときに、次の値を渡して呼びます */
  onValueChange?: (value: string) => void;
  /** 中の input に渡すもの（class・data-*・autoComplete など）。欄の外枠には className を使います */
  inputProps?: ComponentProps<'input'>;
}

/**
 * 1行のテキスト入力
 */
export function TextField({
  label,
  caption,
  captionPlacement,
  errorText,
  warningText,
  successText,
  hideSuccessMark = false,
  infoText,
  disabled,
  className,
  prefix,
  suffix,
  addonShape = 'attached',
  loading = false,
  loadingBehavior = 'non-blocking',
  loadingIndicator = 'spinner',
  readOnly,
  required,
  requiredMark,
  optionalMark,
  onValueChange,
  inputProps,
  name,
  validate,
  validationMode,
  validationDebounceTime,
  'aria-describedby': ariaDescribedBy,
  'aria-disabled': ariaDisabled,
  'aria-busy': ariaBusy,
  ...props
}: TextFieldProps) {
  // Form の送信中（後半の軸 38）。blocking では、値を確かめるときの止める形と同じ見た目にし、書き換えを止める
  const formLock = useFormSubmittingLock();
  // 止めているあいだは、Disabled と同じく書き換えられない。disabled 属性は付けないので、フォーカスは外れない
  const blocking = (loading && loadingBehavior === 'blocking') || formLock.blocking;
  const { className: inputClassName, ...restInputProps } = inputProps ?? {};
  return (
    <Field
      label={label}
      caption={caption}
      captionPlacement={captionPlacement}
      error={errorText}
      warning={warningText}
      success={successText}
      info={infoText}
      disabled={disabled}
      loading={loading}
      loadingBehavior={loadingBehavior}
      required={required}
      requiredMark={requiredMark}
      optionalMark={optionalMark}
      className={className}
      name={name}
      validate={validate}
      validationMode={validationMode}
      validationDebounceTime={validationDebounceTime}
    >
      {(messageIds) => (
        <FieldBox
          prefix={prefix}
          suffix={suffix}
          addonShape={addonShape}
          readOnly={readOnly}
          disabled={disabled}
          loading={loading}
          loadingIndicator={loadingIndicator}
          success={successText}
          successMark={!hideSuccessMark}
          error={errorText}
          describedBy={ariaDescribedBy}
          messageIds={messageIds}
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
              aria-required={required || undefined}
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
      )}
    </Field>
  );
}
