import { useRender } from '@base-ui/react/use-render';
import {
  Children,
  type ComponentProps,
  createContext,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  use,
  useEffect,
  useRef,
  useState,
} from 'react';

import { focusRing } from '../../internal/focus-styles';
import { ListIcon } from '../../internal/icons';
import { OverlayCloseContext } from '../../internal/overlay/overlay-close-context';
import { useSheetPresentation } from '../../internal/sheet/use-narrow-screen';
import { tv } from '../../internal/tv';
import { Button } from '../button/Button';
import { Container, type ContainerSize } from '../container/Container';
import { Drawer, type DrawerSide } from '../drawer/Drawer';

// ページの上の帯 — 軸 104・105
//   ロゴ（brand）・行き先（NavbarLink）・操作（actions）を 1 行に並べる。中身の幅と左右の余白は Container と同じ
//   高さは入力方式で変えない（原則11）。境目は細い線（ページと同じレイヤー。原則1）
//   貼り付け（sticky）は既定で切り、選べるようにする（軸 105）。貼り付けると内容が帯の下を通るので、境目と面を選べる
//     stickyEdge: line（既定）は貼り付けていないときと同じ細い線、shadow は線の代わりに下へ淡い影（重なるレイヤーとして見せる — 原則1）
//     stickyBackdrop: solid（既定）は白い面、blur は面を透かして後ろをぼかす
//   帯の幅が 48rem（Tailwind の md と同じ幅）より狭いときは、行き先をメニューのボタンに畳み、押すと Drawer に縦に並べて出す
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

export type NavbarCurrentIndicator = 'text' | 'neutral' | 'primary' | 'underline';
export type NavbarStickyEdge = 'line' | 'shadow';
export type NavbarStickyBackdrop = 'solid' | 'blur';

const NavbarContext = createContext<{ placement: Placement; indicator: NavbarCurrentIndicator }>({
  placement: 'bar',
  indicator: 'text',
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
    barNav: 'hidden min-w-0 flex-1 @3xl/navbar:block',
    barList: 'flex items-center gap-(--navbar-item-gap)',
    end: 'ms-auto flex shrink-0 items-center gap-2',
    menuButton: '@3xl/navbar:hidden',
    // 行の塗りは左右にはみ出させ、文字の位置をシートの題とそろえる
    menuList: '-mx-3 flex flex-col gap-1',
  },
  variants: {
    sticky: {
      true: { root: 'sticky top-0 z-10' },
      false: {},
    },
    stickyEdge: { line: {}, shadow: {} },
    stickyBackdrop: { solid: {}, blur: {} },
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
  ],
  defaultVariants: { sticky: false, stickyEdge: 'line', stickyBackdrop: 'solid' },
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
  /** 行き先。NavbarLink を並べます */
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
   * 貼り付けた（sticky）ときの面。solid は白い面、blur は面を透かして後ろをぼかします
   * @default 'solid'
   */
  stickyBackdrop?: NavbarStickyBackdrop;
  /**
   * 行き先の並び（nav）の読み上げの名前
   * @default 'メイン'
   */
  label?: string;
  /**
   * 帯が狭いときに出すメニューのボタンの読み上げの名前と、開いた面の題
   * @default 'メニュー'
   */
  menuLabel?: string;
  /**
   * メニューを出す向き。auto は、指で操作していて画面が狭いときは下から出すシート、それ以外は右から出すパネルです
   * @default 'auto'
   */
  menuSide?: 'auto' | DrawerSide;
  /**
   * メニューの面を描く場所（Drawer の container と同じ）
   * @default document.body
   */
  container?: HTMLElement | null;
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
  label = 'メイン',
  menuLabel = 'メニュー',
  menuSide = 'auto',
  container,
  className,
  ...props
}: NavbarProps) {
  const s = navbar({ sticky, stickyEdge, stickyBackdrop });
  const sheet = useSheetPresentation('auto');
  const side = menuSide === 'auto' ? (sheet ? 'bottom' : 'right') : menuSide;
  const [open, setOpen] = useState(false);
  const hasLinks = Children.count(children) > 0;
  const rootRef = useRef<HTMLElement>(null);

  // 開いたまま帯が広がり、行き先が帯に戻ったら、メニューを閉じる
  useEffect(() => {
    const root = rootRef.current;
    if (!open || !root) return undefined;
    const observer = new ResizeObserver(() => {
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      if (root.offsetWidth >= WIDE_REM * rem) setOpen(false);
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, [open]);

  return (
    <header ref={rootRef} data-slot="navbar" className={s.root({ className })} {...props}>
      <Container size={size} className={s.inner()}>
        {brand && (
          <div data-slot="navbar-brand" className={s.brand()}>
            {brand}
          </div>
        )}
        {hasLinks && (
          <nav aria-label={label} className={s.barNav()}>
            <ul className={s.barList()}>
              <NavbarContext value={{ placement: 'bar', indicator: currentIndicator }}>
                {children}
              </NavbarContext>
            </ul>
          </nav>
        )}
        <div className={s.end()}>
          {actions}
          {hasLinks && (
            <Drawer
              title={menuLabel}
              side={side}
              open={open}
              onOpenChange={setOpen}
              container={container}
              trigger={
                <Button
                  iconOnly
                  appearance="outline"
                  aria-label={menuLabel}
                  className={s.menuButton()}
                >
                  <ListIcon standalone />
                </Button>
              }
            >
              <NavbarMenuList label={label} currentIndicator={currentIndicator}>
                {children}
              </NavbarMenuList>
            </Drawer>
          )}
        </div>
      </Container>
    </header>
  );
}

/**
 * メニューの面の中身（行き先を縦に並べる）。Navbar が Drawer の中に描く。公開しない（比較のストーリーでも使う）
 */
export function NavbarMenuList({
  label,
  currentIndicator = 'text',
  children,
}: {
  label: string;
  currentIndicator?: NavbarCurrentIndicator;
  children?: ReactNode;
}) {
  return (
    <NavbarContext value={{ placement: 'menu', indicator: currentIndicator }}>
      <nav aria-label={label}>
        <ul className={navbar().menuList()}>{children}</ul>
      </nav>
    </NavbarContext>
  );
}

export interface NavbarLinkProps extends ComponentProps<'a'> {
  /**
   * いまいるページか。true のとき aria-current="page" を付け、印を出します
   * @default false
   */
  current?: boolean;
  /** 描く要素（Base UI の render と同じ）。Next.js の Link などを渡すと、その要素に見た目を重ねます */
  render?: ReactElement;
}

/**
 * Navbar の行き先のリンク。Navbar の中に並べます
 */
export function NavbarLink({
  current = false,
  render,
  className,
  onClick,
  ...props
}: NavbarLinkProps) {
  const { placement, indicator } = use(NavbarContext);
  const close = use(OverlayCloseContext);
  const link = useRender({
    render,
    defaultTagName: 'a',
    props: {
      ...props,
      'aria-current': current ? 'page' : undefined,
      'data-slot': 'navbar-link',
      onClick: (event: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(event);
        // メニューの中では、移る前にメニューを閉じる（同じページの中の移動でも閉じる）
        // Next.js の Link などは既定の移動を止めて自分で移るので、止められていても閉じる
        if (placement === 'menu') close?.();
      },
      className: navbarLink({ placement, indicator, className }),
    },
  });
  return <li className="flex">{link}</li>;
}
