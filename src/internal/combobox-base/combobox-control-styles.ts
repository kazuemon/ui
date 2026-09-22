import type { CSSProperties } from 'react';

import { controlBox } from '../field/field-styles';
import { type ListboxColor, OWN_FOCUS } from '../listbox/listbox-colors';

// 打って選ぶ入力欄（Combobox・Autocomplete・TagsInput）の本体の並び — ADR-0214〜0221
//   本体（原則2・8）: ふだんはグレーの塗りで枠線なし、フォーカスで枠線が付く
//   選択肢を開いているあいだ（data-popup-open）も、フォーカス中と同じ見た目にする
//   余白は打つ欄とチップの側に持たせ、欄のどこを押しても打てるようにする（端のボタンは端に接する）

/** 本体の内側の余白（枠線の内側から数える） */
export const controlInset = 'px-[calc(var(--spacing-control-x)-var(--field-border-width))]';
/** 端のボタンの側の余白 */
export const controlInsetEnd = 'pe-[calc(var(--spacing-control-x)-var(--field-border-width))]';

/** 本体（Base UI の InputGroup・Trigger）のクラス */
export function comboboxControl({
  color,
  loading,
  className,
}: {
  color: ListboxColor;
  /** 読み込み中の線（FieldLoadingBar）の位置の基準にする */
  loading?: boolean;
  className?: (string | false | undefined)[];
}) {
  return controlBox({
    className: [
      loading && 'relative',
      'data-popup-open:border-[color:var(--control-focus-line,var(--color-focus))] data-popup-open:[--control-bg:var(--color-field-focus)]',
      // エラーの欄の離した線は、開いているあいだもフォーカス中と同じに引く
      'data-popup-open:[outline-style:solid] data-popup-open:[outline-width:var(--control-ring-width,0px)]',
      'data-popup-open:[outline-offset:var(--focus-ring-offset)] data-popup-open:[outline-color:var(--control-ring-color,var(--color-focus-ring))]',
      'data-popup-open:ring-[length:var(--control-ring-inner,0px)] data-popup-open:ring-[color:var(--color-focus-ring-inner)]',
      // フォーカスの枠線と線の色（部品の色 — ADR-0071 の M）
      OWN_FOCUS[color],
      ...(className ?? []),
    ],
  });
}

/** 欄の中の打つ欄（Base UI の Input）のクラス */
export function comboboxInputClass({
  blocking,
  readOnly,
}: {
  /** 止めているあいだ（読み込み・フォームの送信中） */
  blocking?: boolean;
  readOnly?: boolean;
}) {
  return [
    'min-w-0 flex-1 bg-transparent text-input outline-none placeholder:text-(color:--field-placeholder)',
    'disabled:cursor-not-allowed',
    blocking && 'cursor-progress',
    readOnly && 'cursor-default',
  ]
    .filter(Boolean)
    .join(' ');
}

/**
 * 欄の中にチップと打つ欄を並べる箱（Base UI の Chips）のクラス
 * 折り返すかどうかは持たない（使う側が渡す。TagsInput は行数の上限で差し替える）
 */
export const comboboxChipsClass = `flex min-w-0 flex-1 items-center gap-(--spacing) py-(--spacing) ${controlInset}`;

/** 押すボタンの本体（シートに打つ欄を移したとき）に、選んだチップを並べる箱のクラス。余白は本体が持つ */
export const comboboxTriggerChipsClass =
  'flex min-w-0 flex-1 flex-wrap items-center gap-(--spacing)';

/** 欄の中のチップ。部品の高さより一段小さくする（--combobox-chip-*） */
export const comboboxChipClass =
  'max-w-full min-w-0 [--spacing-control-x:var(--combobox-chip-padding-x)] [--spacing-control:var(--combobox-chip-height)]';

/** チップの高さ。sm は部品の高さより一段小さく、md はそれより少し大きくする（ADR-0237） */
export type ChipSize = 'sm' | 'md';

/** チップの最大幅と高さ（チップの style に置く）。既定のままのときは何も置かない */
export function comboboxChipStyle(
  chipMaxWidth: string | undefined,
  chipSize: ChipSize
): CSSProperties | undefined {
  if (!chipMaxWidth && chipSize !== 'md') return undefined;
  return {
    ...(chipMaxWidth ? { maxWidth: chipMaxWidth } : {}),
    ...(chipSize === 'md'
      ? ({
          '--combobox-chip-height': 'calc(var(--spacing-control) - var(--spacing) * 2)',
        } as CSSProperties)
      : {}),
  };
}
