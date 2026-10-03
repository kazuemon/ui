'use client';

import { type CSSProperties, type MouseEvent, useRef, useState } from 'react';

import { focusRing } from '../../internal/focus-styles';
import { ResizeHandle } from '../../internal/resize-handle/ResizeHandle';
import { useMergedRefs } from '../../internal/use-merged-refs';
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
  /**
   * 列の幅。数は px、文字は CSS の長さ（`'12rem'`・`'20%'`）です。書かないときは、中身に合わせて表が決めます。
   * 表は枠の幅いっぱいに広がるので、ほかの列の中身が長いときや枠が広いときは、この幅から伸び縮みします。
   * resizable のときに数を渡すと、幅を外で持つ形（制御）になります（TanStack Table では `header.getSize()`）
   */
  width?: number | string;
  /** 列の最小の幅。数は px、文字は CSS の長さです。枠が狭くても、列をこれより細くしません（枠が横にスクロールします） */
  minWidth?: number | string;
  /**
   * 見出しの右の端（列の境）のつまみをドラッグして、列の幅を変えられるか。キーボードでは、つまみにフォーカスして ← → で 16px ずつ。
   * ダブルクリックで defaultWidth（なければ中身に合わせた幅）に戻ります。最後の列は表の端で残りの幅を受け持つので、つまみを出しません
   * @default false
   */
  resizable?: boolean;
  /** resizable のときの、はじめの幅（px。非制御） */
  defaultWidth?: number;
  /** resizable で幅を変えたときに、次の幅（px）を渡して呼びます。TanStack Table では `table.setColumnSizing` につなぎます */
  onWidthChange?: (width: number) => void;
  /** resizable のときの、いちばん広い幅（px）。書かないときは上限なし */
  maxWidth?: number;
  /**
   * 幅を変えるつまみの読み上げの名前。列の名前を入れます（「金額の列の幅」）
   * @default '列の幅'
   */
  resizeName?: string;
  /**
   * resizable のつまみに、ふだんから淡い線を出すか。既定では、幅を変えられる列（つまみのある列）に出します。
   * false にしても、載せる・動かす・フォーカスしたときは線が出ます。列の境に縦の線を引いた表など、幅を変えられることが見た目で分かるときに使います
   * @default resizable
   */
  showResizeLine?: boolean;
}

// resizable で、minWidth が数でないときの、いちばん狭い幅（px）
const RESIZE_MIN = 48;

/** 見出しのセル（th）。onSortClick を渡すと、押して並べ替えられる見出しになります */
export function DataTableHeader({
  sorted = false,
  onSortClick,
  width,
  minWidth,
  resizable = false,
  defaultWidth,
  onWidthChange,
  maxWidth,
  resizeName = '列の幅',
  showResizeLine = resizable,
  align,
  children,
  style: styleProp,
  className,
  ref,
  ...props
}: DataTableHeaderProps) {
  const cellRef = useRef<HTMLTableCellElement | null>(null);
  const mergedRef = useMergedRefs<HTMLTableCellElement>(cellRef, ref);
  // 幅を変えられるとき: 数の width は制御、なければ部品の中で持つ（はじめは defaultWidth）
  const [widthState, setWidthState] = useState(defaultWidth);
  const controlledWidth = resizable && typeof width === 'number';
  const resizedWidth = resizable ? (controlledWidth ? width : widthState) : undefined;
  const shownWidth = resizedWidth ?? width;
  const setWidth = (next: number) => {
    if (!controlledWidth) setWidthState(next);
    onWidthChange?.(next);
  };
  // 列の幅は見出しのセルに書く（表は列ごとに、いちばん広いセルの幅を取る）
  const style: CSSProperties | undefined =
    shownWidth === undefined && minWidth === undefined
      ? styleProp
      : { width: shownWidth, minWidth, ...styleProp };
  // 列の境（見出しの終わりの端）に、つかめる幅を半分ずつ重ねる。並べ替えのボタンとは重ならない（セルの余白の上）
  const handle = resizable ? (
    <ResizeHandle
      name={resizeName}
      target={cellRef}
      width={resizedWidth}
      min={typeof minWidth === 'number' ? minWidth : RESIZE_MIN}
      max={maxWidth}
      edge="end"
      slot="data-table-resize-handle"
      // 最後の列は表の端で、残りの幅を受け持つので、つまみを出さない（読み上げとキーボードからも外れる）
      // 表の列の境は線が薄いか無く、幅を変えられることに気づけないので、ふだんから淡い線を出す（Sidebar・Inspector は載せたときだけ）。
      // 線はセルの上下の余白の分だけ短くし、見出しの文字の行にそろえる（つかめる範囲はセルの高さいっぱい）
      className={[
        'inset-y-0 -end-[calc(var(--resize-handle-hit)/2)] [--resize-handle-line-inset:calc(var(--spacing)*3)] [th:last-child>&]:hidden',
        showResizeLine ? '[--resize-handle-rest:var(--color-line)]' : '',
      ].join(' ')}
      onWidthChange={setWidth}
      onReset={() => {
        if (!controlledWidth) setWidthState(defaultWidth);
        if (defaultWidth !== undefined) onWidthChange?.(defaultWidth);
      }}
    />
  ) : null;
  // つまみを置くセルは、つまみの位置の基準にする（貼り付いた見出しの sticky は、表の側のクラスが勝つ）
  // 貼り付いた見出しのセルはそれぞれ重なりの層を作り、後ろのセルが前のセルからはみ出したつまみを覆うので、
  // つまみに載せている・動かしている・フォーカスしているあいだは、そのセルを上に出す。
  // 後ろのセルに覆われた半分（つまみの真ん中の線を含む）からも載せられるよう、後ろのセルに載せているあいだも上に出す
  const cellClassName = resizable
    ? [
        'relative has-[>[data-slot=data-table-resize-handle]:is(:hover,:focus-visible,[data-resizing])]:z-2! [&:has(+th:hover)]:z-2!',
        className,
      ]
        .filter(Boolean)
        .join(' ')
    : className;
  if (!onSortClick) {
    return (
      <TableHeader align={align} style={style} className={cellClassName} ref={mergedRef} {...props}>
        {children}
        {handle}
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
    <TableHeader
      align={align}
      aria-sort={ariaSort}
      style={style}
      className={cellClassName}
      ref={mergedRef}
      {...props}
    >
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
      {handle}
    </TableHeader>
  );
}
