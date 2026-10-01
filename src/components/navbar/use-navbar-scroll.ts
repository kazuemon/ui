'use client';

import { type RefObject, useEffect, useState } from 'react';

// 貼り付けた帯の、スクロールに応じた状態（stickyBehavior・stickyBackdrop）
//   scrolled: いちばん上から動いたか（transparent-until-scroll で、面を不透明にする）
//   hidden: 隠しているか（hide-on-scroll。下へスクロールしたら隠し、上へ戻したら出す）
//   follow: --navbar-hide-follow が 1 のときは、スクロールの量だけ帯を押し上げ（--navbar-follow-offset）、止めたら近い方へ寄せる
//   帯の中にフォーカスがあるとき・メニューを開いているときは隠さない

/** 止まったとみなすまで（ms）。スクロールの量に合わせて動かすとき、ここで近い方へ寄せる */
const SETTLE_MS = 150;

function scrollParent(element: HTMLElement): HTMLElement | Window {
  let node = element.parentElement;
  while (node && node !== document.body && node !== document.documentElement) {
    const { overflowY } = getComputedStyle(node);
    if (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') return node;
    node = node.parentElement;
  }
  return window;
}

function scrollTop(target: HTMLElement | Window) {
  return target instanceof Window ? target.scrollY : target.scrollTop;
}

export interface NavbarScrollState {
  scrolled: boolean;
  hidden: boolean;
  /** スクロールの量に合わせて押し上げている量（px）。合わせていないときは null */
  followOffset: number | null;
}

export function useNavbarScroll(
  rootRef: RefObject<HTMLElement | null>,
  {
    watchTop,
    hideOnScroll,
    keepShown,
  }: { watchTop: boolean; hideOnScroll: boolean; keepShown: boolean }
): NavbarScrollState {
  const [state, setState] = useState<NavbarScrollState>({
    scrolled: false,
    hidden: false,
    followOffset: null,
  });

  useEffect(() => {
    const root = rootRef.current;
    if (!root || (!watchTop && !hideOnScroll)) return undefined;
    const target = scrollParent(root);
    let last = scrollTop(target);
    let offset = 0;
    let settle: ReturnType<typeof setTimeout> | undefined;
    const height = () => root.offsetHeight;
    const follows = () =>
      getComputedStyle(root).getPropertyValue('--navbar-hide-follow').trim() === '1';

    const update = () => {
      const top = scrollTop(target);
      const delta = top - last;
      last = top;
      const scrolled = top > 0;
      if (!hideOnScroll || keepShown || root.contains(document.activeElement)) {
        offset = 0;
        setState({ scrolled, hidden: false, followOffset: null });
        return;
      }
      if (follows()) {
        // スクロールの量だけ押し上げる（帯の高さまで）。いちばん上の近くでは出したまま
        offset = Math.min(Math.max(offset + delta, 0), height());
        if (top <= 0) offset = 0;
        setState({ scrolled, hidden: false, followOffset: offset });
        clearTimeout(settle);
        settle = setTimeout(() => {
          const hide = offset > height() / 2 && scrollTop(target) > height();
          offset = hide ? height() : 0;
          setState({ scrolled: scrollTop(target) > 0, hidden: hide, followOffset: null });
        }, SETTLE_MS);
        return;
      }
      if (delta === 0) {
        setState((prev) => (prev.scrolled === scrolled ? prev : { ...prev, scrolled }));
        return;
      }
      // 下へ動いて、帯の高さより下にいれば隠す（いちばん上の近くでは隠さない）。上へ動いたら出す
      setState({ scrolled, hidden: delta > 0 ? top > height() : false, followOffset: null });
    };
    update();
    target.addEventListener('scroll', update, { passive: true });
    // 帯の中にフォーカスが入ったら出す
    const onFocus = () => setState((prev) => ({ ...prev, hidden: false, followOffset: null }));
    root.addEventListener('focusin', onFocus);
    return () => {
      target.removeEventListener('scroll', update);
      root.removeEventListener('focusin', onFocus);
      clearTimeout(settle);
    };
  }, [rootRef, watchTop, hideOnScroll, keepShown]);

  return state;
}
