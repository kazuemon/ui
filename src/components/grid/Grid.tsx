'use client';

import { useRender } from '@base-ui/react/use-render';
import type { ComponentProps, CSSProperties, ReactElement, ReactNode } from 'react';

import { tv } from '../../internal/tv';

// 子を格子（行と列）に並べる枠（ADR-0308〜0312）
//   Stack は 1 列、Grid は列を並べる。Masonry と違い隙間なく積まないので、CSS Grid だけで描ける（子の高さを測らない）
//   'use client' は、render を受けるための useRender（Base UI）のため。Stack・Container と同じ
//   列の数の決め方
//     columns なし: 入れ物の幅を minColumnWidth で割った数だけ列にする（子が少ないときは auto-fill で空いた列を残し、子を伸ばさない。ADR-0309）
//     columns だけ: 入れ物の幅によらず列の数を固定する（Masonry と同じ。ADR-0310）
//     columns と minColumnWidth: columns を上限にし、1 列が minColumnWidth を割るときは列を減らす（ADR-0310）
//   columns は画面の幅の段ごとにも渡せる（{ base: 1, md: 3 }。段は Tailwind の既定の sm・md・lg・xl。ADR-0311）
//     クラスは静的に書き、数だけを style で --grid-columns-<段> に入れる。--grid-columns は、いまの画面の幅で効く段の数を、
//     渡していない段は 1 つ下の段へ（base もないときは 1 列へ）さかのぼって読む。fixed・capped は --grid-columns だけを読むので、
//     数でも段ごとでも同じ式で描ける
//     入れ子の Grid が外の Grid の段の数を受け継がないよう、段の変数は自分の要素で initial に戻す（渡した段は style が上書きする）
//       1 列の最小の幅を「100% / 列の数 − 間隔」にすると、列の数ちょうどが入り、1 つ多いと入らない。
//       間隔が 0 のときも端数で 1 列落ちないよう、引く幅は 1px を下回らせない
//   同じ行の子の高さの揃え（align）は CSS Grid の既定の stretch（ADR-0308）
//   間隔は Stack と同じ間隔の段（ADR-0212）。押すものではないので入力方式では変えない
const grid = tv({
  base: [
    'grid gap-(--grid-gap) [--grid-min:var(--grid-column-width)]',
    '[--grid-columns-base:initial] [--grid-columns-lg:initial] [--grid-columns-md:initial] [--grid-columns-sm:initial] [--grid-columns-xl:initial]',
    '[--grid-columns:var(--grid-columns-base,1)]',
    'sm:[--grid-columns:var(--grid-columns-sm,var(--grid-columns-base,1))]',
    'md:[--grid-columns:var(--grid-columns-md,var(--grid-columns-sm,var(--grid-columns-base,1)))]',
    'lg:[--grid-columns:var(--grid-columns-lg,var(--grid-columns-md,var(--grid-columns-sm,var(--grid-columns-base,1))))]',
    'xl:[--grid-columns:var(--grid-columns-xl,var(--grid-columns-lg,var(--grid-columns-md,var(--grid-columns-sm,var(--grid-columns-base,1)))))]',
  ],
  variants: {
    layout: {
      fill: '[grid-template-columns:repeat(auto-fill,minmax(min(100%,var(--grid-min)),1fr))]',
      fixed: '[grid-template-columns:repeat(var(--grid-columns),minmax(0,1fr))]',
      capped:
        '[grid-template-columns:repeat(auto-fill,minmax(min(100%,max(var(--grid-min),100%_/_var(--grid-columns)_-_max(var(--grid-gap),1px))),1fr))]',
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
/** 列の数を変える画面の幅の段。base はいちばん狭い画面から、sm・md・lg・xl は Tailwind の既定の幅（40rem・48rem・64rem・80rem）から上 */
export type GridBreakpoint = 'base' | 'sm' | 'md' | 'lg' | 'xl';
/** 列の数。数なら画面の幅によらず同じ、段ごとの数なら画面の幅で変わる */
export type GridColumns = number | Partial<Record<GridBreakpoint, number>>;

const breakpoints: readonly GridBreakpoint[] = ['base', 'sm', 'md', 'lg', 'xl'];

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

// 渡した段の数だけを --grid-columns-<段> に入れる
function columnVars(columns: GridColumns | undefined): Record<`--${string}`, string> {
  if (columns == null) return {};
  if (typeof columns === 'number') return { '--grid-columns-base': String(columns) };
  const vars: Record<`--${string}`, string> = {};
  for (const bp of breakpoints) {
    const n = columns[bp];
    if (n != null) vars[`--grid-columns-${bp}`] = String(n);
  }
  return vars;
}

/**
 * 子を行と列の格子に並べる部品。列の数は、入れ物の幅から決めるか、画面の幅の段ごとに渡します
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
        ...columnVars(columns),
        ...style,
      } satisfies TokenStyle,
    },
  });
}
