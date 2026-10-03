import type { ReactElement } from 'react';

// 画面の幅の段と、段ごとに変える値（Grid・Masonry の columns、Stack の direction）
//   段は Tailwind の既定の sm・md・lg・xl。渡していない段は 1 つ下の段の値を使う（ADR-0311）

/** 列の数を変える画面の幅の段。base はいちばん狭い画面から、sm・md・lg・xl は Tailwind の既定の幅（40rem・48rem・64rem・80rem）から上 */
export type GridBreakpoint = 'base' | 'sm' | 'md' | 'lg' | 'xl';
/** 列の数。数なら画面の幅によらず同じ、段ごとの数なら画面の幅で変わる */
export type GridColumns = number | Partial<Record<GridBreakpoint, number>>;

export const breakpoints: readonly GridBreakpoint[] = ['base', 'sm', 'md', 'lg', 'xl'];

/** 数か段ごとの値を、段ごとの値にそろえる */
export function byBreakpoint<T extends string | number>(
  value: T | Partial<Record<GridBreakpoint, T>> | undefined
): Partial<Record<GridBreakpoint, T>> {
  if (value == null) return {};
  if (typeof value === 'object') return value;
  return { base: value };
}

// 列の数を段ごとに読むクラス。数だけを style で --columns-<段> に入れ、--columns が、いまの画面の幅で効く段の数を、
// 渡していない段は 1 つ下の段へ（base もないときは 1 列へ）さかのぼって読む
// 入れ子の枠が外の枠の段の数を受け継がないよう、段の変数は自分の要素で initial に戻す（渡した段は style が上書きする）
export const columnsClasses = [
  '[--columns-base:initial] [--columns-lg:initial] [--columns-md:initial] [--columns-sm:initial] [--columns-xl:initial]',
  '[--columns:var(--columns-base,1)]',
  'sm:[--columns:var(--columns-sm,var(--columns-base,1))]',
  'md:[--columns:var(--columns-md,var(--columns-sm,var(--columns-base,1)))]',
  'lg:[--columns:var(--columns-lg,var(--columns-md,var(--columns-sm,var(--columns-base,1))))]',
  'xl:[--columns:var(--columns-xl,var(--columns-lg,var(--columns-md,var(--columns-sm,var(--columns-base,1)))))]',
];

/** 渡した段の数だけを --columns-<段> に入れる */
export function columnVars(columns: GridColumns | undefined): Record<`--${string}`, string> {
  const vars: Record<`--${string}`, string> = {};
  for (const [bp, n] of Object.entries(byBreakpoint(columns))) {
    if (n != null) vars[`--columns-${bp}`] = String(n);
  }
  return vars;
}

/**
 * render に渡した要素が ul・ol か。子を li で包む・区切り線を li の枠線にするかを決めるのに使う
 * （要素の種類だけを見て、props は読まない）
 */
export function isListElement(render: ReactElement | undefined) {
  return render?.type === 'ul' || render?.type === 'ol';
}
