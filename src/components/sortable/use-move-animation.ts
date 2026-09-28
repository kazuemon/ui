'use client';

import { type RefObject, useCallback, useLayoutEffect, useRef } from 'react';

/**
 * キーボードで並べ替えた項目を、元の位置から滑らせる（原則14: 場所をまっすぐ移るものは滑らせる）
 * capture() で動かす前の位置を覚え、value が変わって描き直したあとに、差の分だけずらした位置から戻す
 * 描き直すたびに確かめるが、覚えた位置がなければ何もしない
 * ポインタで引いた並べ替えは、エンジンが自分で動かすので、ここでは動かさない（capture を呼ぶのはキーボードだけ）
 * 長さと緩急は --sortable-move-duration・--sortable-move-ease。動きを減らす設定では長さが 0 になり、動かさない
 */
export function useMoveAnimation(listRef: RefObject<HTMLElement | null>) {
  const before = useRef<Map<string, number> | null>(null);

  const capture = useCallback(() => {
    const list = listRef.current;
    if (list) before.current = measure(list);
  }, [listRef]);

  useLayoutEffect(() => {
    const list = listRef.current;
    const previous = before.current;
    before.current = null;
    if (!list || !previous) return;
    const style = getComputedStyle(list);
    const duration = Number.parseFloat(style.getPropertyValue('--sortable-move-duration')) || 0;
    if (duration <= 0) return;
    const easing = style.getPropertyValue('--sortable-move-ease').trim() || 'ease';
    for (const [key, top] of measure(list)) {
      const from = previous.get(key);
      if (from === undefined || from === top) continue;
      const element = list.querySelector<HTMLElement>(`:scope > [data-value="${CSS.escape(key)}"]`);
      element?.animate([{ translate: `0 ${from - top}px` }, { translate: '0 0' }], {
        duration,
        easing,
      });
    }
  });

  return { capture };
}

/** 項目ごとの、リストの上端からの位置 */
function measure(list: HTMLElement) {
  const origin = list.getBoundingClientRect().top;
  const positions = new Map<string, number>();
  for (const element of list.querySelectorAll<HTMLElement>(':scope > [data-value]')) {
    positions.set(element.dataset.value ?? '', element.getBoundingClientRect().top - origin);
  }
  return positions;
}
