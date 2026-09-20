'use client';

import { useCallback, useSyncExternalStore } from 'react';

// ソフトウェアキーボードが画面の下から隠している高さ（px）
// キーボードが出ても、画面（layout viewport）の高さは変わらないことがある（iOS の Safari・Chrome）。
// 画面の下に固定したシートは、そのままではキーボードの下に隠れるので、隠れている分だけ持ち上げる
// 見えている範囲は visualViewport が持つ（高さと、画面の上からのずれ）

const noop = () => {};

// これより小さい縮みは、キーボードではなく、アドレスバーやナビゲーションバーの出入りとみなして 0 にする
// （ソフトウェアキーボードは、少なくとも画面の 3 割ほどを隠す）
const KEYBOARD_MIN = 120;

function subscribeViewport(onChange: () => void) {
  const viewport = window.visualViewport;
  if (!viewport) return noop;
  viewport.addEventListener('resize', onChange);
  viewport.addEventListener('scroll', onChange);
  return () => {
    viewport.removeEventListener('resize', onChange);
    viewport.removeEventListener('scroll', onChange);
  };
}

function readInset() {
  const viewport = window.visualViewport;
  if (!viewport) return 0;
  // 見えている範囲が縮んでいなければ、ずれ（offsetTop）は数えない
  if (window.innerHeight - viewport.height < KEYBOARD_MIN) return 0;
  return Math.max(0, Math.round(window.innerHeight - viewport.height - viewport.offsetTop));
}

/** シートを出しているあいだだけ、キーボードが隠している高さを見る */
export function useKeyboardInset(enabled: boolean) {
  const subscribe = useCallback(
    (onChange: () => void) => (enabled ? subscribeViewport(onChange) : noop),
    [enabled]
  );
  const getSnapshot = useCallback(() => (enabled ? readInset() : 0), [enabled]);
  return useSyncExternalStore(subscribe, getSnapshot, () => 0);
}

function readShrink() {
  const viewport = window.visualViewport;
  if (!viewport) return 0;
  const shrink = window.innerHeight - viewport.height;
  return shrink < KEYBOARD_MIN ? 0 : Math.round(shrink);
}

/**
 * ソフトウェアキーボードなどで、見えている範囲が画面の高さからどれだけ縮んだか（px）
 * 画面の下に固定したシートの高さは、これを引いた高さで数える。
 * useKeyboardInset との違い: 見えている範囲が画面の上からずれている分（offsetTop）を引かない。
 * Android の Chrome は、打つ欄を見せるために見えている範囲だけを下へずらすので、ずれ分を引くとシートが上へ突き抜ける
 */
export function useKeyboardShrink(enabled: boolean) {
  const subscribe = useCallback(
    (onChange: () => void) => (enabled ? subscribeViewport(onChange) : noop),
    [enabled]
  );
  const getSnapshot = useCallback(() => (enabled ? readShrink() : 0), [enabled]);
  return useSyncExternalStore(subscribe, getSnapshot, () => 0);
}
