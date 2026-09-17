import { type RefObject, useEffect, useState } from 'react';

/**
 * 要素が横にはみ出しているか（中身の幅が見えている幅より広いか）を返す。幅が変わるたびに測り直す
 */
export function useScrollable(ref: RefObject<HTMLElement | null>) {
  const [scrollable, setScrollable] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    const measure = () => setScrollable(element.scrollWidth > element.clientWidth + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    // 中身（表）の幅が変わっても測る
    for (const child of element.children) observer.observe(child);
    return () => observer.disconnect();
  }, [ref]);
  return scrollable;
}
