import { type RefObject, useLayoutEffect, useState } from 'react';

import { type AffixPosition, isStuck } from './stuck';

/**
 * Affix が留まっているかを返す。スクロール（どの枠でも拾えるよう capture で聞く）と画面の大きさの変化で、
 * 1 フレームに 1 回だけ読み直す
 */
export function useStuck(ref: RefObject<HTMLElement | null>, position: AffixPosition): boolean {
  const [stuck, setStuck] = useState(false);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    let frame = 0;
    const read = () => {
      frame = 0;
      setStuck(isStuck(element, position));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    read();
    const observer = new ResizeObserver(schedule);
    // 自分と、包む要素（留まれる範囲）の大きさが変わったとき。文字の読み込みで記事の高さが変わる
    observer.observe(element);
    if (element.parentElement) observer.observe(element.parentElement);
    document.addEventListener('scroll', schedule, { capture: true, passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener('scroll', schedule, { capture: true });
      window.removeEventListener('resize', schedule);
    };
  }, [ref, position]);
  return stuck;
}
