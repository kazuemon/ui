// 重なる面（Dialog・Drawer）を開いた直後のフォーカス — ADR-0109
// 既定は Base UI のまま（Dialog は最初に Tab で止まるもの＝右上の ×、指で開いたときは面。Drawer は面）。
// 中身の要素に autoFocus を付けたときは、その要素に置く
//   React は autoFocus を付けた要素を描いたときにフォーカスするので、開いた直後に面の中にフォーカスがあれば、そこに置いたままにする
//   HTML の autofocus 属性（React を通さない中身）も同じに扱う
// 面には data-overlay-id={overlayId} を付けておく（開いたときに探す）
export function initialFocusOf(overlayId: string, kind: 'dialog' | 'drawer') {
  return (interaction: string) => {
    const popup = document.querySelector<HTMLElement>(
      `[data-overlay-id="${CSS.escape(overlayId)}"]`
    );
    if (!popup) return true;
    const active = document.activeElement;
    if (active instanceof HTMLElement && active !== popup && popup.contains(active)) return active;
    const marked = popup.querySelector<HTMLElement>('[autofocus]');
    if (marked) return marked;
    return kind === 'drawer' || interaction === 'touch' ? popup : true;
  };
}
