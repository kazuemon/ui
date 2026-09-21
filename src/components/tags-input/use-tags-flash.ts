'use client';

import { useEffect, useRef, useState } from 'react';

import type { TagsInputRejectReason } from './tags-input-commit';

// 弾いたことを一瞬だけ見せる状態（軸 261）。すでにあるチップを強調したり、欄を揺らしたりする合図
// 見せる長さは --tags-input-flash-duration（design/tokens.css）。JS と CSS で別々に持つとずれるので、
// 欄の計算済みの値を読んで、その長さで消す

const FALLBACK_DURATION = 900;

/** --tags-input-flash-duration を ms で読む。読めないときは既定の長さ */
function flashDuration(element: HTMLElement | null): number {
  if (!element) return FALLBACK_DURATION;
  const raw = getComputedStyle(element).getPropertyValue('--tags-input-flash-duration').trim();
  const value = Number.parseFloat(raw);
  if (!Number.isFinite(value) || value <= 0) return FALLBACK_DURATION;
  return raw.endsWith('ms') ? value : value * 1000;
}

export interface TagsFlash {
  tag: string;
  reason: TagsInputRejectReason;
}

/**
 * 弾いた合図を出す。`fire` を呼ぶと合図が立ち、決めた長さで消える
 * 続けて弾いたときは、いったん消してから立て直す（CSS の動きを頭から出し直すため）
 */
export function useTagsFlash(elementRef: { current: HTMLElement | null }) {
  const [flash, setFlash] = useState<TagsFlash | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const frame = useRef<number | undefined>(undefined);
  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
      cancelAnimationFrame(frame.current ?? 0);
    },
    []
  );
  const fire = (next: TagsFlash) => {
    window.clearTimeout(timer.current);
    cancelAnimationFrame(frame.current ?? 0);
    setFlash(null);
    frame.current = requestAnimationFrame(() => {
      setFlash(next);
      timer.current = window.setTimeout(() => setFlash(null), flashDuration(elementRef.current));
    });
  };
  return { flash, fire };
}
