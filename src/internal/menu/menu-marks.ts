'use client';

import { Children, Fragment, isValidElement, type ReactNode } from 'react';

import {
  MenuCheckboxItem,
  MenuGroup,
  type MenuGroupProps,
  MenuRadioGroup,
  MenuSubmenu,
  type MenuSubmenuProps,
} from '../../components/menu/MenuItem';

/**
 * children の中に、印を持つ項目（MenuCheckboxItem・MenuRadioGroup）があるか。Menu・ContextMenu の alignMarks が読み、
 * あるときだけ、印のない項目（MenuItem・MenuLinkItem・MenuSubmenu）にも印の場所を空けます
 * MenuGroup・MenuSubmenu（自分の items）の中までは見ますが、利用者が作った別のコンポーネントの中までは見ません
 */
export function menuChildrenHaveMarks(children: ReactNode): boolean {
  return Children.toArray(children).some((child) => {
    if (!isValidElement(child)) return false;
    if (child.type === MenuCheckboxItem || child.type === MenuRadioGroup) return true;
    // <>…</> は開いて中の子を見る（Children.toArray は Fragment を開かない）
    if (child.type === Fragment) {
      return menuChildrenHaveMarks((child.props as { children?: ReactNode }).children);
    }
    if (child.type === MenuGroup) {
      return menuChildrenHaveMarks((child.props as MenuGroupProps).children);
    }
    if (child.type === MenuSubmenu) {
      return menuChildrenHaveMarks((child.props as MenuSubmenuProps).items);
    }
    return false;
  });
}
