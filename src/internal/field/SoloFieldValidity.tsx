'use client';

import { Field as BaseField } from '@base-ui/react/field';
import { type ReactNode, useContext } from 'react';

import {
  FieldMessageLine,
  type MessageKind,
  mergeBaseFieldError,
  useFormFieldErrors,
} from './Field';
import { fieldDescribedBy, type fieldMessageIds, messageKinds } from './field-messages';
import { FieldsetContext } from './fieldset-context';
import type { FieldMessage } from './input-field-props';
import { cn } from '../tv';

// 状態の行は、並びの最後の 4 行に置く（行は呼び出し側の格子で明示する）
const messageRows: Record<MessageKind, string> = {
  error: 'row-start-[-5]',
  warning: 'row-start-[-4]',
  success: 'row-start-[-3]',
  info: 'row-start-[-2]',
};

/**
 * 1 つだけ置く選択肢（Checkbox・Switch）の、状態の行と説明のつながり。Field を通らず、自分の BaseField.Root の中に置く
 * BaseField.Validity（公開 API）で、validate・Form の errors から Base UI が見つけたエラーを読み、errorText と同じ行に出す
 * （errorText があれば、そちらを優先）。説明（aria-describedby）も、ここで決まったエラーの有無を見て組み、children に渡す
 * children のあとに、エラー → 警告 → 成功 → 情報の行（入力欄と同じ）を置く
 */
export function SoloFieldValidity({
  ids,
  name,
  disabled,
  caption,
  errorText,
  warningText,
  successText,
  infoText,
  ariaDescribedBy,
  messageClassName,
  children,
}: {
  ids: ReturnType<typeof fieldMessageIds>;
  name: string | undefined;
  /** 押せない（Fieldset の押せない状態を含む）。押せないあいだは Base UI のエラーを出さない */
  disabled: boolean | undefined;
  caption: ReactNode;
  errorText?: FieldMessage;
  warningText?: FieldMessage;
  successText?: FieldMessage;
  infoText?: FieldMessage;
  ariaDescribedBy: string | undefined;
  /** 状態の行の箱の置き方（列・上の間）。行の位置はこの部品が足す */
  messageClassName: string;
  children: (describedBy: string | undefined) => ReactNode;
}) {
  const formErrors = useFormFieldErrors();
  const fieldsetErrorIds = useContext(FieldsetContext).errorIds;
  return (
    <BaseField.Validity>
      {(validity) => {
        const messages: Record<MessageKind, ReactNode> = {
          error: errorText ?? mergeBaseFieldError({ name, disabled, formErrors, validity }),
          warning: warningText,
          success: successText,
          info: infoText,
        };
        const describedBy = fieldDescribedBy({
          fieldsetErrorIds,
          ariaDescribedBy,
          caption,
          messages,
          ids,
        });
        return (
          <>
            {children(describedBy)}
            {messageKinds.map((kind) => (
              <FieldMessageLine
                key={kind}
                kind={kind}
                content={messages[kind]}
                id={ids[kind]}
                className={cn(messageClassName, messageRows[kind])}
              />
            ))}
          </>
        );
      }}
    </BaseField.Validity>
  );
}
