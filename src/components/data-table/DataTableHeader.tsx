'use client';

import type { MouseEvent } from 'react';

import { focusRing } from '../../internal/focus-styles';
import { tv } from '../../internal/tv';
import { TableHeader, type TableHeaderProps } from '../table/Table';
import { SortAscIcon, SortDescIcon, SortNoneIcon } from './sort-icons';

// 見出しのセル。onSortClick を渡すと、見出しの文字が並べ替えのボタンになる
// ボタンは平らな押すもの（原則3）: hover で文字の色を淡く敷き、押すと敷く色が濃くなって沈む。敷いた色が押せる範囲を見せる（原則17）
//   セルの余白に食い込ませ、行の高さは変えない
// 印: 並べ替えている列は上か下の矢印（本文の色）。並べ替えていない列は上下の山（淡い文字の色）。
//   山の濃さは DataTable の sortIndicator が --data-table-sort-idle・--data-table-sort-hover に書く。消しても場所は取るので、並べ替えても文字は動かない
//   右寄せの列（数字）は、印を文字の前に置く。文字の右端を数字の右端とそろえるため
// 並べ替えの向きは th の aria-sort で伝える（並べ替えている列だけに付ける）。ボタンの名前は見出しの文字
const sortButton = tv({
  base: [
    'group/sort -mx-2 -my-1 inline-flex max-w-[calc(100%+var(--spacing)*4)] cursor-pointer items-center gap-1 rounded-control px-2 py-1 align-top',
    'text-start font-[inherit] text-[length:inherit] leading-[inherit] text-[color:inherit] select-none',
    ...focusRing,
    'hover:bg-flat-hover active:translate-y-(--flat-press-depth) active:bg-flat-press',
    '[transition:translate_var(--duration-press)_var(--ease-press),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)]',
    'motion-reduce:[transition:none]',
  ],
});

const idleIcon = [
  'text-fg-subtle opacity-[var(--data-table-sort-idle,1)]',
  'group-hover/sort:opacity-[var(--data-table-sort-hover,1)] group-focus-visible/sort:opacity-[var(--data-table-sort-hover,1)]',
].join(' ');

/** 並べ替えの向き。asc は小さい順、desc は大きい順 */
export type DataTableSortDirection = 'asc' | 'desc';

export interface DataTableHeaderProps extends TableHeaderProps {
  /**
   * この列で並べ替えているか、その向き。TanStack Table では `column.getIsSorted()` をそのまま渡します
   * @default false
   */
  sorted?: false | DataTableSortDirection;
  /**
   * 見出しを押したときに呼びます。渡すと見出しの文字が並べ替えのボタンになります。
   * 次の向きは使う側が決めます（TanStack Table では `column.getToggleSortingHandler()` をそのまま渡します）
   */
  onSortClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}

/** 見出しのセル（th）。onSortClick を渡すと、押して並べ替えられる見出しになります */
export function DataTableHeader({
  sorted = false,
  onSortClick,
  align,
  children,
  ...props
}: DataTableHeaderProps) {
  if (!onSortClick) {
    return (
      <TableHeader align={align} {...props}>
        {children}
      </TableHeader>
    );
  }
  const icon =
    sorted === 'asc' ? (
      <SortAscIcon />
    ) : sorted === 'desc' ? (
      <SortDescIcon />
    ) : (
      <SortNoneIcon className={idleIcon} />
    );
  const ariaSort = sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : undefined;
  return (
    <TableHeader align={align} aria-sort={ariaSort} {...props}>
      <button
        type="button"
        onClick={onSortClick}
        data-slot="data-table-sort"
        data-sorted={sorted || undefined}
        className={sortButton()}
      >
        {align === 'end' && icon}
        <span className="min-w-0">{children}</span>
        {align !== 'end' && icon}
      </button>
    </TableHeader>
  );
}
