'use client';

import type { ComponentProps, ReactNode } from 'react';

import { focusRing } from '../../internal/focus-styles';
import { CaretRightIcon } from '../../internal/icons';
import { tv } from '../../internal/tv';

// 行を開く。親の行の頭に開閉のボタン（DataTableExpandCell）を置き、すぐ下に開いた行（DataTableExpandRow）を置く
// 開いているかは使う側が持つ（TanStack Table では row.getIsExpanded()・row.getToggleExpandedHandler()）
// ボタンは平らな押すもの（原則3）: 並べ替えの見出しと同じく、hover で文字の色を淡く敷き、押すと濃くなって沈む
//   印は右向き（▶）で、開くと 90° 回って下向き（▼）。畳める節（Collapsible の indicator="start"）と同じ向きと動き
// ボタンは 1 行の高さの包みの縦の中央に置く（選ぶ箱と同じ）。セルの縦の寄せが middle なら行の中央、top なら最初の行にそろう
// 開いた行: 列をまたぐ 1 つのセル。親の行とのあいだに線を引かない（DataTable）。見た目は variant で選ぶ
//   indent（既定）は線も面もなく、中身を開閉のボタンの列の分だけ字下げする（--data-table-expand-indent）。flush は字下げしない
//   filled は字下げした中身にグレーの面を敷き、開いているあいだの親の行にも同じ面を敷いてつなぐ（DataTable）
//   閉じているあいだは hidden で消す（ボタンの aria-controls が指す先は残す）
const expandButton = tv({
  base: [
    'group/expand -m-1 inline-flex cursor-pointer items-center justify-center rounded-control p-1 text-fg-muted',
    ...focusRing,
    'hover:bg-flat-hover active:translate-y-(--flat-press-depth) active:bg-flat-press',
    '[transition:translate_var(--duration-press)_var(--ease-press),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)]',
    'motion-reduce:[transition:none]',
  ],
});

const expandIcon =
  'flex transition-[rotate] duration-(--collapsible-duration) ease-(--collapsible-ease) group-aria-expanded/expand:rotate-90 motion-reduce:[transition:none]';

export interface DataTableExpandCellProps extends Omit<ComponentProps<'td'>, 'onToggle'> {
  /**
   * 下の行を開いているか
   * @default false
   */
  open?: boolean;
  /** ボタンを押したときに、次の値を渡して呼びます */
  onOpenChange?: (open: boolean) => void;
  /** 開く行（DataTableExpandRow）の id。ボタンの aria-controls になります */
  controls?: string;
  /** ボタンの読み上げの名前（例: 「A-1024 の明細」）。開いているかは読み上げソフトが別に伝えます */
  accessibleName: string;
  /** セルの要素（td）に付きます */
  className?: string;
}

/** 開閉のボタンを置くセル（td）。行の頭に置きます */
export function DataTableExpandCell({
  open = false,
  onOpenChange,
  controls,
  accessibleName,
  className,
  ...props
}: DataTableExpandCellProps) {
  return (
    <td className={['w-px', className].filter(Boolean).join(' ')} {...props}>
      <span className="flex h-[1lh] items-center">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={controls}
          aria-label={accessibleName}
          onClick={() => onOpenChange?.(!open)}
          data-slot="data-table-expand"
          className={expandButton()}
        >
          <span className={expandIcon}>
            <CaretRightIcon standalone />
          </span>
        </button>
      </span>
    </td>
  );
}

const expandRow = tv({
  slots: {
    cell: '',
    content: '',
  },
  variants: {
    // 字下げ。セルの余白は表の見た目（variant）が決めるので、中身の包みで足す
    variant: {
      indent: { content: 'ps-(--data-table-expand-indent)' },
      flush: {},
      filled: { cell: 'bg-field', content: 'ps-(--data-table-expand-indent)' },
    },
  },
  defaultVariants: { variant: 'indent' },
});

/** 開いた行の見た目 */
export type DataTableExpandRowVariant = 'indent' | 'flush' | 'filled';

export interface DataTableExpandRowProps extends ComponentProps<'tr'> {
  /**
   * 開いているか。閉じているあいだは行を消します
   * @default false
   */
  open?: boolean;
  /**
   * 見た目。indent は中身を開閉のボタンの列の分だけ字下げし、flush は字下げしません。
   * filled は字下げした中身にグレーの面を敷き、開いているあいだの親の行にも同じ面を敷いてつなぎます
   * @default 'indent'
   */
  variant?: DataTableExpandRowVariant;
  /** 表の列の数。中のセルが、すべての列をまたぎます */
  columns: number;
  /** 開いた行の中身（明細・補足） */
  children?: ReactNode;
  /** 行の要素（tr）に付きます */
  className?: string;
}

/** 開いた行（tr）。親の行（DataTableRow）のすぐ下に置き、列をまたぐ 1 つのセルに中身を入れます */
export function DataTableExpandRow({
  open = false,
  variant = 'indent',
  columns,
  children,
  ...props
}: DataTableExpandRowProps) {
  const s = expandRow({ variant });
  return (
    <tr data-slot="data-table-expand-row" data-variant={variant} {...props} hidden={!open}>
      <td colSpan={columns} className={s.cell()}>
        <div className={s.content()}>{children}</div>
      </td>
    </tr>
  );
}
