import { Field as BaseField } from '@base-ui/react/field';
import type { ComponentProps, ReactNode } from 'react';

import { Field } from './Field';
import { FieldAddon } from './FieldAddon';
import { type AddonShape, FieldAddonDisabled } from './field-addon-context';
import { controlBox } from './field-styles';

// 文字はグレーのラベルで包み、要素（FieldAddonButton など）はそのまま置く
function renderAddon(node: ReactNode) {
  if (node == null || node === false) return null;
  return typeof node === 'string' || typeof node === 'number' ? (
    <FieldAddon>{node}</FieldAddon>
  ) : (
    node
  );
}

export interface TextFieldProps extends Omit<
  ComponentProps<typeof BaseField.Control>,
  'className' | 'render' | 'prefix'
> {
  label: ReactNode;
  caption?: ReactNode;
  error?: ReactNode;
  className?: string;
  /** 入力欄の前に付くもの。文字を渡すとグレーのラベルになる。ボタンは FieldAddonButton を渡す */
  prefix?: ReactNode;
  /** 入力欄の後ろに付くもの。文字を渡すとグレーのラベルになる。ボタンは FieldAddonButton を渡す */
  suffix?: ReactNode;
  /** prefix・suffix の形。既定は attached（本体の端に接する）、floating は本体の内側に浮かせる */
  addonShape?: AddonShape;
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
  prefix,
  suffix,
  addonShape = 'attached',
  ...props
}: TextFieldProps) {
  return (
    <Field label={label} caption={caption} error={error} disabled={disabled} className={className}>
      {/* 余白は input 側に持たせ、欄のどこを押しても入力できるようにする（prefix・suffix の文字を押しても入力できる） */}
      <div
        data-slot="control"
        data-addon-shape={addonShape}
        className={controlBox({ className: 'gap-0 px-0' })}
        onMouseDown={(event) => {
          if (
            event.target instanceof Element &&
            event.target.closest('[data-slot="field-addon"]')
          ) {
            event.preventDefault();
            event.currentTarget.querySelector('input')?.focus();
          }
        }}
      >
        <FieldAddonDisabled value={!!disabled}>
          {renderAddon(prefix)}
          <BaseField.Control
            className="h-full w-full min-w-0 bg-transparent px-[calc(var(--space-control-x)-var(--field-border-width))] outline-none placeholder:text-fg-subtle disabled:cursor-not-allowed"
            disabled={disabled}
            {...props}
          />
          {renderAddon(suffix)}
        </FieldAddonDisabled>
      </div>
    </Field>
  );
}
