'use client';

import { cloneElement, type ReactElement } from 'react';

import { Menu } from '../menu/Menu';
import { MenuItem, MenuLinkItem } from '../menu/MenuItem';

export interface PaginationEllipsisMenuProps {
  /** 省略（…）が隠しているページ */
  pages: number[];
  /** 押すものの見た目（Pagination の番号と同じ） */
  className: string;
  /** 開くボタンの読み上げの名前 */
  label: string;
  /** 項目の文字を作る関数（番号の読み上げの名前と同じ） */
  pageLabel: (page: number) => string;
  /** 押せなくするか（Pagination の disabled） */
  disabled?: boolean;
  href?: (page: number) => string;
  render?: (page: number) => ReactElement;
  onChange?: (page: number) => void;
}

/**
 * 押すと、省略（…）が隠しているページを一覧で出す省略（ellipsisMenu）。
 * 押せるので、番号と同じ大きさ（指で押せる大きさ）を取る（原則17）
 */
export function PaginationEllipsisMenu({
  pages,
  className,
  label,
  pageLabel,
  disabled = false,
  href,
  render,
  onChange,
}: PaginationEllipsisMenuProps) {
  const asLink = href != null || render != null;
  return (
    <Menu
      align="center"
      title={label}
      trigger={
        <button
          type="button"
          disabled={disabled}
          aria-label={label}
          data-slot="pagination-ellipsis"
          data-kind="ellipsis"
          className={className}
        >
          …
        </button>
      }
    >
      {/* 開いている間に disabled になったときも選べないよう、項目にも渡す */}
      {pages.map((page) => {
        if (!asLink) {
          return (
            <MenuItem key={page} disabled={disabled} onClick={() => onChange?.(page)}>
              {pageLabel(page)}
            </MenuItem>
          );
        }
        // リンクのときも onChange を渡したときは、移る前に知らせる（移る動きは止めない）
        const element = render?.(page) ?? <a />;
        return (
          <MenuLinkItem
            key={page}
            disabled={disabled}
            href={href?.(page)}
            render={onChange ? cloneElement(element, { onClick: () => onChange(page) }) : element}
          >
            {pageLabel(page)}
          </MenuLinkItem>
        );
      })}
    </Menu>
  );
}
