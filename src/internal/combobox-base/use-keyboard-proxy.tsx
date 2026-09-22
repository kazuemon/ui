'use client';

import { useRef } from 'react';

// ソフトウェアキーボードを開く操作の中で出すための、見えない打つ欄（ADR-0221）
// スマホのブラウザは、ユーザーの操作の中で同期的に当たったフォーカスにだけキーボードを出す。
// 押した瞬間にここへフォーカスを当てておき、シートが開いたら本物の打つ欄へ移す（キーボードは出たままになる）
// 打つ欄をシートの中に移す Combobox・Autocomplete・TagsInput が共有する

/**
 * 見えない打つ欄と、それにフォーカスを当てる関数を返す
 * @param active 出すか（focusInputOnOpen）。false では欄を置かない
 */
export function useKeyboardProxy(active: boolean) {
  const ref = useRef<HTMLInputElement>(null);
  // 見えない打つ欄を、押した欄の位置に合わせて、フォーカスを当てる（押した操作の中で、同期的に行う）
  const focusProxy = (trigger: HTMLElement) => {
    const proxy = ref.current;
    if (!proxy) return;
    const rect = trigger.getBoundingClientRect();
    proxy.style.top = `${rect.top}px`;
    proxy.style.left = `${rect.left}px`;
    proxy.style.width = `${rect.width}px`;
    proxy.style.height = `${rect.height}px`;
    proxy.focus({ preventScroll: true });
  };
  const proxy = active ? (
    <input
      ref={ref}
      aria-hidden
      tabIndex={-1}
      autoComplete="off"
      data-slot="combobox-keyboard-proxy"
      // 押した欄の真上に重ねる（画面の隅に置くと、フォーカスでブラウザが見えている範囲をそこへずらす）
      // 欄を包む位置指定の箱は作らない（作ると、container に出した面より手前に描かれる）。見えない fixed の要素だけを置く
      className="pointer-events-none fixed opacity-0"
      style={{ fontSize: 16, caretColor: 'transparent' }}
    />
  ) : null;
  return { focusProxy, proxy };
}
