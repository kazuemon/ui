import type { ListboxGroup, ListboxItems } from '../../internal/listbox/listbox-items';
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
export type ComboboxGroup = ListboxGroup;

/**
 * 選択肢。`ComboboxItem[]`（そのまま並べる）か `ComboboxGroup[]`（まとまりに分ける）のどちらかで渡す
 * 2つを混ぜることはできない。`items` を持つ要素があるかどうかで、まとまりかどうかを見分ける
 */
export type ComboboxItems = ListboxItems;
