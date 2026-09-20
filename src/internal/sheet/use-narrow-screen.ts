'use client';

import { useSyncExternalStore } from 'react';

import { useUIConfig } from '../ui-config';

// auto では、指で操作していて、画面が狭いときにシートにする（design/adr/0037）
// シートにする理由は指の動きを減らすことなので、入力方式を見る。狭さは Tailwind のブレイクポイントで決める
//   縦長: md（768px）より狭い — スマートフォン、iPad mini
//   横長: lg（1024px）より狭い — スマートフォンの横持ち
// それより広い画面（タブレット）では浮かべたまま
// Select・Dialog・Popover が使う
const SHEET_QUERY = [
  '(pointer: coarse) and (orientation: portrait) and (max-width: 767.98px)',
  '(pointer: coarse) and (orientation: landscape) and (max-width: 1023.98px)',
].join(', ');

/** 浮かぶ UI の出し方。popover: 浮かべる、sheet: 画面の下から出すシート、auto: 指で操作していて画面が狭いときはシート */
export type OverlayPresentation = 'popover' | 'sheet' | 'auto';

export function useNarrowScreen() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(SHEET_QUERY);
      query.addEventListener('change', onChange);
      return () => query.removeEventListener('change', onChange);
    },
    () => window.matchMedia(SHEET_QUERY).matches,
    () => false
  );
}

/** presentation から、いまシートにするかを決める。書かないときは ThemeProvider の presentation、それもなければ auto */
export function useSheetPresentation(presentationProp: OverlayPresentation | undefined) {
  const narrow = useNarrowScreen();
  const config = useUIConfig();
  const presentation = presentationProp ?? config.presentation ?? 'auto';
  return presentation === 'sheet' || (presentation === 'auto' && narrow);
}
