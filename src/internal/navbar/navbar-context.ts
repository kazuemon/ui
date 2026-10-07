'use client';

import { createContext, use, useLayoutEffect } from 'react';

// Navbar が中のまとまり（NavbarLinks・NavbarGroup・NavigationMenu）と行き先に配る値

type Placement = 'bar' | 'menu';

/** 帯が狭いときの置き場所。menu はメニューのボタンに畳み、bar は帯に残し、hidden は隠す */
export type NavbarNarrowPlacement = 'menu' | 'bar' | 'hidden';
/** いまいるページの印。text は文字を太く、neutral・primary は pill を敷き、underline は文字の下に線 */
export type NavbarCurrentIndicator = 'text' | 'neutral' | 'primary' | 'underline';

export interface NavbarContextValue {
  placement: Placement;
  indicator: NavbarCurrentIndicator;
  accessibleName: string;
  /** メニューへ畳むまとまりが名乗り出る。戻り値で取り消す */
  registerMenuGroup: () => () => void;
}

// Navbar の外に置いたときの値。NavigationMenu は、これかどうかで Navbar の中にいるかを見分ける
export const outsideNavbar: NavbarContextValue = {
  placement: 'bar',
  indicator: 'text',
  accessibleName: 'メイン',
  registerMenuGroup: () => () => {},
};

export const NavbarContext = createContext<NavbarContextValue>(outsideNavbar);

// まとまり（NavbarLinks・NavbarGroup・NavigationMenu）の共通の処理
//   帯の中で menu のものはメニューへ畳むと名乗り出る。メニューの中では menu のものだけを描く
//   inNavbar: Navbar の中（帯かメニュー）に置かれているか。外では帯が狭いときに隠す指定（@3xl/navbar）を付けない
export function useNavbarGroup(narrowPlacement: NavbarNarrowPlacement) {
  const context = use(NavbarContext);
  const { placement, registerMenuGroup } = context;
  useLayoutEffect(() => {
    if (placement !== 'bar' || narrowPlacement !== 'menu') return undefined;
    return registerMenuGroup();
  }, [placement, narrowPlacement, registerMenuGroup]);
  return {
    ...context,
    visible: placement === 'bar' || narrowPlacement === 'menu',
    inNavbar: context !== outsideNavbar,
  };
}
