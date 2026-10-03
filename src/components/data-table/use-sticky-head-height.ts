'use client';

import { type RefObject, useEffect } from 'react';

// 貼り付いた見出しの行の高さを測り、スクロールの枠に --data-table-head-height として書く
//   縦のつまみの溝を、見出しの行の下から始めるために使う（見出しに重ねない）
//   密度・文字の大きさ・見出しの折り返しで高さが変わっても追う
export function useStickyHeadHeight(frameRef: RefObject<HTMLDivElement | null>, enabled: boolean) {
  useEffect(() => {
    const frame = frameRef.current;
    if (!enabled || !frame) return;
    const table = frame.querySelector('table');
    if (!table) return;
    const write = () => {
      const height = table.tHead?.getBoundingClientRect().height ?? 0;
      frame.style.setProperty('--data-table-head-height', `${height}px`);
    };
    write();
    // 表の大きさが変われば見出しの行も変わりうるので、表と見出しの両方を見る
    const observer = new ResizeObserver(write);
    observer.observe(table);
    let head = table.tHead;
    if (head) observer.observe(head);
    // 見出しがあとから描かれたり差し替わったりしたら、見る相手を付け直して書き直す
    const mutation = new MutationObserver(() => {
      if (table.tHead === head) return;
      if (head) observer.unobserve(head);
      head = table.tHead;
      if (head) observer.observe(head);
      write();
    });
    mutation.observe(table, { childList: true });
    return () => {
      observer.disconnect();
      mutation.disconnect();
      frame.style.removeProperty('--data-table-head-height');
    };
  }, [frameRef, enabled]);
}
