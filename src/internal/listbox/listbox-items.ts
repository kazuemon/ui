import type { ReactNode } from 'react';

import type { ListboxItem } from './use-listbox-option';

// 選択肢の渡し方（design/adr/0214）。Combobox・Autocomplete・TagsInput が共有する
// そのまま並べる配列か、まとまり（label と items）の配列か。children で組み立てる形は採らない

/**
 * 選択肢のまとまり。`label` が見出しの文字、`items` がその中の選択肢
 * まとまりで渡すか、選択肢をそのまま並べるかは、`items` に渡した配列の形で決まる
 */
// 型（interface ではなく type）で書く: Base UI の Group は添字の署名を持つので、interface のままでは渡せない
export type ListboxGroup = {
  /** まとまりの見出し */
  label: ReactNode;
  /** まとまりの中の選択肢 */
  items: ListboxItem[];
};

/**
 * 選択肢。`ListboxItem[]`（そのまま並べる）か `ListboxGroup[]`（まとまりに分ける）のどちらかで渡す
 * 2つを混ぜることはできない。`items` を持つ要素があるかどうかで、まとまりかどうかを見分ける
 */
export type ListboxItems = ListboxItem[] | ListboxGroup[];

/** まとまりで渡されたか */
export function isGroupedItems(items: ListboxItems): items is ListboxGroup[] {
  return items.length > 0 && 'items' in items[0];
}

/** まとまりをほどいた選択肢の並び。値からラベルを引くときと、選択肢の数を数えるときに使う */
export function flattenItems(items: ListboxItems): ListboxItem[] {
  return isGroupedItems(items) ? items.flatMap((group) => group.items) : items;
}

/** 値からラベルを引く表（チップと、選んだ値の文字）。外で絞り込んで項目が消えても、items に残っていれば引ける */
export function labelMap(items: ListboxItem[]) {
  const map = new Map<string, string>();
  for (const item of items) map.set(item.value, item.label);
  return map;
}
