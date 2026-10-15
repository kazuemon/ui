'use client';

import { type ComponentProps, isValidElement, type ReactElement, type ReactNode } from 'react';

import { flattenChildren } from '../../internal/link-parts';
import { tv } from '../../internal/tv';
import { ScrollArea } from '../scroll-area/ScrollArea';

// Attachment を横に並べる。並びきらないときは、折り返す（wrap、既定）か、1 行のまま横にスクロールする
//   どちらにするかは置く場所しだいで、部品には分からないので使う側が選ぶ（原則20）
//   横にスクロールするときは ScrollArea で、続きは端の内側の影で見せる（原則1）
//   中の札のフォーカスの線が枠で切れないよう、内側に線の分の余白を取り、外側の余白で打ち消す
const list = tv({
  base: 'm-0 flex list-none gap-2 p-0',
  variants: {
    wrap: {
      true: 'flex-wrap',
      // 下は横のつまみの溝の分だけ広く空け、つまみを札に重ねない（原則1）
      false: 'w-max flex-nowrap p-1 pb-3',
    },
  },
});

// Fragment で包んで渡された札も、1 つずつ項目にする
//   key は包んだ Fragment の key を前に付け、兄弟の項目とぶつからないようにする（flattenChildren）
function flatItems(children: ReactNode): ReactElement[] {
  return flattenChildren(children).filter((child) => isValidElement(child));
}

export interface AttachmentListProps extends Omit<ComponentProps<'ul'>, 'children'> {
  /** 並べる Attachment。1 つずつ項目（li）に包みます */
  children?: ReactNode;
  /**
   * 並びきらないときに折り返します。false にすると 1 行のまま横にスクロールします（Composer の高さを変えたくないときなど）
   * @default true
   */
  wrap?: boolean;
  /** 並び（ul）に付きます */
  className?: string;
}

/**
 * Attachment を横に並べる並び。読み上げでは一覧（list）になります
 */
export function AttachmentList({
  children,
  wrap = true,
  className,
  ...props
}: AttachmentListProps) {
  const items = flatItems(children);
  if (items.length === 0) return null;
  const ul = (
    <ul data-slot="attachment-list" className={list({ wrap, className })} {...props}>
      {items.map((child) => (
        <li key={child.key} className="flex max-w-full min-w-0">
          {child}
        </li>
      ))}
    </ul>
  );
  if (wrap) return ul;
  return (
    <ScrollArea orientation="horizontal" className="-m-1 max-w-[calc(100%+var(--spacing)*2)]">
      {ul}
    </ScrollArea>
  );
}
