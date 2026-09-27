import type { ComponentProps, ReactNode } from 'react';

import { tv } from '../../internal/tv';

// ButtonGroup: 複数の Button（ボタンの見た目の Link も含む）を視覚的に連結して並べる、組み合わせの部品
// ToggleGroup と近い構造だが、選んでいる状態は持たない、素の Button の並び（役割は role="group" だけ）
//   矢印キーでの移動は持たせない。中身はそれぞれ独立した操作で、ToggleGroup のような単一の選択ではないので、
//   ふつうの Tab の並びのままにした — 原則にない判断（design/backlog.md の ButtonGroup の節）
// 詰め方（frame）は ToggleGroup の考え（軸269）をいちばん近い決定として流用した — 原則にない判断
//   connected（既定）: 隣り合わせ、仕切りの細い線（--color-line）で区切り、両端だけ角丸を残す
//   gap: それぞれ離して並べる。間は --button-group-gap
//   色・variant の一括指定は持たせない（v1）。ButtonGroup は選択状態を持たないので、色をそろえたいかどうかは
//   使う側にしか分からない（原則20: 部品は知らないことを決めない）。それぞれの Button に個別に渡す
// Button は自分の data-frame（親から見た in-data-[frame=…]）で connected の角丸だけを変えるので、
//   ButtonGroup 側は見た目の枠（gap・overflow-hidden など）だけを持てばよい（Button.tsx の button の base に同じ仕組みを足した）
const buttonGroupStyles = tv({
  base: [
    'inline-flex items-center gap-(--button-group-gap)',
    'data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch',
  ],
  variants: {
    frame: {
      gap: '',
      connected: [
        'gap-0 overflow-hidden rounded-control',
        'divide-x divide-(--color-line) data-[orientation=vertical]:divide-x-0 data-[orientation=vertical]:divide-y',
      ],
    },
  },
  defaultVariants: { frame: 'connected' },
});

/** ButtonGroup の詰め方。connected は隣り合わせで両端だけ角丸を残す、gap は離して並べる */
export type ButtonGroupFrame = 'gap' | 'connected';

/** 並べる向き */
export type ButtonGroupOrientation = 'horizontal' | 'vertical';

export interface ButtonGroupProps extends Omit<ComponentProps<'div'>, 'color'> {
  /**
   * 並べる向き
   * @default 'horizontal'
   */
  orientation?: ButtonGroupOrientation;
  /**
   * 詰め方。connected は隣り合わせて仕切りの細い線で区切り、両端だけ角丸を残します。gap はそれぞれ離して並べます
   * @default 'connected'
   */
  frame?: ButtonGroupFrame;
  /** グループの読み上げの名前（aria-label）。見出しが近くにないときに付けます */
  'aria-label'?: string;
  /** グループの枠（div）に付きます */
  className?: string;
  /**
   * 並べる Button（またはボタンの見た目の Link）。選んでいる状態は持たないので、value は渡しません
   */
  children?: ReactNode;
}

/**
 * 複数の Button を視覚的に連結して並べます。選んでいる状態は持たない、素の Button の並びです。
 * 選択状態を持たせたいとき（1つだけ、または複数を押し分けたいとき）は ToggleGroup を使います。
 */
export function ButtonGroup({
  orientation = 'horizontal',
  frame,
  className,
  ...props
}: ButtonGroupProps) {
  return (
    <div
      {...props}
      role="group"
      data-orientation={orientation}
      data-frame={frame ?? 'connected'}
      className={buttonGroupStyles({ frame, className })}
    />
  );
}
