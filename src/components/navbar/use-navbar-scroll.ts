'use client';

import { type RefObject, useEffect, useState } from 'react';

// 貼り付けた帯の、スクロールに応じた状態（stickyBehavior・stickyBackdrop）
//   scrolled: いちばん上から動いたか（transparent-until-scroll で、面を不透明にする）
//   hidden: 隠しているか（hide-on-scroll）
//   followOffset: スクロールの量だけ帯を押し上げ（--navbar-follow-offset）、止めたら近い方へ寄せて hidden を決める
//   帯の中にフォーカスがあるとき・メニューを開いているときは隠さない（止まったあとに寄せるときも確かめる）

/** 止まったとみなすまで（ms）。ここで近い方へ寄せる */
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
    // 帯の中にフォーカスがあるとき・メニューを開いているときは隠さない
    const pinned = () => !hideOnScroll || keepShown || root.contains(document.activeElement);
    const show = (scrolled: boolean) => {
      offset = 0;
      clearTimeout(settle);
      setState((prev) =>
        prev.scrolled === scrolled && !prev.hidden && prev.followOffset === null
          ? prev
          : { scrolled, hidden: false, followOffset: null }
      );
    };

    const update = () => {
      const top = scrollTop(target);
      const delta = top - last;
      last = top;
      const scrolled = top > 0;
      if (pinned()) {
        show(scrolled);
        return;
      }
      if (delta === 0) {
        setState((prev) => (prev.scrolled === scrolled ? prev : { ...prev, scrolled }));
        return;
      }
      // スクロールの量だけ押し上げる（帯の高さまで）。いちばん上では出したまま
      offset = Math.min(Math.max(offset + delta, 0), height());
      if (top <= 0) offset = 0;
      clearTimeout(settle);
      // 隠れきったら、隠した形（影まで押し上げる）にする。下へ送り続けても影が戻らないように
      const full = offset >= height() && top > height();
      setState((prev) =>
        full
          ? prev.hidden && prev.scrolled === scrolled && prev.followOffset === null
            ? prev
            : { scrolled, hidden: true, followOffset: null }
          : { scrolled, hidden: false, followOffset: offset }
      );
      if (full) return;
      // 止まったら、半分より隠れていれば隠し、そうでなければ出す（いちばん上の近くでは隠さない）
      settle = setTimeout(() => {
        if (pinned()) {
          show(scrollTop(target) > 0);
          return;
        }
        const hide = offset > height() / 2 && scrollTop(target) > height();
        offset = hide ? height() : 0;
        setState({ scrolled: scrollTop(target) > 0, hidden: hide, followOffset: null });
      }, SETTLE_MS);
    };
    update();
    target.addEventListener('scroll', update, { passive: true });
    // 帯の中にフォーカスが入ったら出す
    const onFocus = () => show(scrollTop(target) > 0);
    root.addEventListener('focusin', onFocus);
    return () => {
      target.removeEventListener('scroll', update);
      root.removeEventListener('focusin', onFocus);
      clearTimeout(settle);
    };
  }, [rootRef, watchTop, hideOnScroll, keepShown]);

  return state;
}
