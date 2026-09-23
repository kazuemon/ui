'use client';

import { createContext, use } from 'react';

export type SidebarPlacement = 'below' | 'full';
export type SidebarMotion = 'smooth' | 'none';
export type SidebarColor = 'primary' | 'secondary' | 'neutral';
export type SidebarNarrowSide = 'left' | 'right' | 'bottom' | 'auto';

/** SidebarLayout が持つ状態。SidebarTrigger と Sidebar が読む */
export interface SidebarLayoutContextValue {
  /** 広い画面で、列を畳んでいるか（アイコンだけ残す） */
  collapsed: boolean;
  setCollapsed: (next: boolean) => void;
  /** 置かれた面が狭く、列の代わりに Drawer にする状態か */
  narrow: boolean;
  mobileOpen: boolean;
  setMobileOpen: (next: boolean) => void;
  motion: SidebarMotion;
  navId: string;
}

export const SidebarLayoutContext = createContext<SidebarLayoutContextValue | null>(null);

export function useSidebarLayout(name: string) {
  const context = use(SidebarLayoutContext);
  if (!context) throw new Error(`${name} は SidebarLayout の中に置いてください`);
  return context;
}

/**
 * 行の描き方。expanded は広い画面の開いた列、drawer は狭い画面の Drawer の中（どちらも行を縦に並べる）、
 * rail は畳んだ列（アイコンだけ）、flyout は畳んだ列から横に出す面の中（Menu の項目）
 */
export type SidebarListMode = 'expanded' | 'drawer' | 'rail' | 'flyout';

export interface SidebarNavContextValue {
  mode: SidebarListMode;
  /** 入れ子の深さ。0 が最上段 */
  depth: number;
  color: SidebarColor;
  openDelay: number;
  closeDelay: number;
}

export const SidebarNavContext = createContext<SidebarNavContextValue | null>(null);
