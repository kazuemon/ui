import { Field as BaseField } from '@base-ui/react/field';
import type { ComponentProps } from 'react';

import { Field } from '../../internal/field/Field';
import { FieldBox, fieldInset } from '../../internal/field/FieldBox';
import type { InputFieldProps } from '../../internal/field/input-field-props';
import { useFormSubmittingLock } from '../../internal/form-context';

export interface TextFieldProps
  extends
    Omit<ComponentProps<typeof BaseField.Control>, 'className' | 'render' | 'prefix'>,
    InputFieldProps {}

/**
 * 1行のテキスト入力
 */
export function TextField({
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
  required,
  requiredMark,
  optionalMark,
  'aria-describedby': ariaDescribedBy,
  'aria-disabled': ariaDisabled,
  'aria-busy': ariaBusy,
  ...props
}: TextFieldProps) {
  // Form の送信中（後半の軸 38）。blocking では、値を確かめるときの止める形と同じ見た目にし、書き換えを止める
  const formLock = useFormSubmittingLock();
  // 止めているあいだは、Disabled と同じく書き換えられない。disabled 属性は付けないので、フォーカスは外れない
  const blocking = (loading && loadingBehavior === 'blocking') || formLock.blocking;
  return (
    <Field
      label={label}
      caption={caption}
      captionPlacement={captionPlacement}
      error={error}
      warning={warning}
      success={success}
      info={info}
      disabled={disabled}
      loading={loading}
      loadingBehavior={loadingBehavior}
      required={required}
      requiredMark={requiredMark}
      optionalMark={optionalMark}
      className={className}
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
          success={success}
          successMark={successMark}
          error={error}
          describedBy={ariaDescribedBy}
          messageIds={messageIds}
        >
          {(describedBy) => (
            <BaseField.Control
              className={[
                'h-full w-full min-w-0 bg-transparent outline-none placeholder:text-(color:--field-placeholder) disabled:cursor-not-allowed',
                fieldInset,
                blocking && 'cursor-progress',
              ]
                .filter(Boolean)
                .join(' ')}
              disabled={disabled}
              required={required}
              readOnly={blocking || readOnly}
              aria-disabled={blocking || ariaDisabled}
              aria-busy={loading || ariaBusy}
              aria-describedby={describedBy}
              {...props}
            />
          )}
        </FieldBox>
      )}
    </Field>
  );
}
