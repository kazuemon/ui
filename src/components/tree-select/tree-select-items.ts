import type { ReactNode } from 'react';

import type { ListboxValue } from '../../internal/listbox/use-listbox-option';

// TreeSelect の木の形と、選んだ値の計算（DOM を読まない）
//   複数選ぶ形は、選んだ葉の集まりを中で持ち、親の箱（チェック・中間）と、外に渡す値（multipleValue）はそこから出す
//   押せない行は、親の箱を押しても変えない（選んだまま・選ばないままを保つ）

/** TreeSelect の 1 行。子（children）を渡すと、開け閉めできる行になります */
export interface TreeSelectItem<Value extends ListboxValue = string> {
  /** 値。木の中で重ならないようにします */
  value: Value;
  /** 行と欄に出す文字 */
  label: string;
  /** 文字の前に置くアイコン（フォルダの印など） */
  icon?: ReactNode;
  /** 選べなくします。親に付けると、中の行もすべて選べなくなります */
  disabled?: boolean;
  /** 入れ子の行 */
  children?: TreeSelectItem<Value>[];
}

/**
 * 複数選ぶ形で、外に渡す値。親の中をすべて選んだときにどうまとめるか
 * leaves: 葉（子のない行）だけを並べる。parents: 中をすべて選んだ親は、親の値 1 つに畳む。all: 親と葉の両方を並べる
 */
export type TreeSelectMultipleValue = 'leaves' | 'parents' | 'all';

export interface TreeNode {
  value: ListboxValue;
  label: string;
  icon?: ReactNode;
  /** 自分か祖先が選べない */
  disabled: boolean;
  /** 段（いちばん上が 0） */
  depth: number;
  parent: TreeNode | null;
  children: TreeNode[];
  /** 中の葉（自分が葉なら自分）。選べない葉も含む */
  leaves: ListboxValue[];
  /** 中の葉のうち、選べるもの */
  enabledLeaves: ListboxValue[];
}

export interface TreeIndex {
  roots: TreeNode[];
  byValue: Map<ListboxValue, TreeNode>;
  /** 木を上から順に並べた全行（閉じている枝の中も含む） */
  order: TreeNode[];
}

export function isParent(node: TreeNode) {
  return node.children.length > 0;
}

/** 渡された木を、値から引ける形にする */
export function indexTree(items: readonly TreeSelectItem<ListboxValue>[]): TreeIndex {
  const byValue = new Map<ListboxValue, TreeNode>();
  const order: TreeNode[] = [];
  const build = (
    item: TreeSelectItem<ListboxValue>,
    depth: number,
    parent: TreeNode | null
  ): TreeNode => {
    const node: TreeNode = {
      value: item.value,
      label: item.label,
      icon: item.icon,
      disabled: Boolean(item.disabled || parent?.disabled),
      depth,
      parent,
      children: [],
      leaves: [],
      enabledLeaves: [],
    };
    byValue.set(item.value, node);
    order.push(node);
    node.children = (item.children ?? []).map((child) => build(child, depth + 1, node));
    if (node.children.length === 0) {
      node.leaves = [node.value];
      node.enabledLeaves = node.disabled ? [] : [node.value];
    } else {
      node.leaves = node.children.flatMap((child) => child.leaves);
      node.enabledLeaves = node.children.flatMap((child) => child.enabledLeaves);
    }
    return node;
  };
  const roots = items.map((item) => build(item, 0, null));
  return { roots, byValue, order };
}

/** 祖先を上から並べる（自分は含まない） */
export function ancestorsOf(node: TreeNode): TreeNode[] {
  const list: TreeNode[] = [];
  for (let current = node.parent; current; current = current.parent) list.unshift(current);
  return list;
}

/** 開いている行の中だけを、上から順に並べる（キーボードで移る順） */
export function visibleNodes(index: TreeIndex, expanded: ReadonlySet<ListboxValue>): TreeNode[] {
  const list: TreeNode[] = [];
  const walk = (nodes: TreeNode[]) => {
    for (const node of nodes) {
      list.push(node);
      if (isParent(node) && expanded.has(node.value)) walk(node.children);
    }
  };
  walk(index.roots);
  return list;
}

/** 値の並びを、選んだ葉の集まりに直す。親の値は中の葉すべてとして読む。木にない値は捨てる */
export function leafSetOf(index: TreeIndex, values: readonly ListboxValue[]): Set<ListboxValue> {
  const set = new Set<ListboxValue>();
  for (const value of values) {
    const node = index.byValue.get(value);
    if (node) for (const leaf of node.leaves) set.add(leaf);
  }
  return set;
}

/** 行の箱の状態。checked は中の葉をすべて選んだ、mixed は一部だけ選んだ */
export function checkStateOf(
  node: TreeNode,
  leaves: ReadonlySet<ListboxValue>
): 'checked' | 'mixed' | 'unchecked' {
  const count = node.leaves.filter((leaf) => leaves.has(leaf)).length;
  if (count === 0) return 'unchecked';
  return count === node.leaves.length ? 'checked' : 'mixed';
}

/**
 * 行の箱を押したときの、次の葉の集まり。選べる葉をすべて選んでいれば外し、そうでなければすべて選ぶ
 * 選べない葉は変えない
 */
export function toggleLeaves(node: TreeNode, leaves: ReadonlySet<ListboxValue>): Set<ListboxValue> {
  const next = new Set(leaves);
  const all = node.enabledLeaves.every((leaf) => leaves.has(leaf));
  for (const leaf of node.enabledLeaves) {
    if (all) next.delete(leaf);
    else next.add(leaf);
  }
  return next;
}

/** 葉の集まりを、外に渡す値の並び（木の順）に直す */
export function valuesOf(
  index: TreeIndex,
  leaves: ReadonlySet<ListboxValue>,
  multipleValue: TreeSelectMultipleValue
): ListboxValue[] {
  const full = (node: TreeNode) => checkStateOf(node, leaves) === 'checked';
  if (multipleValue === 'leaves')
    return index.order
      .filter((node) => !isParent(node) && leaves.has(node.value))
      .map((n) => n.value);
  if (multipleValue === 'all') return index.order.filter(full).map((node) => node.value);
  // parents: 中をすべて選んだ親は親の値 1 つにし、中には降りない
  const list: ListboxValue[] = [];
  const walk = (nodes: TreeNode[]) => {
    for (const node of nodes) {
      if (full(node)) list.push(node.value);
      else if (isParent(node)) walk(node.children);
    }
  };
  walk(index.roots);
  return list;
}
