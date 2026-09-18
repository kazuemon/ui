import { useCallback, useRef } from 'react';

// ストーリーで、ScrollArea のスクロールの位置を固定する（上の端・途中・下の端）。部品ではない
// 文字の読み込みなどで中身の大きさが変わっても、同じ位置に置き直す
export type ScrollPosition = 'start' | 'middle' | 'end';

export function useScrollPosition(position: ScrollPosition, axis: 'y' | 'x' = 'y') {
  const observer = useRef<ResizeObserver | null>(null);
  return useCallback(
    (viewport: HTMLDivElement | null) => {
      observer.current?.disconnect();
      observer.current = null;
      if (!viewport) return;
      const place = () => {
        const max =
          axis === 'y'
            ? viewport.scrollHeight - viewport.clientHeight
            : viewport.scrollWidth - viewport.clientWidth;
        const to = position === 'start' ? 0 : position === 'end' ? max : Math.round(max / 2);
        if (axis === 'y') viewport.scrollTop = to;
        else viewport.scrollLeft = to;
      };
      place();
      requestAnimationFrame(place);
      observer.current = new ResizeObserver(() => requestAnimationFrame(place));
      observer.current.observe(viewport);
      for (const child of viewport.children) observer.current.observe(child);
    },
    [position, axis]
  );
}
