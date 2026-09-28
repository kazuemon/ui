'use client';

import { tv } from '../../internal/tv';
import { TableRow, type TableRowProps } from '../table/Table';

// 本文の行。載せると淡く塗り（原則3: 中に押す部品を持つ行は、hover で行を淡く塗り、押しても濃くしない）、選んだ行は面を敷く
// 選んだ行の面は DataTable の color の淡い面（--data-table-row-selected。neutral は Select の選んだ項目と同じグレー）。選んだ行に載せたときは、面に本文の色を少し混ぜる
// 面は行（tr）に置く。罫線（行のあいだの横線）はそのまま残す
const row = tv({
  base: [
    'bg-(--data-table-row-bg) [--data-table-row-bg:transparent]',
    'hover:[--data-table-row-bg:var(--data-table-row-hover)]',
    'data-selected:[--data-table-row-bg:var(--data-table-row-selected)]',
    'data-selected:hover:[--data-table-row-bg:color-mix(in_oklab,var(--data-table-row-selected),var(--color-fg)_var(--data-table-row-selected-hover-mix))]',
  ],
});

export interface DataTableRowProps extends TableRowProps {
  /**
   * 選んだ行にします。行に DataTable の color の淡い面を敷きます。TanStack Table では `row.getIsSelected()` をそのまま渡します
   * @default false
   */
  selected?: boolean;
}

/** 本文の行（tr）。載せると淡く塗り、選んだ行には面を敷きます */
export function DataTableRow({ selected, className, ...props }: DataTableRowProps) {
  return (
    <TableRow
      data-slot="data-table-row"
      data-selected={selected || undefined}
      className={row({ className })}
      {...props}
    />
  );
}
