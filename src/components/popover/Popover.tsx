'use client';

import { Popover as BasePopover } from '@base-ui/react/popover';
import { type ReactElement, type ReactNode, useState } from 'react';

import { useDensityScope } from '../../internal/density-scope';
import { DISMISS_REASONS, ESCAPE_REASONS } from '../../internal/overlay/close-reasons';
import { OverlayCloseContext } from '../../internal/overlay/overlay-close-context';
import {
  focusTargetRef,
  type OverlayFocusTarget,
  type OverlayModal,
  type PopupProps,
  type PositionerProps,
} from '../../internal/overlay/overlay-props';
import {
  popupMotionClass,
  popupSurfaceClass,
  readTokenLength,
} from '../../internal/overlay/popup-styles';
import {
  overlayTitleLeading,
  sheetDescriptionClass,
  sheetTitleClass,
} from '../../internal/sheet/sheet-styles';
import {
  type OverlayPresentation,
  useSheetPresentation,
} from '../../internal/sheet/use-narrow-screen';
import { cn, SCOPE_CLASS } from '../../internal/tv';
import { useMergedRefs } from '../../internal/use-merged-refs';
import { Drawer } from '../drawer/Drawer';
import { VisuallyHidden } from '../visually-hidden/VisuallyHidden';
import { usePortalContainer } from '../../internal/ui-config';

export type PopoverSide = 'top' | 'bottom' | 'left' | 'right';
export type PopoverAlign = 'start' | 'center' | 'end';

export interface PopoverProps {
  /** 開くボタン。Button などの要素を渡す。押すと開き、もう一度押すと閉じる */
  trigger: ReactElement;
  /**
   * 題。読み上げでは、開いた面の名前になる。シートでは見出しに出す
   * 名前のない面は、読み上げで何の面か分からないので必ず渡す。画面に出したくないときは `hideTitle` を付ける
   */
  title: ReactNode;
  /**
   * 題を画面に出さず、読み上げにだけ届けるか。文だけを見せる面（「送料について」など）で使う。
   * 浮かべる形でもシートでも同じで、読み上げの名前は題のままです
   * @default false
   */
  hideTitle?: boolean;
  /** 題の下の説明。読み上げでは、開いた面の説明になる */
  description?: ReactNode;
  /** 面の中身（補足の文や、小さな設定） */
  children?: ReactNode;
  /**
   * 本体のどちら側に出すか。画面の端に当たるときは反対側に出します
   * @default 'bottom'
   */
  side?: PopoverSide;
  /**
   * 本体を指す小さな矢印を出すか。どこから開いたかをはっきりさせたいときに出します（シートでは出しません）
   * @default false
   */
  showArrow?: boolean;
  /**
   * 本体に対して、どこにそろえるか
   * @default 'center'
   */
  align?: PopoverAlign;
  /** 開いているか（制御） */
  open?: boolean;
  /**
   * はじめに開いているか（非制御）
   * @default false
   */
  defaultOpen?: boolean;
  /** 開閉が変わるときに、次の値を渡して呼びます */
  onOpenChange?: (open: boolean) => void;
  /** 開閉の動きが終わったあとに、次の値を渡して呼びます */
  onOpenChangeComplete?: (open: boolean) => void;
  /**
   * 開いているあいだ、ほかの部分の操作とページのスクロールを止めるか。中に入力や一覧を置くときは true にします。
   * passive は、裏を止めず外を押しても閉じません（開いたまま後ろを触れるようにするとき）
   * @default false
   */
  modal?: OverlayModal;
  /**
   * 後ろの画面を押したときに閉じるか。false にすると、フォーカスが面の外へ出たときにも閉じません（Esc では閉じます）
   * @default true
   */
  dismissible?: boolean;
  /**
   * Esc（Android の戻る操作を含む）で閉じるか
   * @default true
   */
  closeOnEscape?: boolean;
  /** 開いた直後に焦点を当てる要素。要素そのものか、要素の ref を渡します。書かないときは面の中の最初のもの */
  autoFocus?: OverlayFocusTarget;
  /** 閉じたあとに焦点を戻す要素。要素そのものか、要素の ref を渡します。書かないときは開いたボタン */
  returnFocus?: OverlayFocusTarget;
  /**
   * 出し方。auto は指で操作していて画面が狭いときだけ、画面の下から出すシートにします。popover はいつも本体のそばに浮かべ、sheet はいつもシートにします
   * 書かないときは ThemeProvider の presentation に従います
   * @default 'auto'
   */
  presentation?: OverlayPresentation;
  /**
   * 閉じる × の読み上げの名前（シートの × と、裏を止めるときに面の中へ置く読み上げ用の閉じる手段）
   * @default '閉じる'
   */
  closeName?: string;
  /**
   * 描く場所。トリガーの祖先に付いた data-density と coarse-large は、描く場所がその外でも写します。
   * まとめて決めるときは ThemeProvider の portalContainer を使います
   * @default document.body
   */
  portalContainer?: HTMLElement | null;
  /** 面（Popup）に足す props（id・data-*・aria-*・ref など） */
  popupProps?: PopupProps;
  /** 位置を決める要素（Positioner）に足す props（anchor・collisionAvoidance・sideOffset など） */
  positionerProps?: PositionerProps;
  /** 面（Popup）に足すクラス。幅を変えるときは w-*・max-w-* を渡す */
  className?: string;
}

/**
 * 押して開く、本体のそばに浮かぶ面。補足の説明や、小さな設定をその場で見せます。
 * 既定ではほかの操作は止めず、外を押すか Esc で閉じます
 *
 * 題（title）は必ず渡します。開いた面の読み上げの名前になります（原則15）。
 * 画面に出したくないときは hideTitle を付けます。読み上げの名前は残ります
 */
export function Popover({
  presentation,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  ...props
}: PopoverProps) {
  // 開閉はここで持つ。出し方（シート・浮かべる）が開いたまま切り替わっても（画面を回すなど）、閉じないようにするため
  const [openState, setOpenState] = useState(defaultOpen);
  const open = openProp ?? openState;
  const changeOpen = (next: boolean) => {
    setOpenState(next);
    onOpenChange?.(next);
  };
  const sheet = useSheetPresentation(presentation);
  // 指で操作していて画面が狭いときは、画面の下から出すシート（Drawer と同じ面）にする — 原則11
  if (sheet) {
    const { trigger, title, hideTitle, description, children } = props;
    return (
      <Drawer
        trigger={trigger}
        // 題を出さないときも、読み上げの名前は題のまま（見出しには見えない文字として置く）
        title={hideTitle ? <VisuallyHidden>{title}</VisuallyHidden> : title}
        description={description}
        open={open}
        onOpenChange={changeOpen}
        onOpenChangeComplete={props.onOpenChangeComplete}
        // シートは画面を覆うので、書かないときは裏を止める（浮かべる形の既定は止めない）
        modal={props.modal ?? true}
        dismissible={props.dismissible}
        closeOnEscape={props.closeOnEscape}
        autoFocus={props.autoFocus}
        returnFocus={props.returnFocus}
        closeName={props.closeName}
        portalContainer={props.portalContainer}
        popupProps={props.popupProps}
        className={props.className}
        detent="full"
      >
        {children}
      </Drawer>
    );
  }
  return <FloatingPopover {...props} open={open} onOpenChange={changeOpen} />;
}

// 本体のそばに浮かべる形
//   面は浮かぶ選択肢と同じ（popupSurfaceClass）。余白は --popover-padding、幅の上限は --popover-max-width
//   題・説明はシートの見出しと同じ文字。中身は部品の文字の大きさ
//   閉じる × は置かない（外を押すか Esc で閉じる。ほかの操作を止めないので、閉じる手段を探させない）
//   裏を止めるとき（modal=true）は、読み上げで面から出られるよう、見えない閉じるボタンを面の中に置く（Base UI の決まり）
function FloatingPopover({
  trigger,
  title,
  hideTitle = false,
  description,
  children,
  side = 'bottom',
  align = 'center',
  showArrow = false,
  open,
  onOpenChange: changeOpen,
  onOpenChangeComplete,
  modal = false,
  dismissible = true,
  closeOnEscape = true,
  autoFocus,
  returnFocus,
  closeName = '閉じる',
  portalContainer: container,
  popupProps,
  positionerProps,
  className,
}: Omit<PopoverProps, 'presentation' | 'defaultOpen' | 'open' | 'onOpenChange'> & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const portalContainer = usePortalContainer(container);
  const { anchorRef, scope } = useDensityScope(open);
  // 見出しの分の間は、見えている題か説明があるときだけ空ける（見えない題は場所を取らない）
  const heading = (title != null && !hideTitle) || description != null;
  // passive は、裏を止めないが外を押しても（フォーカスが外れても）閉じない
  const passive = modal === 'passive';
  const { className: popupClassName, ref: userPopupRef, ...restPopupProps } = popupProps ?? {};
  const {
    className: positionerClassName,
    ref: userPositionerRef,
    ...restPositionerProps
  } = positionerProps ?? {};
  const popupRef = useMergedRefs<HTMLDivElement>(userPopupRef);
  const positionerRef = useMergedRefs<HTMLDivElement>(userPositionerRef);
  return (
    <BasePopover.Root
      open={open}
      onOpenChange={(next, details) => {
        // Esc で閉じない設定・外を押しても閉じない設定のときは、閉じる合図を取り消す
        if (!next && !closeOnEscape && ESCAPE_REASONS.has(details.reason)) {
          details.cancel();
          return;
        }
        if (!next && (!dismissible || passive) && DISMISS_REASONS.has(details.reason)) {
          details.cancel();
          return;
        }
        changeOpen(next);
      }}
      onOpenChangeComplete={onOpenChangeComplete}
      modal={passive ? false : modal}
    >
      <BasePopover.Trigger ref={anchorRef} render={trigger} />
      <OverlayCloseContext value={() => changeOpen(false)}>
        <BasePopover.Portal className={SCOPE_CLASS} container={portalContainer}>
          <BasePopover.Positioner
            side={side}
            align={align}
            sideOffset={() => readTokenLength('--popover-offset')}
            collisionPadding={8}
            data-density={scope.density}
            {...restPositionerProps}
            ref={positionerRef}
            className={['z-10 outline-none', scope.large && 'coarse-large', positionerClassName]
              .filter(Boolean)
              .join(' ')}
          >
            <BasePopover.Popup
              data-slot="popover"
              initialFocus={focusTargetRef(autoFocus)}
              finalFocus={focusTargetRef(returnFocus)}
              {...restPopupProps}
              ref={popupRef}
              className={[
                popupSurfaceClass,
                popupMotionClass,
                'relative shadow-overlay max-w-[min(var(--popover-max-width),var(--available-width))] p-(--popover-padding) text-(length:--text-control) leading-(--leading-control)',
                overlayTitleLeading,
                cn(className, popupClassName),
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {/* 本体を指す矢印（showArrow）。面と同じ白に、外側の2辺だけ輪郭を引いた四角を 45 度回す */}
              {showArrow && (
                <BasePopover.Arrow
                  data-slot="popover-arrow"
                  className={[
                    'size-3 rotate-45 border-surface-line bg-surface',
                    'data-[side=bottom]:-top-1.5 data-[side=bottom]:border-t-(length:--border-width-thin) data-[side=bottom]:border-l-(length:--border-width-thin)',
                    'data-[side=top]:-bottom-1.5 data-[side=top]:border-r-(length:--border-width-thin) data-[side=top]:border-b-(length:--border-width-thin)',
                    'data-[side=left]:-right-1.5 data-[side=left]:border-t-(length:--border-width-thin) data-[side=left]:border-r-(length:--border-width-thin)',
                    'data-[side=right]:-left-1.5 data-[side=right]:border-b-(length:--border-width-thin) data-[side=right]:border-l-(length:--border-width-thin)',
                  ].join(' ')}
                />
              )}
              {/* 題は必ず出す（開いた面の読み上げの名前）。hideTitle では、読み上げにだけ届ける */}
              <BasePopover.Title className={hideTitle ? 'sr-only' : sheetTitleClass}>
                {title}
              </BasePopover.Title>
              {description != null && (
                <BasePopover.Description
                  className={[sheetDescriptionClass, title != null && 'mt-0.5']
                    .filter(Boolean)
                    .join(' ')}
                >
                  {description}
                </BasePopover.Description>
              )}
              {children != null && <div className={heading ? 'mt-3' : undefined}>{children}</div>}
              {/* 裏を止めるときは、読み上げで面から出られるよう閉じる手段を面の中に置く（Base UI は、これがないと焦点を閉じ込めない） */}
              {modal === true && (
                <BasePopover.Close data-slot="popover-close" className="sr-only">
                  {closeName}
                </BasePopover.Close>
              )}
            </BasePopover.Popup>
          </BasePopover.Positioner>
        </BasePopover.Portal>
      </OverlayCloseContext>
    </BasePopover.Root>
  );
}
