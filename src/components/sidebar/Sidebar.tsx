'use client';

import { type ComponentProps, type ReactNode } from 'react';

import { CaretLeftIcon, CaretRightIcon } from '../../internal/icons';
import { useSheetPresentation } from '../../internal/sheet/use-narrow-screen';
import { cn } from '../../internal/tv';
import { Drawer } from '../drawer/Drawer';
import { ScrollArea } from '../scroll-area/ScrollArea';
import {
  type SidebarColor,
  SidebarNavContext,
  type SidebarNarrowSide,
  useSidebarLayout,
} from './sidebar-context';
import { sidebar } from './sidebar-styles';

export type {
  SidebarColor,
  SidebarMotion,
  SidebarNarrowSide,
  SidebarPlacement,
} from './sidebar-context';

// ページの横に並ぶ列 — 軸 303〜307（design/adr/0313〜0317）
//   広い画面: 本文の横に並ぶ列。畳むと幅が縮み、アイコンだけが残る（rail）。開け閉めで本文の幅が変わる
//   狭い画面: 列をやめ、Drawer と同じ挙動（後ろを暗くする・外を押す／Esc／はじくで閉じる）で出す。行き先を押すと閉じる
//   出す向きは narrowSide。auto は Navbar のメニューと同じ判定（指で操作していて画面が狭いときは下から、それ以外は左から）

export interface SidebarProps extends Omit<ComponentProps<'nav'>, 'color' | 'title'> {
  /**
   * 列の題。列の上に小さく出し（畳むと消えます）、読み上げでは列の名前と、狭い画面の Drawer の題になります
   */
  title: string;
  /** 行（SidebarItem）を並べます */
  children?: ReactNode;
  /**
   * いまいる行の色。primary・secondary は利用者が選ぶ色、neutral は色を持たないグレーです（原則6）
   * @default 'neutral'
   */
  color?: SidebarColor;
  /**
   * 列の下端に、畳む・開くボタンを置くか。ページの帯の SidebarTrigger とは別に、列の中でも開閉できます
   * @default false
   */
  collapseButton?: boolean;
  /**
   * 列の下端のボタンの文字（開いているとき）。畳んだ列では、読み上げの名前になります
   * @default '畳む'
   */
  collapseName?: string;
  /**
   * 列の下端のボタンの読み上げの名前（畳んでいるとき）
   * @default '開く'
   */
  expandName?: string;
  /**
   * 畳んだ列で、行に載せてから入れ子の面（や名前の札）が出るまで（ms）
   * @default 0
   */
  openDelay?: number;
  /**
   * 畳んだ列で、行から離れてから入れ子の面が閉じるまで（ms）。斜めに動いて別の行をかすめても、すぐには閉じません
   * @default 200
   */
  closeDelay?: number;
  /**
   * 狭い画面で、Drawer を出す向き。auto は、指で操作していて画面が狭いときは下から、それ以外は左から出します
   * @default 'left'
   */
  narrowSide?: SidebarNarrowSide;
  /**
   * 狭い画面の Drawer を描く場所。まとめて決めるときは ThemeProvider の portalContainer を使います
   * @default document.body
   */
  portalContainer?: HTMLElement | null;
  /** いちばん外の要素（nav）に付きます */
  className?: string;
}

/**
 * ページの横に並ぶ列。SidebarLayout の中に置き、行（SidebarItem）を並べます。畳むとアイコンだけが残り、狭い画面では Drawer になります
 */
export function Sidebar({
  title,
  children,
  color = 'neutral',
  collapseButton = false,
  collapseName = '畳む',
  expandName = '開く',
  openDelay = 0,
  closeDelay = 200,
  narrowSide = 'left',
  portalContainer,
  className,
  ref,
  ...props
}: SidebarProps) {
  const layout = useSidebarLayout('Sidebar');
  const { collapsed, setCollapsed, narrow, mobileOpen, setMobileOpen, motion, navId } = layout;
  const sheet = useSheetPresentation('auto');
  const side = narrowSide === 'auto' ? (sheet ? 'bottom' : 'left') : narrowSide;
  const s = sidebar({ color, collapsed, motion });

  if (narrow) {
    return (
      <Drawer
        title={title}
        side={side}
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        portalContainer={portalContainer}
      >
        <SidebarNavContext value={{ mode: 'drawer', depth: 0, color, openDelay, closeDelay }}>
          <nav
            {...props}
            ref={ref}
            aria-label={title}
            data-slot="sidebar"
            className={s.drawer({ className })}
          >
            <ul className="flex flex-col gap-0.5">{children}</ul>
          </nav>
        </SidebarNavContext>
      </Drawer>
    );
  }

  return (
    <SidebarNavContext
      value={{ mode: collapsed ? 'rail' : 'expanded', depth: 0, color, openDelay, closeDelay }}
    >
      <nav
        {...props}
        ref={ref}
        id={navId}
        aria-label={title}
        data-slot="sidebar"
        data-collapsed={collapsed || undefined}
        className={s.root({ className })}
      >
        <p aria-hidden="true" className={s.title()}>
          {title}
        </p>
        <ScrollArea
          orientation="vertical"
          className={s.list()}
          contentProps={{ className: s.listContent() }}
        >
          <ul className="flex flex-col gap-0.5">{children}</ul>
        </ScrollArea>
        {collapseButton && (
          <button
            type="button"
            aria-label={collapsed ? expandName : collapseName}
            aria-expanded={!collapsed}
            aria-controls={navId}
            onClick={() => setCollapsed(!collapsed)}
            className={cn(s.row(), 'mt-auto')}
          >
            <span aria-hidden="true" className={s.icon()}>
              {collapsed ? <CaretRightIcon /> : <CaretLeftIcon />}
            </span>
            <span className={collapsed ? 'sr-only' : s.label()}>{collapseName}</span>
          </button>
        )}
      </nav>
    </SidebarNavContext>
  );
}
