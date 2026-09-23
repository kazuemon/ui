'use client';

import { useRender } from '@base-ui/react/use-render';
import type { ComponentProps, CSSProperties, ReactElement, ReactNode } from 'react';

import { tv } from '../../internal/tv';

// 子を格子（行と列）に並べる枠 — 軸 300〜302（未決）
//   Stack は 1 列、Grid は列を並べる。Masonry と違い隙間なく積まないので、CSS Grid だけで描ける（子の高さを測らない）
//   'use client' は、render を受けるための useRender（Base UI）のため。Stack・Container と同じ
//   列の数は入れ物の幅で決める（原則11: 入れ物の幅で決まるものは、画面の幅や入力方式と分ける）。画面の幅の段は持たない
//     columns なし: 入れ物の幅を minColumnWidth で割った数だけ列にする（--grid-fill。軸 301 で auto-fill か auto-fit かを比べる）
//     columns だけ: 入れ物の幅によらず列の数を固定する（Masonry と同じ）
//     columns と minColumnWidth: columns を上限にし、1 列が minColumnWidth を割るときは列を減らす（軸 302）
//       1 列の最小の幅を「100% / 列の数 − 間隔」にすると、列の数ちょうどが入り、1 つ多いと入らない。
//       間隔が 0 のときも端数で 1 列落ちないよう、引く幅は 1px を下回らせない
//   同じ行の子の高さの揃え（align）は軸 300 で比べる。いまは CSS Grid の既定（stretch）
//   間隔は Stack と同じ間隔の段（ADR-0212）。押すものではないので入力方式では変えない
const grid = tv({
  base: 'grid gap-(--grid-gap) [--grid-min:var(--grid-column-width)]',
  variants: {
    layout: {
      fill: '[grid-template-columns:repeat(var(--grid-fill),minmax(min(100%,var(--grid-min)),1fr))]',
      fixed: '[grid-template-columns:repeat(var(--grid-columns),minmax(0,1fr))]',
      capped:
        '[grid-template-columns:repeat(var(--grid-fill),minmax(min(100%,max(var(--grid-min),100%_/_var(--grid-columns)_-_max(var(--grid-gap),1px))),1fr))]',
    },
    gap: {
      none: '[--grid-gap:0px]',
      xs: '[--grid-gap:var(--stack-gap-xs)]',
      sm: '[--grid-gap:var(--stack-gap-sm)]',
      md: '[--grid-gap:var(--stack-gap-md)]',
      lg: '[--grid-gap:var(--stack-gap-lg)]',
      xl: '[--grid-gap:var(--stack-gap-xl)]',
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
   * 1 列がこの幅を割るときは列を減らします（スマホは 1 列、広い画面は 3 列のような並べ方）
   * @default 240
   */
  minColumnWidth?: number;
  /**
   * 列の数。これだけを渡すと、入れ物の幅によらず同じ列数に固定します。
   * 狭い入れ物で列を減らしたいときは、minColumnWidth も渡します
   */
  columns?: number;
  /**
   * 子の間隔（縦横とも）。Stack の gap と同じ段です（none は 0、xs は 4px、sm は 8px、md は 16px、lg は 24px、xl は 40px）
   * @default 'md'
   */
  gap?: GridGap;
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
 * 子を行と列の格子に並べる部品。列の数は、入れ物の幅から決めるか、固定します
 */
export function Grid({
  minColumnWidth,
  columns,
  gap,
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
      className: grid({ layout, gap, align, className }),
      style: {
        ...(minColumnWidth != null && { '--grid-min': `${minColumnWidth}px` }),
        ...(columns != null && { '--grid-columns': String(columns) }),
        ...style,
      } satisfies TokenStyle,
    },
  });
}
