// 閉じたお知らせのフォーカスの行き先（原則15: フォーカスは、次に触るものへ移す）
// × を押して消えたあと、フォーカスは body に落ちる。そこから Tab を押すと、ページの先頭に戻ってしまう
// 行き先は、消したものの次にあるフォーカスできるもの。なければ前のもの、それもなければ領域（NoticeRegion）自身
// 消える前に候補を集めておく（消えたあとは、どこにあったかが分からない）。消えなかったときは何もしない

const FOCUSABLE = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'summary',
  'iframe',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]:not([tabindex^="-"])',
].join(',');

/** いま本当にフォーカスできるか。消えたもの・隠れたもの・押せないものは飛ばす */
function focusable(element: HTMLElement | null): element is HTMLElement {
  if (!element?.isConnected) return false;
  if (element.closest('[inert]') !== null) return false;
  if (element.getAttribute('aria-hidden') === 'true') return false;
  return element.getClientRects().length > 0;
}

/**
 * 消えたあとにフォーカスを移す用意をする。閉じる前に呼び、返した関数を消えたあとに呼ぶ
 *
 * @param element 消えるもの（この中にあるものは行き先にしない）
 * @param fallback 前にも後ろにもないときの行き先（お知らせの領域）。フォーカスを受けられるようにしておく
 */
export function planFocusAfterClose(element: HTMLElement, fallback?: HTMLElement | null) {
  const all = Array.from(element.ownerDocument.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (candidate) => !element.contains(candidate)
  );
  const after: HTMLElement[] = [];
  const before: HTMLElement[] = [];
  for (const candidate of all) {
    const position = element.compareDocumentPosition(candidate);
    if (position & Node.DOCUMENT_POSITION_FOLLOWING) after.push(candidate);
    else if (position & Node.DOCUMENT_POSITION_PRECEDING) before.push(candidate);
  }
  // 前のものは、近い順（文書の順の逆）に見る
  before.reverse();
  return () => {
    // 消えていなければ、フォーカスは × に置いたままにする（呼び出し側がお知らせを残すこともある）
    if (element.isConnected) return;
    const target = [...after, ...before, fallback ?? null].find(focusable);
    target?.focus();
  };
}
