import { type RefObject, useEffect, useState } from 'react';

// 横にはみ出しているか（スクロールできるか）の判定を 1 つにまとめる（表・複数行のコード・Prose の素の HTML で共通）
// スクロールできるものだけキーボードで止まるようにする（原則15: キーボードの振る舞いは働きに従う）。
// スクロールしないものに Tab で止まると、押しても何も起きない止まり場が増える
// 自分で描く包み（Table）は useScrollable の返り値で tabIndex を決め、
// 自分では描かない要素（Shiki が出す pre、Prose の中の素の table・pre）は useScrollTabStops が属性を付け外しする

/** 中身が見えている幅より広いか。小数の誤差で 1px はみ出して見えることがあるので、1px は許す */
export function isScrollableX(element: HTMLElement) {
  return element.scrollWidth > element.clientWidth + 1;
}

/**
 * 要素が横にはみ出しているか（中身の幅が見えている幅より広いか）を返す。幅が変わるたびに測り直す
 */
export function useScrollable(ref: RefObject<HTMLElement | null>) {
  const [scrollable, setScrollable] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    const measure = () => setScrollable(isScrollableX(element));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    // 中身（表）の幅が変わっても測る
    for (const child of element.children) observer.observe(child);
    return () => observer.disconnect();
  }, [ref]);
  return scrollable;
}

/**
 * 自分では描かない要素（Shiki が出す pre、Prose の中の素の table・pre）に、
 * 横にはみ出しているあいだだけ tabindex="0" を付ける。はみ出していないものからは外す
 *
 * root の中を selector で探し直すのは描くたび（中身が入れ替わると要素も入れ替わるため）。
 * onMeasure には、同じ測り直しのついでに見たいこと（横のスクロールバーが場所を取っているか）を渡せる
 */
export function useScrollTabStops(
  rootRef: RefObject<HTMLElement | null>,
  selector: string,
  onMeasure?: (element: HTMLElement) => void
) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const elements = Array.from(root.querySelectorAll<HTMLElement>(selector));
    if (elements.length === 0) return undefined;
    const measure = () => {
      for (const element of elements) {
        if (isScrollableX(element)) element.setAttribute('tabindex', '0');
        else element.removeAttribute('tabindex');
        onMeasure?.(element);
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    for (const element of elements) {
      observer.observe(element);
      // 中身（コード・表）の幅が変わっても測る
      for (const child of element.children) observer.observe(child);
    }
    return () => observer.disconnect();
  });
}
