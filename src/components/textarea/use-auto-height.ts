import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

// CSS の field-sizing: content（中身の高さに合わせる）に対応していないか。描いたあと（ブラウザの中）でだけ呼ぶ
function needsFallback() {
  return typeof CSS !== 'undefined' && !CSS.supports('field-sizing', 'content');
}

/**
 * textarea を中身の高さに合わせる。field-sizing: content に対応したブラウザでは CSS に任せ、何もしない
 * 対応していないブラウザでは、打ったとき・値が変わったとき・幅が変わったときに、高さを scrollHeight に合わせる
 * 返すのは、textarea に渡す ref と、打ったときに呼ぶ関数
 */
export function useAutoHeight() {
  const elementRef = useRef<HTMLTextAreaElement | null>(null);

  const fit = useCallback(() => {
    const element = elementRef.current;
    if (!element || !needsFallback()) return;
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  }, []);

  // 値（value）が外から変わったときも合わせる。描くたびに合わせる（対応しているブラウザでは何もしない）
  useLayoutEffect(fit);

  // 幅が変わると折り返しが変わるので、合わせ直す
  useEffect(() => {
    const element = elementRef.current;
    if (!element || !needsFallback()) return undefined;
    let width = element.clientWidth;
    const observer = new ResizeObserver(() => {
      if (element.clientWidth === width) return;
      width = element.clientWidth;
      fit();
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [fit]);

  const ref = useCallback((element: HTMLTextAreaElement | null) => {
    elementRef.current = element;
  }, []);

  return { ref, fit };
}
