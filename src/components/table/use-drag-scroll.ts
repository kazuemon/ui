'use client';

import { useCallback, useRef } from 'react';

// マウスで引っぱって、横にスクロールする（スマホで指で送るのと同じ）。タッチとペンはブラウザの標準のまま
// 文字の選択とボタンなどの操作を邪魔しない:
//   操作できる要素（ボタン・リンク・入力欄・ラベルなど）の中で押したときは引っぱらない
//   文字の上で押したときは、文字の選択を優先する。文字のない場所（セルの余白・罫線・行のあいだ）から引っぱったときだけ動かす
// 押しただけ（動かしていない）なら、ふつうのクリックとして扱う。少し動かしてから引っぱりを始め、動かしたあとの click は打ち消す
// カーソルは、引っぱれる場所で grab、引っぱっているあいだ grabbing（data-drag-scroll の値を CSS が読む）
// 返す ref をスクロールする要素に付ける

/** 引っぱりを始めるまでに動かす距離（px）。これより小さい動きはクリックとして扱う */
const DRAG_THRESHOLD = 4;

/** 押しても引っぱらない要素。押した場所がこの中なら、その要素の操作を優先する */
const INTERACTIVE = [
  'a[href]',
  'button',
  'input',
  'select',
  'textarea',
  'label',
  'summary',
  'video',
  'audio',
  '[contenteditable]:not([contenteditable="false"])',
  '[role="button"]',
  '[role="link"]',
  '[role="checkbox"]',
  '[role="radio"]',
  '[role="switch"]',
  '[role="slider"]',
  '[role="menuitem"]',
  '[role="option"]',
  '[role="tab"]',
  '[role="textbox"]',
  '[role="combobox"]',
].join(',');

/**
 * 点 (x, y) が文字の上にあるか。点のいちばん近くの文字の箱に、点が入っているかで決める
 * 箱は行の高さまで上下に広げる（行のあいだのすき間で押しても、文字の選択として扱う）
 */
function isOverText(x: number, y: number) {
  let node: Node | null = null;
  let offset = 0;
  if (typeof document.caretPositionFromPoint === 'function') {
    const position = document.caretPositionFromPoint(x, y);
    node = position?.offsetNode ?? null;
    offset = position?.offset ?? 0;
  } else if (typeof document.caretRangeFromPoint === 'function') {
    const range = document.caretRangeFromPoint(x, y);
    node = range?.startContainer ?? null;
    offset = range?.startOffset ?? 0;
  }
  if (!(node instanceof Text)) return false;
  const lineHeight = node.parentElement
    ? Number.parseFloat(getComputedStyle(node.parentElement).lineHeight)
    : Number.NaN;
  const range = document.createRange();
  // 点の前と後ろの 1 文字を見る（文字の箱の右半分を押すと、位置はその文字の後ろになる）
  for (const start of [offset - 1, offset]) {
    if (start < 0 || start >= node.length) continue;
    range.setStart(node, start);
    range.setEnd(node, start + 1);
    for (const rect of range.getClientRects()) {
      const pad = Number.isNaN(lineHeight) ? 0 : Math.max(0, (lineHeight - rect.height) / 2);
      if (x >= rect.left && x <= rect.right && y >= rect.top - pad && y <= rect.bottom + pad) {
        return true;
      }
    }
  }
  return false;
}

/** 押した場所から引っぱれるか（操作できる要素の中でも、文字の上でもない） */
function canDragFrom(target: EventTarget | null, x: number, y: number) {
  if (!(target instanceof Element)) return false;
  if (target.closest(INTERACTIVE)) return false;
  return !isOverText(x, y);
}

function scrollableX(element: HTMLElement) {
  return element.scrollWidth > element.clientWidth + 1;
}

export function useDragScroll(enabled: boolean) {
  const cleanup = useRef<(() => void) | null>(null);
  return useCallback(
    (scroller: HTMLElement | null) => {
      cleanup.current?.();
      cleanup.current = null;
      if (!scroller || !enabled) return;

      // 押してから離すまでの記録。dragging は、しきい値を超えて引っぱりを始めたか
      let drag: { id: number; x: number; scrollLeft: number; dragging: boolean } | null = null;

      // 載せている場所に合わせて、カーソルの形（grab か、ふつうのカーソル）を切り替える
      let hoverFrame = 0;
      const onHover = (event: PointerEvent) => {
        if (event.pointerType !== 'mouse' || drag) return;
        const { target, clientX, clientY } = event;
        cancelAnimationFrame(hoverFrame);
        hoverFrame = requestAnimationFrame(() => {
          if (scrollableX(scroller) && canDragFrom(target, clientX, clientY)) {
            scroller.setAttribute('data-drag-scroll', 'ready');
          } else {
            scroller.removeAttribute('data-drag-scroll');
          }
        });
      };
      const onLeave = () => {
        cancelAnimationFrame(hoverFrame);
        if (!drag) scroller.removeAttribute('data-drag-scroll');
      };

      // 押してから離すまでを片づける。離したのが表の外でも届くよう、離す・取りやめは文書に付ける
      //   （引っぱりを始める前は pointer を捕まえていないので、表の外で離すと表には届かない）
      const doc = scroller.ownerDocument;
      const end = (event?: PointerEvent) => {
        if (!drag) return;
        const { id, dragging } = drag;
        drag = null;
        doc.removeEventListener('pointerup', onUp);
        doc.removeEventListener('pointercancel', onUp);
        if (scroller.hasPointerCapture(id)) scroller.releasePointerCapture(id);
        // 表の上にいるときは grab に戻し、外にいるときは外す（次に載せたときに onHover が付け直す）
        if (scroller.matches(':hover')) scroller.setAttribute('data-drag-scroll', 'ready');
        else scroller.removeAttribute('data-drag-scroll');
        if (!dragging || event?.type !== 'pointerup') return;
        // 引っぱったあとの click を、いちばん外（window）の捕まえる段階で止め、ページのどのリスナーにも届けない
        window.addEventListener('click', swallowClick, { capture: true, once: true });
        // click が来ないとき（押した要素の外で離したとき）に、次のクリックまで残さない
        setTimeout(() => window.removeEventListener('click', swallowClick, { capture: true }));
      };

      // 引っぱったあとの click（押した要素に届く）を、一度だけ打ち消す
      const swallowClick = (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
      };

      const onUp = (event: PointerEvent) => {
        if (drag && event.pointerId === drag.id) end(event);
      };

      const onDown = (event: PointerEvent) => {
        if (event.pointerType !== 'mouse' || event.button !== 0) return;
        if (!scrollableX(scroller)) return;
        if (!canDragFrom(event.target, event.clientX, event.clientY)) return;
        end();
        // 押した既定の動き（枠に焦点を移す。マウスなので線は出ない）はそのまま。文字の選択だけを onSelectStart で止める
        drag = {
          id: event.pointerId,
          x: event.clientX,
          scrollLeft: scroller.scrollLeft,
          dragging: false,
        };
        doc.addEventListener('pointerup', onUp);
        doc.addEventListener('pointercancel', onUp);
      };

      const onMove = (event: PointerEvent) => {
        if (!drag || event.pointerId !== drag.id) return;
        // 左のボタンがもう離れている（離したことが届かなかった）なら、引っぱりを捨てる
        if ((event.buttons & 1) === 0) {
          end(event);
          return;
        }
        const dx = event.clientX - drag.x;
        if (!drag.dragging) {
          if (Math.abs(dx) < DRAG_THRESHOLD) return;
          drag.dragging = true;
          // 枠の外へ出ても追い続ける（合成のイベントなど、捕まえられない pointer では捕まえずに続ける）
          try {
            scroller.setPointerCapture(event.pointerId);
          } catch {
            // 捕まえられなくても、枠の中では動かせる
          }
          scroller.setAttribute('data-drag-scroll', 'dragging');
        }
        scroller.scrollLeft = drag.scrollLeft - dx;
      };

      // 捕まえていた pointer を失った（ウィンドウの外へ出たなど）ときも片づける
      const onLostCapture = () => end();

      // 余白から押したあいだは、文字の選択と、要素を持ち出すドラッグ（画像など）を始めない
      const onSelectStart = (event: Event) => {
        if (drag) event.preventDefault();
      };

      scroller.addEventListener('pointermove', onHover);
      scroller.addEventListener('pointerleave', onLeave);
      scroller.addEventListener('pointerdown', onDown);
      scroller.addEventListener('pointermove', onMove);
      scroller.addEventListener('lostpointercapture', onLostCapture);
      scroller.addEventListener('selectstart', onSelectStart);
      scroller.addEventListener('dragstart', onSelectStart);
      cleanup.current = () => {
        end();
        cancelAnimationFrame(hoverFrame);
        scroller.removeAttribute('data-drag-scroll');
        scroller.removeEventListener('pointermove', onHover);
        scroller.removeEventListener('pointerleave', onLeave);
        scroller.removeEventListener('pointerdown', onDown);
        scroller.removeEventListener('pointermove', onMove);
        scroller.removeEventListener('lostpointercapture', onLostCapture);
        scroller.removeEventListener('selectstart', onSelectStart);
        scroller.removeEventListener('dragstart', onSelectStart);
      };
    },
    [enabled]
  );
}
