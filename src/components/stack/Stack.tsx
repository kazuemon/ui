'use client';

import { useRender } from '@base-ui/react/use-render';
import {
  Children,
  cloneElement,
  type ComponentProps,
  Fragment,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react';

import {
  breakpoints,
  byBreakpoint,
  type GridBreakpoint,
  isListElement,
} from '../../internal/breakpoints';
import { tv } from '../../internal/tv';

// 子を縦・横に一定の間隔で並べる枠 — 軸 230
//   間隔は段（--stack-gap-*）で持ち、値は尺度（--spacing）の倍数。入力方式では変えない（押すものではない）
//   Stack は間隔と並べ方だけを持ち、色・影を持たない。区切り線を入れる showDivider だけが細い線を足す（原則1: ページと同じレイヤーなので影なし）
//   向きは画面の幅の段ごとにも渡せる（Grid の columns と同じ段）。区切り線の向きも段ごとに変わるよう、
//   向きのクラスは --stack-vertical（縦 1・横 0）を持ち、線と li の余白はこれを掛けて縦横を切り替える
const stack = tv({
  base: 'flex gap-(--stack-gap)',
  variants: {
    gap: {
      none: '[--stack-gap:0px]',
      xs: '[--stack-gap:var(--stack-gap-xs)]',
      sm: '[--stack-gap:var(--stack-gap-sm)]',
      md: '[--stack-gap:var(--stack-gap-md)]',
      lg: '[--stack-gap:var(--stack-gap-lg)]',
      xl: '[--stack-gap:var(--stack-gap-xl)]',
    },
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
    },
    // ul・ol で描くときは、区切り線を div で差し込まず、2 つ目からの li の枠線にする（ul の直下に div を置かない）。
    // 線と子のあいだの間隔は li の余白で取るので、div の線と同じ見た目になる
    listDivider: {
      true: [
        '[&>li+li]:border-0 [&>li+li]:border-solid [&>li+li]:border-line',
        '[&>li+li]:border-t-[length:calc(var(--border-width-thin)*var(--stack-vertical))] [&>li+li]:pt-[calc(var(--stack-gap)*var(--stack-vertical))]',
        '[&>li+li]:border-l-[length:calc(var(--border-width-thin)*(1-var(--stack-vertical)))] [&>li+li]:pl-[calc(var(--stack-gap)*(1-var(--stack-vertical)))]',
      ],
      false: '',
    },
  },
  defaultVariants: {
    gap: 'md',
    align: 'stretch',
    justify: 'start',
    listDivider: false,
  },
});

// 段ごとの向きと折り返し。Tailwind が拾えるよう、クラスは段ごとに書き切る。折り返しは横のときだけ
const directionClasses: Record<GridBreakpoint, Record<StackDirection, string>> = {
  base: {
    vertical: 'flex-col [--stack-vertical:1]',
    horizontal: 'flex-row [--stack-vertical:0]',
  },
  sm: {
    vertical: 'sm:flex-col sm:[--stack-vertical:1]',
    horizontal: 'sm:flex-row sm:[--stack-vertical:0]',
  },
  md: {
    vertical: 'md:flex-col md:[--stack-vertical:1]',
    horizontal: 'md:flex-row md:[--stack-vertical:0]',
  },
  lg: {
    vertical: 'lg:flex-col lg:[--stack-vertical:1]',
    horizontal: 'lg:flex-row lg:[--stack-vertical:0]',
  },
  xl: {
    vertical: 'xl:flex-col xl:[--stack-vertical:1]',
    horizontal: 'xl:flex-row xl:[--stack-vertical:0]',
  },
};
const wrapClasses: Record<GridBreakpoint, Record<'wrap' | 'nowrap', string>> = {
  base: { wrap: 'flex-wrap', nowrap: 'flex-nowrap' },
  sm: { wrap: 'sm:flex-wrap', nowrap: 'sm:flex-nowrap' },
  md: { wrap: 'md:flex-wrap', nowrap: 'md:flex-nowrap' },
  lg: { wrap: 'lg:flex-wrap', nowrap: 'lg:flex-nowrap' },
  xl: { wrap: 'xl:flex-wrap', nowrap: 'xl:flex-nowrap' },
};

// 区切り線。縦に並べるときは横の線、横に並べるときは縦の線（--stack-vertical で切り替える）
const separator =
  'shrink-0 self-stretch border-0 border-solid border-line border-t-[length:calc(var(--border-width-thin)*var(--stack-vertical))] border-l-[length:calc(var(--border-width-thin)*(1-var(--stack-vertical)))]';

export type StackDirection = 'vertical' | 'horizontal';
/** 並べる向き。向きなら画面の幅によらず同じ、段ごとの向きなら画面の幅で変わる */
export type StackDirections = StackDirection | Partial<Record<GridBreakpoint, StackDirection>>;
export type StackGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type StackAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type StackJustify = 'start' | 'center' | 'end' | 'between';

export interface StackProps extends ComponentProps<'div'> {
  /**
   * 並べる向き。vertical は縦、horizontal は横です。画面の幅の段ごとの向きも渡せます（`direction={{ base: 'vertical', md: 'horizontal' }}`）。
   * 段は Grid の columns と同じで、渡していない段は 1 つ下の段の向きを使います（base もないときは縦）
   * @default 'vertical'
   */
  direction?: StackDirections;
  /**
   * 子の間隔。none は 0、xs は 4px、sm は 8px、md は 16px、lg は 24px、xl は 40px です
   * @default 'md'
   */
  gap?: StackGap;
  /**
   * 並べる向きと交わる向きの揃え。縦なら左右、横なら上下です。既定は伸ばす（stretch）ので、横で高さの違う子を上下の中央に揃えるときは `align="center"` を渡します
   * @default 'stretch'
   */
  align?: StackAlign;
  /**
   * 並べる向きの揃え。between は両端に寄せて、間を広げます
   * @default 'start'
   */
  justify?: StackJustify;
  /**
   * 入りきらないときに次の行へ折り返します。横に並べるときだけ効き、縦では無視されます。折り返さないときは `wrap={false}` を渡します
   * @default true
   */
  wrap?: boolean;
  /**
   * 子の間に区切り線を入れます。縦に並べるときは横の線、横に並べるときは縦の線です。
   * ul・ol で描くときは、線を 2 つ目からの li の枠線にします（子は li にします）
   * @default false
   */
  showDivider?: boolean;
  /**
   * 描く要素（Base UI の render と同じ）。ul・section などにするときは `render={<ul />}` を渡します。
   * ul・ol は要素を直接渡します。ul・ol を中で描く自作の部品を渡しても一覧とはみなさず、区切り線は li の枠線になりません
   */
  render?: ReactElement;
  /** 並べる子。間隔は gap で決めます。ul・ol で描くときは li を並べます */
  children?: ReactNode;
  /** 根の要素（render を渡したときはその要素）に付きます */
  className?: string;
}

// Fragment の中の子も 1 つずつ数える。null・false は数えない
// Children.toArray は入れ子ごとに key を .0 から振り直すので、Fragment の key を前に付けてぶつからないようにする
function flatten(nodes: ReactNode, prefix = ''): ReactNode[] {
  return Children.toArray(nodes).flatMap((child) => {
    if (!isValidElement<{ children?: ReactNode }>(child)) return [child];
    return child.type === Fragment
      ? flatten(child.props.children, `${prefix}${child.key}`)
      : [cloneElement(child, { key: `${prefix}${child.key}` })];
  });
}

/**
 * 子を縦・横に一定の間隔で並べる部品。間隔を段で選び、揃え・折り返し・区切り線を props で足します
 */
export function Stack({
  direction,
  gap,
  align,
  justify,
  wrap = true,
  showDivider = false,
  className,
  render,
  children,
  ...props
}: StackProps) {
  // base を渡していない（undefined を含む）ときは縦。向きのクラスと --stack-vertical を必ず 1 つ置く
  const directions = { ...byBreakpoint(direction) };
  directions.base ??= 'vertical';
  const responsive = breakpoints.flatMap((bp) => {
    const d = directions[bp];
    if (d == null) return [];
    return [
      directionClasses[bp][d],
      wrapClasses[bp][d === 'horizontal' && wrap ? 'wrap' : 'nowrap'],
    ];
  });
  // 読み上げの線の向きは、いちばん狭い画面の向きで決める（段ごとには変えられない）
  const orientation = directions.base === 'horizontal' ? 'vertical' : 'horizontal';
  const list = isListElement(render);
  return useRender({
    render,
    defaultTagName: 'div',
    props: {
      ...props,
      'data-slot': 'stack',
      className: stack({
        gap,
        align,
        justify,
        listDivider: list && showDivider,
        className: [...responsive, className],
      }),
      children:
        showDivider && !list
          ? flatten(children).map((child, i) => (
              <Fragment key={isValidElement(child) && child.key != null ? child.key : i}>
                {i > 0 && (
                  <div
                    role="separator"
                    aria-orientation={orientation}
                    data-slot="stack-separator"
                    className={separator}
                  />
                )}
                {child}
              </Fragment>
            ))
          : children,
    },
  });
}
