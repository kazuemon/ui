'use client';

import type { ReactElement, ReactNode } from 'react';

import { textLinkSizeReset } from '../../internal/reading/text-link';
import { Link, type LinkProps } from '../link/Link';

// 行のリンク。行（DataTableRow）の中の、行を代表するセル（注文番号・名前）に置く、見た目も文字のリンク（Link の variant="text"）
// これを置いた行だけ、行のどこを押してもこのリンクを押したのと同じになる。キーボードと読み上げはこのリンクで移る
// 色は使う側が選び、既定はグレー（Link と同じ）。行に載せると、リンクに載せたときと同じく下線を濃くする
// 文字の大きさは表の文字のまま（表の textSize に従う）
//   フォーカスの線はリンクの文字に付け、行には載せたときと同じ面を敷く（DataTableRow）
const rowHover = 'in-[tr:hover]:[text-decoration-color:var(--color-link-underline-hover)]';

export interface DataTableRowLinkProps extends Omit<
  LinkProps,
  'variant' | 'caption' | 'disabled' | 'contentAlign' | 'leadIconPlacement' | 'shape'
> {
  /**
   * リンクの色。primary は進めたい移動、secondary は用途を限定しない選べる色です。指定しないときはグレー（neutral）です
   * @default 'neutral'
   */
  color?: LinkProps['color'];
  /** 行き先 */
  href?: string;
  /**
   * 描く要素。Next.js の Link などを渡すと、その要素に行のリンクの見た目を重ねます（例: `render={<NextLink href="/orders/1" />}`）
   */
  render?: ReactElement;
  /** リンクの文字（注文番号・名前など、行を代表するもの） */
  children?: ReactNode;
  /** リンクの要素（a か render の要素）に付きます */
  className?: string;
}

/** 行のリンク（a）。これを置いた行は、行のどこを押してもこのリンクを押したのと同じになります */
export function DataTableRowLink({ className, ...props }: DataTableRowLinkProps) {
  return (
    <Link
      className={[textLinkSizeReset, rowHover, className].filter(Boolean).join(' ')}
      {...props}
      // 行の押下が探す印。使う側の data-slot で上書きさせない
      data-slot="data-table-row-link"
      variant="text"
    />
  );
}
