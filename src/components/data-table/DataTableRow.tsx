'use client';

import { type MouseEvent, useContext } from 'react';

import { tv } from '../../internal/tv';
import { TableRow, type TableRowProps } from '../table/Table';
import { DataTableContext } from './data-table-context';

// 本文の行。載せると淡く塗り（原則3: 中に押す部品を持つ行は、hover で行を淡く塗り、押しても濃くしない）、選んだ行は面を敷く
// 選んだ行の面は DataTable の color の淡い面（--data-table-row-selected。neutral は Select の選んだ項目と同じグレー）。選んだ行に載せたときは、面に本文の色を少し混ぜる
// 面は行（tr）に置く。罫線（行のあいだの横線）はそのまま残す
//   ふだんの面は --data-table-row-rest（状態の行・開いた親の行が差し替える）。載せたとき・選んだときは --data-table-row-bg を上書きする
// 行の状態（status）: muted は文字を淡くする。warning・danger は DataTable の statusIndicator で、状態の淡い面（fill。既定）か、
//   左端の帯（edge）か、その両方（fill-edge）で見せる。面のある状態の行に載せたときは、状態の面に本文の色を少し混ぜる（選んだ行と同じ）
// 行のリンク: 中に DataTableRowLink（見た目も文字のリンク）を置いた行だけ、行のどこを押してもそのリンクを押したのと同じにする
//   行そのものに行き先は持たせない（リンクに見えない行が暗黙に移らないように）
//   キーボードと読み上げは DataTableRowLink（本物の a）で移る。行そのものはフォーカスに止まらない
//   押したときは、載せたときのグレーに本文の色を少し混ぜる（選んだ行に載せたときと同じ混ぜ方）
//   行の中のボタン・箱・リンク（interactive）を押している間と、押して開いたメニューなどが開いている間は、行を押したことにならないので濃くしない
//   行の中のボタン・箱・リンクを押したときと、文字を選んだときは移らない
//   中ボタン（ホイール）で押したときは、行のリンクの行き先を新しいタブで開く（リンクの文字を中ボタンで押したときと同じ）
const row = tv({
  base: [
    'bg-(--data-table-row-bg) [--data-table-row-bg:var(--data-table-row-rest,transparent)]',
    'hover:[--data-table-row-bg:var(--data-table-row-hover)]',
    'data-[status=muted]:text-fg-subtle',
    // リンクのある行
    'has-[[data-slot=data-table-row-link]]:cursor-pointer',
    // 行の中の操作を押している間は濃くしない。:is(…) は下の interactive と同じ並び（行のリンクの a は除かない）
    // 押した時点で開くメニューなどは、開くとボタンから :active が外れ、行にだけ残る。開いている間（data-popup-open）も除く
    'has-[[data-slot=data-table-row-link]]:active:not-has-[:is(a:not([data-slot=data-table-row-link]),button,input,select,textarea,label,summary,[contenteditable],[role=checkbox],[role=button],[role=switch],[role=radio],[role=combobox],[role=menuitem],[role=option]):active,[data-popup-open]]:[--data-table-row-bg:color-mix(in_oklab,var(--data-table-row-hover),var(--color-fg)_var(--data-table-row-selected-hover-mix))]',
    'has-[[data-slot=data-table-row-link]:focus-visible]:[--data-table-row-bg:var(--data-table-row-hover)]',
    // 選んだ行
    'data-selected:[--data-table-row-bg:var(--data-table-row-selected)]',
    'data-selected:hover:[--data-table-row-bg:color-mix(in_oklab,var(--data-table-row-selected),var(--color-fg)_var(--data-table-row-selected-hover-mix))]',
  ],
  variants: {
    statusIndicator: {
      fill: '',
      edge: '',
      'fill-edge': '',
    },
  },
  compoundVariants: [
    {
      statusIndicator: ['fill', 'fill-edge'],
      class: [
        'data-[status=warning]:[--data-table-row-rest:var(--color-warning-subtle)]',
        'data-[status=danger]:[--data-table-row-rest:var(--color-danger-subtle)]',
        'data-[status=warning]:hover:[--data-table-row-bg:color-mix(in_oklab,var(--data-table-row-rest),var(--color-fg)_var(--data-table-row-selected-hover-mix))]',
        'data-[status=danger]:hover:[--data-table-row-bg:color-mix(in_oklab,var(--data-table-row-rest),var(--color-fg)_var(--data-table-row-selected-hover-mix))]',
      ],
    },
    {
      // 左端の帯（最初のセルの内側に描く）
      statusIndicator: ['edge', 'fill-edge'],
      class: [
        'data-[status=danger]:[--data-table-row-edge:var(--color-danger)] data-[status=warning]:[--data-table-row-edge:var(--color-warning)]',
        'data-status:[&>*:first-child]:[box-shadow:inset_var(--data-table-row-status-edge-width)_0_0_var(--data-table-row-edge,transparent)]',
      ],
    },
  ],
});

/** 行の状態。muted は済んだ・取り消した行、warning・danger は気をつける行 */
export type DataTableRowStatus = 'muted' | 'warning' | 'danger';

// 押しても行を押したことにしないもの（行の中の操作）。上の row の押下の除外と同じ並び
const interactive =
  'a, button, input, select, textarea, label, summary, [contenteditable], [role="checkbox"], [role="button"], [role="switch"], [role="radio"], [role="combobox"], [role="menuitem"], [role="option"]';

export interface DataTableRowProps extends TableRowProps {
  /**
   * 選んだ行にします。行に DataTable の color の淡い面を敷きます。TanStack Table では `row.getIsSelected()` をそのまま渡します
   * @default false
   */
  selected?: boolean;
  /** 行の状態。muted は文字を淡くし、warning・danger は状態の色で知らせます（見せ方は DataTable の statusIndicator） */
  status?: DataTableRowStatus;
}

/**
 * 本文の行（tr）。載せると淡く塗り、選んだ行には面を敷きます。
 * 中に DataTableRowLink を置くと、行のどこを押してもそのリンクで移ります（中ボタンでは新しいタブで開きます）
 */
export function DataTableRow({
  selected,
  status,
  className,
  onClick,
  onAuxClick,
  ...props
}: DataTableRowProps) {
  const { statusIndicator } = useContext(DataTableContext);
  const handleClick = (event: MouseEvent<HTMLTableRowElement>) => {
    onClick?.(event);
    const anchor = rowLinkFor(event);
    if (!anchor) return;
    // 修飾キー（新しいタブで開く）もそのまま渡す
    anchor.dispatchEvent(
      new window.MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        button: event.button,
      })
    );
  };
  // 中ボタンは click が来ないので auxclick で拾う。転送した click では新しいタブにならないので、行き先を開く
  const handleAuxClick = (event: MouseEvent<HTMLTableRowElement>) => {
    onAuxClick?.(event);
    if (event.button !== 1) return;
    const href = rowLinkFor(event)?.getAttribute('href');
    if (href == null) return;
    window.open(new URL(href, document.baseURI).href, '_blank', 'noopener,noreferrer');
  };
  return (
    <TableRow
      data-slot="data-table-row"
      data-selected={selected || undefined}
      data-status={status}
      className={row({ statusIndicator, className })}
      onClick={handleClick}
      onAuxClick={handleAuxClick}
      {...props}
    />
  );
}

// 行を押したことにする押下なら、行のリンクの要素を返す
function rowLinkFor(event: MouseEvent<HTMLTableRowElement>) {
  if (event.defaultPrevented) return null;
  // 行の外の DOM（行の中のメニュー・ポップオーバーが portal で開いた面）からの押下は、React の木を伝って届くので除く
  if (!(event.target instanceof Node) || !event.currentTarget.contains(event.target)) return null;
  if (event.target instanceof Element && event.target.closest(interactive)) return null;
  if (window.getSelection()?.toString()) return null;
  return event.currentTarget.querySelector<HTMLElement>('[data-slot="data-table-row-link"]');
}
