'use client';

import {
  type ComponentProps,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  type RefObject,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { CaretLeftIcon, CaretRightIcon } from '../../internal/icons';
import { useSheetPresentation } from '../../internal/sheet/use-narrow-screen';
import { useMergedRefs } from '../../internal/use-merged-refs';
import { Drawer } from '../drawer/Drawer';
import { Menu } from '../menu/Menu';
import { MenuSeparator } from '../menu/MenuItem';
import { ScrollArea } from '../scroll-area/ScrollArea';
import {
  type SidebarColor,
  SidebarNavContext,
  type SidebarBadgeShape,
  type SidebarEdgeVariant,
  type SidebarIndicator,
  type SidebarNarrowPresentation,
  type SidebarNarrowSide,
  type SidebarResize,
  type SidebarVariant,
  useSidebarLayout,
} from './sidebar-context';
import { sidebar } from './sidebar-styles';

export type {
  SidebarColor,
  SidebarBadgeColor,
  SidebarBadgeShape,
  SidebarEdgeVariant,
  SidebarIndicator,
  SidebarItemBadge,
  SidebarMotion,
  SidebarNarrowPresentation,
  SidebarNarrowSide,
  SidebarPlacement,
  SidebarResizeHandle,
  SidebarVariant,
} from './sidebar-context';

// ページの横に並ぶ列 — ADR-0350〜0357
//   広い画面: 本文の横に並ぶ列。畳むと幅が縮み、アイコンだけが残る（rail）。開け閉めで本文の幅が変わる
//   狭い画面: 列をやめ、Drawer と同じ挙動（後ろを暗くする・外を押す／Esc／はじくで閉じる）で出す。行き先を押すと閉じる
//   出す向きは narrowSide。auto は Navbar のメニューと同じ判定（指で操作していて画面が狭いときは下から、それ以外は左から）

export interface SidebarProps extends Omit<ComponentProps<'nav'>, 'color' | 'title'> {
  /**
   * 狭い画面の Drawer の題。列の読み上げの名前（nav の名前）にも使います
   * @default 'メニュー'
   */
  drawerLabel?: string;
  /** 行（SidebarItem）を並べます */
  children?: ReactNode;
  /**
   * 列の上に固定する行（SidebarItem）。大会やワークスペースの切り替えなどを置きます。行が多くても、ここはスクロールしません
   */
  header?: ReactNode;
  /**
   * 列の下に固定する行（SidebarItem）。アカウントや設定などを置きます。collapseButton の上に並びます
   */
  footer?: ReactNode;
  /**
   * 列の地。plain は本文と同じ白、muted は淡いグレーです。どちらも本文との境に細い線を引きます。狭い画面の Drawer の中では使いません
   * @default 'plain'
   */
  variant?: SidebarVariant;
  /**
   * 上下に固定する行（header・footer）と、スクロールする行のあいだの区切り線を消します
   * @default false
   */
  hideDivider?: boolean;
  /**
   * 上に固定する行（header）の面。plain は列の地のまま、filled は淡い面を敷きます。いまいる大会やワークスペースを、列の中身と分けて見せたいときに使います
   * @default 'plain'
   */
  headerVariant?: SidebarEdgeVariant;
  /**
   * 下に固定する行（footer）の面。値の意味は headerVariant と同じです
   * @default 'plain'
   */
  footerVariant?: SidebarEdgeVariant;
  /**
   * 畳んだ列で、行の数字の札（SidebarItem の badge）をどう出すか。count は数字の札のまま、dot は数字を出さず点にします。行ごとに badge.collapsedShape で上書きできます
   * @default 'count'
   */
  collapsedItemBadgeShape?: SidebarBadgeShape;
  /**
   * 行ごとのメニュー（SidebarItem の menu）を開く ︙ のボタンの、ふだんの濃さ。subtle は半分の濃さで置き、行に載せると濃くします。
   * always はいつも濃く、hover は載せたとき（とキーボードで止まったとき）だけ出します。指で操作しているときは、hover でもいつも出します
   * @default 'subtle'
   */
  itemMenuIndicator?: SidebarIndicator;
  /**
   * 畳める節（SidebarSection の collapsible）の、開閉の印のふだんの濃さ。値の意味は itemMenuIndicator と同じです
   * @default 'subtle'
   */
  sectionIndicator?: SidebarIndicator;
  /**
   * 狭い画面での出し方。drawer は列の中身をそのまま Drawer に並べ、入れ子はその場で開け閉めします。
   * menu は Menu と同じく画面の下からシートを出し、入れ子の行を押すと中身が横に滑って入れ替わります（narrowSide は使いません）
   * @default 'drawer'
   */
  narrowPresentation?: SidebarNarrowPresentation;
  /**
   * 列の幅を変えるつまみの読み上げの名前（SidebarLayout の resizable のとき）
   * @default '列の幅'
   */
  resizeName?: string;
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
  collapseLabel?: string;
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
  drawerLabel = 'メニュー',
  children,
  header,
  footer,
  resizeName = '列の幅',
  color = 'neutral',
  variant = 'plain',
  hideDivider = false,
  headerVariant = 'plain',
  footerVariant = 'plain',
  collapsedItemBadgeShape = 'count',
  itemMenuIndicator = 'subtle',
  sectionIndicator = 'subtle',
  narrowPresentation = 'drawer',
  collapseButton = false,
  collapseLabel = '畳む',
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
  const { collapsed, setCollapsed, narrow, mobileOpen, setMobileOpen, motion, navId, resize } =
    layout;
  const [resizing, setResizing] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const mergedRef = useMergedRefs(navRef, ref);
  const sheet = useSheetPresentation('auto');
  const side = narrowSide === 'auto' ? (sheet ? 'bottom' : 'left') : narrowSide;
  const s = sidebar({
    color,
    collapsed,
    motion,
    variant,
    hideDivider,
    headerVariant,
    footerVariant,
    itemMenuIndicator,
    sectionIndicator,
  });
  const navValue = { color, openDelay, closeDelay, collapsedBadgeShape: collapsedItemBadgeShape };

  // 狭い画面を Menu と同じシートで出す: 行を Menu の項目にし、入れ子は同じシートの中で横に滑らせる
  if (narrow && narrowPresentation === 'menu') {
    return (
      <Menu
        // 開くのは帯の SidebarTrigger なので、Menu 自身の開くボタンは隠して置く
        trigger={<button type="button" hidden aria-hidden="true" tabIndex={-1} />}
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        title={drawerLabel}
        presentation="sheet"
        color={color}
        returnFocus={layout.triggerRef}
        portalContainer={portalContainer}
      >
        <SidebarNavContext value={{ ...navValue, mode: 'flyout', depth: 0, sheet: true }}>
          {header}
          {/* 列の上下に固定した行との境は、シートの中でも区切り線で分ける（hideDivider で消す） */}
          {header != null && !hideDivider && <MenuSeparator />}
          {children}
          {footer != null && !hideDivider && <MenuSeparator />}
          {footer}
        </SidebarNavContext>
      </Menu>
    );
  }

  if (narrow) {
    return (
      <Drawer
        title={drawerLabel}
        side={side}
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        returnFocus={layout.triggerRef}
        portalContainer={portalContainer}
      >
        <SidebarNavContext value={{ ...navValue, mode: 'drawer', depth: 0 }}>
          <nav
            {...props}
            ref={ref}
            aria-label={drawerLabel}
            data-slot="sidebar"
            className={s.drawer({ className })}
          >
            {header != null && <ul className="flex flex-col gap-0.5">{header}</ul>}
            <ul className="flex flex-col gap-0.5">{children}</ul>
            {footer != null && <ul className="flex flex-col gap-0.5">{footer}</ul>}
          </nav>
        </SidebarNavContext>
      </Drawer>
    );
  }

  // 畳んだ列でも、幅を変えて畳める設定（collapseOnResize）なら、つまみを残して引き出せるようにする
  const showHandle = resize != null && (!collapsed || resize.collapseOnResize);
  return (
    <SidebarNavContext value={{ ...navValue, mode: collapsed ? 'rail' : 'expanded', depth: 0 }}>
      <nav
        {...props}
        ref={mergedRef}
        id={navId}
        aria-label={drawerLabel}
        data-slot="sidebar"
        data-collapsed={collapsed || undefined}
        data-resizing={resizing || undefined}
        className={s.root({ className })}
        style={
          resize?.width !== undefined && !collapsed
            ? ({ ...props.style, '--sidebar-width': `${resize.width}px` } as CSSProperties)
            : props.style
        }
      >
        {header != null && (
          <div data-slot="sidebar-header" className={s.head()}>
            <ul className="flex flex-col gap-0.5">{header}</ul>
          </div>
        )}
        <ScrollArea
          orientation="vertical"
          className={s.list()}
          contentProps={{ className: s.listContent() }}
        >
          <ul className="flex flex-col gap-0.5">{children}</ul>
        </ScrollArea>
        {(footer != null || collapseButton) && (
          <div data-slot="sidebar-footer" className={s.footer()}>
            {footer != null && <ul className="flex flex-col gap-0.5">{footer}</ul>}
            {collapseButton && (
              <button
                type="button"
                aria-label={collapsed ? expandName : collapseLabel}
                aria-expanded={!collapsed}
                aria-controls={navId}
                onClick={() => setCollapsed(!collapsed)}
                className={s.row()}
              >
                <span aria-hidden="true" className={s.icon()}>
                  {collapsed ? <CaretRightIcon /> : <CaretLeftIcon />}
                </span>
                <span className={collapsed ? 'sr-only' : s.label()}>{collapseLabel}</span>
              </button>
            )}
          </div>
        )}
      </nav>
      {showHandle && (
        <ResizeHandle
          resize={resize}
          navRef={navRef}
          navId={navId}
          name={resizeName}
          resizing={resizing}
          setResizing={setResizing}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
      )}
    </SidebarNavContext>
  );
}

// 矢印キーで動かす幅（px）
const KEY_STEP = 16;
// いちばん狭い幅から、さらにこれだけ細くすると列を畳む（px）
const COLLAPSE_OVERSHOOT = 48;
// 畳んだ列から引き出すとき、畳む幅よりこれだけ広げたら開く（px）。行き来の境で開閉を繰り返さないよう、間をあける
const EXPAND_HYSTERESIS = 24;

/**
 * 列の端の幅を変えるつまみ。本文との境の線の上に重ねる。
 * ドラッグで幅を変え、いちばん狭い幅よりさらに細くすると畳む（collapseOnResize）。畳んだ列からは、右へ引き出すと開く。
 * ← → で 16px ずつ（いちばん狭い幅で ← を押すと畳み、畳んだ列で → を押すと開く）、Home・End で最小・最大。ダブルクリックではじめの幅に戻る
 */
function ResizeHandle({
  resize,
  navRef,
  navId,
  name,
  resizing,
  setResizing,
  collapsed,
  setCollapsed,
}: {
  resize: SidebarResize;
  navRef: RefObject<HTMLElement | null>;
  navId: string;
  name: string;
  resizing: boolean;
  setResizing: (next: boolean) => void;
  collapsed: boolean;
  setCollapsed: (next: boolean) => void;
}) {
  const s = sidebar();
  const drag = useRef<{ startX: number; startWidth: number; rtl: boolean } | null>(null);
  const { minWidth, maxWidth } = resize;
  const clamp = (value: number) => Math.min(maxWidth, Math.max(minWidth, Math.round(value)));
  const current = () => resize.width ?? navRef.current?.offsetWidth ?? minWidth;
  const collapseBelow = minWidth - COLLAPSE_OVERSHOOT;
  const expandAbove = collapseBelow + EXPAND_HYSTERESIS;
  // ドラッグの途中で開閉しても、同じドラッグのまま続ける（開閉のたびに描き直され、次の動きは新しい状態で読む）

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
    const startWidth = collapsed ? (navRef.current?.offsetWidth ?? 0) : current();
    drag.current = { startX: event.clientX, startWidth, rtl };
    setResizing(true);
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const delta = (event.clientX - d.startX) * (d.rtl ? -1 : 1);
    const raw = d.startWidth + delta;
    if (collapsed) {
      // 畳んだ列: 十分に引き出したら開き、そこからは幅を追う
      if (raw >= expandAbove) {
        setCollapsed(false);
        resize.setWidth(clamp(raw));
      }
      return;
    }
    if (resize.collapseOnResize && raw < collapseBelow) {
      setCollapsed(true);
      return;
    }
    resize.setWidth(clamp(raw));
  };
  const onPointerEnd = () => {
    drag.current = null;
    setResizing(false);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
    const grow = rtl ? 'ArrowLeft' : 'ArrowRight';
    const shrink = rtl ? 'ArrowRight' : 'ArrowLeft';
    if (collapsed) {
      if (event.key === grow || event.key === 'End') {
        event.preventDefault();
        setCollapsed(false);
      }
      return;
    }
    if (event.key === shrink && resize.collapseOnResize && current() <= minWidth) {
      event.preventDefault();
      setCollapsed(true);
      return;
    }
    let next: number | undefined;
    if (event.key === grow) next = current() + KEY_STEP;
    else if (event.key === shrink) next = current() - KEY_STEP;
    else if (event.key === 'Home') next = minWidth;
    else if (event.key === 'End') next = maxWidth;
    if (next === undefined) return;
    event.preventDefault();
    resize.setWidth(clamp(next));
  };
  // まだ幅を変えていないときの読み上げの値は、描いた列の幅を測って持つ
  const [measured, setMeasured] = useState<number>();
  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return undefined;
    const observer = new ResizeObserver(() => setMeasured(Math.round(nav.offsetWidth)));
    observer.observe(nav);
    return () => observer.disconnect();
  }, [navRef]);
  // 畳んだ列では、いちばん狭い幅を値とする（畳んだ列の幅は範囲の外なので）
  const width = collapsed ? minWidth : (resize.width ?? measured);
  return (
    <div className={s.handleSlot()}>
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label={name}
        aria-controls={navId}
        aria-valuemin={minWidth}
        aria-valuemax={maxWidth}
        aria-valuenow={width}
        tabIndex={0}
        data-slot="sidebar-resize-handle"
        data-resizing={resizing || undefined}
        className={s.handle()}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onDoubleClick={() => resize.setWidth(resize.defaultWidth)}
        onKeyDown={onKeyDown}
      >
        {resize.handle === 'grip' && <span aria-hidden="true" className={s.grip()} />}
      </div>
    </div>
  );
}
