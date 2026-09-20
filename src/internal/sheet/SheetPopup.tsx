'use client';

import { Drawer as BaseDrawer } from '@base-ui/react/drawer';
import { type ReactNode, type Ref, useId } from 'react';

import { initialFocusOf } from '../overlay/initial-focus';

import type { DensityScope } from '../density-scope';
import { SheetCloseButton, SheetHeader } from './SheetHeader';
import { SheetMoreCue } from './SheetMoreCue';
import { overlayTitleLeading, sheetDescriptionClass, sheetTitleClass } from './sheet-styles';
import { useMoreCues } from './use-more-cues';
import { usePortalContainer } from '../ui-config';

/**
 * 下の操作の並べ方
 * auto: 出し方に合わせる（画面の下から出すシートは縦に積み、横から出すパネルは右寄せ。中央に浮かべる Dialog はいつも右寄せ）
 * end: 横に並べて右に寄せる。fill: 横に並べて幅を等分する
 * stack: 幅いっぱいで縦に積む（渡した順に上から）。stack-reverse: 縦に積み、最後に渡した主な操作を上にする
 */
export type OverlayActionsLayout = 'auto' | 'end' | 'fill' | 'stack' | 'stack-reverse';

/** シートを出す向き。bottom は画面の下から、left・right は画面の横から */
export type SheetSide = 'bottom' | 'left' | 'right';

interface SheetPopupProps {
  side: SheetSide;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** 下の端に置く操作（ボタンの並び）。中身をスクロールしても動かない */
  footer?: ReactNode;
  /** 下の操作の並べ方 */
  footerLayout?: OverlayActionsLayout;
  /**
   * つまみを出すか（下から出すときだけ）。引けるとき（はじいて閉じられる・上へ広げられる）に出す — ADR-0110
   * 出さないときも場所は取る（出し入れで見出しの位置と余白が動かないようにするため）
   */
  handle?: boolean;
  /**
   * 引く操作を始めさせないか（はじいて閉じず、上へ広げることもできないとき）
   * Base UI は指を置いた要素から data-base-ui-swipe-ignore を探して引く操作を無視するので、面そのものに付ける
   */
  swipeLocked?: boolean;
  /**
   * 引いているあいだ、引いた量に合わせて後ろの暗さを薄くするか
   * 段（snap points）があるときは、Base UI の引いた量が段の位置によらず 1 になるので薄くできない
   */
  swipeFade?: boolean;
  /**
   * 開いているあいだ、ほかの部分の操作を止めるか。false では後ろを暗くせず、面の外は触れたままにする
   * （Base UI の Backdrop と Viewport は閉じたときしか pointer-events を切らないので、ここで切る）
   */
  modal?: boolean;
  /** 閉じる × の読み上げの名前 */
  closeLabel?: string;
  /** 右上に閉じる × を置くか */
  closeButton?: boolean;
  container?: HTMLElement | null;
  densityScope: DensityScope;
  popupRef?: Ref<HTMLDivElement>;
  className?: string;
}

// シートの本体 — adr/0037 の形を、Base UI の Drawer の上に作る。Drawer.Root の中に置く
// Drawer・狭い画面の Dialog と Popover が使う（Select のシートは Select の浮かぶ部分で作り、見出しと続きの印だけを共有する）
//   面・輪郭は浮かぶ面と同じ。下から出すときは上の角をカードの角に丸め、上向きの影（--shadow-sheet）
//   横から出すときは、内側の角を丸め、影は --shadow-sheet-left・--shadow-sheet-right
//   後ろの画面は暗くし（--color-backdrop）、押すと閉じる
//   見出しは Select のシートと同じ（つまみ・題・説明・右上の ×）。中身が長いときは上下の端に続きの印（上はいつも区切り線）
//   滑る長さと緩急はシート（--duration-sheet・--ease-sheet）。はじいて閉じたときも同じ長さで滑らせる（Select のシートと同じ。
//   Base UI の例のように、はじいた強さで短くすると、一瞬で消えて見える）
//   閉じるときは影も一緒に薄くする。緩急の尻尾で面が画面の端に着いたあとも外されるまで数フレームあり、
//   面の外へ伸びる影だけが画面の端に残って見えるため（はじいて閉じたときは、残りの距離が短い分、長く残る）
//   動きを減らす設定では動かさない（原則3）
export function SheetPopup({
  side,
  title,
  description,
  children,
  footer,
  footerLayout = 'auto',
  handle = false,
  swipeLocked = false,
  swipeFade = true,
  modal = true,
  closeLabel,
  closeButton = true,
  container,
  densityScope,
  popupRef,
  className,
}: SheetPopupProps) {
  const portalContainer = usePortalContainer(container);
  const cues = useMoreCues();
  // auto: 下から出すシートは縦に積み（主な操作が上）、横から出すパネルは右寄せ
  const layout =
    footerLayout === 'auto' ? (side === 'bottom' ? 'stack-reverse' : 'end') : footerLayout;
  const overlayId = useId();
  const bottom = side === 'bottom';
  // 面のない場所（後ろの暗い面の側）に敷く、引く操作を無視する場所
  // Base UI は Viewport の中を引く操作を拾うので、これがないと、空いた場所を引いてもシートを引いたことになる
  //   （面は動かないのに、後ろの暗さだけが変わる）。押して閉じる（外を押す）のはそのまま効く
  const swipeIgnore = <div aria-hidden data-base-ui-swipe-ignore className="flex-1 self-stretch" />;
  return (
    // 中身に入力欄を置くシートのために、ソフトウェアキーボードに合わせてスクロールを整える（Base UI）
    <BaseDrawer.VirtualKeyboardProvider>
      <BaseDrawer.Portal container={portalContainer}>
        {/* 引いているあいだは、引いた量に合わせて薄くする。閉じる方へ引くほど、後ろの画面が見えてくる
        段（snap points）があるときは、Base UI の引いた量が段の位置によらず 1 になるので、薄くしない（暗さは変えない）
        ほかの操作を止めないとき（modal=false）は、後ろを暗くしない（Base UI の非モーダルの例と同じ） */}
        {modal && (
          <BaseDrawer.Backdrop
            className={[
              swipeFade ? 'opacity-[calc(1-var(--drawer-swipe-progress,0))]' : '',
              'fixed inset-0 z-10 bg-backdrop transition-opacity duration-(--duration-sheet) ease-(--ease-sheet) data-ending-style:opacity-0 data-starting-style:opacity-0 data-swiping:duration-0 motion-reduce:transition-none',
            ].join(' ')}
          />
        )}
        {/* 面を置く枠。ほかの操作を止めないときは枠を素通しにし、面だけが触れるようにする */}
        <BaseDrawer.Viewport
          className={[
            'fixed inset-0 z-10 flex',
            !modal && 'pointer-events-none',
            bottom ? 'flex-col items-center justify-end' : 'items-stretch',
            side === 'left' && 'justify-start',
            side === 'right' && 'justify-end',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {(bottom || side === 'right') && swipeIgnore}
          <BaseDrawer.Popup
            ref={popupRef}
            data-overlay-id={overlayId}
            initialFocus={initialFocusOf(overlayId, 'drawer')}
            data-slot="sheet"
            data-side={side}
            data-density={densityScope.density}
            data-base-ui-swipe-ignore={swipeLocked ? '' : undefined}
            className={[
              'relative flex min-h-0 flex-col border-surface-line bg-surface text-(length:--text-control) leading-(--leading-control) text-fg outline-none [--sheet-inset:0px]',
              !modal && 'pointer-events-auto',
              overlayTitleLeading,
              // 閉じる向きと反対へ引いたときに、面が端から離れても隙間が見えないよう、画面の外側に面と同じ色を伸ばしておく
              // 引いた量は端数になるので、継ぎ目が見えないよう面に 1px 重ねる
              "before:pointer-events-none before:absolute before:bg-surface before:content-['']",
              'transition-[transform,box-shadow] duration-(--duration-sheet) ease-(--ease-sheet) data-swiping:duration-0 data-swiping:select-none motion-reduce:transition-none',
              densityScope.large && 'coarse-large',
              bottom && [
                'max-h-(--sheet-max-height) w-full rounded-t-card border-t-(length:--border-width-thin) shadow-sheet',
                'before:inset-x-0 before:top-[calc(100%-1px)] before:h-(--sheet-bleed)',
                '[transform:translateY(calc(var(--drawer-snap-point-offset,0px)+var(--drawer-swipe-movement-y,0px)))]',
                // 半分の段のときは面を下へずらすので、ずらした分だけ下に余白を足し、中身の高さを縮める
                // 下の操作と続きの影が、画面の下の端に見えたままになる
                // 引いている量（--drawer-swipe-movement-y）は足さない。足すと面が伸びて、指の動きと打ち消し合い、面が止まって見える
                '[padding-bottom:max(0px,var(--drawer-snap-point-offset,0px))] data-ending-style:[padding-bottom:0] data-starting-style:[padding-bottom:0]',
                'data-ending-style:[transform:translateY(100%)] data-starting-style:[transform:translateY(100%)]',
                'data-ending-style:shadow-none',
                // はじいて閉じるときは、離した位置から下へ滑らせる（transition では滑らない場合がある — src/styles/theme.css）
                'data-swipe-dismiss:data-ending-style:animate-[sheet-swipe-out-down_var(--duration-sheet)_var(--ease-sheet)_forwards] motion-reduce:data-swipe-dismiss:data-ending-style:animate-none',
              ],
              side === 'left' && [
                'h-full w-(--sheet-side-width) rounded-r-card border-r-(length:--border-width-thin) [box-shadow:var(--shadow-sheet-left)]',
                'before:inset-y-0 before:right-[calc(100%-1px)] before:w-(--sheet-bleed)',
                '[transform:translateX(var(--drawer-swipe-movement-x,0px))]',
                'data-ending-style:[transform:translateX(-100%)] data-starting-style:[transform:translateX(-100%)]',
                'data-ending-style:[box-shadow:none]',
              ],
              side === 'right' && [
                'h-full w-(--sheet-side-width) rounded-l-card border-l-(length:--border-width-thin) [box-shadow:var(--shadow-sheet-right)]',
                'before:inset-y-0 before:left-[calc(100%-1px)] before:w-(--sheet-bleed)',
                '[transform:translateX(var(--drawer-swipe-movement-x,0px))]',
                'data-ending-style:[transform:translateX(100%)] data-starting-style:[transform:translateX(100%)]',
                'data-ending-style:[box-shadow:none]',
              ],
              className,
            ]
              .flat()
              .filter(Boolean)
              .join(' ')}
          >
            {/* 横から出すときは、つまみの場所に端末の安全領域の分を空ける */}
            <SheetHeader
              handle={bottom && handle}
              className={bottom ? undefined : 'pt-[env(safe-area-inset-top)]'}
              close={
                closeButton ? (
                  <BaseDrawer.Close
                    render={<SheetCloseButton label={closeLabel} />}
                    data-slot="sheet-close"
                  />
                ) : null
              }
            >
              {title != null && (
                <BaseDrawer.Title className={sheetTitleClass}>{title}</BaseDrawer.Title>
              )}
              {description != null && (
                <BaseDrawer.Description className={sheetDescriptionClass}>
                  {description}
                </BaseDrawer.Description>
              )}
            </SheetHeader>
            {/* 続きの印: 上の区切り線は、中身がスクロールできるときだけ出す。下の区切り線は、下に操作があり、下の影が出ているあいだ出す */}
            <SheetMoreCue
              edge="top"
              sheet
              sheetMoreCue="divider-always-shadow"
              divider="scrollable"
            />
            {/* 中身。スクロールする。下に操作がないときは、下端の余白に端末の安全領域の分を空ける */}
            <BaseDrawer.Content
              ref={cues}
              data-slot="sheet-content"
              className={[
                'min-h-0 flex-1 overflow-y-auto overscroll-contain px-(--sheet-padding-x) pt-(--sheet-padding-x)',
                footer == null && 'pb-[max(var(--sheet-padding-x),env(safe-area-inset-bottom))]',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {children}
            </BaseDrawer.Content>
            <SheetMoreCue
              edge="bottom"
              sheet
              sheetMoreCue="divider-always-shadow"
              divider={footer != null ? 'shadow' : undefined}
            />
            {footer != null && (
              <div
                data-slot="sheet-footer"
                data-layout={layout}
                className="flex shrink-0 flex-wrap justify-end gap-2 px-(--sheet-padding-x) pt-(--sheet-padding-x) pb-[max(var(--sheet-padding-x),env(safe-area-inset-bottom))] data-[layout='stack-reverse']:flex-col-reverse data-[layout=fill]:*:flex-1 data-[layout=stack]:flex-col"
              >
                {footer}
              </div>
            )}
          </BaseDrawer.Popup>
          {side === 'left' && swipeIgnore}
        </BaseDrawer.Viewport>
      </BaseDrawer.Portal>
    </BaseDrawer.VirtualKeyboardProvider>
  );
}
