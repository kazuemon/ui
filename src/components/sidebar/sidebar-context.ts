'use client';

import { createContext, type RefObject, use } from 'react';

export type SidebarPlacement = 'under-header' | 'full-height';
export type SidebarMotion = 'smooth' | 'none';
export type SidebarColor = 'primary' | 'secondary' | 'neutral';
export type SidebarNarrowSide = 'left' | 'right' | 'bottom' | 'auto';
export type SidebarVariant = 'plain' | 'muted';
/** 上下に固定する行の面。plain は列の地のまま、filled は淡い面 */
export type SidebarEdgeVariant = 'plain' | 'filled';
export type SidebarNarrowPresentation = 'drawer' | 'menu';
/** ふだんの濃さ。subtle は半分の濃さで置いて載せると濃く、always はいつも濃く、hover は載せたときだけ（DataTable の sortIndicator と同じ） */
export type SidebarIndicator = 'subtle' | 'always' | 'hover';
/** 行の札の形。count は数字の札、dot は数字のない点 */
export type SidebarBadgeShape = 'count' | 'dot';
export type SidebarResizeHandle = 'line' | 'grip';
/** 行の札の色 */
export type SidebarBadgeColor =
  | 'neutral'
  | 'primary'
  | 'secondary'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger';

/** 行の札（SidebarItem の badge）。値の名前は Badge と同じです */
export interface SidebarItemBadge {
  /** 数。0 以下のときは出しません */
  count?: number;
  /**
   * これを超える数は「99+」のように出します
   * @default 99
   */
  max?: number;
  /**
   * 形。書かないときは、count があれば数字の札（count）、なければ点（dot）です
   */
  shape?: SidebarBadgeShape;
  /**
   * 色。neutral はグレー（開いた列では淡いグレーの札）、ほかは塗りの色です
   * @default 'neutral'
   */
  color?: SidebarBadgeColor;
  /**
   * 畳んだ列での形。書かないときは Sidebar の collapsedItemBadgeShape に従います。点の札（shape が dot）には効きません
   */
  collapsedShape?: SidebarBadgeShape;
}

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
  /** 畳んだ列で、数字の札をそのまま出すか点にするか（行の badge.collapsedShape がなければこれ） */
  collapsedBadgeShape: SidebarBadgeShape;
}

export const SidebarNavContext = createContext<SidebarNavContextValue | null>(null);
