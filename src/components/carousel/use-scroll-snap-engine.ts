'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import type { CarouselEngine, CarouselEngineOptions } from './carousel-engine';

// scroll-snap で送る仕組み（Carousel の既定）。依存を足さず、ブラウザの横スクロールと scroll-snap に任せる
//   指・トラックパッド・ホイールでは、ブラウザがそのまま横にスクロールし、scroll-snap が 1 枚ずつ止める（scroll-snap-stop: always）
//   使う人がスクロールした位置から、止まる先にいちばん近い 1 枚を求めて onIndexChange で知らせる
//   index が変わったら（前へ・次へ・キーボード・Thumbnails・外からの value）、その 1 枚の位置へ scrollTo で送る
//     送っているあいだに途中の 1 枚を知らせると、index が途中へ戻って行き来するので、着くまで（または使う人が触るまで）知らせない
//   動きを減らす設定では、滑らせずにすぐ送る（原則14）。はじめの位置（defaultValue）も滑らせない
//   枠の幅が変わったら、いまの 1 枚の位置に置き直す
// 端でつながる（無限ループ）・自動で送る、は持たない

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

// スクロールが止まったとみなすまでの間（scrollend を持たないブラウザのため）
const SETTLE_MS = 150;

function slidesOf(viewport: HTMLElement) {
  return Array.from(
    viewport.querySelectorAll<HTMLElement>(
      ':scope > [data-slot="carousel-track"] > [data-slot="carousel-slide"]'
    )
  );
}

/** その 1 枚が止まる位置（scrollLeft）。scroll-snap-align の start・center・end に合わせ、スクロールできる範囲に収める */
function scrollLeftFor(viewport: HTMLElement, slide: HTMLElement) {
  const align = getComputedStyle(slide).scrollSnapAlign;
  let left = slide.offsetLeft;
  if (align.includes('center')) left += slide.offsetWidth / 2 - viewport.clientWidth / 2;
  else if (align.includes('end')) left += slide.offsetWidth - viewport.clientWidth;
  const max = viewport.scrollWidth - viewport.clientWidth;
  return Math.min(Math.max(left, 0), Math.max(max, 0));
}

/** いまの位置から、止まる先がいちばん近い 1 枚 */
function nearestIndex(viewport: HTMLElement) {
  const slides = slidesOf(viewport);
  let best = 0;
  let bestDistance = Infinity;
  slides.forEach((slide, i) => {
    const distance = Math.abs(scrollLeftFor(viewport, slide) - viewport.scrollLeft);
    if (distance < bestDistance - 0.5) {
      best = i;
      bestDistance = distance;
    }
  });
  return best;
}

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function useScrollSnapEngine({
  index,
  count,
  onIndexChange,
}: CarouselEngineOptions): CarouselEngine {
  const [viewport, setViewport] = useState<HTMLDivElement | null>(null);
  const bindViewport = useCallback((element: HTMLDivElement | null) => setViewport(element), []);
  // 送っている先。着くまで、途中の 1 枚を知らせない
  const target = useRef<number | null>(null);
  // 最後に知らせた（または受け取った）1 枚
  const reported = useRef(index);
  // はじめの位置に置いたか（はじめは滑らせない）
  const placed = useRef(false);
  // 知らせる先はいつも最新にする（描いたあとに差し替える）
  const onIndexChangeRef = useRef(onIndexChange);
  useIsomorphicLayoutEffect(() => {
    onIndexChangeRef.current = onIndexChange;
  });

  // index → 位置
  useIsomorphicLayoutEffect(() => {
    reported.current = index;
    if (!viewport) return;
    const slide = slidesOf(viewport)[index];
    if (!slide) return;
    const left = scrollLeftFor(viewport, slide);
    const first = !placed.current;
    placed.current = true;
    if (Math.abs(viewport.scrollLeft - left) < 1) {
      target.current = null;
      return;
    }
    // 指で動かしている途中に、止まる先が変わって知らせたとき。ブラウザの scroll-snap に任せ、動きを奪わない
    if (!first && target.current === null && nearestIndex(viewport) === index) return;
    target.current = index;
    viewport.scrollTo({ left, behavior: first || reducedMotion() ? 'instant' : 'smooth' });
  }, [index, viewport, count]);

  // 位置 → index
  //   知らせるのは、使う人が動かしたとき（指・ホイール・トラックパッド・キー・中の要素へのフォーカス）だけ。
  //   使う人が触っていないのに位置が変わったとき（レイアウトが変わって、ブラウザが前に止まっていた 1 枚へ止め直したときなど）は、
  //   いまの 1 枚の位置へ置き直す（重いときに、送った先から前の 1 枚へ戻ってしまうのを防ぐ）
  useEffect(() => {
    if (!viewport) return undefined;
    let frame = 0;
    let idle: number | undefined;
    // 使う人が動かしているか。指を置いているあいだは、止まったように見えても動かしている
    let userActive = false;
    let touching = false;
    const report = () => {
      const next = nearestIndex(viewport);
      if (next === reported.current) return;
      reported.current = next;
      onIndexChangeRef.current(next);
    };
    // いまの 1 枚の位置へ置き直す
    const realign = () => {
      const slide = slidesOf(viewport)[reported.current];
      if (!slide) return;
      const left = scrollLeftFor(viewport, slide);
      if (Math.abs(viewport.scrollLeft - left) >= 1)
        viewport.scrollTo({ left, behavior: 'instant' });
    };
    // スクロールが止まったとき。送っている先があれば、着いたかを確かめる。
    //   すぐ続けて送ると、ブラウザが前に止まっていた 1 枚へ止め直すことがあるので、着いていなければもう一度送る
    const settle = () => {
      if (touching) return;
      if (target.current !== null) {
        const slide = slidesOf(viewport)[target.current];
        const left = slide ? scrollLeftFor(viewport, slide) : viewport.scrollLeft;
        if (Math.abs(viewport.scrollLeft - left) >= 1) {
          viewport.scrollTo({ left, behavior: 'instant' });
          window.clearTimeout(idle);
          idle = window.setTimeout(settle, SETTLE_MS);
          return;
        }
        target.current = null;
        userActive = false;
        return;
      }
      if (userActive) report();
      else realign();
      userActive = false;
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      // 送っているあいだは知らせない（着いたかは、止まったときに確かめる）
      frame = requestAnimationFrame(() => {
        if (target.current === null && userActive) report();
      });
      window.clearTimeout(idle);
      idle = window.setTimeout(settle, SETTLE_MS);
    };
    // 使う人が触ったら、送っている途中でも、その動きを知らせる側に戻す
    const release = () => {
      target.current = null;
      userActive = true;
    };
    const touchStart = () => {
      release();
      touching = true;
    };
    const touchEnd = () => {
      touching = false;
      window.clearTimeout(idle);
      idle = window.setTimeout(settle, SETTLE_MS);
    };
    // 中の要素へのフォーカス（Tab で中のリンクへ移ると、ブラウザがその 1 枚まで送る）
    const interact = () => {
      userActive = true;
    };
    viewport.addEventListener('scroll', onScroll, { passive: true });
    viewport.addEventListener('scrollend', settle);
    viewport.addEventListener('pointerdown', release);
    viewport.addEventListener('wheel', release, { passive: true });
    viewport.addEventListener('touchstart', touchStart, { passive: true });
    viewport.addEventListener('touchend', touchEnd);
    viewport.addEventListener('touchcancel', touchEnd);
    viewport.addEventListener('focusin', interact);
    // 幅が変わったら、いまの 1 枚の位置に置き直す
    const observer = new ResizeObserver(() => {
      if (target.current === null && !userActive) realign();
    });
    observer.observe(viewport);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(idle);
      viewport.removeEventListener('scroll', onScroll);
      viewport.removeEventListener('scrollend', settle);
      viewport.removeEventListener('pointerdown', release);
      viewport.removeEventListener('wheel', release);
      viewport.removeEventListener('touchstart', touchStart);
      viewport.removeEventListener('touchend', touchEnd);
      viewport.removeEventListener('touchcancel', touchEnd);
      viewport.removeEventListener('focusin', interact);
      observer.disconnect();
    };
  }, [viewport]);

  return { mode: 'scroll', bindViewport };
}
