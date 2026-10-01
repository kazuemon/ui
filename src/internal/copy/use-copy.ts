'use client';

import { createContext, use, useCallback, useEffect, useRef, useState } from 'react';

/** コピーの結果。idle は押す前（または知らせが消えたあと） */
export type CopyState = 'idle' | 'copied' | 'failed';

/**
 * 押したあとの見た目に固定する（ストーリーと比較の見本用。公開しない）
 * 配った範囲の中では、useCopy の copied（'copied'）・failed（'failed'）がいつも true になる
 */
export const CopiedPreviewContext = createContext<CopyState>('idle');

// 文字列か、あとで決まる文字列（Promise）をクリップボードに写す
//   Promise のときは、押した処理の中で（待つ前に）ClipboardItem に Promise のまま渡す。Safari は、押した処理から
//   await を挟んで呼んだ書き込みを、利用者の操作によるものと見なさず断るため。ClipboardItem がない環境では、待ってから写す
async function writeClipboard(source: string | Promise<string>) {
  if (typeof source === 'string') {
    await navigator.clipboard.writeText(source);
    return;
  }
  if (typeof ClipboardItem !== 'undefined' && typeof navigator.clipboard.write === 'function') {
    const blob = source.then((text) => new Blob([text], { type: 'text/plain' }));
    // write が blob の失敗より先に済んでも、作れなかったことを呼び出し元に伝える
    await Promise.all([
      navigator.clipboard.write([new ClipboardItem({ 'text/plain': blob })]),
      blob,
    ]);
    return;
  }
  await navigator.clipboard.writeText(await source);
}

/**
 * 文字列をクリップボードに写し、duration のあいだ結果（写せた・写せなかった）を持つ
 * Promise も受け、決まった文字列を写す（Promise が失敗したときは、写せなかったことにする）
 * 写せなかったとき（権限がない・安全でない接続）は failed になり、false を返す
 * CodeBlock のコピーのボタンと CopyButton が使う
 */
export function useCopy(duration: number) {
  const preview = use(CopiedPreviewContext);
  const [state, setState] = useState<CopyState>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const copy = useCallback(
    async (text: string | Promise<string>) => {
      let ok = true;
      try {
        await writeClipboard(text);
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
