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

import { tv } from '../../internal/tv';

// 子を縦・横に一定の間隔で並べる枠 — 軸 230
//   間隔は段（--stack-gap-*）で持ち、値は尺度（--spacing）の倍数。入力方式では変えない（押すものではない）
//   Stack は間隔と並べ方だけを持ち、色・影を持たない。区切り線を入れる showDivider だけが細い線を足す（原則1: ページと同じレイヤーなので影なし）
const stack = tv({
  base: 'flex gap-(--stack-gap)',
  variants: {
    direction: {
      vertical: 'flex-col',
      horizontal: 'flex-row',
    },
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
    wrap: { true: 'flex-wrap', false: '' },
  },
  defaultVariants: {
    direction: 'vertical',
    gap: 'md',
    align: 'stretch',
    justify: 'start',
    wrap: true,
  },
});

// 区切り線。縦に並べるときは横の線、横に並べるときは縦の線
const separator = tv({
  base: 'shrink-0 self-stretch border-0 border-solid border-line',
  variants: {
    orientation: {
      horizontal: 'border-t-(length:--border-width-thin)',
      vertical: 'border-l-(length:--border-width-thin)',
    },
  },
});

export type StackDirection = 'vertical' | 'horizontal';
export type StackGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type StackAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type StackJustify = 'start' | 'center' | 'end' | 'between';

export interface StackProps extends ComponentProps<'div'> {
  /**
   * 並べる向き。vertical は縦、horizontal は横です
   * @default 'vertical'
   */
  direction?: StackDirection;
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
   * 子の間に区切り線を入れます。縦に並べるときは横の線、横に並べるときは縦の線です
   * @default false
   */
  showDivider?: boolean;
  /** 描く要素（Base UI の render と同じ）。ul・section などにするときは `render={<ul />}` を渡します */
  render?: ReactElement;
  /** 並べる子。間隔は gap で決めます */
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
  const orientation = direction === 'horizontal' ? 'vertical' : 'horizontal';
  return useRender({
    render,
    defaultTagName: 'div',
    props: {
      ...props,
      'data-slot': 'stack',
      className: stack({
        direction,
        gap,
        align,
        justify,
        wrap: direction === 'horizontal' && wrap,
        className,
      }),
      children: showDivider
        ? flatten(children).map((child, i) => (
            <Fragment key={isValidElement(child) && child.key != null ? child.key : i}>
              {i > 0 && (
                <div
                  role="separator"
                  aria-orientation={orientation}
                  data-slot="stack-separator"
                  className={separator({ orientation })}
                />
              )}
              {child}
            </Fragment>
          ))
        : children,
    },
  });
}
