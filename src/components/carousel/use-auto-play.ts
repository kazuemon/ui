'use client';

import {
  type FocusEvent,
  type PointerEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

// Carousel の自動の送り（autoPlay）。WAI-ARIA の Carousel パターン（自動で回るもの）にならう
//   止める手段を持つ（WCAG 2.2.2）: 止めるボタン（playing を切り替える）と、載せたとき・中にキーボードのフォーカスがあるあいだの一時停止
//     マウスで押したボタンに残るフォーカス（:focus-visible でないもの）では止めない。再生を押したのに、離れるまで動かないことがないように
//     ボタンで止めたら、載せ終わっても・フォーカスが外れても、もう一度押すまで動かない
//     始めるボタンを押したら、載せたまま・フォーカスがあるままでも送りはじめる
//   動きを減らす設定では、止めた状態で始める（Video の autoPlay と同じ — ADR-0307）。押せば送りはじめる（滑らせずに送る）
//   ページが隠れているあいだ（別のタブ）も止める
//   送ったら（手で送ったときも）、間を数え直す

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export interface AutoPlayOptions {
  /** 自動で送るか（autoPlay） */
  enabled: boolean;
  /** 送る間（ミリ秒） */
  interval: number;
  /** いまの位置。変わったら間を数え直す */
  position: number;
  /** 次へ送る */
  onTick: () => void;
}

export interface AutoPlay {
  /** 使う人が送りを止めていないか（ボタンの見た目と名前） */
  playing: boolean;
  /** いま送っているか（一時停止も含めて止まっていない）。読み上げの知らせを黙らせるのに使う */
  running: boolean;
  toggle: () => void;
  /** 根の要素に付ける。載せたとき・中にフォーカスがあるあいだ止める */
  rootProps: {
    onPointerEnter: (event: PointerEvent<HTMLElement>) => void;
    onPointerLeave: (event: PointerEvent<HTMLElement>) => void;
    onFocus: (event: FocusEvent<HTMLElement>) => void;
    onBlur: (event: FocusEvent<HTMLElement>) => void;
  };
}

export function useAutoPlay({ enabled, interval, position, onTick }: AutoPlayOptions): AutoPlay {
  const [playing, setPlaying] = useState(enabled);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const onTickRef = useRef(onTick);
  useIsomorphicLayoutEffect(() => {
    onTickRef.current = onTick;
  });

  // 動きを減らす設定では、止めた状態で始める。autoPlay を付け外ししたときも、はじめの状態に戻す
  useIsomorphicLayoutEffect(() => {
    setPlaying(enabled && !reducedMotion());
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return undefined;
    const update = () => setHidden(document.visibilityState === 'hidden');
    update();
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, [enabled]);

  const running = enabled && playing && !hovered && !focused && !hidden;

  useEffect(() => {
    if (!running) return undefined;
    const timer = window.setTimeout(() => onTickRef.current(), interval);
    return () => window.clearTimeout(timer);
  }, [running, interval, position]);

  return {
    playing: enabled && playing,
    running,
    // 始めるボタンを押したら、載せたまま・中にフォーカスがあるままでもすぐ送りはじめる（押したのに動かない、を避ける）
    //   次に載せ直す・フォーカスし直すと、また止まる
    toggle: () => {
      if (!playing) {
        setHovered(false);
        setFocused(false);
      }
      setPlaying(!playing);
    },
    rootProps: {
      // 指で触れたときは載せたことにしない（離したあとも止まったままになるため）
      onPointerEnter: (event) => {
        if (event.pointerType === 'mouse') setHovered(true);
      },
      onPointerLeave: (event) => {
        if (event.pointerType === 'mouse') setHovered(false);
      },
      onFocus: (event) => {
        if ((event.target as Element).matches(':focus-visible')) setFocused(true);
      },
      onBlur: (event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
      },
    },
  };
}
