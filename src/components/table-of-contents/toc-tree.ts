// 見出しの一覧（平たい並び）を、入れ子の木に組む。DOM は読まない

/** 目次に並べる見出し 1 つ */
export interface TableOfContentsItem {
  /** 見出しの要素の id。リンクの行き先（#id）になります */
  id: string;
  /** 目次に出す文字 */
  text: string;
  /** 見出しの段（h2 なら 2）。いちばん小さい段が目次の 1 段目になります */
  level: number;
}

export interface TocNode extends TableOfContentsItem {
  /** 目次の中の段。0 が 1 段目 */
  depth: number;
  children: TocNode[];
}

/**
 * 平たい見出しの並びを木にする。子は、直前にある自分より小さい段の見出しの下に入る。
 * 段が飛んでも（h2 の次に h4）、空の段は作らず 1 段だけ下げる
 */
export function buildTocTree(items: readonly TableOfContentsItem[]): TocNode[] {
  const roots: TocNode[] = [];
  const stack: TocNode[] = [];
  for (const item of items) {
    while ((stack.at(-1)?.level ?? -Infinity) >= item.level) stack.pop();
    const parent = stack.at(-1);
    const node: TocNode = { ...item, depth: parent ? parent.depth + 1 : 0, children: [] };
    if (parent) parent.children.push(node);
    else roots.push(node);
    stack.push(node);
  }
  return roots;
}
