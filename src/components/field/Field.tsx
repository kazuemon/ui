'use client';

import { Field as BaseField } from '@base-ui/react/field';
import type { ReactElement, ReactNode } from 'react';

import {
  Field as FieldRoot,
  FieldCaption,
  type FieldCaptionProps,
  FieldLabel,
  type FieldLabelProps,
  FieldMessages,
  type FieldMessagesProps,
  useFieldState,
} from '../../internal/field/Field';
import {
  type FieldNamed,
  type InputFieldProps,
  splitFieldProps,
} from '../../internal/field/input-field-props';

export { FieldCaption, FieldLabel, FieldMessages };
export type { FieldCaptionProps, FieldLabelProps, FieldMessagesProps };

type FieldBaseProps = Omit<
  InputFieldProps,
  | 'placeholder'
  | 'prefix'
  | 'suffix'
  | 'addonShape'
  | 'loadingIndicator'
  | 'hideSuccessMark'
  | 'captionPlacement'
> & {
  /** 部位（FieldLabel・FieldCaption・FieldMessages）と本体（TextFieldControl・FieldControl など）を並べます */
  children: ReactNode;
  /**
   * errorText がなくても、欄をエラーの状態（赤い枠線・aria-invalid）にします。エラーの行は出しません。
   * 文字数の上限を超えたときのように、行は本体の側で出すときに使います
   */
  invalid?: boolean;
};

/** Field の props。label か accessibleName のどちらかが要ります */
export type FieldProps = FieldNamed<FieldBaseProps>;

/**
 * 入力欄を組み立てる外枠。ラベル・キャプション・状態の文と、欄の状態（押せない・待っている・エラー）を持ち、
 * 中の部位と本体に渡します。並べ方は自由ですが、読み上げの説明の順は ラベル → キャプション → 状態の行 のままです
 * ふだんは TextField などの入力欄をそのまま使い、並べ方を変えたいとき・ライブラリにない本体を入れたいときに使います
 */
export function Field({ children, ...props }: FieldProps) {
  const [field, { invalid }] = splitFieldProps(props as FieldBaseProps);
  return (
    <FieldRoot {...field} invalid={invalid}>
      {children}
    </FieldRoot>
  );
}

export interface FieldControlProps {
  /**
   * 本体にする要素。input か、input と同じ props（id・value・onChange・disabled・aria-*）を受ける部品を渡します
   * id・name・aria-describedby・aria-invalid・disabled は Field が付けます
   */
  render: ReactElement;
  className?: string;
  children?: ReactNode;
}

/**
 * ライブラリにない本体を Field につなぎます。ラベルとの結び付き（id）、説明のつながり（aria-describedby）、
 * エラーの状態（aria-invalid）、押せない状態を、渡した要素に付けます
 */
export function FieldControl({ render, className, children }: FieldControlProps) {
  const field = useFieldState();
  return (
    <BaseField.Control
      render={render}
      className={className}
      disabled={field?.disabled}
      aria-describedby={field?.describedBy}
      aria-required={field?.required || undefined}
    >
      {children}
    </BaseField.Control>
  );
}
