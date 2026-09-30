'use client';

import { type MouseEvent, useMemo } from 'react';

import { tv } from '../../internal/tv';
import { TableRow, type TableRowProps } from '../table/Table';
import { DataTableRowContext } from './data-table-context';

// 本文の行。載せると淡く塗り（原則3: 中に押す部品を持つ行は、hover で行を淡く塗り、押しても濃くしない）、選んだ行は面を敷く
// 選んだ行の面は DataTable の color の淡い面（--data-table-row-selected。neutral は Select の選んだ項目と同じグレー）。選んだ行に載せたときは、面に本文の色を少し混ぜる
// 面は行（tr）に置く。罫線（行のあいだの横線）はそのまま残す
//   ふだんの面は --data-table-row-rest（状態の行・開いた親の行が差し替える）。載せたとき・選んだときは --data-table-row-bg を上書きする
// 行の状態（status）— 比較中（Design Review/424）: muted は文字を淡く、warning・danger は面・左端の線・文字の色を --data-table-row-{status}-* で持つ
//   状態の行に載せたときは、状態の面に本文の色を少し混ぜる（選んだ行と同じ）
// 行のリンク（href・link）— 比較中（Design Review/427）: 行のどこを押しても、中の DataTableRowLink を押したのと同じにする
//   キーボードと読み上げは DataTableRowLink（本物の a）で移る。行そのものはフォーカスに止まらない
//   押したときの面は --data-table-row-link-press。行の中のボタン・箱・リンクを押したときと、文字を選んだときは移らない
const row = tv({
  base: [
    'bg-(--data-table-row-bg) [--data-table-row-bg:var(--data-table-row-rest,transparent)]',
    'hover:[--data-table-row-bg:var(--data-table-row-hover)]',
    // 状態
    'data-[status=muted]:text-(--data-table-row-muted-fg)',
    'data-[status=warning]:text-(--data-table-row-warning-fg) data-[status=warning]:[--data-table-row-edge:var(--data-table-row-warning-edge)] data-[status=warning]:[--data-table-row-rest:var(--data-table-row-warning-bg)]',
    'data-[status=danger]:text-(--data-table-row-danger-fg) data-[status=danger]:[--data-table-row-edge:var(--data-table-row-danger-edge)] data-[status=danger]:[--data-table-row-rest:var(--data-table-row-danger-bg)]',
    'data-[status=warning]:hover:[--data-table-row-bg:color-mix(in_oklab,var(--data-table-row-rest),var(--color-fg)_var(--data-table-row-selected-hover-mix))]',
    'data-[status=danger]:hover:[--data-table-row-bg:color-mix(in_oklab,var(--data-table-row-rest),var(--color-fg)_var(--data-table-row-selected-hover-mix))]',
    // 左端の線（最初のセルの内側に描く。幅は --data-table-row-status-edge-width）
    'data-status:[&>*:first-child]:[box-shadow:inset_var(--data-table-row-status-edge-width)_0_0_var(--data-table-row-edge,transparent)]',
    // リンクの行
    'data-link:cursor-pointer data-link:active:[--data-table-row-bg:var(--data-table-row-link-press)]',
    'data-link:has-[[data-slot=data-table-row-link]:focus-visible]:[--data-table-row-bg:var(--data-table-row-hover)]',
    // 選んだ行
    'data-selected:[--data-table-row-bg:var(--data-table-row-selected)]',
    'data-selected:hover:[--data-table-row-bg:color-mix(in_oklab,var(--data-table-row-selected),var(--color-fg)_var(--data-table-row-selected-hover-mix))]',
  ],
});

/** 行の状態。muted は済んだ・取り消した行、warning・danger は気をつける行 */
export type DataTableRowStatus = 'muted' | 'warning' | 'danger';

// 押しても行を押したことにしないもの（行の中の操作）
const interactive = 'a, button, input, select, textarea, label, [role="checkbox"], [role="button"]';

export interface DataTableRowProps extends TableRowProps {
  /**
   * 選んだ行にします。行に DataTable の color の淡い面を敷きます。TanStack Table では `row.getIsSelected()` をそのまま渡します
   * @default false
   */
  selected?: boolean;
  /** 行の状態。muted は文字を淡くし、warning・danger は状態の色で知らせます */
  status?: DataTableRowStatus;
  /** 行の行き先。行のどこを押しても移ります。行の中の DataTableRowLink が、この行き先のリンクになります */
  href?: string;
  /**
   * 行をリンクとして描きます（押すと中の DataTableRowLink を押したのと同じにします）。
   * href を渡すと既定で true です。DataTableRowLink の render にルーターのリンクを渡すときは、部品からは分からないので書きます
   * @default href !== undefined
   */
  link?: boolean;
}

/** 本文の行（tr）。載せると淡く塗り、選んだ行には面を敷きます。href を渡すと、行のどこを押しても移ります */
export function DataTableRow({
  selected,
  status,
  href,
  link,
  className,
  onClick,
  ...props
}: DataTableRowProps) {
  const isLink = link ?? href !== undefined;
  const context = useMemo(() => ({ href }), [href]);
  const handleClick = (event: MouseEvent<HTMLTableRowElement>) => {
    onClick?.(event);
    if (!isLink || event.defaultPrevented) return;
    if (event.target instanceof Element && event.target.closest(interactive)) return;
    if (window.getSelection()?.toString()) return;
    const anchor = event.currentTarget.querySelector<HTMLElement>(
      '[data-slot="data-table-row-link"]'
    );
    if (anchor) {
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
    } else if (href !== undefined) {
      window.location.assign(href);
    }
  };
  return (
    <DataTableRowContext.Provider value={context}>
      <TableRow
        data-slot="data-table-row"
        data-selected={selected || undefined}
        data-status={status}
        data-link={isLink || undefined}
        className={row({ className })}
        onClick={isLink ? handleClick : onClick}
        {...props}
      />
    </DataTableRowContext.Provider>
  );
}
