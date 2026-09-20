'use client';

import { useRef } from 'react';

// 開く前のスクロール位置を覚え、閉じたあとに元へ戻す（ADR-0221）
// ソフトウェアキーボードの出入りでブラウザがページをずらすので、シートの中に打つ欄を移す部品が使う

/** 開閉のたびに呼ぶ関数を返す。開くときに位置を覚え、閉じるときに戻す */
export function useScrollRestore() {
  const before = useRef<{ x: number; y: number } | null>(null);
  return (open: boolean) => {
    if (open) {
      const saved = { x: window.scrollX, y: window.scrollY };
      before.current = saved;
      // 見えない入力欄にフォーカスが当たると、ブラウザは、キーボードに隠れない位置までページをスクロールする。
      // シートは画面に固定されていて、ページの位置とは関係ないので、開いているあいだは元の位置へ戻し続ける
      for (const delay of [0, 100, 300, 600, 1000]) {
        window.setTimeout(() => {
          if (before.current === saved) {
            window.scrollTo({ left: saved.x, top: saved.y, behavior: 'instant' });
          }
        }, delay);
      }
    } else if (before.current) {
      const { x, y } = before.current;
      before.current = null;
      // キーボードが引っ込むあいだにも、ブラウザが位置を直すことがある。閉じた直後と、動きが落ち着いたあとの 2 回戻す
      const restore = () => window.scrollTo({ left: x, top: y, behavior: 'instant' });
      requestAnimationFrame(restore);
      window.setTimeout(restore, 400);
    }
  };
}
