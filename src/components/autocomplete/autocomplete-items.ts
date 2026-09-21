import type { ListboxGroup, ListboxItems } from '../../internal/listbox/listbox-items';
import type {
  ListboxItem,
  ListboxItemNote,
  ListboxItemNoteKind,
} from '../../internal/listbox/use-listbox-option';

/**
 * 候補に付く文の種類
 * reason: 選べない理由。キャプションと同じ灰色の文字だけ（アイコンなし）。disabled の候補に付ける
 * warning: 選べるが、選ぶ前に知っておくこと。本体の下の警告の行と同じ三角とオリーブ色の文字
 */
export type AutocompleteItemNoteKind = ListboxItemNoteKind;

/** 候補に付く文（ラベルの下の2行目）。文は呼び出し側が渡す。部品は文を組み立てない */
export type AutocompleteItemNote = ListboxItemNote;

/**
 * Autocomplete の候補。Combobox と同じ形（`label`・`value` に、`disabled` と `note` を足せる）
 * `label` は選んだときに欄へ入る文字であり、打った文字で絞り込むときの当たり先でもある
 * `value` は候補を見分ける印で、欄には入らない（onSelect が受け取る）
 */
export type AutocompleteItem = ListboxItem;

/** 候補のまとまり。`label` が見出しの文字、`items` がその中の候補 */
export type AutocompleteGroup = ListboxGroup;

/**
 * 候補。`AutocompleteItem[]`（そのまま並べる）か `AutocompleteGroup[]`（まとまりに分ける）のどちらかで渡す
 * 2つを混ぜることはできない
 */
export type AutocompleteItems = ListboxItems;
