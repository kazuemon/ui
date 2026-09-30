'use client';

import {
  type ComponentProps,
  cloneElement,
  type ReactElement,
  type ReactNode,
  useContext,
} from 'react';

import { focusRing } from '../../internal/focus-styles';
import { tv } from '../../internal/tv';
import { DataTableRowContext } from './data-table-context';

// 行のリンク。行（DataTableRow の href・link）の中の、行を代表するセル（注文番号・名前）に置く本物のリンク
// キーボードと読み上げはこのリンクで移る。行のほかの場所を押したときは、行がこのリンクを押したことにする
// 見た目 — 比較中（Design Review/427）: 文字の色・下線はふだんと、行に載せたときとで --data-table-row-link-* から取る
//   フォーカスの線はリンクの文字に付け、行には載せたときと同じ面を敷く（DataTableRow）
const rowLink = tv({
  base: [
    'rounded-control text-(--data-table-row-link-color) underline-offset-4',
    '[text-decoration-line:var(--data-table-row-link-decoration)] [text-decoration-color:var(--color-link-underline)]',
    'in-[tr:hover]:[text-decoration-color:var(--color-link-underline-hover)] in-data-link:in-[tr:hover]:[text-decoration-line:var(--data-table-row-link-hover-decoration)]',
    ...focusRing,
    '[transition:text-decoration-color_var(--link-underline-duration)_var(--link-underline-ease),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)]',
    'motion-reduce:[transition:none]',
  ],
});

export interface DataTableRowLinkProps extends ComponentProps<'a'> {
  /** 行き先。渡さないときは、行（DataTableRow）の href を使います */
  href?: string;
  /**
   * 描く要素。Next.js の Link などを渡すと、その要素に行のリンクの見た目を重ねます（例: `render={<NextLink href="/orders/1" />}`）。
   * このとき行には `link` を渡します
   */
  render?: ReactElement;
  /** リンクの文字（注文番号・名前など、行を代表するもの） */
  children?: ReactNode;
  /** リンクの要素（a か render の要素）に付きます */
  className?: string;
}

/** 行のリンク（a）。行のどこを押しても、このリンクを押したのと同じになります */
export function DataTableRowLink({ href, render, className, ...props }: DataTableRowLinkProps) {
  const row = useContext(DataTableRowContext);
  const own = {
    ...props,
    'data-slot': 'data-table-row-link',
    className: rowLink({ className }),
  };
  if (render) return cloneElement(render, own);
  return <a href={href ?? row.href} {...own} />;
}
