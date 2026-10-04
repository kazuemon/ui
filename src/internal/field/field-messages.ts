'use client';

import type { ReactNode } from 'react';

import type { MessageKind } from './Field';
import { withFieldsetErrors } from './fieldset-context';

/** 状態の行の種類の並び（重いものが上）。行を並べる順と、説明につなぐ順 */
export const messageKinds: MessageKind[] = ['error', 'warning', 'success', 'info'];

/** キャプションと状態の行の id。Field と、1 つだけ置く選択肢（Checkbox・Switch）で同じ形にする */
export function fieldMessageIds(id: string): { caption: string } & Record<MessageKind, string> {
  return {
    caption: `${id}caption`,
    error: `${id}error`,
    warning: `${id}warning`,
    success: `${id}success`,
    info: `${id}info`,
  };
}

/**
 * 本体の説明（aria-describedby）。見た目の順（利用者が足した説明 → キャプション → エラー → 警告 → 成功 → 情報）でつなぎ、
 * 出ている行の id だけを入れる。Fieldset のまとまりのエラーがあれば前に足す。警告・成功・情報もつなぐが、欄をエラーの状態にはしない
 */
export function fieldDescribedBy({
  fieldsetErrorIds,
  ariaDescribedBy,
  caption,
  messages,
  ids,
}: {
  fieldsetErrorIds: string | undefined;
  ariaDescribedBy?: string;
  caption: ReactNode;
  messages: Record<MessageKind, ReactNode>;
  ids: { caption: string } & Record<MessageKind, string>;
}): string | undefined {
  return withFieldsetErrors(
    fieldsetErrorIds,
    [
      ariaDescribedBy,
      caption && ids.caption,
      ...messageKinds.map((kind) => (messages[kind] ? ids[kind] : null)),
    ]
      .filter(Boolean)
      .join(' ') || undefined
  );
}
