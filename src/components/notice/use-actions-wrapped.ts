'use client';

import { type RefObject, useLayoutEffect, useState } from 'react';

/**
 * 文の列と操作を折り返せる横の並びで、操作が文の下の行へ回ったかを返す（actionsPlacement="end"）
 * 回ったかどうかは幅だけで決まる（上下の余白を差し替えても折り返しは変わらない）ので、並びと操作の大きさが変わったときに測り直す
 */
export function useActionsWrapped(
  enabled: boolean,
  textRef: RefObject<HTMLElement | null>,
  actionsRef: RefObject<HTMLElement | null>
) {
  const [wrapped, setWrapped] = useState(false);
  useLayoutEffect(() => {
    const text = textRef.current;
    const actions = actionsRef.current;
    if (!enabled || !text || !actions) {
      setWrapped(false);
      return undefined;
    }
    // 文の右に並んでいるときは、操作の上端が文の下端より上にある。上へのはみ出し（負の margin）は除いて比べる
    const measure = () => {
      const marginTop = Number.parseFloat(getComputedStyle(actions).marginTop) || 0;
      const top = actions.getBoundingClientRect().top - marginTop;
      setWrapped(top >= text.getBoundingClientRect().bottom - 1);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(text);
    observer.observe(actions);
    if (text.parentElement) observer.observe(text.parentElement);
    return () => observer.disconnect();
  }, [enabled, textRef, actionsRef]);
  return wrapped;
}
