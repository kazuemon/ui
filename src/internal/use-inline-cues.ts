'use client';

import { useCallback, useRef } from 'react';

import { cueStrength } from './cue-strength';

// 横にスクロールする中身の左右に続きがあるかを、親（ScrollArea の根）の --cue-x-start・--cue-x-end（0〜1）に書く
// 上下は useMoreCues（src/internal/sheet）が --cue-top・--cue-bottom に書く。これはその横の向きの分
// 返す ref をスクロールする要素に付ける。大きさが変わったときとスクロールしたときに書き直す
export function useInlineCues() {
  const observer = useRef<ResizeObserver | null>(null);
  return useCallback((scroller: HTMLElement | null) => {
    observer.current?.disconnect();
    observer.current = null;
    if (!scroller) return;
    const update = () => {
      const root = scroller.parentElement;
      if (!root) return;
      const start = Math.abs(scroller.scrollLeft);
      const rest = Math.max(0, scroller.scrollWidth - start - scroller.clientWidth);
      root.style.setProperty('--cue-x-start', cueStrength(start));
      root.style.setProperty('--cue-x-end', cueStrength(rest));
    };
    update();
    scroller.addEventListener('scroll', update, { passive: true });
    observer.current = new ResizeObserver(() => requestAnimationFrame(update));
    observer.current.observe(scroller);
    for (const child of scroller.children) observer.current.observe(child);
  }, []);
}
