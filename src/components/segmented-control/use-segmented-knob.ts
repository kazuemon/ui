'use client';

import { type RefObject, useLayoutEffect } from 'react';

// 選んだ項目の位置と大きさを、溝（ルート）の CSS 変数（--segmented-control-knob-*）に書く。つまみはその変数だけを読む
//   選び方は制御・非制御のどちらでも変わるので、値ではなく、項目の data-checked の付け外しを見て測り直す
//   文字の読み込みや幅の変化でも位置が変わるので、溝と項目の大きさも見る。項目の追加・削除・並べ替えでも測り直し、足された項目も見る
//   0 でない大きさで初めて置けたあとに data-knob-ready を付ける。付くまではつまみを出さず、選んだ項目が自分で下地を塗る
//   （サーバーで描いた直後や、測る前や、display:none の中で大きさ 0 のまま測ったあとに見えたとき、つまみが左上から滑ってこないようにする）
export function useSegmentedKnob(rootRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    let frame = 0;
    const place = () => {
      const item = root.querySelector<HTMLElement>(
        '[data-slot="segmented-control-item"][data-checked]'
      );
      if (!item) {
        root.style.setProperty('--segmented-control-knob-opacity', '0');
        return;
      }
      // 見えていない（display:none の中など）と大きさが 0 になる。置かずに、見えて大きさが変わったときに測り直す
      if (!item.offsetWidth || !root.offsetWidth) return;
      // つまみは溝の内側（padding の箱）を基準に置く
      //   横は端数を残すため getBoundingClientRect で測り、祖先の拡大・縮小（transform）の分を割り戻す
      //   縦は offset で測る（押して沈んでいる途中の translate を拾わない）。項目の offsetTop は、すぐ外の升（Field.Item）からなので、升の位置を足す
      const rootBox = root.getBoundingClientRect();
      const itemBox = item.getBoundingClientRect();
      const scale = root.offsetWidth ? rootBox.width / root.offsetWidth : 1;
      const cell = item.offsetParent instanceof HTMLElement ? item.offsetParent : null;
      const top = item.offsetTop + (cell && cell !== root ? cell.offsetTop : 0);
      const left = (itemBox.left - rootBox.left) / scale - root.clientLeft;
      root.style.setProperty('--segmented-control-knob-x', `${left}px`);
      root.style.setProperty('--segmented-control-knob-y', `${top}px`);
      root.style.setProperty('--segmented-control-knob-w', `${itemBox.width / scale}px`);
      root.style.setProperty('--segmented-control-knob-h', `${item.offsetHeight}px`);
      root.style.setProperty('--segmented-control-knob-opacity', '1');
      // 初めて置けた次の描画から動きを付ける（はじめの位置へは滑らせない）
      if (!frame && !root.hasAttribute('data-knob-ready'))
        frame = requestAnimationFrame(() => root.setAttribute('data-knob-ready', ''));
    };

    const resize = new ResizeObserver(place);
    const observeItems = () => {
      resize.observe(root);
      for (const item of root.querySelectorAll('[data-slot="segmented-control-item"]'))
        resize.observe(item);
    };
    observeItems();
    place();

    const mutation = new MutationObserver((records) => {
      // 項目が足された・外された・並べ替えられたら、足された項目も見て測り直す（同じ要素を二度 observe しても 1 つのまま）
      if (records.some((record) => record.type === 'childList')) observeItems();
      place();
    });
    mutation.observe(root, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['data-checked'],
    });

    return () => {
      cancelAnimationFrame(frame);
      mutation.disconnect();
      resize.disconnect();
    };
  }, [rootRef]);
}
