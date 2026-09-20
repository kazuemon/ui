'use client';

import { useCallback, useRef } from 'react';

// 続きの印が最も濃くなるまでのスクロールの量（px）。Select と同じ — adr/0037
const CUE_RAMP = 24;

// スクロールする中身の上下に続きがあるかを、親（面）の --cue-top・--cue-bottom（0〜1）に書く（SheetMoreCue が読む）
// スクロールできるか（中身が枠より長いか）は --cue-scrollable（1 か 0）
// スクロールした量に合わせて濃くし、急に出さない。影はスクロールバーの手前で止める（--cue-right）
// 返す ref をスクロールする要素に付ける。大きさが変わったときとスクロールしたときに書き直す
export function useMoreCues() {
  const observer = useRef<ResizeObserver | null>(null);
  return useCallback((scroller: HTMLElement | null) => {
    observer.current?.disconnect();
    observer.current = null;
    if (!scroller) return;
    const update = () => {
      const surface = scroller.parentElement;
      if (!surface) return;
      const rest = Math.max(0, scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight);
      surface.style.setProperty('--cue-top', String(Math.min(1, scroller.scrollTop / CUE_RAMP)));
      surface.style.setProperty('--cue-bottom', String(Math.min(1, rest / CUE_RAMP)));
      const scrollable = scroller.scrollHeight > scroller.clientHeight + 1;
      surface.style.setProperty('--cue-scrollable', scrollable ? '1' : '0');
      const scrollbar = scroller.offsetWidth - scroller.clientWidth;
      surface.style.setProperty('--cue-right', `${scrollbar}px`);
    };
    update();
    scroller.addEventListener('scroll', update, { passive: true });
    // ResizeObserver の中で書くと、同じ描画の中でもう一度大きさが変わったとみなされることがあるので、次の描画に回す
    observer.current = new ResizeObserver(() => requestAnimationFrame(update));
    observer.current.observe(scroller);
    // 開く途中で面の高さが決まることがあるので、面の大きさの変化でも測り直す
    if (scroller.parentElement) observer.current.observe(scroller.parentElement);
    requestAnimationFrame(update);
    for (const child of scroller.children) observer.current.observe(child);
  }, []);
}
