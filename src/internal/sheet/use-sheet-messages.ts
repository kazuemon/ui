'use client';

import { type ReactNode, useId } from 'react';

import type { SheetMessage } from './SheetFieldTitle';

/**
 * 欄のシート（Select・Combobox・Autocomplete・TagsInput）の見出しに出す欄の文と、その id
 * 本体の下の行と同じ文を、エラー → 警告の順に並べる（両方渡したときは両方）。
 * listDescribedBy は、シートの選択肢の一覧の説明（ヘルプテキスト → エラー → 警告）
 */
export function useSheetMessages({
  error,
  warning,
  caption,
}: {
  error: ReactNode;
  warning: ReactNode;
  caption: ReactNode;
}) {
  const id = useId();
  const captionId = `${id}caption`;
  const messages: SheetMessage[] = [];
  if (error) messages.push({ kind: 'error', content: error, id: `${id}error` });
  if (warning) messages.push({ kind: 'warning', content: warning, id: `${id}warning` });
  const listDescribedBy =
    [caption && captionId, ...messages.map((message) => message.id)].filter(Boolean).join(' ') ||
    undefined;
  return { id, captionId, messages, listDescribedBy };
}
