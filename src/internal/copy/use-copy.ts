'use client';

import { createContext, use, useCallback, useEffect, useRef, useState } from 'react';

/** コピーの結果。idle は押す前（または知らせが消えたあと） */
export type CopyState = 'idle' | 'copied' | 'failed';

/**
 * 押したあとの見た目に固定する（ストーリーと比較の見本用。公開しない）
 * 配った範囲の中では、useCopy の copied（'copied'）・failed（'failed'）がいつも true になる
 */
export const CopiedPreviewContext = createContext<CopyState>('idle');

/**
 * 文字列をクリップボードに写し、duration のあいだ結果（写せた・写せなかった）を持つ
 * 写せなかったとき（権限がない・安全でない接続）は failed になり、false を返す
 * CodeBlock のコピーのボタンと CopyButton が使う
 */
export function useCopy(duration: number) {
  const preview = use(CopiedPreviewContext);
  const [state, setState] = useState<CopyState>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const copy = useCallback(
    async (text: string) => {
      let ok = true;
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        ok = false;
      }
      clearTimeout(timer.current);
      // 写せなかったことも、写せたときと同じ長さだけ出す
      setState(ok ? 'copied' : 'failed');
      timer.current = setTimeout(() => setState('idle'), duration);
      return ok;
    },
    [duration]
  );
  return {
    copied: state === 'copied' || preview === 'copied',
    failed: state === 'failed' || preview === 'failed',
    copy,
  };
}
