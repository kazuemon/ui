import type { ReactNode } from 'react';

import type { ListboxValue } from '../../internal/listbox/use-listbox-option';

// TreeSelect の木の形と、選んだ値の計算（DOM を読まない）
//   値は「選んだ点（行）」の並び。none・label は行ごとに自分の値だけを入れ替え、scope は親が配下を覆う（pressScope）
//   押せない行は、親を押しても変えない（選んだまま・選ばないままを保つ）

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
 * 親の行（子を持つ行）の選び方。none は親を選べない（ただのまとまり）、label は親も独立した項目、
 * scope は親が配下を覆う（複数選ぶ形。親を選ぶと配下も含む。1 つ選ぶ形では label と同じ）
 */
export type TreeSelectParentSelect = 'none' | 'label' | 'scope';

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
  /** 渡された行そのもの */
  item: TreeSelectItem<ListboxValue>;
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
    };
    byValue.set(item.value, node);
    order.push(node);
    node.children = (item.children ?? []).map((child) => build(child, depth + 1, node));
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

/** 複数選ぶ形の none・label で、行の値を入れ替えた次の値（木の順）。木にない値は捨てる */
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
 * parentSelect="scope"（複数選ぶ形）で、行の印を押したときの次の値（木の順）
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
