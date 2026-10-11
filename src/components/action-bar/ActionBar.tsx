'use client';

import {
  Children,
  type CSSProperties,
  type KeyboardEvent,
  Fragment,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  createContext,
  isValidElement,
  cloneElement,
  use,
  useId,
  useRef,
  useState,
} from 'react';

import { Button } from '../button/Button';
import { Icon } from '../icon/Icon';
import { Menu } from '../menu/Menu';
import { MenuItem } from '../menu/MenuItem';
import { Toolbar, ToolbarButton } from '../toolbar/Toolbar';
import { useTransitionStatus } from '../transition/use-transition-status';
import { DotsThreeVerticalIcon, XIcon } from '../../internal/icons';
import { useSheetPresentation } from '../../internal/sheet/use-narrow-screen';
import { tv } from '../../internal/tv';
import { useIsomorphicLayoutEffect } from '../../internal/use-isomorphic-layout-effect';
import { type ActionBarButtonNarrowPlacement, useActionBarFit } from './use-action-bar-fit';

// ActionBar: 一覧の項目を選んでいるあいだだけ、置いた場所の下に浮かぶ操作の帯
//   DataTable の上の帯に並べる件数と操作（ADR-0349）とは別の部品。表の上の帯がない一覧（カード・行の一覧・Gallery）や、
//   表が長くて上の帯がスクロールで見えなくなる画面で、選んだものへの操作をいつも手の届く下に出す
//   置き方: 一覧のすぐ後ろ（同じ親の中）に置く。帯は position: sticky で、一覧をスクロールしているあいだは置いた場所の下に貼り付き、
//     一覧の終わりまでスクロールすると、一覧の下に確保した空き（spacer）に収まる。下の内容が帯に隠れたままにならない（原則1: 重なり）
//     空きは帯の高さだけ、帯の出入りと同じ長さで伸び縮みする（下の内容は跳ばずに滑る — 原則4）
//   面: ページの上に重なるレイヤー（原則1）。影は浮かぶ面と同じ、角はカードの角（原則5）。色は --action-bar-*
//     variant（軸 651）: surface（既定）は白い面に細い輪郭。neutral-strong は濃いグレー、primary-subtle は淡い青、primary は青の面
//     primary の上では危険の赤が読めないので、危険の操作も白い文字にする
//     帯の中で --color-fg・--color-fg-danger を差し替えるので、面の値は差し替えない役割（--color-danger など）から取る（循環させない）
//     帯の中では本文の色・危険の前景・フォーカスの線を帯の色に差し替えるので、ToolbarButton などをそのまま置ける（原則2: 濃い面の上の線は文字の色）
//   幅と寄せ（軸 652）: placement。full（既定）は置いた場所の幅いっぱい（左右に inset を残す）で、件数は左・操作は右
//     center は中身の幅で真ん中。指で操作していて画面が狭いときは、左右の余白を残して幅いっぱい（Toast と同じ判定 — 原則16）
//     docked は浮かべず、置いた場所の下の端に幅いっぱいで着ける（角なし・シートと同じ上向きの影）
//   中身: [選択を外す ×] [件数の文] … [操作] [⋮ その他]。全体が Toolbar（Tab で 1 回止まり、中は矢印キーで移る）
//   入りきらないとき（軸 654）: 操作ごとの narrowPlacement（Navbar の行き先の narrowPlacement と同じ考え）で決める
//     既定（bar）の操作は畳まず、帯を折り返して次の行へ送る。icon-only は文字を外してよい操作、menu は ⋮ に畳んでよい操作
//     順は、icon-only の文字を外す → menu を後ろから畳む → それでも入らなければ折り返す（use-action-bar-fit.ts）
//     ⋮ のメニューは、指で狭いとシートになる
//   読み上げ: 件数の文は、いつも置いてある知らせの箱（role="status"）が 1 回だけ読む（原則15）。帯の名前もその箱から取る
//     帯の中の見える文は、二度読ませないよう読み上げから外す
//   Esc: 帯の中にフォーカスがあるとき、選択を外す（onClear）。帯が消えたら、帯に入る前にいた場所へフォーカスを戻す
//   動き（軸 653）: motion。fade-up（既定）は浮かぶ面と同じく 8px 下から濃さと一緒に浮かぶ。slide は下の端の外から滑って出る、
//     scale は少し小さい姿から広がる、none は動かさない。どれも消えるときは出るときより短い。動きを減らす設定ではすぐに出す（原則14）
const actionBar = tv({
  slots: {
    // 一覧の下の空き。帯が出ているあいだ、帯の高さ＋上下の inset だけ伸びる
    spacer: [
      'pointer-events-none h-0 shrink-0',
      'data-open:h-[calc(var(--action-bar-height,0px)+var(--action-bar-inset)*2+env(safe-area-inset-bottom))]',
      '[transition:height_var(--action-bar-duration-enter)_var(--ease-sheet)] data-closing:[transition-duration:var(--action-bar-duration-exit)]',
      'motion-reduce:[transition:none]',
    ],
    // 帯の基準。高さ 0 で置いた場所の下の端に貼り付き、帯はここから上へ描く
    anchor: 'sticky bottom-0 z-30 h-0',
    // 帯がいちばん広がったときの中身の幅を測る定規（見えない）
    ruler: 'invisible absolute inset-x-(--action-bar-inset) bottom-0 h-0 px-(--action-bar-padding)',
    bar: [
      'absolute inset-x-(--action-bar-inset) bottom-[calc(var(--action-bar-inset)+env(safe-area-inset-bottom))]',
      'max-w-[calc(100%-var(--action-bar-inset)*2)]',
      'rounded-(--action-bar-radius) bg-(--action-bar-bg) p-(--action-bar-padding) text-(--action-bar-fg)',
      '[box-shadow:var(--action-bar-shadow),inset_0_0_0_var(--border-width-thin)_var(--action-bar-line)]',
      // 帯の中の部品は、本文の色・危険の前景・フォーカスの線を帯の色で読む
      '[--color-fg-danger:var(--action-bar-danger-fg)] [--color-fg:var(--action-bar-fg)] [--color-on-neutral-disabled:var(--action-bar-disabled-fg)]',
      '[--color-focus-ring:var(--action-bar-fg)] [--focus-follow-color:initial]',
      // 出入り（軸 653）。出はじめと消えたあとは --action-bar-from-* の姿
      'origin-bottom [transition-property:opacity,translate,scale] duration-(--action-bar-duration-enter) ease-(--ease-sheet)',
      'data-ending-style:duration-(--action-bar-duration-exit)',
      'data-ending-style:opacity-(--action-bar-from-opacity) data-starting-style:opacity-(--action-bar-from-opacity)',
      'data-ending-style:[translate:0_var(--action-bar-from-shift)] data-starting-style:[translate:0_var(--action-bar-from-shift)]',
      'data-ending-style:scale-(--action-bar-from-scale) data-starting-style:scale-(--action-bar-from-scale)',
      'motion-reduce:[transition:none]',
    ],
    // 入りきらないときの最後の手は折り返し。件数の行と操作の行に分かれ、操作の行の中でも折り返す
    toolbar: 'flex-wrap',
    lead: 'flex min-w-0 shrink-0 items-center gap-(--button-group-gap)',
    // 件数の文。見える文は読み上げから外す（知らせの箱が読む）
    label:
      'min-w-0 truncate ps-(--spacing-control-x) text-(length:--text-control) leading-(--leading-control) font-bold',
    actions: 'ms-auto flex min-w-0 flex-wrap items-center gap-(--button-group-gap)',
    // 測るための見えない並び。帯の操作と同じ間で、文字のボタン・アイコンだけのボタン・⋮ を並べる
    measure:
      'pointer-events-none invisible absolute start-0 bottom-0 flex w-max gap-(--button-group-gap)',
  },
  variants: {
    // 面（軸 651）。surface は :root の既定（白い面・細い輪郭）のまま
    variant: {
      surface: {},
      'neutral-strong': {
        bar: [
          '[--action-bar-bg:var(--color-neutral-strong)] [--action-bar-fg:var(--color-on-neutral-strong)] [--action-bar-line:transparent]',
          // 濃いグレーの上で 4.62:1。危険の赤を文字の白に寄せた淡い赤
          '[--action-bar-danger-fg:color-mix(in_oklab,var(--color-danger)_25%,var(--color-on-neutral-strong))]',
          '[--action-bar-disabled-fg:color-mix(in_oklab,var(--color-on-neutral-strong)_50%,var(--color-neutral-strong))]',
        ],
      },
      'primary-subtle': {
        bar: [
          '[--action-bar-bg:var(--color-primary-subtle)] [--action-bar-fg:var(--color-on-primary-subtle)] [--action-bar-line:transparent]',
          '[--action-bar-danger-fg:var(--color-danger)]',
          '[--action-bar-disabled-fg:color-mix(in_oklab,var(--color-on-primary-subtle)_45%,var(--color-primary-subtle))]',
        ],
      },
      primary: {
        bar: [
          '[--action-bar-bg:var(--color-primary)] [--action-bar-fg:var(--color-on-primary)] [--action-bar-line:transparent]',
          // 青の上では赤が 3:1 に届かないので、危険の操作も白い文字にする
          '[--action-bar-danger-fg:var(--color-on-primary)]',
          '[--action-bar-disabled-fg:color-mix(in_oklab,var(--color-on-primary)_50%,var(--color-primary))]',
        ],
      },
    },
    // 幅と寄せ（軸 652）
    placement: {
      full: {},
      center: { bar: 'mx-auto w-fit data-narrow:mx-0 data-narrow:w-auto' },
      docked: {
        spacer: '[--action-bar-inset:0px]',
        anchor: '[--action-bar-inset:0px]',
        bar: '[--action-bar-radius:0px] [--action-bar-shadow:var(--shadow-sheet)]',
      },
    },
    // 出入りの動き（軸 653）。fade-up は :root の既定のまま
    motion: {
      'fade-up': {},
      slide: { bar: '[--action-bar-from-shift:calc(100%+var(--action-bar-inset))]' },
      scale: { bar: '[--action-bar-from-scale:0.9] [--action-bar-from-shift:0px]' },
      none: {
        spacer: '[--action-bar-duration-enter:0ms] [--action-bar-duration-exit:0ms]',
        bar: '[--action-bar-duration-enter:0ms] [--action-bar-duration-exit:0ms] [--action-bar-from-opacity:1] [--action-bar-from-shift:0px]',
      },
    },
    // label の前に × があるときは、文の左の余白を詰める（× のボタンの余白で足りる。× のフォーカスの線が文字にかからない分だけ空ける）
    clearable: {
      true: { label: 'ps-1' },
      false: {},
    },
  },
});

/** 帯の面。surface は白い面に細い輪郭、neutral-strong は濃いグレー、primary-subtle は淡い青、primary は青の面 */
export type ActionBarVariant = 'surface' | 'neutral-strong' | 'primary-subtle' | 'primary';

/** 帯の幅と寄せ。full は置いた場所の幅いっぱい、center は中身の幅で真ん中、docked は下の端に幅いっぱいで着ける */
export type ActionBarPlacement = 'full' | 'center' | 'docked';

/** 出入りの動き。fade-up は 8px 下から浮かぶ、slide は下の端から滑る、scale は小さい姿から広がる、none は動かさない */
export type ActionBarMotion = 'fade-up' | 'slide' | 'scale' | 'none';

export type { ActionBarButtonNarrowPlacement };

/** 操作の状態。danger は、削除など取り消せない操作 */
export type ActionBarButtonStatus = 'danger';

type ItemMode = 'bar' | 'menu' | 'measure' | 'measure-icon';
interface ItemContext {
  mode: ItemMode;
  /** 文字を外しているか（bar） */
  icon: boolean;
  /** ⋮ に畳んでいるか */
  folded: boolean;
}
const ActionBarItemContext = createContext<ItemContext | null>(null);

export interface ActionBarProps {
  /** 帯を出しているか。ふつうは「1 件以上選んでいるか」を渡します。false にすると、消える動きのあとで消えます */
  open: boolean;
  /**
   * 件数の文（「2 件を選択中」）。帯の左に太字で出し、変わるたびに読み上げでも知らせます。帯の読み上げの名前にもなります
   */
  label: ReactNode;
  /** 選択を外すときに呼びます。渡すと、帯の左に × のボタンを置き、Esc でも呼びます */
  onClear?: () => void;
  /**
   * 帯の面。surface は白い面に影と細い輪郭、neutral-strong は濃いグレーに白い文字、primary-subtle は淡い青、primary は青に白い文字です。
   * primary の上では危険の赤が読めないので、status="danger" の操作も白い文字になります
   * @default 'surface'
   */
  variant?: ActionBarVariant;
  /**
   * 帯の幅と寄せ。full は置いた場所の幅いっぱい（左右に余白を残す）で、件数を左、操作を右に置きます。
   * center は中身の幅で真ん中に浮かべ、指で操作していて画面が狭いときは幅いっぱいにします。
   * docked は浮かべずに、置いた場所の下の端へ幅いっぱいで着けます（角なし）
   * @default 'full'
   */
  placement?: ActionBarPlacement;
  /**
   * 出入りの動き。fade-up はメニューと同じく 8px 下から濃さと一緒に浮かび、slide は下の端の外から滑って出ます。
   * scale は少し小さい姿から広がり、none は動かさずにすぐ出します。動きを減らす設定では、どれもすぐに出します
   * @default 'fade-up'
   */
  motion?: ActionBarMotion;
  /**
   * 選択を外すボタンの読み上げの名前
   * @default '選択を外す'
   */
  clearName?: string;
  /**
   * 帯の中にフォーカスがあるとき、Esc で選択を外すか（onClear を呼ぶ）
   * @default true
   */
  closeOnEscape?: boolean;
  /**
   * 畳んだ操作を開く ⋮ のボタンの読み上げの名前。メニューをシートで出すときの題にもなります
   * @default 'その他の操作'
   */
  moreName?: string;
  /** 帯の面（浮かぶ要素）に付きます */
  className?: string;
  /** 帯の面に付けるスタイル */
  style?: CSSProperties;
  /**
   * 操作（ActionBarButton）。並べた順に左から置きます。入りきらないときの扱いは、操作ごとの narrowPlacement で決まります
   * （icon-only の文字を外す → menu の操作を後ろから ⋮ に畳む → それでも入らなければ折り返す）
   */
  children?: ReactNode;
}

/**
 * 一覧の項目を選んでいるあいだだけ、置いた場所の下に浮かぶ操作の帯です。件数の文と、選んだものへの操作（ActionBarButton）を並べます。
 * 一覧のすぐ後ろ（同じ親の中）に置きます。スクロールしているあいだは下に貼り付き、一覧の終わりでは一覧の下に収まります
 */
export function ActionBar({
  open,
  label,
  variant = 'surface',
  placement = 'full',
  motion = 'fade-up',
  onClear,
  clearName = '選択を外す',
  closeOnEscape = true,
  moreName = 'その他の操作',
  className,
  style,
  children,
}: ActionBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const rulerRef = useRef<HTMLDivElement>(null);
  const leadRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  // 帯に入る前にフォーカスがあった場所。帯が消えるときに戻す
  const returnRef = useRef<HTMLElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [height, setHeight] = useState(0);
  const statusId = useId();
  const narrow = useSheetPresentation(undefined);
  const status = useTransitionStatus(open, barRef, { appear: false });
  const mounted = status !== 'closed';
  const items = flattenItems(children);
  const placements = items.map(
    (item) => (item.props as ActionBarButtonProps).narrowPlacement ?? 'bar'
  );
  const fit = useActionBarFit(
    { ruler: rulerRef, lead: leadRef, measure: measureRef },
    { placements, active: mounted }
  );
  const s = actionBar({
    variant,
    placement,
    motion,
    clearable: onClear != null,
  });

  // 帯の高さを空きに渡す
  useIsomorphicLayoutEffect(() => {
    const bar = barRef.current;
    if (!mounted || !bar) return undefined;
    const update = () => setHeight(bar.offsetHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(bar);
    return () => observer.disconnect();
  }, [mounted]);

  // 帯が消えはじめたとき、フォーカスが帯の中にあれば、帯に入る前の場所へ戻す
  useIsomorphicLayoutEffect(() => {
    if (status !== 'ending') return;
    const bar = barRef.current;
    if (!bar || !bar.contains(document.activeElement)) return;
    const target = returnRef.current;
    if (target?.isConnected) target.focus({ preventScroll: true });
    else (document.activeElement as HTMLElement | null)?.blur();
  }, [status]);

  const onKeyDown = (event: KeyboardEvent) => {
    // メニューが開いているときの Esc は、メニューを閉じるだけにする
    if (event.key !== 'Escape' || !closeOnEscape || !onClear || menuOpen) return;
    event.preventDefault();
    onClear();
  };

  const folded = fit.folded.some(Boolean);
  const itemsIn = (mode: ItemMode) =>
    items.map((item, index) => (
      <ActionBarItemContext
        key={`${String(item.key)}-${index}`}
        value={{ mode, icon: fit.icon[index] ?? false, folded: fit.folded[index] ?? false }}
      >
        {item}
      </ActionBarItemContext>
    ));

  const barStatus = status === 'starting' ? 'starting' : status === 'ending' ? 'ending' : 'open';

  return (
    <>
      {/* 件数の知らせの箱。帯がないときも置いておき、中身が入ったときに読ませる */}
      <span id={statusId} role="status" className="sr-only">
        {open ? label : null}
      </span>
      {mounted && (
        <>
          <div
            aria-hidden
            data-slot="action-bar-spacer"
            data-open={status === 'open' ? '' : undefined}
            data-closing={status === 'ending' ? '' : undefined}
            className={s.spacer()}
            style={{ ['--action-bar-height' as string]: `${height}px` }}
          />
          <div data-slot="action-bar-anchor" className={s.anchor()}>
            <div ref={rulerRef} aria-hidden className={s.ruler()} />
            <div
              ref={barRef}
              data-slot="action-bar"
              data-narrow={narrow ? '' : undefined}
              data-starting-style={barStatus === 'starting' ? '' : undefined}
              data-ending-style={barStatus === 'ending' ? '' : undefined}
              // 帯に外から入ったとき、入る前の場所を控える
              onFocus={(event) => {
                const from = event.relatedTarget as HTMLElement | null;
                if (from && !event.currentTarget.contains(from)) returnRef.current = from;
              }}
              onKeyDown={onKeyDown}
              className={s.bar({ className })}
              style={style}
            >
              <Toolbar aria-labelledby={statusId} className={s.toolbar()}>
                <div ref={leadRef} className={s.lead()}>
                  {onClear && (
                    <ToolbarButton iconOnly aria-label={clearName} onClick={onClear}>
                      <XIcon standalone />
                    </ToolbarButton>
                  )}
                  <span aria-hidden className={s.label()}>
                    {label}
                  </span>
                </div>
                <div className={s.actions()}>
                  {itemsIn('bar')}
                  {folded && (
                    <Menu
                      title={moreName}
                      side="top"
                      align="end"
                      open={menuOpen}
                      onOpenChange={setMenuOpen}
                      trigger={
                        <ToolbarButton iconOnly aria-label={moreName}>
                          <DotsThreeVerticalIcon standalone />
                        </ToolbarButton>
                      }
                    >
                      {itemsIn('menu')}
                    </Menu>
                  )}
                </div>
              </Toolbar>
              {/* 測るための見えない並び。帯の操作と同じ大きさで、文字の形・アイコンだけの形・⋮ を並べる */}
              <div ref={measureRef} aria-hidden inert className={s.measure()}>
                {itemsIn('measure')}
                {itemsIn('measure-icon')}
                <Button variant="underline" iconOnly aria-label="" data-fit="more" tabIndex={-1}>
                  <DotsThreeVerticalIcon standalone />
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export interface ActionBarButtonProps {
  /** 操作の文字（「複製」「削除」） */
  children: string;
  /** 文字の前に置くアイコン（`<Icon icon={CopyIcon} />`）。narrowPlacement="icon-only" で文字を外したときは、これだけを出します */
  icon?: ReactNode;
  /** 押したときの処理 */
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  /**
   * 押せないか
   * @default false
   */
  disabled?: boolean;
  /**
   * 帯に入りきらないときの扱い。bar は帯に残し、入らなければ帯を折り返して次の行へ送ります。
   * icon-only は、まず文字を外してアイコンだけにします（アイコンだけで意味が伝わる操作に。名前は読み上げで伝わります）。
   * menu は、⋮ のメニューに畳みます（たまにしか使わない操作に）。
   * 先に icon-only の文字を外し、それでも入らなければ menu の操作を後ろから畳み、それでも入らなければ折り返します
   * @default 'bar'
   */
  narrowPlacement?: ActionBarButtonNarrowPlacement;
  /** 削除など、取り消せない操作の状態。danger は文字を危険の色にします（帯の上では、帯の面で読める淡い赤） */
  status?: ActionBarButtonStatus;
}

/** 操作の並び。Fragment で包んだ操作も、1 つずつの操作として数える */
function flattenItems(children: ReactNode): ReactElement[] {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement<{ children?: ReactNode }>(child)) return [];
    return child.type === Fragment ? flattenItems(child.props.children) : [child];
  });
}

/** アイコンだけで置くときは、単体の太い線にする（Icon の standalone） */
function standaloneIcon(icon: ReactNode) {
  return isValidElement<{ standalone?: boolean }>(icon) && icon.type === Icon
    ? cloneElement(icon, { standalone: true })
    : icon;
}

/**
 * ActionBar に並べる操作です。帯では下線のボタン（ToolbarButton）として置き、入りきらないときは ⋮ のメニューの項目になります
 */
export function ActionBarButton({
  children,
  icon,
  onClick,
  disabled,
  status,
}: ActionBarButtonProps) {
  const context = use(ActionBarItemContext);
  if (!context) return null;
  const color = status === 'danger' ? 'danger' : 'neutral';
  switch (context.mode) {
    case 'menu':
      return context.folded ? (
        <MenuItem icon={icon} status={status} disabled={disabled} onClick={onClick}>
          {children}
        </MenuItem>
      ) : null;
    case 'measure':
      return (
        <Button variant="underline" color={color} data-fit="label" tabIndex={-1}>
          {icon}
          {children}
        </Button>
      );
    case 'measure-icon':
      return icon ? (
        <Button
          variant="underline"
          color={color}
          iconOnly
          aria-label=""
          data-fit="icon"
          tabIndex={-1}
        >
          {standaloneIcon(icon)}
        </Button>
      ) : (
        <Button variant="underline" color={color} data-fit="icon" tabIndex={-1}>
          {children}
        </Button>
      );
    default:
      if (context.folded) return null;
      return context.icon && icon ? (
        <ToolbarButton
          iconOnly
          aria-label={children}
          color={color}
          disabled={disabled}
          onClick={onClick}
        >
          {standaloneIcon(icon)}
        </ToolbarButton>
      ) : (
        <ToolbarButton color={color} disabled={disabled} onClick={onClick}>
          {icon}
          {children}
        </ToolbarButton>
      );
  }
}
