import type { CSSProperties } from 'react';

import type { DensityScope } from '../density-scope';
import { SHEET_FULL } from '../listbox/listbox-measure';
import type { SheetDetent } from '../sheet/use-sheet-drag';

// 打って選ぶ入力欄（Combobox・Autocomplete）の、浮かぶ選択肢とシートの外枠 — design/adr/0037・ADR-0221
//   シートのときは、Base UI が付ける位置（インラインの style）を上書きして、画面の下に固定する
//   ソフトウェアキーボードが隠している分（keyboardInset）だけ持ち上げ、縮んだ残りの高さ（keyboardShrink）に収める
//   本体の祖先に付いた data-density・coarse-large を写し、項目の高さと文字を本体とそろえる（readDensityScope）

interface PositionerOptions {
  sheet: boolean;
  densityScope: DensityScope;
  /** キーボードが画面の下から隠している高さ（useKeyboardInset） */
  keyboardInset: number;
  /** 見えている範囲が画面の高さから縮んだ分（useKeyboardShrink） */
  keyboardShrink: number;
  sheetDetent: SheetDetent;
}

/** 外枠（Base UI の Positioner）のクラス */
export function comboboxPositionerClass({ sheet, densityScope }: PositionerOptions) {
  return [
    'z-10 outline-none',
    densityScope.large && 'coarse-large',
    sheet && 'inset-x-0! top-auto! left-0! flex flex-col [position:fixed]! [transform:none]!',
  ]
    .filter(Boolean)
    .join(' ');
}

/** 外枠（Base UI の Positioner）の style。浮かべるときは Base UI のまま */
export function comboboxPositionerStyle({
  sheet,
  keyboardInset,
  keyboardShrink,
  sheetDetent,
}: PositionerOptions): CSSProperties | undefined {
  if (!sheet) return undefined;
  return {
    bottom: keyboardInset,
    maxHeight: `calc((100% - ${keyboardShrink}px) * ${SHEET_FULL})`,
    // full は、中身が短くても上限の高さまで広げて開く
    ...(sheetDetent === 'full'
      ? { height: `calc((100% - ${keyboardShrink}px) * ${SHEET_FULL})` }
      : {}),
  };
}

/**
 * 面（Base UI の Popup）の style。選んだ項目の色（selectedTokens）に、シートの高さを足す
 * つまみで引いているあいだはその高さ、full は外枠と同じ高さまで広げる
 */
export function comboboxPopupStyle({
  selected,
  sheet,
  sheetDetent,
  dragHeight,
}: {
  selected: CSSProperties;
  sheet: boolean;
  sheetDetent: SheetDetent;
  dragHeight: number | undefined;
}): CSSProperties {
  if (dragHeight !== undefined) return { ...selected, height: dragHeight };
  // full は、外枠（Positioner）を目いっぱいの高さにしているので、面も同じ高さまで広げる
  if (sheet && sheetDetent === 'full') return { ...selected, height: '100%' };
  return selected;
}

/** 当たる選択肢がないときの行を包む箱（Base UI の Empty）。文がなくても要素は残すので、空のときは余白も持たない */
export const comboboxEmptyClass = '[&:not(:empty)]:py-(--select-popup-padding)';

/** シートの見出しの下に置く打つ欄の、左右と上下の余白 */
export const comboboxSheetInputClass =
  'px-[calc(var(--sheet-padding-x)-var(--select-popup-padding))] pt-2 pb-(--select-popup-padding)';
