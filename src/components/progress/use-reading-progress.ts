'use client';

import { useEffect, useState } from 'react';

// 記事の読了のバーの見本（ストーリー）が使う。部品ではなく、公開の入口には足さない

/** スクロールする枠の、読んだ割合（0〜100）。枠の要素を渡す関数（ref に渡す）と、いまの割合を返す */
export function useReadingProgress() {
  const [frame, setFrame] = useState<HTMLElement | null>(null);
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!frame) return undefined;
    const update = () => {
      const range = frame.scrollHeight - frame.clientHeight;
      setValue(range > 0 ? (frame.scrollTop / range) * 100 : 100);
    };
    update();
    frame.addEventListener('scroll', update, { passive: true });
    return () => frame.removeEventListener('scroll', update);
  }, [frame]);
  return { setFrame, value };
}
