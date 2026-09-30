'use client';

import { type ComponentProps, type CSSProperties, type ReactNode, useId } from 'react';

import type { ChoiceColor } from '../../internal/choice/choice-styles';
import { tableStyles } from '../../internal/reading/table';
import { ScrollFrame } from '../../internal/ScrollFrame';
import { tv } from '../../internal/tv';
import type { TableVariant, TableVerticalAlign } from '../table/Table';
import { DataTableContext } from './data-table-context';

// データの表。Table と同じ要素・罫線・見出し・余白・文字（internal/reading/table.ts）に、データを扱う見た目を足す
//   並べ替えの見出し（DataTableHeader）・選択の列（DataTableSelectHeader・DataTableSelectCell）・選んだ行（DataTableRow）・
//   空のとき（DataTableEmpty）・読み込み中（DataTableLoading）
// 状態は持たない。並べ替え・選択・ページ送りは使う側（TanStack Table など）が持ち、props で受ける
// Table との違い:
//   スクロールする包みは ScrollArea と同じ枠（ScrollFrame）。続きがある端に内側の影を落とす（原則1）
//   maxHeight を渡すと縦にもスクロールし、見出しの行が上に貼り付く。貼り付いた見出しの下を本文が通るあいだは、
//     見出しの下に影を落とす（原則1: ページの一部でも、スクロールした内容が下を通るようになったら重なり）。
//     影の濃さは ScrollFrame が書く --cue-top（スクロールした量）に合わせる。枠の上の端の影は見出しに重なるので出さない
//   見出しの影は、ScrollArea の上の端の影と同じ色・高さ。枠（framed）の角丸は見出しの面の上の角で切れ、影は見出しの下の辺から落ちるので角にかからない
//   banded の丸い帯は th の ::before に描き、th そのものは地の色の四角にする。貼り付いたとき、帯の角丸の外に下を通る行が透けず、
//     影は帯の下の辺（四角い th の下）から、ほかの見た目と同じ形で落ちる
//   セルの縦の寄せの既定は middle（選択の箱や行の操作と、文字の行をそろえる）
//   選んだ行の面は color（選択の箱と同じ色）の淡い面。色を持たないときは Select の選んだ項目と同じグレー（原則6）
//   並べ替えていない列の印（上下の山）は sortIndicator で出し方を選ぶ。既定の subtle は、ふだん半分の濃さで置き、載せると濃くする
//   読み直し（refreshing）— 比較中（Design Review/425）: 行を残したまま、表に aria-busy を付ける。
//     見せ方は --data-table-refreshing-*（本文の濃さと、表の上の端に流れる線の太さ）。線は Loading の流れる線と同じ動き
//   開いた行（DataTableExpandRow）— 比較中（Design Review/426）: 親の行とのあいだの線・面・字下げは --data-table-expand-*
const dataTable = tv({
  slots: {
    root: 'relative flex min-w-0 flex-col gap-2',
    frame: '',
    table: [
      ...tableStyles.table,
      ...tableStyles.cells,
      // 右寄せの列（数字）は折り返さない。「3,200 円」が 2 行に割れると、桁がそろわない
      '[&_td[align=right]]:whitespace-nowrap',
      // 見出しの行は、縦にスクロールする枠の上に貼り付く（枠の高さに上限がないときは動かない）
      //   下を通る本文を隠すため、見出しには面を置く（lines は地と同じ白、framed・banded はグレーの面）
      '[&_thead_th]:sticky [&_thead_th]:top-0 [&_thead_th]:z-1',
      // 貼り付いた見出しの下の影。スクロールした量（--cue-top）に合わせて濃くする
      "[&_thead_th]:after:pointer-events-none [&_thead_th]:after:absolute [&_thead_th]:after:inset-x-0 [&_thead_th]:after:top-full [&_thead_th]:after:h-3 [&_thead_th]:after:content-['']",
      '[&_thead_th]:after:bg-linear-to-b [&_thead_th]:after:from-(color:--color-sheet-edge-shadow) [&_thead_th]:after:to-transparent',
      '[&_thead_th]:after:opacity-[var(--cue-top,0)]',
      // 読み直しのあいだの本文の濃さ
      '[&_tbody]:transition-opacity [&_tbody]:duration-(--duration-loading) motion-reduce:[&_tbody]:transition-none',
      'data-refreshing:[&_tbody]:opacity-(--data-table-refreshing-opacity)',
      // 開いた行: 親の行とのあいだの線と、開いているあいだの親の行の面
      '[&_tbody_tr+tr[data-slot=data-table-expand-row]>*]:[border-top-width:var(--data-table-expand-line-width)]',
      '[&_tbody_tr:has(+[data-slot=data-table-expand-row]:not([hidden]))]:[--data-table-row-rest:var(--data-table-expand-open-bg)]',
    ],
    // 読み直しの線。表の上の端に置く
    refreshBar:
      'pointer-events-none absolute inset-x-0 top-0 z-2 h-(--data-table-refreshing-bar-height) overflow-hidden',
    refreshBarFill: [
      'absolute inset-y-0 left-0 w-2/5 animate-loading-bar bg-(--data-table-refreshing-bar-color) opacity-60',
      'motion-reduce:w-full motion-reduce:animate-loading-bar-reduced',
    ],
    caption: 'text-body-sm text-fg-subtle',
  },
  variants: {
    variant: {
      lines: { table: [tableStyles.lines, '[&_thead_th]:bg-bg'] },
      framed: { frame: tableStyles.framedFrame, table: tableStyles.framed },
      banded: {
        table: [
          '[&_:is(th,td)]:px-4 [&_:is(th,td)]:py-3 [&_thead_th]:bg-bg',
          "[&_thead_th]:before:pointer-events-none [&_thead_th]:before:absolute [&_thead_th]:before:inset-0 [&_thead_th]:before:-z-1 [&_thead_th]:before:bg-field [&_thead_th]:before:content-['']",
          '[&_thead_th:first-child]:before:rounded-s-control [&_thead_th:last-child]:before:rounded-e-control',
        ],
      },
    },
    showColumnDivider: {
      true: { table: tableStyles.columnDivider },
      false: {},
    },
    verticalAlign: {
      top: { table: '[--table-valign:top]' },
      middle: { table: '[--table-valign:middle]' },
      bottom: { table: '[--table-valign:bottom]' },
    },
    // 選んだ行の面。行（DataTableRow）が --data-table-row-selected を読む
    color: {
      primary: { root: '[--data-table-row-selected:var(--color-primary-subtle)]' },
      secondary: { root: '[--data-table-row-selected:var(--color-secondary-subtle)]' },
      neutral: { root: '[--data-table-row-selected:var(--color-select-neutral-selected)]' },
    },
    // 並べ替えていない列の印の濃さ。見出し（DataTableHeader）が --data-table-sort-idle・--data-table-sort-hover を読む
    //   hover: 指では載せられないので、指の密度（--density-coarse が 1）ではいつも出す（原則16）
    sortIndicator: {
      subtle: {
        root: '[--data-table-sort-hover:1] [--data-table-sort-idle:var(--data-table-sort-subtle-opacity)]',
      },
      always: { root: '[--data-table-sort-hover:1] [--data-table-sort-idle:1]' },
      hover: { root: '[--data-table-sort-hover:1] [--data-table-sort-idle:var(--density-coarse)]' },
    },
    scrollY: {
      true: { frame: 'max-h-(--data-table-max-height)' },
      false: {},
    },
  },
  defaultVariants: {
    variant: 'lines',
    showColumnDivider: false,
    verticalAlign: 'middle',
    color: 'neutral',
    sortIndicator: 'subtle',
    scrollY: false,
  },
});

/** 並べ替えていない列の印（上下の山）の出し方 */
export type DataTableSortIndicator = 'subtle' | 'always' | 'hover';

export interface DataTableProps extends Omit<ComponentProps<'table'>, 'color'> {
  /**
   * 見た目。Table と同じです。lines は行のあいだの横線、framed は外枠と見出しのグレーの面、banded は見出しの行を丸い帯にした形です
   * @default 'lines'
   */
  variant?: TableVariant;
  /**
   * 列のあいだに縦線を引きます
   * @default false
   */
  showColumnDivider?: boolean;
  /**
   * セルの縦の寄せ。行（DataTableRow）・セル（TableCell・DataTableHeader）で上書きできます
   * @default 'middle'
   */
  verticalAlign?: TableVerticalAlign;
  /**
   * 選ぶ箱の色と、選んだ行の面の色。primary・secondary はその色の淡い面、neutral はグレーの面です
   * @default 'neutral'
   */
  color?: ChoiceColor;
  /**
   * 並べ替えられるが、いまは並べ替えていない列の印（上下の山）の出し方。
   * subtle はふだん淡く置き、見出しに載せる（キーボードで止まる）と濃くします。always はいつも同じ濃さで出します。
   * hover は載せたときだけ出します（指で操作しているときは、載せられないのでいつも出します）。並べ替えている列の矢印は、どれでもいつも出ます
   * @default 'subtle'
   */
  sortIndicator?: DataTableSortIndicator;
  /**
   * 表の高さの上限（数は px、文字は CSS の長さ）。渡すと、はみ出した行は表の中で縦にスクロールし、見出しの行が上に貼り付きます
   */
  maxHeight?: number | string;
  /**
   * 読み込み中にします。表に aria-busy を付けます。行の代わりに DataTableLoading を置いて、形を先に見せます
   * @default false
   */
  loading?: boolean;
  /**
   * 読み直し中にします。行を残したまま、表に aria-busy を付け、読み直していることを見せます。
   * 並べ替え・ページ送りのあと、新しい行が届くまでに使います（最初の読み込みは loading）
   * @default false
   */
  refreshing?: boolean;
  /** 表の説明。表の下に小さく出し、表とスクロールの枠の名前にもします */
  caption?: ReactNode;
  /** caption を出さないときの、表の名前（読み上げ用）。スクロールの枠の名前にもなります */
  accessibleName?: string;
  /** 行をまとめる TableHead・TableBody を入れます */
  children?: ReactNode;
  /** 表とキャプションを包む要素（figure）に付きます */
  className?: string;
}

/**
 * データの表。並べ替え・選択・ページ送りの状態は持たず、使う側が props で渡します。
 * 本文の幅より広いときは横に、maxHeight より高いときは縦に、表だけがスクロールします
 */
export function DataTable({
  variant,
  showColumnDivider,
  verticalAlign,
  color = 'neutral',
  sortIndicator,
  maxHeight,
  loading,
  refreshing,
  caption,
  accessibleName,
  className,
  children,
  ...props
}: DataTableProps) {
  const scrollY = maxHeight != null;
  const styles = dataTable({
    variant,
    showColumnDivider,
    verticalAlign,
    color,
    sortIndicator,
    scrollY,
  });
  const captionId = useId();
  const labelledBy = caption == null ? undefined : captionId;
  const ariaLabel = caption == null ? accessibleName : undefined;
  const style: CSSProperties & Record<`--${string}`, string> = {};
  if (scrollY) {
    style['--data-table-max-height'] = typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight;
  }
  return (
    <DataTableContext.Provider value={{ color }}>
      <figure className={styles.root({ className })} style={style} data-slot="data-table">
        <ScrollFrame
          slot="data-table-scroll"
          className={styles.frame()}
          topEdge={false}
          viewportProps={{
            role: 'region',
            'aria-labelledby': labelledBy,
            'aria-label': ariaLabel,
          }}
        >
          <table
            className={styles.table()}
            aria-labelledby={labelledBy}
            aria-label={ariaLabel}
            aria-busy={loading || refreshing || undefined}
            data-refreshing={refreshing || undefined}
            {...props}
          >
            {children}
          </table>
        </ScrollFrame>
        {refreshing && (
          <span aria-hidden className={styles.refreshBar()} data-slot="data-table-refreshing">
            <span className={styles.refreshBarFill()} />
          </span>
        )}
        {caption == null ? null : (
          <figcaption id={captionId} className={styles.caption()}>
            {caption}
          </figcaption>
        )}
      </figure>
    </DataTableContext.Provider>
  );
}
