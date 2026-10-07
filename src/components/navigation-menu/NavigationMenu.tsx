'use client';

import { NavigationMenu as BaseNavigationMenu } from '@base-ui/react/navigation-menu';
import { useRender } from '@base-ui/react/use-render';
import {
  createContext,
  type CSSProperties,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  use,
  useId,
  useState,
} from 'react';

import { useDensityScope } from '../../internal/density-scope';
import { focusRing } from '../../internal/focus-styles';
import { ArrowUpRightIcon, CaretDownIcon } from '../../internal/icons';
import { type ItemIconVariant, softIconBoxClass } from '../../internal/menu/item-icon';
import { newTabNaming, opensNewTab, withRenderOverrides } from '../../internal/link-parts';
import { OverlayCloseContext } from '../../internal/overlay/overlay-close-context';
import type { PopupProps } from '../../internal/overlay/overlay-props';
import { popupCollisionPadding, readCssLength } from '../../internal/overlay/popup-styles';
import { cn, tv } from '../../internal/tv';
import { usePortalContainer } from '../../internal/ui-config';
import { useMergedRefs } from '../../internal/use-merged-refs';
import {
  navbarLink,
  navbarLinks,
  type NavbarCurrentIndicator,
  type NavbarNarrowPlacement,
  useNavbarGroup,
} from '../navbar/Navbar';

// ページの上の帯から、行き先の一覧を下に開くメニュー — ADR-0485〜0488
//   帯の項目（NavigationMenuItem）に載せる・押すと、題と説明つきの行き先（NavigationMenuLink）を並べた面が下に開く
//   項目を移ると、面の大きさと位置が滑らかに変わり、中身は移った向きから入れ替わる（Base UI の Viewport）
//   開くボタンと帯の行き先は NavbarLink と同じ平らな pill（原則5）。Navbar の中に置くと、いまいるページの印も Navbar に従う
//   面は Popover と同じ（白・細い輪郭・--shadow-overlay・部品の角 — 原則1・5）。面の中の行き先は一覧の項目（原則3: hover で塗る）
//   Navbar の中では NavbarLinks の代わりに置く。帯が狭いとき（narrowPlacement）は NavbarLinks と同じく Navbar のメニューへ畳み、
//     メニューの中では、項目の名前を見出しにして、行き先を縦に並べ直す（面は開かない）

type Level = 'top' | 'panel';

const NavigationMenuContext = createContext<{
  /** bar は帯（Base UI の NavigationMenu）、menu は Navbar の畳んだメニューの中 */
  placement: 'bar' | 'menu';
  /** top は帯に直に並ぶもの、panel は開いた面（メニューでは見出しの下）に並ぶもの */
  level: Level;
  indicator: NavbarCurrentIndicator;
  keepMounted: boolean;
}>({ placement: 'bar', level: 'top', indicator: 'text', keepMounted: false });

const styles = tv({
  slots: {
    list: 'flex items-center gap-(--spacing)',
    // 開くボタン（NavbarLink の帯の見た目に ▼ を足す）
    //   開いているあいだ: 文字を本文の色にし、hover と同じ淡い塗りを残す。▼ は回さない（ADR-0487）
    trigger: [
      'gap-1',
      'data-popup-open:text-fg data-popup-open:[--flat-bg:color-mix(in_oklab,var(--color-fg)_var(--flat-hover-mix),transparent)]',
    ],
    caret: 'size-(--spacing-icon) shrink-0',
    // 位置を決める要素。項目を移ると、面と同じ長さで滑る（data-instant: 開いた直後と閉じたあとは動かさない）
    //   switchMotion="none" では、面の大きさ・位置と中身をすぐ切り替える（中の要素は、ここで 0 にした値を継ぐ）
    //   開くボタンと面の間に、同じ高さの見えない橋を架ける（マウスが間を通っても閉じない）
    positioner: [
      'z-10 outline-none',
      '[transition:top_var(--navigation-menu-switch-duration)_var(--ease-sheet),left_var(--navigation-menu-switch-duration)_var(--ease-sheet),right_var(--navigation-menu-switch-duration)_var(--ease-sheet),bottom_var(--navigation-menu-switch-duration)_var(--ease-sheet)]',
      'data-instant:[transition:none] motion-reduce:[transition:none]',
      "before:absolute before:inset-x-0 before:content-['']",
      'data-[side=bottom]:before:top-[calc(var(--navigation-menu-offset)*-1)] data-[side=bottom]:before:h-(--navigation-menu-offset)',
      'data-[side=top]:before:bottom-[calc(var(--navigation-menu-offset)*-1)] data-[side=top]:before:h-(--navigation-menu-offset)',
    ],
    // 面。大きさは Base UI が測って --popup-width・--popup-height に入れ、項目を移るとそこへ滑る
    //   開閉は浮かぶ面と同じ（本体の側に寄った位置から、濃さと一緒に滑る — ADR-0054）
    popup: [
      'relative overflow-clip bg-surface text-fg shadow-overlay outline-none',
      'rounded-control border-(length:--border-width-thin) border-surface-line',
      'h-(--popup-height) w-(--popup-width) max-w-(--available-width)',
      '[transition:opacity_var(--duration-normal)_var(--ease-sheet),translate_var(--duration-normal)_var(--ease-sheet),width_var(--navigation-menu-switch-duration)_var(--ease-sheet),height_var(--navigation-menu-switch-duration)_var(--ease-sheet)]',
      'data-ending-style:[transition-duration:var(--popup-duration-out)]',
      'data-ending-style:opacity-0 data-starting-style:opacity-0',
      'data-[side=bottom]:data-ending-style:[translate:0_calc(var(--popup-shift)*-1)] data-[side=bottom]:data-starting-style:[translate:0_calc(var(--popup-shift)*-1)]',
      'data-[side=top]:data-ending-style:[translate:0_var(--popup-shift)] data-[side=top]:data-starting-style:[translate:0_var(--popup-shift)]',
      'motion-reduce:[transition:none]',
    ],
    viewport: 'relative size-full overflow-hidden',
    // 面の中身。項目を移ると、移った向きから switch-shift だけ滑りながら入れ替わる
    content: [
      'box-border w-max max-w-(--available-width) p-(--navigation-menu-padding)',
      '[transition:opacity_calc(var(--navigation-menu-switch-duration)/2)_ease,translate_var(--navigation-menu-switch-duration)_var(--ease-sheet)]',
      'data-ending-style:opacity-0 data-starting-style:opacity-0',
      'data-starting-style:data-[activation-direction=left]:[translate:calc(var(--navigation-menu-switch-shift)*-1)_0]',
      'data-starting-style:data-[activation-direction=right]:[translate:var(--navigation-menu-switch-shift)_0]',
      'data-ending-style:data-[activation-direction=left]:[translate:var(--navigation-menu-switch-shift)_0]',
      'data-ending-style:data-[activation-direction=right]:[translate:calc(var(--navigation-menu-switch-shift)*-1)_0]',
      'motion-reduce:[transition:none]',
    ],
    // 行き先を列に並べる。列の幅は --navigation-menu-column-width、狭い画面では縮める
    grid: 'grid grid-cols-[repeat(var(--navigation-menu-columns),minmax(0,var(--navigation-menu-column-width)))] gap-x-1 gap-y-0.5',
    // まとまり（NavigationMenuGroup）。見出しの左は行の文字とそろえる
    group: 'flex min-w-0 flex-col',
    groupLabel:
      'px-[calc(var(--spacing-control-x)-var(--navigation-menu-padding))] pt-2 pb-1 text-(length:--text-label) leading-(--leading-label) font-bold text-fg-muted select-none',
    groupList: 'flex flex-col gap-0.5',
    // 面の中の行き先。一覧の項目（原則3）: hover とキーボードで止まったときは入力欄の塗り。押すと閉じるので沈めない
    //   角は面の角から余白を引いた同心の角、左右の余白は文字が帯の文字とそろう分（Menu の項目と同じ — 原則5）
    link: [
      'group/navigation-menu-link relative flex w-full min-w-0 cursor-pointer items-start gap-3 text-fg no-underline',
      'rounded-[calc(var(--radius-control)-var(--navigation-menu-padding))] px-[calc(var(--spacing-control-x)-var(--navigation-menu-padding))] py-2',
      'bg-(color:--navigation-menu-link-bg) [--navigation-menu-link-bg:transparent]',
      'hover:[--navigation-menu-link-bg:var(--color-field)] focus-visible:[--navigation-menu-link-bg:var(--color-field)]',
      'transition-[background-color] duration-(--duration-press) ease-(--ease-press) motion-reduce:[transition:none]',
      ...focusRing,
    ],
    // 前のアイコン。題の 1 行目と縦の中央をそろえる（箱が 1 行より高いときは、行の上にそろえる）
    linkIcon: [
      'flex size-(--navigation-menu-link-icon-size) shrink-0 items-center justify-center text-fg-muted',
      'mt-[max(0px,calc((var(--leading-control)-var(--navigation-menu-link-icon-size))/2))]',
      '[&>svg]:size-(--navigation-menu-link-icon-size)',
    ],
    linkText: 'flex min-w-0 flex-1 flex-col gap-0.5',
    linkTitle: [
      'text-(length:--text-control) leading-(--leading-control)',
      'group-aria-[current=page]/navigation-menu-link:font-bold',
    ],
    linkDescription: 'text-(length:--text-caption) leading-(--leading-caption) text-fg-subtle',
    // Navbar のメニューの中: 項目の名前を見出しにし、行き先を NavbarLink のメニューの行で並べる
    //   行の塗りは左右にはみ出させ、文字の位置をシートの題とそろえる（NavbarLinks と同じ）
    menuList: '-mx-3 flex flex-col gap-1',
    menuSection: 'flex flex-col gap-1',
    menuHeading:
      'px-3 pt-2 text-(length:--text-label) leading-(--leading-label) font-bold text-fg-subtle select-none',
    menuSubHeading:
      'px-3 pt-1 text-(length:--text-caption) leading-(--leading-caption) text-fg-subtle select-none',
  },
  variants: {
    // 項目を移ったときの動き（ADR-0488）。none は面の大きさ・位置と中身をすぐ切り替える（開閉の動きは残す）
    switchMotion: {
      slide: {},
      none: {
        positioner: '[--navigation-menu-switch-duration:0ms] [--navigation-menu-switch-shift:0px]',
      },
    },
    // 前のアイコンの見せ方（ADR-0486）。soft は Menu の項目と同じ箱（入力欄と同じグレーの角丸の箱に、部品の中のアイコンの大きさで入れる）
    //   箱は題と説明の 2 行より高いので、行の上にそろえる
    iconVariant: {
      plain: {},
      soft: { linkIcon: [softIconBoxClass, 'mt-0'] },
    },
  },
});

export type NavigationMenuAlign = 'start' | 'center' | 'end';
export type NavigationMenuSwitchMotion = 'slide' | 'none';

export interface NavigationMenuProps {
  /** 帯に並べるもの。開く項目は NavigationMenuItem、ただの行き先は NavigationMenuLink で並べます */
  children?: ReactNode;
  /**
   * 行き先の並び（nav）の読み上げの名前。画面には出ません。省くと、Navbar の中では Navbar の accessibleName を使います
   * @default 'メイン'
   */
  accessibleName?: string;
  /** 開いている項目の value（制御）。null で閉じます */
  value?: string | null;
  /**
   * はじめに開いている項目の value（非制御）
   * @default null
   */
  defaultValue?: string | null;
  /** 開く項目が変わるときに、次の項目の value（閉じるときは null）を渡して呼びます */
  onValueChange?: (value: string | null) => void;
  /**
   * マウスを載せてから開くまでの待ち（ms）
   * @default 50
   */
  delay?: number;
  /**
   * マウスが離れてから閉じるまでの待ち（ms）
   * @default 50
   */
  closeDelay?: number;
  /**
   * 開いた面を、開いた項目に対してどこにそろえるか。start は左端、center は中央、end は右端です
   * @default 'start'
   */
  align?: NavigationMenuAlign;
  /**
   * 面を開いたまま隣の項目へ移ったときの動き。slide は面の大きさと位置が滑らかに変わり、中身が移った向きから滑って入れ替わります。
   * none はすぐ切り替えます（開くとき・閉じるときの動きは残ります）。動きを減らす設定では、値によらず動かしません
   * @default 'slide'
   */
  switchMotion?: NavigationMenuSwitchMotion;
  /**
   * Navbar の中に置いたときの、帯が狭いときの行き先。menu は Navbar のメニューへ畳み（項目の名前を見出しにして行き先を縦に並べます）、
   * bar は帯に残し、hidden は隠します。Navbar の外では効きません
   * @default 'menu'
   */
  narrowPlacement?: NavbarNarrowPlacement;
  /**
   * 閉じているあいだも、面の中身（行き先のリンク）を描いておくか。検索エンジンに行き先を読ませたいときに付けます
   * @default false
   */
  keepMounted?: boolean;
  /**
   * 面を描く場所。ThemeProvider の portalContainer でまとめて指定できます
   * @default document.body
   */
  portalContainer?: HTMLElement | null;
  /** 面（Popup）に足す props（id・data-*・aria-*・ref・className など） */
  popupProps?: PopupProps;
  /** いちばん外の要素（nav）に付きます */
  className?: string;
}

/**
 * ページの上の帯から、行き先の一覧を下に開くメニューです。Navbar の中に、NavbarLinks の代わりに置きます
 */
export function NavigationMenu({
  narrowPlacement = 'menu',
  accessibleName,
  children,
  ...props
}: NavigationMenuProps) {
  const group = useNavbarGroup(narrowPlacement);
  if (!group.visible) return null;
  const name = accessibleName ?? group.accessibleName;
  if (group.placement === 'menu') {
    return (
      <NavigationMenuContext
        value={{
          placement: 'menu',
          level: 'top',
          indicator: group.indicator,
          keepMounted: false,
        }}
      >
        <nav aria-label={name} data-slot="navbar-links">
          <ul className={styles().menuList()}>{children}</ul>
        </nav>
      </NavigationMenuContext>
    );
  }
  return (
    <BarNavigationMenu
      {...props}
      accessibleName={name}
      indicator={group.indicator}
      collapseClassName={
        group.inNavbar ? navbarLinks({ placement: 'bar', narrowPlacement }) : undefined
      }
    >
      {children}
    </BarNavigationMenu>
  );
}

function BarNavigationMenu({
  children,
  accessibleName,
  indicator,
  collapseClassName,
  value: valueProp,
  defaultValue = null,
  onValueChange,
  delay,
  closeDelay,
  align = 'start',
  switchMotion = 'slide',
  keepMounted = false,
  portalContainer: container,
  popupProps,
  className,
}: Omit<NavigationMenuProps, 'narrowPlacement'> & {
  accessibleName: string;
  indicator: NavbarCurrentIndicator;
  collapseClassName?: string;
}) {
  const s = styles({ switchMotion });
  const [valueState, setValueState] = useState<string | null>(defaultValue);
  const value = valueProp === undefined ? valueState : valueProp;
  const portalContainer = usePortalContainer(container);
  // 開いた面に写す密度は、帯の中に置いた空の印の祖先から読む
  const { anchorRef, setAnchor, scope } = useDensityScope<HTMLSpanElement>(value != null);
  const { className: popupClassName, ref: userPopupRef, ...restPopupProps } = popupProps ?? {};
  const popupRef = useMergedRefs<HTMLDivElement>(userPopupRef);
  return (
    <BaseNavigationMenu.Root
      value={value}
      onValueChange={(next) => {
        const nextValue = next ?? null;
        if (valueProp === undefined) setValueState(nextValue);
        onValueChange?.(nextValue);
      }}
      delay={delay}
      closeDelay={closeDelay}
      aria-label={accessibleName}
      data-slot="navigation-menu"
      className={cn('min-w-0', collapseClassName, className)}
    >
      <span ref={setAnchor} hidden />
      <NavigationMenuContext value={{ placement: 'bar', level: 'top', indicator, keepMounted }}>
        <BaseNavigationMenu.List className={s.list()}>{children}</BaseNavigationMenu.List>
      </NavigationMenuContext>
      <BaseNavigationMenu.Portal container={portalContainer}>
        <BaseNavigationMenu.Positioner
          side="bottom"
          align={align}
          // 面との間は帯の中（上書きしたトークンが効く場所）で測る
          sideOffset={() =>
            readCssLength('var(--navigation-menu-offset)', anchorRef.current?.parentElement)
          }
          collisionPadding={popupCollisionPadding}
          data-density={scope.density}
          className={cn(s.positioner(), scope.large && 'coarse-large')}
        >
          <BaseNavigationMenu.Popup
            data-slot="navigation-menu-popup"
            {...(restPopupProps as Record<string, unknown>)}
            ref={popupRef}
            className={cn(s.popup(), popupClassName)}
          >
            <BaseNavigationMenu.Viewport className={s.viewport()} />
          </BaseNavigationMenu.Popup>
        </BaseNavigationMenu.Positioner>
      </BaseNavigationMenu.Portal>
    </BaseNavigationMenu.Root>
  );
}

export interface NavigationMenuItemProps {
  /** 帯に出す項目の名前。押す・載せると、children の行き先を並べた面が下に開きます */
  label: ReactNode;
  /** 開いた面に並べる行き先。NavigationMenuLink か、見出しでまとめた NavigationMenuGroup を並べます */
  children?: ReactNode;
  /**
   * 面に並べる列の数。行き先（またはまとまり）を左から右、上から下の順に並べます
   * @default 1
   */
  columns?: number;
  /** 項目を見分ける値。NavigationMenu の value で開く項目を外から決めるときに使います。省くと自動で付きます */
  value?: string;
  /**
   * 押せない項目にします
   * @default false
   */
  disabled?: boolean;
  /** 開くボタン（button）に付きます */
  className?: string;
}

/**
 * 帯の、行き先の一覧を開く項目。NavigationMenu の中に並べます
 */
export function NavigationMenuItem({
  label,
  children,
  columns = 1,
  value,
  disabled = false,
  className,
}: NavigationMenuItemProps) {
  const context = use(NavigationMenuContext);
  const s = styles();
  const headingId = useId();
  const panelContext = { ...context, level: 'panel' as const };
  // Navbar のメニューの中: 名前を見出しにして、行き先を縦に並べる
  if (context.placement === 'menu') {
    return (
      <li className={s.menuSection()}>
        <span id={headingId} className={s.menuHeading()}>
          {label}
        </span>
        <ul aria-labelledby={headingId} className={s.menuSection()}>
          <NavigationMenuContext value={panelContext}>{children}</NavigationMenuContext>
        </ul>
      </li>
    );
  }
  return (
    <BaseNavigationMenu.Item value={value} className="flex">
      <BaseNavigationMenu.Trigger
        disabled={disabled}
        data-slot="navigation-menu-trigger"
        className={cn(
          navbarLink({ placement: 'bar', indicator: context.indicator }),
          s.trigger(),
          className
        )}
      >
        {label}
        <CaretDownIcon className={s.caret()} />
      </BaseNavigationMenu.Trigger>
      <BaseNavigationMenu.Content keepMounted={context.keepMounted} className={s.content()}>
        <NavigationMenuContext value={panelContext}>
          <ul
            className={s.grid()}
            style={{ '--navigation-menu-columns': columns } as CSSProperties}
          >
            {children}
          </ul>
        </NavigationMenuContext>
      </BaseNavigationMenu.Content>
    </BaseNavigationMenu.Item>
  );
}

export interface NavigationMenuGroupProps {
  /** まとまりの見出し */
  label: ReactNode;
  /** まとまりの行き先。NavigationMenuLink を並べます */
  children?: ReactNode;
  /** いちばん外の要素（li）に付きます */
  className?: string;
}

/**
 * 開いた面の中で、行き先を見出しでまとめます。NavigationMenuItem の中に並べ、列の数（columns）と合わせて 1 列に 1 つ置きます
 */
export function NavigationMenuGroup({ label, children, className }: NavigationMenuGroupProps) {
  const context = use(NavigationMenuContext);
  const s = styles();
  const headingId = useId();
  const menu = context.placement === 'menu';
  return (
    <li className={menu ? cn(s.menuSection(), className) : s.group({ className })}>
      <span id={headingId} className={menu ? s.menuSubHeading() : s.groupLabel()}>
        {label}
      </span>
      <ul aria-labelledby={headingId} className={menu ? s.menuSection() : s.groupList()}>
        {children}
      </ul>
    </li>
  );
}

export interface NavigationMenuLinkProps {
  /** 行き先の名前（題）。文字を書きます */
  children?: ReactNode;
  /** 題の下に添える説明。開いた面の中でだけ出し、読み上げではリンクの説明になります */
  description?: ReactNode;
  /** 題の前に置くアイコン（`<svg>`）。開いた面の中でだけ出します */
  icon?: ReactNode;
  /**
   * アイコンの見せ方。plain はアイコンだけを文字より一段大きく置き、soft は入力欄と同じグレーの角丸の箱に入れます（題と説明の 2 行の高さにそろいます）
   * @default 'plain'
   */
  iconVariant?: ItemIconVariant;
  /** 移る先 */
  href?: string;
  /** _blank のときは、題の後ろに右上向きの矢印を付け、読み上げに「新しいタブで開きます」を足します */
  target?: string;
  /** リンクと先の関係。target="_blank" のときは noopener noreferrer を付けます */
  rel?: string;
  /**
   * 描く要素。ルーターのリンク（Next.js・TanStack Router の Link など）を渡すと、その要素に見た目を重ねます。
   * 行き先は渡す要素に書き（例: `render={<NextLink href="/works" />}`）、名前は children に書きます
   */
  render?: ReactElement;
  /**
   * いまいるページか。true のとき aria-current="page" を付けます。帯では Navbar の currentIndicator の印、面の中では題を太くします
   * @default false
   */
  current?: boolean;
  /**
   * 題の後ろに右上向きの矢印（↗）を付けるか。渡さないときは、新しいタブで開くときだけ付きます。
   * 「新しいタブで開きます」の読み上げは、この値にかかわらず新しいタブで開くときに付きます
   * @default 新しいタブで開くときは true
   */
  newTabIcon?: boolean;
  /** 押したときの処理（移る前に呼びます）。押すと開いた面は閉じます */
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  /** リンク（a）に付きます */
  className?: string;
}

/**
 * 行き先のリンク。NavigationMenuItem（か NavigationMenuGroup）の中では題と説明つきの行に、NavigationMenu に直に並べると帯の行き先になります
 */
export function NavigationMenuLink({
  children,
  description,
  icon,
  iconVariant = 'plain',
  href,
  target,
  rel,
  render,
  current = false,
  newTabIcon,
  onClick,
  className,
}: NavigationMenuLinkProps) {
  const context = use(NavigationMenuContext);
  const close = use(OverlayCloseContext);
  const s = styles();
  const titleId = useId();
  const descriptionId = useId();
  const noteId = useId();
  const newTab = target === '_blank' || opensNewTab(render);
  const showArrow = newTabIcon ?? newTab;
  const row = context.placement === 'bar' && context.level === 'panel';
  // 面の中で説明があるときは、名前を題だけにし、説明は aria-describedby で添える
  const described = row && description != null;
  const own = described ? { 'aria-labelledby': titleId } : {};
  const naming = newTab ? newTabNaming(own, render, noteId) : null;
  const linkProps = {
    href,
    target,
    rel: newTab ? (rel ?? 'noopener noreferrer') : rel,
    ...own,
    ...naming?.props,
    'aria-describedby': described ? descriptionId : undefined,
    'aria-current': current ? ('page' as const) : undefined,
  };
  const arrow = showArrow && (
    <ArrowUpRightIcon className="ms-1 inline-block size-(--spacing-icon) shrink-0 align-[-0.2em]" />
  );

  // Navbar のメニューの中: NavbarLink のメニューの行。押すと、移る前にメニューを閉じる
  if (context.placement === 'menu') {
    return (
      <MenuRowLink
        {...linkProps}
        render={naming ? withRenderOverrides(render, naming.props) : render}
        onClick={(event) => {
          onClick?.(event);
          close?.();
        }}
        className={cn(navbarLink({ placement: 'menu', indicator: context.indicator }), className)}
      >
        {children}
        {showArrow && <ArrowUpRightIcon className="ms-1 size-(--spacing-icon) shrink-0" />}
        {naming?.note}
      </MenuRowLink>
    );
  }

  // 帯に直に並べた行き先: NavbarLink と同じ pill
  if (!row) {
    return (
      <BaseNavigationMenu.Item className="flex">
        <BaseNavigationMenu.Link
          {...linkProps}
          active={current}
          closeOnClick
          render={naming ? withRenderOverrides(render, naming.props) : render}
          onClick={onClick}
          data-slot="navigation-menu-link"
          className={cn(navbarLink({ placement: 'bar', indicator: context.indicator }), className)}
        >
          {children}
          {showArrow && <ArrowUpRightIcon className="ms-1 size-(--spacing-icon) shrink-0" />}
          {naming?.note}
        </BaseNavigationMenu.Link>
      </BaseNavigationMenu.Item>
    );
  }

  // 開いた面の中: アイコン・題・説明の行
  return (
    <li className="flex min-w-0">
      <BaseNavigationMenu.Link
        {...linkProps}
        active={current}
        closeOnClick
        render={naming ? withRenderOverrides(render, naming.props) : render}
        onClick={onClick}
        data-slot="navigation-menu-link"
        className={s.link({ className })}
      >
        {icon != null && (
          <span aria-hidden="true" className={s.linkIcon({ iconVariant })}>
            {icon}
          </span>
        )}
        <span className={s.linkText()}>
          <span id={titleId} className={s.linkTitle()}>
            {children}
            {arrow}
          </span>
          {description != null && (
            <span id={descriptionId} className={s.linkDescription()}>
              {description}
            </span>
          )}
        </span>
        {/* 新しいタブで開くことを読み上げに足す文。名前を題から付けるときは、id で名前の後ろに足す */}
        {naming?.note}
      </BaseNavigationMenu.Link>
    </li>
  );
}

// Navbar のメニューの中の行（Base UI の NavigationMenu の外なので、素の a か渡した要素で描く）
function MenuRowLink({
  render,
  children,
  ...props
}: Record<string, unknown> & {
  render?: ReactElement;
  children?: ReactNode;
  onClick: (event: MouseEvent<HTMLAnchorElement>) => void;
  className: string;
}) {
  const link = useRender({
    render,
    defaultTagName: 'a',
    props: { ...props, 'data-slot': 'navigation-menu-link', children },
  });
  return <li className="flex">{link}</li>;
}
