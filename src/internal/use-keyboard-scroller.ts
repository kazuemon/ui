'use client';

import { useCallback, useRef, useState } from 'react';

// スクロールする箱を、ブラウザのスクロールする箱と同じ条件で Tab の止まり先にする（Chrome の keyboard-focusable scrollers）
//   中身があふれていて、中に Tab で止まれるものがないときだけ止まる。止まれるものがあれば、そこへ進めばスクロールが付いてくる
//   開いた直後のフォーカスを変えない: Base UI の Dialog・Drawer は、開いた直後に面の中の最初の止まり先へフォーカスを移す。
//   ブラウザのスクロールする箱はその数に入らなかったので、フォーカスが動いたあと（来なければ少し待ったあと）から切り替える
// 返す ref をスクロールする要素に付け、stop が true のあいだ tabIndex を 0 にする

const TABBABLE =
  'a[href],button,input:not([type="hidden"]),select,textarea,summary,iframe,[tabindex],[contenteditable]:not([contenteditable="false"]),audio[controls],video[controls]';

/** フォーカスが来ないときに、切り替えを始めるまで待つ時間（ms） */
const ARM_DELAY = 500;

function hasTabbable(scroller: HTMLElement) {
  for (const element of scroller.querySelectorAll<HTMLElement>(TABBABLE)) {
    if (element.tabIndex < 0 || element.matches(':disabled')) continue;
    if (element.closest('[inert],[hidden]')) continue;
    if (element.getClientRects().length > 0) return true;
  }
  return false;
}

export function useKeyboardScroller(enabled: boolean) {
  const [stop, setStop] = useState(false);
  const cleanup = useRef<(() => void) | null>(null);
  const ref = useCallback(
    (scroller: HTMLElement | null) => {
      cleanup.current?.();
      cleanup.current = null;
      setStop(false);
      if (!enabled || !scroller) return;
      let armed = false;
      const update = () => {
        if (!armed) return;
        const overflowing =
          scroller.scrollHeight > scroller.clientHeight + 1 ||
          scroller.scrollWidth > scroller.clientWidth + 1;
        setStop(overflowing && !hasTabbable(scroller));
      };
      const arm = () => {
        if (armed) return;
        armed = true;
        update();
      };
      const doc = scroller.ownerDocument;
      doc.addEventListener('focusin', arm, { once: true });
      const timer = setTimeout(arm, ARM_DELAY);
      // 大きさが変わったとき（中身が伸びた・面の高さが変わった）と、中の要素が出入りしたときに測り直す
      const resize = new ResizeObserver(() => requestAnimationFrame(update));
      resize.observe(scroller);
      for (const child of scroller.children) resize.observe(child);
      const mutation = new MutationObserver(update);
      mutation.observe(scroller, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['disabled', 'tabindex', 'hidden', 'inert', 'href', 'contenteditable'],
      });
      cleanup.current = () => {
        doc.removeEventListener('focusin', arm);
        clearTimeout(timer);
        resize.disconnect();
        mutation.disconnect();
      };
    },
    [enabled]
  );
  return { ref, stop };
}
