import { Field as BaseField } from '@base-ui/react/field';
import type { ComponentProps, ReactNode } from 'react';

import { Field } from './Field';
import { controlBox } from './field-styles';

export interface TextFieldProps extends Omit<
  ComponentProps<typeof BaseField.Control>,
  'className' | 'render'
> {
  label: ReactNode;
  caption?: ReactNode;
  error?: ReactNode;
  className?: string;
}

/**
 * 1行のテキスト入力
 */
export function TextField({
  label,
  caption,
  error,
  disabled,
  className,
  ...props
}: TextFieldProps) {
  return (
    <Field label={label} caption={caption} error={error} disabled={disabled} className={className}>
      {/* 余白は input 側に持たせ、欄のどこを押しても入力できるようにする */}
      <div data-slot="control" className={controlBox({ className: 'px-0' })}>
        <BaseField.Control
          className="h-full w-full min-w-0 bg-transparent px-[calc(var(--space-control-x)-var(--field-border-width))] outline-none placeholder:text-fg-subtle disabled:cursor-not-allowed"
          disabled={disabled}
          {...props}
        />
      </div>
    </Field>
  );
}
