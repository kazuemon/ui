'use client';

import { type ReactNode, useId } from 'react';

import { listboxOption } from './listbox-styles';

/**
 * 選択肢に付く文の種類（design/adr/0044）
 * reason: 選べない理由。キャプションと同じ灰色の文字だけ（アイコンなし）。disabled の選択肢に付ける
 * warning: 選べるが、選ぶ前に知っておくこと。本体の下の警告の行と同じ三角とオリーブ色の文字
 */
export type ListboxItemNoteKind = 'reason' | 'warning';

/** 選択肢に付く文（ラベルの下の2行目）。文は呼び出し側が渡す。部品は文を組み立てない */
export interface ListboxItemNote {
  kind: ListboxItemNoteKind;
  text: ReactNode;
}

/** 選択肢。Select・Combobox・Autocomplete が共有する形 */
export interface ListboxItem {
  label: string;
  value: string;
  /**
   * 選べない（design/adr/0044）。ラベルを押せない文字の色にし、押しても選ばれない
   * 矢印キーでは止まり、選べないこと（disabled）と note が読まれる。文字を打って探すときは飛ばす（Base UI のまま）
   */
  disabled?: boolean;
  /**
   * ラベルの下の2行目（design/adr/0044）。読み上げの名前はラベルだけで、この文は説明になる
   * 2行目のある選択肢だけ高くなる（指用 52px・マウス用 48px）
   */
  note?: ListboxItemNote;
}

/**
 * 選択肢1項目の、Base UI の部品に渡す props とクラス
 * 行（Item）・ラベル（ItemText や span）・選んだ印（ItemIndicator）に、そのまま広げる
 */
export interface ListboxOptionParts {
  /** 行（Base UI の Item）に広げる。クラスと、2行目を説明としてつなぐ読み上げの id */
  itemProps: {
    className: string;
    'aria-labelledby'?: string;
    'aria-describedby'?: string;
  };
  /** ラベル（Base UI の ItemText や span）に広げる */
  labelProps: { id?: string; className: string };
  /** 選んだ印（Base UI の ItemIndicator）に広げる */
  indicatorProps: { className: string };
  /** 2行目に付ける id。ListboxOptionContent にそのまま渡す */
  noteId: string;
}

/**
 * 選択肢1項目のクラスと読み上げのつなぎを作る。Base UI のどの部品かは問わない
 * 読み上げの名前はラベルだけ（aria-labelledby）、2行目は説明（aria-describedby）
 */
export function useListboxOption(item: ListboxItem): ListboxOptionParts {
  const id = useId();
  const { note } = item;
  const slots = listboxOption({ described: !!note });
  return {
    itemProps: {
      className: slots.root(),
      'aria-labelledby': note ? `${id}label` : undefined,
      'aria-describedby': note ? `${id}note` : undefined,
    },
    labelProps: { id: note ? `${id}label` : undefined, className: slots.label() },
    indicatorProps: { className: slots.indicator() },
    noteId: `${id}note`,
  };
}
