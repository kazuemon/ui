'use client';

import { useEffect, useRef, useState } from 'react';

// 幕を出すかどうかの時間の決まり。
//   delay: loading になってから幕を出すまでの待ち。そのあいだに終われば、幕は出ない（一瞬で終わる読み込みでちらつかない）
//   minDuration: 一度出した幕を、少なくともこの長さは出しておく（出てすぐ消えて、ちらつかない）
// shown は「幕が出ているべきか」。mounted は、消える動きが終わるまで DOM に残すため

export function useLoadingOverlay(loading: boolean, delay: number, minDuration: number) {
  const [shown, setShown] = useState(false);
  const [mounted, setMounted] = useState(false);
  const shownAt = useRef(0);

  useEffect(() => {
    if (loading) {
      if (shown) return undefined;
      const timer = setTimeout(() => {
        shownAt.current = performance.now();
        setShown(true);
        setMounted(true);
      }, delay);
      return () => clearTimeout(timer);
    }
    if (!shown) return undefined;
    const remaining = Math.max(0, minDuration - (performance.now() - shownAt.current));
    const timer = setTimeout(() => setShown(false), remaining);
    return () => clearTimeout(timer);
  }, [loading, shown, delay, minDuration]);

  return { shown, mounted, unmount: () => setMounted(false) };
}
