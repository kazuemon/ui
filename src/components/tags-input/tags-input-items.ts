import type { ListboxGroup, ListboxItems } from '../../internal/listbox/listbox-items';
import type {
  ListboxItem,
  ListboxItemNote,
  ListboxItemNoteKind,
} from '../../internal/listbox/use-listbox-option';

/**
 * 候補に付く文の種類（design/adr/0044）
 * reason: 選べない理由。キャプションと同じ灰色の文字だけ（アイコンなし）。disabled の候補に付ける
 * warning: 選べるが、選ぶ前に知っておくこと。本体の下の警告の行と同じ三角とオリーブ色の文字
 */
export type TagsInputItemNoteKind = ListboxItemNoteKind;

/** 候補に付く文（ラベルの下の2行目）。文は呼び出し側が渡す。部品は文を組み立てない */
export type TagsInputItemNote = ListboxItemNote;

/**
 * 打っているあいだに出す候補。`value` がタグの文字、`label` が候補に出る文字です。
 * ふだんは同じ文字を渡します（タグの文字がそのまま値になるため）
 */
export type TagsInputItem = ListboxItem;

/** 候補のまとまり。`label` が見出しの文字、`items` がその中の候補 */
export type TagsInputGroup = ListboxGroup;

/**
 * 候補。`TagsInputItem[]`（そのまま並べる）か `TagsInputGroup[]`（まとまりに分ける）のどちらかで渡す
 * 渡さないときは候補を出さない（打った文字だけがタグになる）
 */
export type TagsInputItems = ListboxItems;
