import type { ReactNode } from 'react';

import type { ListboxValue } from '../../internal/listbox/use-listbox-option';

// TreeSelect の木の形と、選んだ値の計算（DOM を読まない）
//   複数選ぶ形（parentSelect="none"）は、選んだ葉の集まりを中で持ち、親の箱（チェック・中間）と、外に渡す値（葉だけ — 軸 646）はそこから出す
//   親そのものを選ぶ形（parentSelect="self"）は、行ごとに自分の値だけを入れ替える（親の箱は子と連動しない。Gmail のラベル）
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
 * 親の行の選び方。none は、1 つ選ぶ形では親の行を押すと開け閉めだけをし、複数選ぶ形では親の箱で中をすべて選ぶ（値は葉だけ）。
 * self は、親の行そのもので親の値を選ぶ（開け閉めは山形）。複数選ぶ形では、親の箱は中と連動せず、親自身の値だけが入る。
 * row は、親の行は開け閉めだけにし、開いた子の先頭に置く行（parentRowLabel）で親の値を選ぶ（Cascader の row と同じ考え方）
 */
export type TreeSelectParentSelect = 'none' | 'self' | 'row';

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
  /** 渡された行そのもの */
  item: TreeSelectItem<ListboxValue>;
  /** 親そのものを選ぶ行（parentSelect="row"）のとき、その親。値は親と同じ */
  selfOf?: TreeNode;
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
      item,
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
export function visibleNodes(
  index: TreeIndex,
  expanded: ReadonlySet<ListboxValue>,
  /** 開いた親の子の先頭に置く行（parentSelect="row" の、親そのものを選ぶ行） */
  selfRowOf?: (node: TreeNode) => TreeNode | undefined
): TreeNode[] {
  const list: TreeNode[] = [];
  const walk = (nodes: TreeNode[]) => {
    for (const node of nodes) {
      list.push(node);
      if (!isParent(node) || !expanded.has(node.value)) continue;
      const selfRow = selfRowOf?.(node);
      if (selfRow) list.push(selfRow);
      walk(node.children);
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

/** 葉の集まりを、外に渡す値の並び（木の順の葉だけ）に直す */
export function leafValuesOf(index: TreeIndex, leaves: ReadonlySet<ListboxValue>): ListboxValue[] {
  return index.order
    .filter((node) => !isParent(node) && leaves.has(node.value))
    .map((node) => node.value);
}

/** 親そのものを選ぶ形（parentSelect="self"）で、行の値を入れ替えた次の値（木の順）。木にない値は捨てる */
export function toggleSelf(
  index: TreeIndex,
  values: readonly ListboxValue[],
  node: TreeNode
): ListboxValue[] {
  const next = new Set(values);
  if (next.has(node.value)) next.delete(node.value);
  else next.add(node.value);
  return index.order.filter((item) => next.has(item.value)).map((item) => item.value);
}

/**
 * 親もほかの行と同じ点として選ぶ形（軸 645・646 の比較中の仮の props。統合のときに parentSelect にそろえる）
 *   none: 親は選べない（ただのまとまり）。label: 親も独立した項目。scope: 親が子を覆う（複数選ぶ形で意味がある）
 */
export type TreeSelectParentPoint = 'none' | 'label' | 'scope';

/** item が node の配下（子・孫）か */
export function isUnder(item: TreeNode, node: TreeNode) {
  for (let current = item.parent; current; current = current.parent) {
    if (current === node) return true;
  }
  return false;
}

/** 選んだ値に入っている、いちばん近い祖先（自分は含まない）。scope の形で、その行を覆っている親 */
export function coveringAncestor(
  node: TreeNode,
  values: ReadonlySet<ListboxValue>
): TreeNode | null {
  for (let current = node.parent; current; current = current.parent) {
    if (values.has(current.value)) return current;
  }
  return null;
}

/**
 * scope の形（複数選ぶ形）で、行の印を押したときの次の値（木の順）
 *   入っている行: 自分と配下を外す
 *   覆われている行: 覆っている親を外し、親から押した行までの道筋の各段で、道筋以外の兄弟を個別に入れる（押した行は外れる）
 *   それ以外: 自分を入れ、配下の個別の値は自分にまとめる（子を全部入れても、自動では親にまとめない）
 */
export function pressScope(
  index: TreeIndex,
  values: readonly ListboxValue[],
  node: TreeNode
): ListboxValue[] {
  const set = new Set(values);
  const cover = coveringAncestor(node, set);
  if (set.has(node.value)) {
    set.delete(node.value);
    for (const item of index.order) if (isUnder(item, node)) set.delete(item.value);
  } else if (cover) {
    set.delete(cover.value);
    for (let step: TreeNode | null = node; step && step !== cover; step = step.parent) {
      for (const sibling of step.parent?.children ?? [])
        if (sibling !== step && !sibling.disabled) set.add(sibling.value);
    }
  } else {
    set.add(node.value);
    for (const item of index.order) if (isUnder(item, node)) set.delete(item.value);
  }
  return index.order.filter((item) => set.has(item.value)).map((item) => item.value);
}
