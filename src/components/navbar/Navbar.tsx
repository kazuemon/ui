'use client';

import { useRender } from '@base-ui/react/use-render';
import {
  Children,
  type ComponentProps,
  createContext,
  type CSSProperties,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  use,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { focusRing } from '../../internal/focus-styles';
import { ArrowUpRightIcon, ListIcon } from '../../internal/icons';
import { newTabNaming, opensNewTab, withRenderOverrides } from '../../internal/link-parts';
import { useMergedRefs } from '../../internal/use-merged-refs';
import { OverlayCloseContext } from '../../internal/overlay/overlay-close-context';
import { useSheetPresentation } from '../../internal/sheet/use-narrow-screen';
import { tv } from '../../internal/tv';
import { Button } from '../button/Button';
import { Container, type ContainerSize } from '../container/Container';
import { Drawer, type SheetSide } from '../drawer/Drawer';
import { useMenuGroups } from './use-menu-groups';
import { useNavbarScroll } from './use-navbar-scroll';

// ページの上の帯 — 軸 104・105
//   ロゴ（brand）・行き先（NavbarLink）・操作（actions）を 1 行に並べる。中身の幅と左右の余白は Container と同じ
//   高さは入力方式で変えない（原則11）。境目は細い線（ページと同じレイヤー。原則1）
//   貼り付け（sticky）は既定で切り、選べるようにする（軸 105）。貼り付けると内容が帯の下を通るので、境目と面を選べる
//     stickyEdge: line（既定）は貼り付けていないときと同じ細い線、shadow は線の代わりに下へ淡い影（重なるレイヤーとして見せる — 原則1）
//     stickyBackdrop: solid（既定）は白い面、blur は面を透かして後ろをぼかす
//       transparent-until-scroll は、いちばん上では透かし（軸 504）、スクロールしたら solid と同じ面にする
//     stickyBehavior: always（既定）はいつも出す。hide-on-scroll は下へスクロールすると隠し、上へ戻すと出す（軸 503）
//   中身（children）は自由に置く。行き先は NavbarLinks（nav と ul）に、ほかのもの（検索の欄など）は NavbarGroup に入れる
//   帯の幅が 48rem（Tailwind の md と同じ幅）より狭いときの行き先は、まとまりごとに narrowPlacement で選ぶ
//     menu（既定）はメニューのボタンに畳み、押すと Drawer に縦に並べて出す。bar は帯に残す。hidden は隠す
//     Drawer には children をもう一度描き、menu のまとまりだけが中身を出す（ほかは描かず、まとまりに入れずに置いたものは隠す）
//     メニューのボタンは、menu のまとまりが 1 つでもあるときだけ出す（まとまりが名乗り出た数で決める）
//     画面の幅ではなく帯の幅で決める（コンテナクエリ）。横に並べた画面の一部に置いても、置いた幅で畳む
//     出し方は浮かぶ UI と同じ判定（原則11）: 指で操作していて画面が狭いときは下から出すシート、それ以外は横から出すパネル
//     メニューの行き先を押すと、移る前に Drawer を閉じる。帯が広がって行き先が帯に戻ったら、開いていた Drawer を閉じる
//   行き先のリンクは平らな pill（原則5）。hover は文字の色を淡く敷き、押すと沈む（原則3・ADR-0027）
//     いまいるページ（current）は aria-current="page" を付ける。印は currentIndicator で選ぶ（軸 104）
//       text（既定）は文字を本文の色で太く。neutral はグレー、primary は淡い青の pill を敷く。underline は文字の下に青い線
//       メニューの中の行では、underline は text と同じ（行の下に線を引くと区切り線に見えるため）
//     塗りは --flat-bg（theme.css で登録）に置き、background-color ではなく変数を動かす（ADR-0112）

// 行き先を帯に並べる幅（rem）。これより狭いと畳む。クラスの @3xl/navbar（48rem）と同じ値
const WIDE_REM = 48;

type Placement = 'bar' | 'menu';

export type NavbarNarrowPlacement = 'menu' | 'bar' | 'hidden';
export type NavbarCurrentIndicator = 'text' | 'neutral' | 'primary' | 'underline';
export type NavbarStickyEdge = 'line' | 'shadow';
export type NavbarStickyBackdrop = 'solid' | 'blur' | 'transparent-until-scroll';
export type NavbarStickyBehavior = 'always' | 'hide-on-scroll';

const NavbarContext = createContext<{
  placement: Placement;
  indicator: NavbarCurrentIndicator;
  accessibleName: string;
  /** メニューへ畳むまとまりが名乗り出る。戻り値で取り消す */
  registerMenuGroup: () => () => void;
}>({
  placement: 'bar',
  indicator: 'text',
  accessibleName: 'メイン',
  registerMenuGroup: () => () => {},
});

const navbar = tv({
  slots: {
    root: [
      '@container/navbar w-full bg-bg text-fg',
      'border-b-(length:--border-width-thin) border-line',
    ],
    inner: 'flex h-(--navbar-height) items-center gap-(--navbar-gap)',
    brand:
      'flex shrink-0 items-center text-(length:--text-control) leading-(--leading-control) font-bold',
    // 中身（children）を並べる場所。まとまりの間はロゴ・操作との間と同じ
    content: 'flex min-w-0 flex-1 items-center gap-(--navbar-gap)',
    barList: 'flex items-center gap-(--navbar-item-gap)',
    end: 'ms-auto flex shrink-0 items-center gap-2',
    menuButton: '@3xl/navbar:hidden',
    // メニューの面の中身。まとまりを縦に積む。まとまりに入れずに置いたものは隠す（帯にだけ出す）
    //   まとまりを中に持つ要素（自分の部品が返した div など）は隠さず、その中のまとまりでないものを隠す
    menuContent: [
      'flex flex-col gap-4 [&>:not([data-slot=navbar-links],[data-slot=navbar-group],:has([data-slot=navbar-links],[data-slot=navbar-group]))]:hidden',
      '[&_*:has([data-slot=navbar-links],[data-slot=navbar-group])>:not([data-slot=navbar-links],[data-slot=navbar-group],:has([data-slot=navbar-links],[data-slot=navbar-group]))]:hidden',
    ],
    // 行の塗りは左右にはみ出させ、文字の位置をシートの題とそろえる
    menuList: '-mx-3 flex flex-col gap-1',
  },
  variants: {
    sticky: {
      true: { root: 'sticky top-0 z-10' },
      false: {},
    },
    stickyEdge: { line: {}, shadow: {} },
    stickyBackdrop: { solid: {}, blur: {}, 'transparent-until-scroll': {} },
    stickyBehavior: { always: {}, 'hide-on-scroll': {} },
  },
  compoundVariants: [
    {
      sticky: true,
      stickyEdge: 'shadow',
      class: { root: 'border-transparent shadow-(--navbar-sticky-shadow)' },
    },
    {
      sticky: true,
      stickyBackdrop: 'blur',
      class: {
        root: 'bg-(--navbar-backdrop-bg) backdrop-blur-(--navbar-backdrop-blur)',
      },
    },
    // いちばん上では透かす（data-scrolled がないあいだ）。文字の色は、帯の中だけ本文の色を差し替える
    {
      sticky: true,
      stickyBackdrop: 'transparent-until-scroll',
      class: {
        root: [
          'not-data-scrolled:border-transparent not-data-scrolled:shadow-none',
          'not-data-scrolled:bg-(color:--navbar-top-bg) not-data-scrolled:bg-(image:--navbar-top-scrim) not-data-scrolled:backdrop-blur-(--navbar-top-blur)',
          'not-data-scrolled:[--color-fg-muted:var(--navbar-top-fg-muted)] not-data-scrolled:[--color-fg:var(--navbar-top-fg)]',
          'not-data-scrolled:[text-shadow:var(--navbar-top-text-shadow)]',
          '[transition:background-color_var(--navbar-backdrop-duration)_var(--ease-press),border-color_var(--navbar-backdrop-duration)_var(--ease-press),box-shadow_var(--navbar-backdrop-duration)_var(--ease-press),translate_var(--navbar-show-duration)_var(--navbar-show-ease),opacity_var(--navbar-show-duration)_var(--navbar-show-ease)]',
        ],
      },
    },
    // スクロールで隠す。影まで見えなくなるよう、帯の高さより少し余分に押し上げる
    //   スクロールの量に合わせて動かしているあいだ（data-following）は、動きを付けずに --navbar-follow-offset だけ押し上げる
    {
      sticky: true,
      stickyBehavior: 'hide-on-scroll',
      class: {
        root: [
          'translate-y-[calc(var(--navbar-follow-offset,0px)*-1)]',
          'data-hidden:-translate-y-[calc(100%+var(--navbar-hide-shadow-room))] data-hidden:opacity-(--navbar-hide-opacity)',
          '[transition:translate_var(--navbar-show-duration)_var(--navbar-show-ease),opacity_var(--navbar-show-duration)_var(--navbar-show-ease),background-color_var(--navbar-backdrop-duration)_var(--ease-press),border-color_var(--navbar-backdrop-duration)_var(--ease-press),box-shadow_var(--navbar-backdrop-duration)_var(--ease-press)]',
          'data-hidden:[transition:translate_var(--navbar-hide-duration)_var(--navbar-hide-ease),opacity_var(--navbar-hide-duration)_var(--navbar-hide-ease),background-color_var(--navbar-backdrop-duration)_var(--ease-press),border-color_var(--navbar-backdrop-duration)_var(--ease-press),box-shadow_var(--navbar-backdrop-duration)_var(--ease-press)]',
          'data-following:transition-none motion-reduce:transition-none',
        ],
      },
    },
  ],
  defaultVariants: {
    sticky: false,
    stickyEdge: 'line',
    stickyBackdrop: 'solid',
    stickyBehavior: 'always',
  },
});

const navbarLink = tv({
  base: [
    'relative inline-flex h-(--spacing-control) cursor-pointer items-center whitespace-nowrap no-underline',
    'text-(length:--text-control) leading-(--leading-control)',
    'font-normal text-fg-muted',
    // いまいるページ: 文字を本文の色で太く（どの印でも）
    'aria-[current=page]:font-bold aria-[current=page]:text-fg',
    // 塗り: ふだんは透明、pill の印では --navbar-item-rest に面の色を置く。hover と押下は、その上に本文の色を淡く敷く
    '[--navbar-item-rest:transparent]',
    'bg-(color:--flat-bg) [--flat-bg:var(--navbar-item-rest)]',
    'hover:[--flat-bg:color-mix(in_oklab,var(--color-fg)_var(--flat-hover-mix),var(--navbar-item-rest))]',
    'active:translate-y-(--flat-press-depth) active:[--flat-bg:color-mix(in_oklab,var(--color-fg)_var(--flat-press-mix),var(--navbar-item-rest))]',
    '[transition:--flat-bg_var(--duration-press)_var(--ease-press),translate_var(--duration-press)_var(--ease-press),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)]',
    'motion-reduce:[transition:none]',
    ...focusRing,
  ],
  variants: {
    placement: {
      // 帯の中: pill
      bar: 'rounded-pill px-3',
      // メニューの中: 幅いっぱいの行。角は部品の角（一覧の項目と同じ — 原則5）
      menu: 'w-full rounded-control px-3',
    },
    indicator: {
      text: '',
      neutral: 'aria-[current=page]:[--navbar-item-rest:var(--color-neutral)]',
      primary:
        'aria-[current=page]:text-on-primary-subtle aria-[current=page]:[--navbar-item-rest:var(--color-primary-subtle)]',
      underline: '',
    },
  },
  compoundVariants: [
    // 文字の幅の下の線。帯の中だけ
    {
      placement: 'bar',
      indicator: 'underline',
      class:
        "aria-[current=page]:after:pointer-events-none aria-[current=page]:after:absolute aria-[current=page]:after:inset-x-3 aria-[current=page]:after:bottom-1 aria-[current=page]:after:h-(--navbar-current-bar) aria-[current=page]:after:rounded-pill aria-[current=page]:after:bg-primary aria-[current=page]:after:content-['']",
    },
  ],
  defaultVariants: { placement: 'bar', indicator: 'text' },
});

export interface NavbarProps extends Omit<ComponentProps<'header'>, 'children'> {
  /** 左端のロゴやサイトの名前。トップへのリンクにします */
  brand?: ReactNode;
  /**
   * ロゴと操作の間に置く中身。行き先は NavbarLinks に、ほかのものは NavbarGroup に入れて置きます。
   * まとまりに入れずに置いたものは、帯が狭いときも帯に残ります
   */
  children?: ReactNode;
  /** 右端に置く操作（ボタンなど）。帯が狭いときも帯に残ります */
  actions?: ReactNode;
  /**
   * 中身の幅の上限。Container の size と同じで、本文と端をそろえるときに合わせます
   * @default 'default'
   */
  size?: ContainerSize;
  /**
   * スクロールしても画面の上に貼り付けるか
   * @default false
   */
  sticky?: boolean;
  /**
   * いまいるページの印。text は文字を濃く太く、neutral はグレーの面、primary は淡い青の面、underline は文字の下に青い線です
   * @default 'text'
   */
  currentIndicator?: NavbarCurrentIndicator;
  /**
   * 貼り付けた（sticky）ときの、下の内容との境目。line は細い線、shadow は下へ淡い影です
   * @default 'line'
   */
  stickyEdge?: NavbarStickyEdge;
  /**
   * 貼り付けた（sticky）ときの面。solid は白い面、blur は面を透かして後ろをぼかします。
   * transparent-until-scroll は、いちばん上では面と境目を消して後ろを見せ、スクロールすると solid と同じ面にします
   * @default 'solid'
   */
  stickyBackdrop?: NavbarStickyBackdrop;
  /**
   * 貼り付けた（sticky）ときの出し方。always はいつも出し、hide-on-scroll は下へスクロールすると隠して、上へ戻すと出します。
   * 帯の中にフォーカスがあるときと、メニューを開いているときは隠しません
   * @default 'always'
   */
  stickyBehavior?: NavbarStickyBehavior;
  /**
   * 行き先の並び（nav）の読み上げの名前。画面には出ません
   * @default 'メイン'
   */
  accessibleName?: string;
  /**
   * 帯が狭いときに出すメニューの題。開いた面の題になり、メニューのボタンの読み上げの名前にもなります
   * @default 'メニュー'
   */
  menuTitle?: string;
  /**
   * メニューを出す向き。auto は、指で操作していて画面が狭いときは下から出すシート、それ以外は右から出すパネルです
   * @default 'auto'
   */
  menuSide?: 'auto' | SheetSide;
  /** 帯が狭いときに出すメニューが開いているか（制御）。行き先を押したあとの処理で閉じるときなどに使います */
  menuOpen?: boolean;
  /** メニューの開閉が変わるときに、次の値を渡して呼びます。帯が広がって行き先が帯に戻ったときも、閉じる値で呼びます */
  onMenuOpenChange?: (open: boolean) => void;
  /**
   * メニューの面を描く場所。ThemeProvider の portalContainer でまとめて指定できます
   * @default document.body
   */
  portalContainer?: HTMLElement | null;
  /** いちばん外の要素（header）に付きます */
  className?: string;
}

/**
 * ページの上の帯。ロゴ・行き先・操作を 1 行に並べ、帯が狭いときは行き先をメニューに畳みます
 */
export function Navbar({
  brand,
  children,
  actions,
  size,
  sticky,
  currentIndicator = 'text',
  stickyEdge,
  stickyBackdrop,
  stickyBehavior,
  accessibleName = 'メイン',
  menuTitle = 'メニュー',
  menuSide = 'auto',
  menuOpen,
  onMenuOpenChange,
  portalContainer,
  className,
  ref,
  ...props
}: NavbarProps) {
  const s = navbar({ sticky, stickyEdge, stickyBackdrop, stickyBehavior });
  const sheet = useSheetPresentation('auto');
  const side = menuSide === 'auto' ? (sheet ? 'bottom' : 'right') : menuSide;
  const [openState, setOpenState] = useState(false);
  const open = menuOpen ?? openState;
  const setOpen = (next: boolean) => {
    if (menuOpen === undefined) setOpenState(next);
    onMenuOpenChange?.(next);
  };
  // 帯の幅を測る処理（ResizeObserver）から、いまの通知を読むための控え
  const closeRef = useRef(() => {});
  useLayoutEffect(() => {
    closeRef.current = () => setOpen(false);
  });
  const hasContent = Children.count(children) > 0;
  // 帯が狭いときにメニューへ畳むまとまりがあるか
  const { hasMenu, register: registerMenuGroup } = useMenuGroups(children);
  const rootRef = useRef<HTMLElement>(null);
  // 内部の ref（帯の幅を測る）と、利用者が渡した ref をつなぐ（ADR-0250）
  const mergedRef = useMergedRefs(rootRef, ref);
  const scroll = useNavbarScroll(rootRef, {
    watchTop: Boolean(sticky) && stickyBackdrop === 'transparent-until-scroll',
    hideOnScroll: Boolean(sticky) && stickyBehavior === 'hide-on-scroll',
    keepShown: open,
  });

  // 開いたまま帯が広がり、行き先が帯に戻ったら、メニューを閉じる
  useEffect(() => {
    const root = rootRef.current;
    if (!open || !root) return undefined;
    const observer = new ResizeObserver(() => {
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      if (root.offsetWidth >= WIDE_REM * rem) closeRef.current();
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, [open]);

  return (
    <header
      {...props}
      ref={mergedRef}
      data-slot="navbar"
      data-scrolled={scroll.scrolled ? '' : undefined}
      data-hidden={scroll.hidden ? '' : undefined}
      data-following={scroll.followOffset !== null ? '' : undefined}
      style={
        scroll.followOffset !== null
          ? ({
              ...props.style,
              '--navbar-follow-offset': `${scroll.followOffset}px`,
            } as CSSProperties)
          : props.style
      }
      className={s.root({ className })}
    >
      <Container size={size} className={s.inner()}>
        {brand && (
          <div data-slot="navbar-brand" className={s.brand()}>
            {brand}
          </div>
        )}
        {hasContent && (
          <div data-slot="navbar-content" className={s.content()}>
            <NavbarContext
              value={{
                placement: 'bar',
                indicator: currentIndicator,
                accessibleName,
                registerMenuGroup,
              }}
            >
              {children}
            </NavbarContext>
          </div>
        )}
        <div className={s.end()}>
          {actions}
          {hasMenu && (
            <Drawer
              title={menuTitle}
              side={side}
              open={open}
              onOpenChange={setOpen}
              portalContainer={portalContainer}
              trigger={
                <Button
                  iconOnly
                  variant="outline"
                  aria-label={menuTitle}
                  className={s.menuButton()}
                >
                  <ListIcon standalone />
                </Button>
              }
            >
              <NavbarMenuList accessibleName={accessibleName} currentIndicator={currentIndicator}>
                {children}
              </NavbarMenuList>
            </Drawer>
          )}
        </div>
      </Container>
    </header>
  );
}

const noRegister = () => () => {};

// まとまり（NavbarLinks・NavbarGroup）の共通の処理
//   帯の中で menu のものはメニューへ畳むと名乗り出る。メニューの中では menu のものだけを描く
function useNavbarGroup(narrowPlacement: NavbarNarrowPlacement) {
  const context = use(NavbarContext);
  const { placement, registerMenuGroup } = context;
  useLayoutEffect(() => {
    if (placement !== 'bar' || narrowPlacement !== 'menu') return undefined;
    return registerMenuGroup();
  }, [placement, narrowPlacement, registerMenuGroup]);
  return { ...context, visible: placement === 'bar' || narrowPlacement === 'menu' };
}

/**
 * メニューの面の中身（まとまりを縦に積む）。Navbar が Drawer の中に描く。公開しない（ストーリーでも使う）
 */
export function NavbarMenuList({
  accessibleName = 'メイン',
  currentIndicator = 'text',
  children,
}: {
  accessibleName?: string;
  currentIndicator?: NavbarCurrentIndicator;
  children?: ReactNode;
}) {
  return (
    <NavbarContext
      value={{
        placement: 'menu',
        indicator: currentIndicator,
        accessibleName,
        registerMenuGroup: noRegister,
      }}
    >
      <div className={navbar().menuContent()}>{children}</div>
    </NavbarContext>
  );
}

const navbarGroup = tv({
  variants: {
    placement: {
      // 帯の中: 横に並べる
      bar: 'flex items-center gap-(--navbar-item-gap)',
      // メニューの中: 縦に積み、幅いっぱいに広げる
      menu: 'flex flex-col items-stretch gap-2',
    },
    narrowPlacement: { menu: '', bar: '', hidden: '' },
  },
  compoundVariants: [
    // 帯が狭いときは、帯に残すもののほかは隠す（menu はメニューの面に出る）
    {
      placement: 'bar',
      narrowPlacement: ['menu', 'hidden'],
      class: 'hidden @3xl/navbar:flex',
    },
  ],
});

// 行き先の並びの nav。並びの見た目は ul に置き、nav は出す／隠すだけを受け持つ
const navbarLinks = tv({
  variants: {
    placement: { bar: 'block min-w-0', menu: '' },
    narrowPlacement: { menu: '', bar: '', hidden: '' },
  },
  compoundVariants: [
    {
      placement: 'bar',
      narrowPlacement: ['menu', 'hidden'],
      class: 'hidden @3xl/navbar:block',
    },
  ],
});

export interface NavbarLinksProps extends ComponentProps<'nav'> {
  /** 行き先。NavbarLink を並べます */
  children?: ReactNode;
  /**
   * 帯が狭いときの行き先。menu はメニューのボタンに畳み、bar は帯に残し、hidden は隠します
   * @default 'menu'
   */
  narrowPlacement?: NavbarNarrowPlacement;
  /** 読み上げの名前。画面には出ません。省くと Navbar の accessibleName を使います */
  accessibleName?: string;
  /** いちばん外の要素（nav）に付きます */
  className?: string;
}

/**
 * Navbar の行き先の並び（nav と ul）。Navbar の中に置き、中に NavbarLink を並べます
 */
export function NavbarLinks({
  narrowPlacement = 'menu',
  accessibleName,
  className,
  children,
  ...props
}: NavbarLinksProps) {
  const context = useNavbarGroup(narrowPlacement);
  const s = navbar();
  if (!context.visible) return null;
  return (
    <nav
      aria-label={accessibleName ?? context.accessibleName}
      {...props}
      data-slot="navbar-links"
      className={navbarLinks({ placement: context.placement, narrowPlacement, className })}
    >
      <ul className={context.placement === 'menu' ? s.menuList() : s.barList()}>{children}</ul>
    </nav>
  );
}

export interface NavbarGroupProps extends ComponentProps<'div'> {
  /** 帯に置くもの（検索の欄やボタンなど） */
  children?: ReactNode;
  /**
   * 帯が狭いときの行き先。menu はメニューのボタンに畳み、bar は帯に残し、hidden は隠します
   * @default 'menu'
   */
  narrowPlacement?: NavbarNarrowPlacement;
  /** いちばん外の要素（div）に付きます */
  className?: string;
}

/**
 * Navbar の中身のまとまり。行き先のほかに置くもの（検索の欄など）を入れ、帯が狭いときの行き先を選びます
 *
 * narrowPlacement が menu のまとまりは、帯と、狭いときに開くメニューの 2 か所に描かれ、それぞれが別の部品になります。
 * 入力欄など状態を持つものを入れるときは、value と onValueChange で外から状態を渡し、2 か所で同じ値を見るようにします
 */
export function NavbarGroup({
  narrowPlacement = 'menu',
  className,
  children,
  ...props
}: NavbarGroupProps) {
  const { placement, visible } = useNavbarGroup(narrowPlacement);
  if (!visible) return null;
  return (
    <div
      {...props}
      data-slot="navbar-group"
      className={navbarGroup({ placement, narrowPlacement, className })}
    >
      {children}
    </div>
  );
}

export interface NavbarLinkProps extends ComponentProps<'a'> {
  /** 行き先の名前。文字を書きます */
  children?: ReactNode;
  /** リンク（a）に付きます */
  className?: string;
  /**
   * いまいるページか。true のとき aria-current="page" を付け、印を出します
   * @default false
   */
  current?: boolean;
  /** 描く要素（Base UI の render と同じ）。Next.js の Link などを渡すと、その要素に見た目を重ねます */
  render?: ReactElement;
}

/**
 * Navbar の行き先のリンク。NavbarLinks の中に並べます
 */
export function NavbarLink({
  current = false,
  render,
  className,
  onClick,
  children,
  ...props
}: NavbarLinkProps) {
  const { placement, indicator } = use(NavbarContext);
  const close = use(OverlayCloseContext);
  const noteId = useId();
  // 新しいタブで開く行き先（Link と同じ扱い — ADR-0254 の M-17）
  //   ↗ を文字の後ろに付け、読み上げに「新しいタブで開きます」を足し、rel="noopener noreferrer" を付ける
  const newTab = props.target === '_blank' || opensNewTab(render);
  const naming = newTab ? newTabNaming(props, render, noteId) : null;
  const link = useRender({
    // 渡した要素に名前（aria-label・aria-labelledby）があるときは、要素の側も書き換える（要素の props が勝つため）
    render: naming ? withRenderOverrides(render, naming.props) : render,
    defaultTagName: 'a',
    props: {
      ...props,
      ...naming?.props,
      ...(newTab ? { rel: props.rel ?? 'noopener noreferrer' } : {}),
      'aria-current': current ? 'page' : undefined,
      'data-slot': 'navbar-link',
      onClick: (event: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(event);
        // メニューの中では、移る前にメニューを閉じる（同じページの中の移動でも閉じる）
        // Next.js の Link などは既定の移動を止めて自分で移るので、止められていても閉じる
        if (placement === 'menu') close?.();
      },
      className: navbarLink({ placement, indicator, className }),
      children: (
        <>
          {children}
          {/* 新しいタブで開く行き先の ↗（飾り。読み上げは下の文で足す） */}
          {newTab && <ArrowUpRightIcon className="ms-1 size-(--spacing-icon) shrink-0" />}
          {naming?.note}
        </>
      ),
    },
  });
  return <li className="flex">{link}</li>;
}
