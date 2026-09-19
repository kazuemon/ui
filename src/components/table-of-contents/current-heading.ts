// 今読んでいる見出しを、DOM を読むだけで求める。状態は持たない（use-current-heading.ts が持つ）

/** 見出しがスクロールする枠。スクロールできる祖先がなければ画面（null） */
export function findScrollRoot(element: Element): HTMLElement | null {
  for (let node = element.parentElement; node; node = node.parentElement) {
    if (node === document.body || node === document.documentElement) return null;
    const { overflowY } = getComputedStyle(node);
    if (/(auto|scroll|overlay)/.test(overflowY) && node.scrollHeight > node.clientHeight) {
      return node;
    }
  }
  return null;
}

interface Viewport {
  top: number;
  height: number;
  /** 下の端までスクロールしきっているか */
  atEnd: boolean;
}

function readViewport(root: HTMLElement | null): Viewport {
  if (root) {
    return {
      top: root.getBoundingClientRect().top,
      height: root.clientHeight,
      atEnd: root.scrollTop + root.clientHeight >= root.scrollHeight - 1,
    };
  }
  const scroller = document.scrollingElement ?? document.documentElement;
  return {
    top: 0,
    height: window.innerHeight,
    atEnd: window.scrollY + window.innerHeight >= scroller.scrollHeight - 1,
  };
}

/**
 * 今読んでいる見出しの id。枠の上から offset（渡さないときは枠の高さの 4 分の 1。見出しに scroll-margin-top が
 * あれば、その大きいほう）の線を越えた見出しのうち、最後のもの。どれも越えていなければ null。
 * 下の端までスクロールしきったときは、画面に入っている最後の見出し（短い最後の節が線まで上がれないため）
 */
export function readCurrentHeading(ids: readonly string[], offset?: number): string | null {
  const headings = ids
    .map((id) => document.getElementById(id))
    .filter((element): element is HTMLElement => element !== null);
  const first = headings[0];
  if (!first) return null;
  const viewport = readViewport(findScrollRoot(first));
  const base = offset ?? viewport.height / 4;
  let current: string | null = null;
  for (const heading of headings) {
    const top = heading.getBoundingClientRect().top - viewport.top;
    const margin = Number.parseFloat(getComputedStyle(heading).scrollMarginTop) || 0;
    // リンクで移ったとき、見出しは scroll-margin-top の位置に止まる。そのとき確実に越えているよう 1px 足す
    const line = Math.max(base, margin) + 1;
    if (top <= line || (viewport.atEnd && top < viewport.height)) current = heading.id;
  }
  return current;
}
