import type { ReactNode } from 'react';

import type {
  ListboxItem,
  ListboxItemNote,
  ListboxItemNoteKind,
} from '../../internal/listbox/use-listbox-option';

/**
 * 選択肢に付く文の種類（design/adr/0044）
 * reason: 選べない理由。キャプションと同じ灰色の文字だけ（アイコンなし）。disabled の選択肢に付ける
 * warning: 選べるが、選ぶ前に知っておくこと。本体の下の警告の行と同じ三角とオリーブ色の文字
 */
export type ComboboxItemNoteKind = ListboxItemNoteKind;

/** 選択肢に付く文（ラベルの下の2行目）。文は呼び出し側が渡す。部品は文を組み立てない */
export type ComboboxItemNote = ListboxItemNote;

/**
 * Combobox の選択肢。Select と同じ形（`label`・`value` に、`disabled` と `note` を足せる）
 * `label` は欄に出る文字であり、打った文字で絞り込むときの当たり先でもある
 */
export type ComboboxItem = ListboxItem;

/**
 * 選択肢のまとまり。`label` が見出しの文字、`items` がその中の選択肢
 * まとまりで渡すか、選択肢をそのまま並べるかは、`items` に渡した配列の形で決まる
 */
export type ComboboxGroup = {
  /** まとまりの見出し */
  label: ReactNode;
  /** まとまりの中の選択肢 */
  items: ComboboxItem[];
};

/**
 * 選択肢。`ComboboxItem[]`（そのまま並べる）か `ComboboxGroup[]`（まとまりに分ける）のどちらかで渡す
 * 2つを混ぜることはできない。`items` を持つ要素があるかどうかで、まとまりかどうかを見分ける
 */
export type ComboboxItems = ComboboxItem[] | ComboboxGroup[];

/** まとまりで渡されたか */
export function isGroupedItems(items: ComboboxItems): items is ComboboxGroup[] {
  return items.length > 0 && 'items' in items[0];
}

/** まとまりをほどいた選択肢の並び。値からラベルを引くときと、選択肢の数を数えるときに使う */
export function flattenItems(items: ComboboxItems): ComboboxItem[] {
  return isGroupedItems(items) ? items.flatMap((group) => group.items) : items;
}
