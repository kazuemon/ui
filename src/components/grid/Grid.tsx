'use client';

import { useRender } from '@base-ui/react/use-render';
import type { ComponentProps, CSSProperties, ReactElement, ReactNode } from 'react';

import { columnsClasses, columnVars, type GridColumns } from '../../internal/breakpoints';
import { tv } from '../../internal/tv';

export type { GridBreakpoint, GridColumns } from '../../internal/breakpoints';

// 子を格子（行と列）に並べる枠（ADR-0308〜0312）
//   Stack は 1 列、Grid は列を並べる。Masonry と違い隙間なく積まないので、CSS Grid だけで描ける（子の高さを測らない）
//   'use client' は、render を受けるための useRender（Base UI）のため。Stack・Container と同じ
//   列の数の決め方
//     columns なし: 入れ物の幅を minColumnWidth で割った数だけ列にする（子が少ないときは auto-fill で空いた列を残し、子を伸ばさない。ADR-0309）
//     columns だけ: 入れ物の幅によらず列の数を固定する（Masonry と同じ。ADR-0310）
//     columns と minColumnWidth: columns を上限にし、1 列が minColumnWidth を割るときは列を減らす（ADR-0310）
//   columns は画面の幅の段ごとにも渡せる（{ base: 1, md: 3 }。段は Tailwind の既定の sm・md・lg・xl。ADR-0311）
//     クラスは静的に書き、数だけを style で --columns-<段> に入れる（src/internal/breakpoints.ts。Masonry・DescriptionList と同じ）。
//     fixed・capped は --columns だけを読むので、数でも段ごとでも同じ式で描ける
//       1 列の最小の幅を「100% / 列の数 − 間隔」にすると、列の数ちょうどが入り、1 つ多いと入らない。
//       間隔が 0 のときも端数で 1 列落ちないよう、引く幅は 1px を下回らせない
//   同じ行の子の高さの揃え（align）は CSS Grid の既定の stretch（ADR-0308）
//   間隔は Stack と同じ間隔の段（ADR-0212）。押すものではないので入力方式では変えない
const grid = tv({
  base: [
    // 縦横の間隔。rowGap・columnGap を渡さなければ gap の段（--grid-gap）。入れ子の Grid が外の値を受け継がないよう、自分の要素で決め直す
    'grid gap-x-(--grid-column-gap) gap-y-(--grid-row-gap) [--grid-column-gap:var(--grid-gap)] [--grid-row-gap:var(--grid-gap)]',
    '[--grid-min:var(--grid-column-width)]',
    ...columnsClasses,
  ],
  variants: {
    layout: {
      fill: '[grid-template-columns:repeat(auto-fill,minmax(min(100%,var(--grid-min)),1fr))]',
      fixed: '[grid-template-columns:repeat(var(--columns),minmax(0,1fr))]',
      capped:
        '[grid-template-columns:repeat(auto-fill,minmax(min(100%,max(var(--grid-min),100%_/_var(--columns)_-_max(var(--grid-column-gap),1px))),1fr))]',
    },
    gap: {
      none: '[--grid-gap:0px]',
      xs: '[--grid-gap:var(--stack-gap-xs)]',
      sm: '[--grid-gap:var(--stack-gap-sm)]',
      md: '[--grid-gap:var(--stack-gap-md)]',
      lg: '[--grid-gap:var(--stack-gap-lg)]',
      xl: '[--grid-gap:var(--stack-gap-xl)]',
    },
    rowGap: {
      none: '[--grid-row-gap:0px]',
      xs: '[--grid-row-gap:var(--stack-gap-xs)]',
      sm: '[--grid-row-gap:var(--stack-gap-sm)]',
      md: '[--grid-row-gap:var(--stack-gap-md)]',
      lg: '[--grid-row-gap:var(--stack-gap-lg)]',
      xl: '[--grid-row-gap:var(--stack-gap-xl)]',
    },
    columnGap: {
      none: '[--grid-column-gap:0px]',
      xs: '[--grid-column-gap:var(--stack-gap-xs)]',
      sm: '[--grid-column-gap:var(--stack-gap-sm)]',
      md: '[--grid-column-gap:var(--stack-gap-md)]',
      lg: '[--grid-column-gap:var(--stack-gap-lg)]',
      xl: '[--grid-column-gap:var(--stack-gap-xl)]',
    },
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
    },
  },
  defaultVariants: { layout: 'fill', gap: 'md', align: 'stretch' },
});

type TokenStyle = CSSProperties & Record<`--${string}`, string>;

export type GridGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type GridAlign = 'start' | 'center' | 'end' | 'stretch';
export interface GridProps extends ComponentProps<'div'> {
  /**
   * 列の最小の幅（px）。入れ物の幅をこの値で割った数だけ列にします。columns と一緒に渡すと、columns を上限にして、
   * 1 列がこの幅を割るときは列を減らします（サイドバーの横のような、狭い入れ物に置くときの並べ方）
   * @default 240
   */
  minColumnWidth?: number;
  /**
   * 列の数。数を渡すと、どの画面の幅でも同じ列の数です（`columns={3}`）。
   * 画面の幅の段ごとの数を渡すと、画面の幅で列の数を変えます（`columns={{ base: 1, md: 2, lg: 4 }}`）。
   * 段は base（いちばん狭い画面）・sm・md・lg・xl で、渡していない段は 1 つ下の段の数を使います（base もないときは 1 列）。
   * 置いた入れ物の幅では変わりません。狭い入れ物で列を減らしたいときは、minColumnWidth も渡します
   */
  columns?: GridColumns;
  /**
   * 子の間隔（縦横とも）。Stack の gap と同じ段です（none は 0、xs は 4px、sm は 8px、md は 16px、lg は 24px、xl は 40px）
   * @default 'md'
   */
  gap?: GridGap;
  /** 行と行のあいだ（縦）の間隔。渡すと gap より優先します。段は gap と同じです */
  rowGap?: GridGap;
  /** 列と列のあいだ（横）の間隔。渡すと gap より優先します。段は gap と同じです */
  columnGap?: GridGap;
  /**
   * 同じ行の子の、上下の揃え。stretch は行でいちばん高い子に合わせて伸ばします（カードの高さがそろう）。
   * 子の高さをそのままにするときは `align="start"` を渡します
   * @default 'stretch'
   */
  align?: GridAlign;
  /** 描く要素（Base UI の render と同じ）。ul・section などにするときは `render={<ul />}` を渡します */
  render?: ReactElement;
  /** 並べる子。渡した順に、1 行目を左から右へ、埋まったら次の行へ並びます */
  children?: ReactNode;
  /** 根の要素（render を渡したときはその要素）に付きます */
  className?: string;
}

/**
 * 子を行と列の格子に並べる部品。列の数は、入れ物の幅から決めるか、画面の幅の段ごとに渡します
 */
export function Grid({
  minColumnWidth,
  columns,
  gap,
  rowGap,
  columnGap,
  align,
  className,
  render,
  style,
  ...props
}: GridProps) {
  const layout = columns == null ? 'fill' : minColumnWidth == null ? 'fixed' : 'capped';
  return useRender({
    render,
    defaultTagName: 'div',
    props: {
      ...props,
      'data-slot': 'grid',
      className: grid({ layout, gap, rowGap, columnGap, align, className }),
      style: {
        ...(minColumnWidth != null && { '--grid-min': `${minColumnWidth}px` }),
        ...columnVars(columns),
        ...style,
      } satisfies TokenStyle,
    },
  });
}
