import { Field as BaseField } from '@base-ui/react/field';
import type { ReactNode } from 'react';

import { fieldStyles } from './field-styles';

export interface FieldProps {
  /** 本体の上に置く太字のラベル */
  label: ReactNode;
  /** 本体の下に置く補足。省略してもレイアウトは崩れない */
  caption?: ReactNode;
  /** エラーの内容。渡すとエラーの状態になり、キャプションの代わりに表示する */
  error?: ReactNode;
  /** 押せない（Disabled）状態にする */
  disabled?: boolean;
  className?: string;
  children: ReactNode;
  /** ラベルを <label> で描くか。Select のように本体がボタンの部品では false にする */
  nativeLabel?: boolean;
}

/**
 * ラベル / 本体 / キャプションの3層（原則4）。フォーム部品の外枠
 */
export function Field({
  label,
  caption,
  error,
  disabled,
  className,
  children,
  nativeLabel = true,
}: FieldProps) {
  const styles = fieldStyles();
  return (
    <BaseField.Root
      invalid={error ? true : undefined}
      disabled={disabled}
      className={styles.root({ className })}
    >
      <BaseField.Label
        className={styles.label()}
        nativeLabel={nativeLabel}
        render={nativeLabel ? undefined : <div />}
      >
        {label}
      </BaseField.Label>
      {children}
      {error ? (
        <BaseField.Error match className={styles.error()}>
          {error}
        </BaseField.Error>
      ) : (
        caption && (
          <BaseField.Description className={styles.caption()}>{caption}</BaseField.Description>
        )
      )}
    </BaseField.Root>
  );
}
