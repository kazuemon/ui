// 行き先や列を畳む幅（rem）。画面ではなく、置かれた面の幅で比べる（コンテナ）
//   Navbar はこれより狭いと行き先をメニューに畳み、SidebarLayout は列をやめて Drawer にする
//   Navbar のクラスの @3xl/navbar（48rem）と同じ値
const COLLAPSE_WIDTH_REM = 48;

/** 要素の幅が、畳む幅より狭いか。rem は、いまの根の文字の大きさで px に直す */
export function narrowerThanCollapse(element: HTMLElement) {
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  return element.offsetWidth < COLLAPSE_WIDTH_REM * rem;
}
