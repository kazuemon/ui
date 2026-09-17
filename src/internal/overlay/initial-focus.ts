/**
 * 開いた直後にフォーカスを置く場所。中身の要素に autoFocus を付けたときは、どれでもその要素に置く
 * first: Base UI の既定（Dialog は最初に Tab で止まるもの＝右上の ×、指で開いたときは面。Drawer は面）。content: 中身と下の操作のうち、最初に Tab で止まるもの（× を飛ばす）
 * popup: 面そのもの（線は出ない。次の Tab で最初のものへ移る）
 */
export type OverlayInitialFocus = 'first' | 'content' | 'popup';

const TABBABLE =
  'input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

// Base UI の Popup の initialFocus に渡す値を作る。面には data-overlay-id={overlayId} を付けておく（開いたときに探す）
//   autoFocus: React は autoFocus の要素を描いたときにフォーカスするので、開いた直後に面の中にフォーカスがあれば、そこに置いたままにする
//     HTML の autofocus 属性（React を通さない中身）も同じに扱う
//   first: Base UI の既定を写す（kind が dialog なら、指で開いたときは面・それ以外は最初に Tab で止まるもの。drawer は面）
//   content: × （data-slot が closeSlot の要素）を除いて、最初に Tab で止まるもの。なければ面そのもの
export function initialFocusOf(
  focus: OverlayInitialFocus,
  overlayId: string,
  closeSlot: string,
  kind: 'dialog' | 'drawer'
) {
  return (interaction: string) => {
    const popup = document.querySelector<HTMLElement>(
      `[data-overlay-id="${CSS.escape(overlayId)}"]`
    );
    if (!popup) return true;
    const active = document.activeElement;
    if (active instanceof HTMLElement && active !== popup && popup.contains(active)) return active;
    const marked = popup.querySelector<HTMLElement>('[autofocus]');
    if (marked) return marked;
    if (focus === 'first') return kind === 'drawer' || interaction === 'touch' ? popup : true;
    if (focus === 'popup') return popup;
    const target = [...popup.querySelectorAll<HTMLElement>(TABBABLE)].find(
      (el) => !el.closest(`[data-slot="${closeSlot}"]`)
    );
    return target ?? popup;
  };
}
