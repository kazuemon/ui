import type { ReactNode } from 'react';

import type { ListboxItem, ListboxValue } from './use-listbox-option';

// 選択肢の渡し方（design/adr/0214）。Select・Combobox・Autocomplete・TagsInput が共有する
// そのまま並べる配列か、まとまり（label と items）の配列か。children で組み立てる形は採らない
// 1 つの選択肢は、値だけ（文字か数。ラベルは値の文字）か、ListboxItem（label と value）で渡す。混ぜてもよい
// 部品の中では normalizeItems で ListboxItem にそろえてから使う

/**
 * 選択肢のまとまり。`label` が見出しの文字、`items` がその中の選択肢
 * まとまりで渡すか、選択肢をそのまま並べるかは、`items` に渡した配列の形で決まる
 */
// 型（interface ではなく type）で書く: Base UI の Group は添字の署名を持つので、interface のままでは渡せない
export type ListboxGroup<Value = string> = {
  /** まとまりの見出し */
  label: ReactNode;
  /** まとまりの中の選択肢。値だけ（ラベルは値の文字）か、`{ label, value }` で渡す */
  items: readonly (Value | ListboxItem<Value>)[];
};

/**
 * 選択肢。そのまま並べる配列か、`ListboxGroup[]`（まとまりに分ける）のどちらかで渡す
 * 1 つの選択肢は、値だけ（文字か数。ラベルは値の文字）か `{ label, value }`（`ListboxItem`）で、混ぜられる
 * 並べる形とまとまりを混ぜることはできない。`items` を持つ要素があるかどうかで、まとまりかどうかを見分ける
 */
export type ListboxItems<Value = string> =
  | readonly (Value | ListboxItem<Value>)[]
  | readonly ListboxGroup<Value>[];

/** ListboxItem にそろえたまとまり（部品の中で使う） */
export type NormalizedListboxGroup<Value extends ListboxValue = string> = {
  label: ReactNode;
  items: ListboxItem<Value>[];
};

/** ListboxItem にそろえた選択肢（部品の中で使う） */
export type NormalizedListboxItems<Value extends ListboxValue = string> =
  | ListboxItem<Value>[]
  | NormalizedListboxGroup<Value>[];

/** まとまりで渡されたか */
export function isGroupedItems<Value extends ListboxValue>(
  items: ListboxItems<Value>
): items is readonly ListboxGroup<Value>[];
export function isGroupedItems<Value extends ListboxValue>(
  items: NormalizedListboxItems<Value>
): items is NormalizedListboxGroup<Value>[];
export function isGroupedItems(items: readonly unknown[]): boolean {
  const first = items[0];
  return typeof first === 'object' && first !== null && 'items' in first;
}

/** 選択肢 1 つを ListboxItem にそろえる。値だけのときは、値の文字をラベルにする。ListboxItem はそのまま返す */
export function normalizeItem<Value extends ListboxValue>(
  item: Value | ListboxItem<Value>
): ListboxItem<Value> {
  return typeof item === 'object' ? item : { label: String(item), value: item };
}

/** 選択肢を ListboxItem にそろえる。まとまりの形は保つ。描くたびに作り直さないよう、使う側で useMemo に入れる */
export function normalizeItems<Value extends ListboxValue>(
  items: ListboxItems<Value>
): NormalizedListboxItems<Value> {
  if (isGroupedItems(items))
    return items.map((group) => ({ ...group, items: group.items.map(normalizeItem) }));
  return items.map(normalizeItem);
}

/** まとまりをほどいた選択肢の並び。値からラベルを引くときと、選択肢の数を数えるときに使う */
export function flattenItems<Value extends ListboxValue>(
  items: NormalizedListboxItems<Value>
): ListboxItem<Value>[] {
  return isGroupedItems(items) ? items.flatMap((group) => group.items) : items;
}

/** 値からラベルを引く表（チップと、選んだ値の文字）。外で絞り込んで項目が消えても、items に残っていれば引ける */
export function labelMap<Value extends ListboxValue>(items: ListboxItem<Value>[]) {
  const map = new Map<Value, string>();
  for (const item of items) map.set(item.value, item.label);
  return map;
}

/** アイコンを渡されたか。`icon={条件 && <Icon />}` の false（と true・空の文字）は、渡していないとみなす */
export function hasIcon(icon: ReactNode): boolean {
  return icon != null && typeof icon !== 'boolean' && icon !== '';
}
