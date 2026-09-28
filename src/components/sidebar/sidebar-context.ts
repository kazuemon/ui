'use client';

import { createContext, type RefObject, use } from 'react';

export type SidebarPlacement = 'below' | 'full';
export type SidebarMotion = 'smooth' | 'none';
export type SidebarColor = 'primary' | 'secondary' | 'neutral';
export type SidebarNarrowSide = 'left' | 'right' | 'bottom' | 'auto';
export type SidebarVariant = 'plain' | 'muted';
/** 上下に固定する行の面。plain は列の地のまま、filled は淡い面 */
export type SidebarEdgeVariant = 'plain' | 'filled';
export type SidebarNarrowPresentation = 'drawer' | 'menu';
/** ふだんの濃さ。subtle は半分の濃さで置いて載せると濃く、always はいつも濃く、hover は載せたときだけ（DataTable の sortIndicator と同じ） */
export type SidebarIndicator = 'subtle' | 'always' | 'hover';
export type SidebarCountShape = 'count' | 'dot';
export type SidebarResizeHandle = 'line' | 'grip';
/** 行の件数・点の色 */
export type SidebarItemColor =
  | 'neutral'
  | 'primary'
  | 'secondary'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger';

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
  /** 帯の SidebarTrigger。狭い画面のシートを閉じたあと、ここに焦点を戻す */
  triggerRef: RefObject<HTMLButtonElement | null>;
  /** 幅を変えられるとき（resizable）の幅と範囲。変えられないときは null */
  resize: SidebarResize | null;
}

export interface SidebarResize {
  /** 開いた列の幅（px）。まだ変えていないときは undefined（部品の幅のまま） */
  width: number | undefined;
  setWidth: (next: number | undefined) => void;
  defaultWidth: number | undefined;
  minWidth: number;
  maxWidth: number;
  handle: SidebarResizeHandle;
  /** いちばん狭い幅よりさらに細くしたら畳むか */
  collapseOnResize: boolean;
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
  /** 畳んだ列で、件数を数字の札で出すか点にするか */
  countShape: SidebarCountShape;
}

export const SidebarNavContext = createContext<SidebarNavContextValue | null>(null);
