import type { ComponentProps, ReactNode } from 'react';

// 行がないときの行。1 つのセルを表の幅いっぱいに広げ、中身（StatusPanel など）を真ん中に置く
// 行ではないので、載せても塗らない
export interface DataTableEmptyProps extends ComponentProps<'tr'> {
  /** 表の列の数。セルをこの数だけ横に広げます */
  colSpan: number;
  /** 真ん中に置く中身。StatusPanel（`size="sm"`）を置きます */
  children?: ReactNode;
  /** 行（tr）に付きます */
  className?: string;
}

/** 行がないときに、表の幅いっぱいに出す行 */
export function DataTableEmpty({ colSpan, children, ...props }: DataTableEmptyProps) {
  return (
    <tr data-slot="data-table-empty" {...props}>
      <td colSpan={colSpan} className="py-8! [--table-valign:middle]">
        <div className="flex justify-center">{children}</div>
      </td>
    </tr>
  );
}
