'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { SheetMetrics } from '../../internal/sheet/use-sheet-drag';
import {
  CUE_RAMP,
  listContentLength,
  loadingRowLength,
  optionHeights,
  peekLength,
  POPOVER_MAX,
  rowsLength,
  screenHeight,
  SHEET_FULL,
  SHEET_HALF,
} from './measure';

export type { SheetMetrics } from '../../internal/sheet/use-sheet-drag';

interface PopupLayoutOptions {
  open: boolean;
  sheet: boolean;
  /** 浮かぶ選択肢の高さの上限を、画面の高さの半分に合わせるか（popoverMaxHeight="screen"） */
  popoverFit: boolean;
  container?: HTMLElement | null;
}

// 開いた選択肢の寸法を測る。シートの高さ（metrics）、浮かぶ選択肢の高さの上限、上下の続きの印の濃さ
export function usePopupLayout({ open, sheet, popoverFit, container }: PopupLayoutOptions) {
  // シートの高さ: 開いたときに見出しと選択肢の高さを測る
  const headerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState<SheetMetrics | null>(null);
  // 上下に続きがあることの印の濃さ（--cue-top・--cue-bottom、0〜1）。スクロールした量に合わせて濃くし、急に出さない
  // 印の左右の位置（--cue-left・--cue-right）: シートでは端から描き（内側の余白の分だけ外へ出す）、
  // スクロールバーがあるときはその手前で止める。スクロールと高さの変化のたびに、要素の style に直接書く
  const updateCues = useCallback(() => {
    const list = listRef.current;
    const popup = list?.parentElement;
    if (!list || !popup) return;
    const rest = Math.max(0, list.scrollHeight - list.scrollTop - list.clientHeight);
    popup.style.setProperty('--cue-top', String(Math.min(1, list.scrollTop / CUE_RAMP)));
    popup.style.setProperty('--cue-bottom', String(Math.min(1, rest / CUE_RAMP)));
    const scrollbar = list.offsetWidth - list.clientWidth;
    const bleed = 'calc(var(--select-popup-padding) * -1)';
    popup.style.setProperty('--cue-left', bleed);
    popup.style.setProperty('--cue-right', scrollbar > 0 ? `${scrollbar}px` : bleed);
  }, []);
  const observer = useRef<ResizeObserver | null>(null);
  // いま開いている浮かぶ部分。画面の大きさが変わったときに測り直すため
  const popupEl = useRef<HTMLDivElement | null>(null);
  // シートの高さを測る。開いたとき・選択肢の大きさが変わったとき・画面の大きさが変わったときに呼ぶ
  // 読み込み中の行（一覧の下）も中身に入れる（design/adr/0042）
  const readSheetMetrics = useCallback(() => {
    const popup = popupEl.current;
    const list = listRef.current;
    if (!popup || !headerRef.current || !list) return;
    const style = getComputedStyle(popup);
    const frame =
      parseFloat(style.paddingTop) +
      parseFloat(style.paddingBottom) +
      parseFloat(style.borderTopWidth) +
      loadingRowLength(list);
    const header = headerRef.current.offsetHeight;
    const heights = optionHeights(list, 44);
    const screen = screenHeight(container);
    const next = {
      content: frame + header + listContentLength(list),
      half: Math.round(
        frame + header + peekLength(heights, screen * SHEET_HALF - frame - header, false)
      ),
      full: Math.round(screen * SHEET_FULL),
    };
    setMetrics((prev) =>
      prev && prev.content === next.content && prev.half === next.half && prev.full === next.full
        ? prev
        : next
    );
  }, [container]);
  // シートの Popup の ref
  const measure = useCallback(
    (popup: HTMLDivElement | null) => {
      observer.current?.disconnect();
      popupEl.current = popup;
      if (!popup || !listRef.current) return;
      readSheetMetrics();
      observer.current = new ResizeObserver(() => {
        readSheetMetrics();
        updateCues();
      });
      observer.current.observe(listRef.current);
    },
    [readSheetMetrics, updateCues]
  );

  // 浮かぶ選択肢: 続きの影を出すときは、高さの変化を見て影の濃さを直す
  // popoverMaxHeight="screen" のときは、高さの上限（--select-popup-max-height）を、画面の高さの半分のうち
  // 最後の項目が半分見える高さにする。本体の下の空き（--available-height）での上限は、選択肢の CSS がかける
  const fitPopover = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    const heights = optionHeights(list, 40);
    const style = getComputedStyle(list);
    const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    // 項目の数の上限（--select-popup-max-rows）。大きな画面で長くなりすぎないようにする
    const maxRows = parseFloat(style.getPropertyValue('--select-popup-max-rows')) || Infinity;
    // 読み込み中の行は一覧の外にあるので、その分を一覧の上限から引く（行を含めた浮かぶ部分の高さを上限に収める）
    const limit =
      Math.min(screenHeight(container) * POPOVER_MAX, rowsLength(heights, maxRows) + padding) -
      loadingRowLength(list);
    if (list.scrollHeight > limit) {
      list.style.setProperty(
        '--select-popup-max-height',
        `${Math.round(padding + peekLength(heights, limit - padding, true))}px`
      );
    } else {
      list.style.removeProperty('--select-popup-max-height');
    }
  }, [container]);
  // 浮かぶ選択肢の Popup の ref
  const observeCues = useCallback(
    (popup: HTMLDivElement | null) => {
      observer.current?.disconnect();
      popupEl.current = popup;
      if (!popup || !listRef.current) return;
      const update = () => {
        const list = listRef.current;
        // 本体の下の空き（--available-height）での上限にも、読み込み中の行の分を入れる
        if (list) list.style.setProperty('--select-popup-extra', `${loadingRowLength(list)}px`);
        if (popoverFit) fitPopover();
        updateCues();
      };
      requestAnimationFrame(update);
      observer.current = new ResizeObserver(update);
      observer.current.observe(listRef.current);
    },
    [fitPopover, popoverFit, updateCues]
  );

  // 開いたまま画面の大きさが変わったら、シートの半分の高さと、浮かぶ選択肢の高さの上限を測り直す
  useEffect(() => {
    if (!open) return undefined;
    const onResize = () => {
      if (!popupEl.current) return;
      if (sheet) {
        readSheetMetrics();
      } else if (popoverFit) {
        fitPopover();
      }
      updateCues();
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [open, sheet, popoverFit, readSheetMetrics, fitPopover, updateCues]);

  return { headerRef, listRef, metrics, updateCues, measure, observeCues };
}
