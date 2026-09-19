// Affix が画面の端に留まっているかを、DOM を読むだけで求める。状態は持たない
//   sticky の要素は、留まっているあいだ「スクロールする枠の端 + top（bottom）」の位置にある。その位置にいて、
//   かつ枠がスクロールしている（top なら少しでも下へ、bottom ならまだ下に続きがある）ときを「留まっている」とみなす
//   印のための要素（sentinel）を足すと、flex・grid の gap が増えてしまうので、位置だけで判定する

export type AffixPosition = 'top' | 'bottom';

/** 留まる基準になる、いちばん近いスクロールする祖先。なければ null（画面そのもの） */
export function scrollParent(element: Element): HTMLElement | null {
  let node = element.parentElement;
  while (node && node !== document.body && node !== document.documentElement) {
    const { overflowY } = getComputedStyle(node);
    if (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'hidden') return node;
    node = node.parentElement;
  }
  return null;
}

// 位置のずれを許す幅（px）。拡大率によって小数の位置になるため
const EPSILON = 1;

export function isStuck(element: HTMLElement, position: AffixPosition): boolean {
  const style = getComputedStyle(element);
  if (style.position !== 'sticky') return false;
  const parent = scrollParent(element);
  const rect = element.getBoundingClientRect();
  const scroller = parent ?? document.scrollingElement ?? document.documentElement;
  const edgeTop = parent ? parent.getBoundingClientRect().top + parent.clientTop : 0;
  const viewportHeight = parent ? parent.clientHeight : document.documentElement.clientHeight;

  if (position === 'top') {
    const inset = Number.parseFloat(style.top) || 0;
    return scroller.scrollTop > 0 && Math.abs(rect.top - (edgeTop + inset)) < EPSILON;
  }
  const inset = Number.parseFloat(style.bottom) || 0;
  const scrolledToEnd =
    scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - EPSILON;
  return !scrolledToEnd && Math.abs(rect.bottom - (edgeTop + viewportHeight - inset)) < EPSILON;
}
