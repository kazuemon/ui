'use client';

import { Menu as BaseMenu } from '@base-ui/react/menu';
import {
  type ComponentProps,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  use,
  useEffect,
  useId,
  useState,
} from 'react';

import { useDensityScope } from '../../internal/density-scope';
import { CaretLeftIcon } from '../../internal/icons';
import {
  popupMotionClass,
  popupSurfaceClass,
  readTokenLength,
} from '../../internal/overlay/popup-styles';
import { SheetCloseButton, SheetHeader } from '../../internal/sheet/SheetHeader';
import { SheetMoreCue } from '../../internal/sheet/SheetMoreCue';
import {
  overlayTitleLeading,
  sheetCloseButtonClass,
  sheetTitleClass,
} from '../../internal/sheet/sheet-styles';
import { useMoreCues } from '../../internal/sheet/use-more-cues';
import {
  type OverlayPresentation,
  useSheetPresentation,
} from '../../internal/sheet/use-narrow-screen';
import { useSheetDrag } from '../../internal/sheet/use-sheet-drag';
import { usePortalContainer } from '../../internal/ui-config';
// シートの寸法の計算は選択肢の一覧と共有（つまみを引く操作は src/internal/sheet/use-sheet-drag.ts）
import { SHEET_FULL, screenHeight } from '../../internal/listbox/listbox-measure';
import {
  type MenuColor,
  MenuContext,
  type MenuGroupLabelStyle,
  type MenuMarkPlacement,
  MenuParentSurface,
  type MenuRadioMark,
  type MenuSubmenuSheet,
  useMenuContext,
} from './menu-context';
import { menuChildrenHaveMarks } from './MenuItem';
import { MenuSlideStage } from './MenuSlide';
import { useMenuSlideState } from './use-menu-slide';

export type {
  MenuColor,
  MenuGroupLabelStyle,
  MenuMarkPlacement,
  MenuRadioMark,
  MenuSubmenuSheet,
} from './menu-context';
export type MenuPresentation = OverlayPresentation;
export type MenuSide = 'top' | 'bottom' | 'left' | 'right';
export type MenuAlign = 'start' | 'center' | 'end';

export interface MenuProps {
  /** 開くボタン。Button などの要素を渡す。押すと開き、もう一度押すと閉じる */
  trigger: ReactElement;
  /** 項目（MenuItem・MenuLinkItem・MenuCheckboxItem・MenuRadioGroup・MenuGroup・MenuSeparator・MenuSubmenu） */
  children?: ReactNode;
  /**
   * 題。シートで出すときに見出しに出し、読み上げでは開いた一覧の名前になる。浮かべるときは出さない
   * 書かないときは、見出しには閉じる × だけを置く
   */
  title?: ReactNode;
  /**
   * 本体のどちら側に出すか。画面の端に当たるときは反対側に出します
   * @default 'bottom'
   */
  side?: MenuSide;
  /**
   * 本体に対して、どこにそろえるか
   * @default 'start'
   */
  align?: MenuAlign;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * 開いているあいだ、ほかの部分の操作とページのスクロールを止めるか
   * @default true
   */
  modal?: boolean;
  /**
   * 出し方。auto は指で操作していて画面が狭いときだけ、画面の下から出すシートにします。popover はいつも本体のそばに浮かべ、sheet はいつもシートにします
   * 書かないときは ThemeProvider の presentation に従います
   * @default 'auto'
   */
  presentation?: MenuPresentation;
  /**
   * チェックとラジオの印の色。primary・secondary は利用者が選ぶ色、neutral は色を持たないグレー（濃紺）です
   * @default 'neutral'
   */
  color?: MenuColor;
  /**
   * チェックとラジオの印の場所。start は文字の前（印のある項目どうしの文字の左がそろう）、end は右端（ふつうの項目と文字の左がそろう）
   * @default 'start'
   */
  markPlacement?: MenuMarkPlacement;
  /**
   * 1 つだけを選ぶ項目（MenuRadioItem）の印。radio はラジオと同じ丸を小さくした形で、どの項目にもグレーの丸を置き、選んだ丸を color の色に白い点にします。
   * dot は選んだ項目にだけ小さな点、check は選んだ項目にだけチェック（MenuCheckboxItem と同じ印）を出します
   * @default 'radio'
   */
  radioMark?: MenuRadioMark;
  /**
   * 印（チェック・ラジオ）を持つ項目があるとき、印を持たない項目（MenuItem・MenuLinkItem・MenuSubmenu）にも
   * 印の場所を空けて文字の左をそろえるか。false にすると、印を持つ項目だけ字下げされます
   * @default true
   */
  alignMarks?: boolean;
  /**
   * グループ（MenuGroup）の見出しの文字。label は入力欄のラベルと同じ太字、caption はキャプションと同じ小さいグレーで、項目を主役にします。
   * 1 つのメニューの見出しはそろえるので、メニューごとに選びます
   * @default 'label'
   */
  groupLabelStyle?: MenuGroupLabelStyle;
  /**
   * シートで入れ子のメニュー（MenuSubmenu）を開く形。fixed は 1 枚のシートのまま中身を右から滑り込ませ、
   * シートの高さは最初に開いたメニューの高さのまま変えません（入れ子があるときだけ、上のつまみを引いて変えられます。長い中身はシートの中でスクロール）。
   * fit は fixed と同じく滑り込ませますが、高さは中身に合わせて伸び縮みします。
   * cover は親のシートを覆う高さの、別のシートを下から重ねます。
   * どの形も、見出しの左に親へ戻る ‹ を、右にすべてを閉じる × を置きます
   * @default 'fixed'
   */
  submenuSheet?: MenuSubmenuSheet;
  /**
   * シートを、はじく・下へ引いて閉じられるか（Drawer の closeOnSwipe と同じ）。true にすると、入れ子がなくても
   * つまみを出します（原則11・ADR-0110: つまみは引ける印）。高さは変えず、開いた高さと閉じるの 2 つの段だけです。
   * submenuSheet="fixed" で入れ子があるときは、この指定によらずつまみと引いて閉じる操作を出します（高さも変えられます）
   * @default false
   */
  closeOnSwipe?: boolean;
  /**
   * シートの閉じる × の読み上げの名前
   * @default '閉じる'
   */
  closeLabel?: string;
  /**
   * 入れ子のシートで、親のメニューへ戻るボタンの読み上げの名前
   * @default '戻る'
   */
  backLabel?: string;
  /**
   * 描く場所。トリガーの祖先に付いた data-density と coarse-large は、描く場所がその外でも写します
   * @default document.body
   */
  container?: HTMLElement | null;
  /** 画面の端に当たったとき、反対側に出すか・ずらすか。既定は Base UI のまま（反対側に出す） */
  collisionAvoidance?: MenuCollisionAvoidance;
  /** 面（Popup）に足すクラス。幅を変えるときは w-*・min-w-* を渡す */
  className?: string;
}

export type MenuCollisionAvoidance = ComponentProps<
  typeof BaseMenu.Positioner
>['collisionAvoidance'];

/**
 * 押して開く、操作の一覧。項目を押すと実行して閉じます。
 * 別の場所へ移る項目は MenuLinkItem、その場で切り替える項目は MenuCheckboxItem・MenuRadioItem にします
 */
export function Menu({
  trigger,
  children,
  title,
  side = 'bottom',
  align = 'start',
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  modal = true,
  presentation,
  color = 'neutral',
  markPlacement = 'start',
  radioMark = 'radio',
  alignMarks = true,
  groupLabelStyle = 'label',
  submenuSheet = 'fixed',
  closeOnSwipe = false,
  closeLabel,
  backLabel,
  container,
  collisionAvoidance,
  className,
}: MenuProps) {
  // 開閉はここで持つ（シートの × で閉じるため。出し方が開いたまま切り替わっても閉じないようにするため）
  const [openState, setOpenState] = useState(defaultOpen);
  const open = openProp ?? openState;
  const changeOpen = (next: boolean) => {
    setOpenState(next);
    onOpenChange?.(next);
  };
  const sheet = useSheetPresentation(presentation);
  const portalContainer = usePortalContainer(container);
  const { anchorRef, scope } = useDensityScope(open);
  // 閉じ終えたら面を作り直す（slide のシートで開いていた入れ子を、次に開くときに持ち越さない）
  const [generation, setGeneration] = useState(0);
  const reserveMarkSpace = alignMarks && menuChildrenHaveMarks(children);
  return (
    <BaseMenu.Root
      open={open}
      onOpenChange={changeOpen}
      onOpenChangeComplete={(next) => {
        if (!next) setGeneration((current) => current + 1);
      }}
      modal={modal}
    >
      <BaseMenu.Trigger ref={anchorRef} render={trigger} />
      <MenuContext
        value={{
          sheet,
          container: portalContainer,
          densityScope: scope,
          color,
          markPlacement,
          radioMark,
          reserveMarkSpace,
          groupLabelStyle,
          submenuSheet,
          closeOnSwipe,
          closeLabel,
          backLabel,
          closeAll: () => changeOpen(false),
        }}
      >
        <MenuSurface
          key={generation}
          title={title}
          side={side}
          align={align}
          onClose={() => changeOpen(false)}
          collisionAvoidance={collisionAvoidance}
          className={className}
        >
          {children}
        </MenuSurface>
      </MenuContext>
    </BaseMenu.Root>
  );
}

// 印の色（原則6）。面を持たないので、白地に置く前景用の色。選んだ項目に面は敷かない
const MARK_COLOR: Record<MenuColor, string> = {
  primary: 'var(--color-primary)',
  secondary: 'var(--color-fg-secondary)',
  neutral: 'var(--color-fg)',
};

type TokenStyle = CSSProperties & Record<`--${string}`, string>;
const markStyle = (color: MenuColor): TokenStyle => ({ '--menu-mark-color': MARK_COLOR[color] });

// 親へ戻る ‹。アイコンだけのボタンなので線は Bold
function BackButton({ label = '戻る', onClick }: { label?: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      tabIndex={-1}
      onClick={onClick}
      className={sheetCloseButtonClass}
    >
      <CaretLeftIcon standalone />
    </button>
  );
}

// 親の面の高さを追う（入れ子のシートを、親のシートより低くしないため）
function useElementHeight(element: HTMLElement | null, active: boolean) {
  const [height, setHeight] = useState<number | null>(null);
  useEffect(() => {
    if (!element || !active) return undefined;
    const observer = new ResizeObserver(() => setHeight(element.getBoundingClientRect().height));
    observer.observe(element);
    return () => observer.disconnect();
  }, [element, active]);
  return height;
}

// つまみの段: half は親のメニューの高さ（見出し・輪郭を含む。上限を超えない）、full はシートの高さの上限
//   content は上限と同じにし、上へ引くと中身の長さによらず上限まで広がる
function sheetMetrics(rootSheetHeight: number, container: HTMLElement | null | undefined) {
  const full = Math.round(screenHeight(container) * SHEET_FULL);
  // 見出しの上の輪郭の分
  const half = Math.min(full, Math.round(rootSheetHeight + readTokenLength('--border-width-thin')));
  return { content: full, half, full };
}

// closeOnSwipe だけの引く操作（入れ子がない・resizable でないとき）の段: 開いた高さ 1 つだけ
//   content・half・full を同じにすると useSheetDrag は「引いて離すと元の高さへ戻る・十分引く／はじくと閉じる」だけになる
//   （metrics.half より上へは Math.min(metrics.full, …) で頭打ちになるので、上へ広げることもできない）
function swipeCloseMetrics(naturalHeight: number) {
  // 見出しの上の輪郭の分（sheetMetrics と同じ）
  const height = Math.round(naturalHeight + readTokenLength('--border-width-thin'));
  return { content: height, half: height, full: height };
}

interface MenuSurfaceProps {
  title?: ReactNode;
  side?: MenuSide;
  align?: MenuAlign;
  /** 入れ子のメニューの面か。入れ子は親の項目の横に出し、シートでは親のシートの上に重ねる */
  nested?: boolean;
  /** 閉じる。入れ子の面では親へ戻る */
  onClose: () => void;
  collisionAvoidance?: MenuCollisionAvoidance;
  className?: string;
  children?: ReactNode;
}

// 一覧の面。浮かべる形とシートの形を、同じ Base UI の Popup で作る（中の項目は同じまま）
//   浮かべる形: 面は浮かぶ選択肢と同じ（popupSurfaceClass・--shadow-overlay）。開閉の動きも同じ（popupMotionClass）
//     高さは画面の端まで。長いときは上下の端に内側の影を落とす（原則1）
//   シート: Select のシートと同じ作り。Base UI が付ける位置を上書きして画面の下に固定し、見出し（題・×）を置く
//     引いて閉じる操作は持たないので、既定ではつまみは出さない（ADR-0110・原則11）。closeOnSwipe を true にすると出し、
//     はじく・下へ引いて閉じられる（高さは変えない。段は開いた高さと閉じるの 2 つ）。
//     submenuSheet="fixed" で入れ子（MenuSubmenu）があるときは、closeOnSwipe によらずつまみを出す。
//     入れ子へ滑っても高さを保つため、はじめから引いて高さを変えられる（入れ子がなければ高さは変わらないので出さない）
//     見出しは面の端から置く（面に余白を持たせず、余白は一覧の側に持たせるので --sheet-inset は 0）
//     後ろの画面を暗くし、押すと閉じる
//   入れ子のシート（submenuSheet）
//     cover: 親のシートの上に、親と同じ高さ以上の別の面を重ね、下から滑り出る（Base UI の入れ子の Popup のまま）
//       見出しの左に親へ戻る ‹、右にすべてを閉じる × を置く
//     fixed・fit: 入れ子を別の面にせず、同じシートの中のパネルとして描く（MenuSlide.tsx）。見出しは同じ ‹・題・×
//       浮かべる形では使わない（入れ子は Base UI の入れ子の Popup のまま）
export function MenuSurface({
  title,
  side = 'bottom',
  align = 'start',
  nested = false,
  onClose,
  collisionAvoidance,
  className,
  children,
}: MenuSurfaceProps) {
  const {
    sheet,
    container,
    densityScope,
    color,
    closeLabel,
    backLabel,
    submenuSheet,
    closeOnSwipe,
    closeAll,
  } = useMenuContext();
  const cues = useMoreCues();
  const titleId = useId();

  const [popup, setPopup] = useState<HTMLDivElement | null>(null);
  const parent = use(MenuParentSurface);
  const nestedSheet = sheet && nested ? submenuSheet : null;
  // fit・fixed: 親のメニューの面が、入れ子のパネルの道筋を持つ
  const slide = useMenuSlideState(submenuSheet === 'fixed');
  const sliding = sheet && !nested && (submenuSheet === 'fit' || submenuSheet === 'fixed');
  const slideTop = sliding ? slide.path.at(-1) : undefined;
  const shownTitle = slideTop ? slideTop.title : title;
  // cover の入れ子のシートは、親のシートより低くしない
  const parentHeight = useElementHeight(parent, nestedSheet === 'cover');
  // fixed: つまみを出し、引いて高さを変えられる（Select のシートのつまみと同じ操作）。入れ子（MenuSubmenu）があるときだけ
  //   （入れ子がなければ高さはそもそも変わらないので、原則11・ADR-0110 により、変えられないつまみは出さない）
  //   段は 2 つ。親のメニューの高さ（開いたとき）と、シートの高さの上限。引いているあいだは指に付いて動き、
  //   離すと近い段へ動く。下へはじくか、親のメニューの高さより十分低く引いて離すと閉じる
  //   高さはシートが持つので、入れ子へ滑っても変わらない
  const resizable = sliding && slide.fixed && slide.hasSubmenu;
  // closeOnSwipe（入れ子があって resizable なときは、そちらの多段の操作を使うのでここでは出さない）
  //   つまみは出すが高さは変えない。段は「開いた高さ」と「閉じる」の 2 つだけ（swipeCloseMetrics）
  //   fixed・fit は slide の舞台がすでに親のパネルの高さを測っている（slide.rootHeight）ので、それを使う
  //   cover（sliding=false）は舞台を持たないので、中身を包む要素の高さを直接測る（下の content）
  const swipeOnly = !nested && sheet && closeOnSwipe && !resizable;
  const showHandle = resizable || swipeOnly;
  const [header, setHeader] = useState<HTMLDivElement | null>(null);
  const headerHeight = useElementHeight(header, showHandle);
  const [content, setContent] = useState<HTMLDivElement | null>(null);
  const contentHeight = useElementHeight(content, swipeOnly && !sliding);
  const swipeSource = sliding ? slide.rootHeight : contentHeight;
  const drag = useSheetDrag({
    sheetDetent: 'half',
    metrics:
      resizable && headerHeight != null && slide.rootHeight != null
        ? sheetMetrics(headerHeight + slide.rootHeight, container)
        : swipeOnly && headerHeight != null && swipeSource != null
          ? swipeCloseMetrics(headerHeight + swipeSource)
          : null,
    long: showHandle,
    onClose,
  });
  const withBack = nestedSheet === 'cover' || slideTop != null;
  const labelled = sheet && shownTitle != null;
  const popupStyle: TokenStyle = {
    ...markStyle(color),
    ...(withBack && parentHeight != null ? { '--menu-parent-height': `${parentHeight}px` } : {}),
  };
  return (
    <BaseMenu.Portal container={container}>
      {sheet && !nested && (
        <BaseMenu.Backdrop className="fixed inset-0 z-10 bg-backdrop transition-opacity duration-(--duration-sheet) ease-(--ease-sheet) data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none" />
      )}
      <BaseMenu.Positioner
        // 入れ子の面は Base UI の既定（親の項目の横）に出す。最初の項目が親の項目と同じ高さに並ぶよう、面の余白と輪郭の分だけ上へずらす
        side={nested ? undefined : side}
        align={nested ? undefined : align}
        sideOffset={() => (nested ? 0 : readTokenLength('--menu-offset'))}
        alignOffset={() =>
          nested
            ? -(readTokenLength('--menu-popup-padding') + readTokenLength('--border-width-thin'))
            : 0
        }
        collisionPadding={8}
        collisionAvoidance={collisionAvoidance}
        data-density={densityScope.density}
        data-presentation={sheet ? 'sheet' : 'popover'}
        className={[
          'z-10 outline-none',
          densityScope.large && 'coarse-large',
          sheet &&
            'inset-x-0! top-auto! bottom-0! left-0! flex max-h-(--sheet-max-height) flex-col [position:fixed]! [transform:none]!',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <BaseMenu.Popup
          ref={setPopup}
          data-slot="menu"
          data-submenu-sheet={nestedSheet ?? undefined}
          data-dragging={drag.dragging || undefined}
          aria-labelledby={labelled ? titleId : undefined}
          style={
            drag.sheetHeight !== undefined
              ? { ...popupStyle, height: drag.sheetHeight }
              : popupStyle
          }
          className={[
            'flex flex-col text-(length:--text-control) leading-(--leading-control) [--sheet-inset:0px]',
            sheet
              ? [
                  // シート: 面・輪郭は浮かぶ面と同じ。上の角だけカードの角に丸め、下から滑り出る
                  'w-full rounded-t-card border-t-(length:--border-width-thin) border-surface-line bg-surface text-fg shadow-sheet outline-none',
                  overlayTitleLeading,
                  // つまみで引けるシートは、離したあとの高さも動かす（引いているあいだは止める。閉じるときも、離した高さから滑る）
                  showHandle
                    ? '[transition:translate_var(--duration-sheet)_var(--ease-sheet),height_var(--duration-sheet)_var(--ease-sheet)] data-dragging:[transition:none] motion-reduce:[transition:none]'
                    : '[transition:translate_var(--duration-sheet)_var(--ease-sheet)] motion-reduce:[transition:none]',
                  // 下から滑り出る
                  'data-ending-style:translate-y-full data-starting-style:translate-y-full',
                  // 高さの下限。cover は親のシートの高さ（測るまでは 0）、ほかは 0（中身が長いときは一覧の中でスクロールする）
                  nestedSheet === 'cover' ? 'min-h-(--menu-parent-height,0px)' : 'min-h-0',
                ]
                  .filter(Boolean)
                  .join(' ')
              : [
                  popupSurfaceClass,
                  'max-h-(--available-height) max-w-(--available-width) min-w-[max(var(--anchor-width),var(--menu-min-width))] overflow-clip shadow-overlay',
                  // 入れ子の面は、親の項目の横から滑る向きが data-side（inline-end など）になるので、動きは濃さだけ
                  nested
                    ? 'transition-opacity duration-(--popup-duration-in) ease-(--popup-ease) data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:[transition:none]'
                    : popupMotionClass,
                ].join(' '),
            className,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {sheet && (
            <div className="relative">
              {withBack && (
                // つまみの場所（h-4）の下、× と同じ高さ。DOM では見出しより前（読む順が ‹・題・×）なので、題の行より手前に重ねる
                <div className="absolute top-4 left-(--sheet-close-inset) z-1">
                  <BackButton label={backLabel} onClick={slideTop ? slide.back : onClose} />
                </div>
              )}
              <SheetHeader
                ref={setHeader}
                handle={showHandle}
                onPointerDown={showHandle ? drag.handlers.onPointerDown : undefined}
                onPointerMove={showHandle ? drag.handlers.onPointerMove : undefined}
                onPointerUp={showHandle ? drag.handlers.onPointerUp : undefined}
                onPointerCancel={showHandle ? drag.handlers.onPointerUp : undefined}
                className={showHandle ? 'cursor-grab touch-none' : undefined}
                // 閉じる。Tab では止まらない（一覧の中は矢印キーで動く）。キーボードでは Esc で閉じる
                //   入れ子があるときも、× はすべてを閉じる（親へ戻るのは ‹）。読み上げも closeLabel のまま
                close={
                  <SheetCloseButton
                    tabIndex={-1}
                    label={closeLabel}
                    onClick={nestedSheet === 'cover' ? closeAll : onClose}
                  />
                }
              >
                {shownTitle != null && (
                  <div
                    id={titleId}
                    className={[
                      sheetTitleClass,
                      // 左の ‹ の分だけ題を右へ。‹ は × と左右対称に置く
                      withBack &&
                        'ms-[calc(var(--spacing-control)+var(--sheet-close-inset)-var(--sheet-padding-x))]',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {shownTitle}
                  </div>
                )}
              </SheetHeader>
            </div>
          )}
          <SheetMoreCue edge="top" sheet={sheet} sheetMoreCue="divider-always-shadow" />
          <div
            ref={cues}
            data-slot="menu-list"
            // resizable（入れ子があって fixed）: つまみの高さを測るまでは、一覧の高さを親のメニューの高さに固定する
            //   （縮むのは許すので、シートの上限は超えない）。測ったあとは、シートの高さ（つまみの段）の残りを一覧が埋める
            //   swipeOnly は測る前後で高さが変わらないので、このゲートは要らない
            style={
              resizable && drag.sheetHeight === undefined && slide.rootHeight != null
                ? { flex: `0 1 ${slide.rootHeight}px` }
                : undefined
            }
            className={[
              'min-h-0 flex-1 overflow-y-auto overscroll-contain',
              // fit・fixed では、余白はパネルが持つ（滑るときに余白ごと動かすため）
              !sliding && 'p-(--menu-popup-padding)',
              sheet &&
                !sliding &&
                'pb-[max(var(--menu-popup-padding),env(safe-area-inset-bottom))]',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <MenuParentSurface value={popup}>
              {sliding ? (
                <MenuSlideStage slide={slide}>{children}</MenuSlideStage>
              ) : swipeOnly ? (
                // cover は舞台（MenuSlideStage）を持たないので、closeOnSwipe の高さはここで直接測る
                <div ref={setContent}>{children}</div>
              ) : (
                children
              )}
            </MenuParentSurface>
          </div>
          <SheetMoreCue edge="bottom" sheet={sheet} sheetMoreCue="divider-always-shadow" />
        </BaseMenu.Popup>
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  );
}
