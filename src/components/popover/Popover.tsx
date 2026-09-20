'use client';

import { Popover as BasePopover } from '@base-ui/react/popover';
import { type ReactElement, type ReactNode, useState } from 'react';

import { useDensityScope } from '../../internal/density-scope';
import { OverlayCloseContext } from '../../internal/overlay/overlay-close-context';
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
import { Drawer } from '../drawer/Drawer';
import { VisuallyHidden } from '../visually-hidden/VisuallyHidden';
import { usePortalContainer } from '../../internal/ui-config';

export type PopoverPresentation = OverlayPresentation;
export type PopoverSide = 'top' | 'bottom' | 'left' | 'right';
export type PopoverAlign = 'start' | 'center' | 'end';

export interface PopoverProps {
  /** 開くボタン。Button などの要素を渡す。押すと開き、もう一度押すと閉じる */
  trigger: ReactElement;
  /**
   * 題。読み上げでは、開いた面の名前になる。シートでは見出しに出す
   * 名前のない面は、読み上げで何の面か分からないので必ず渡す。画面に出したくないときは `titleHidden` を付ける
   */
  title: ReactNode;
  /**
   * 題を画面に出さず、読み上げにだけ届けるか。文だけを見せる面（「送料について」など）で使う。
   * 浮かべる形でもシートでも同じで、読み上げの名前は題のままです
   * @default false
   */
  titleHidden?: boolean;
  /** 題の下の説明。読み上げでは、開いた面の説明になる */
  description?: ReactNode;
  /** 中身 */
  children?: ReactNode;
  /**
   * 本体のどちら側に出すか。画面の端に当たるときは反対側に出します
   * @default 'bottom'
   */
  side?: PopoverSide;
  /**
   * 本体を指す小さな矢印を付けるか。どこから開いたかをはっきりさせたいときに付けます（シートでは付けません）
   * @default false
   */
  arrow?: boolean;
  /**
   * 本体に対して、どこにそろえるか
   * @default 'center'
   */
  align?: PopoverAlign;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * 出し方。auto は指で操作していて画面が狭いときだけ、画面の下から出すシートにします。popover はいつも本体のそばに浮かべ、sheet はいつもシートにします
   * 書かないときは ThemeProvider の presentation に従います
   * @default 'auto'
   */
  presentation?: PopoverPresentation;
  /**
   * シートの閉じる × の読み上げの名前
   * @default '閉じる'
   */
  closeLabel?: string;
  /**
   * 描く場所。トリガーの祖先に付いた data-density と coarse-large は、描く場所がその外でも写します
   * @default document.body
   */
  container?: HTMLElement | null;
  /** 面（Popup）に足すクラス。幅を変えるときは w-*・max-w-* を渡す */
  className?: string;
}

/**
 * 押して開く、本体のそばに浮かぶ面。補足の説明や、小さな設定をその場で見せます。
 * ほかの操作は止めず、外を押すか Esc で閉じます
 *
 * 題（title）は必ず渡します。開いた面の読み上げの名前になります（原則15）。
 * 画面に出したくないときは titleHidden を付けます。読み上げの名前は残ります
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
    const { trigger, title, titleHidden, description, children } = props;
    return (
      <Drawer
        trigger={trigger}
        // 題を出さないときも、読み上げの名前は題のまま（見出しには見えない文字として置く）
        title={titleHidden ? <VisuallyHidden>{title}</VisuallyHidden> : title}
        description={description}
        open={open}
        onOpenChange={changeOpen}
        closeLabel={props.closeLabel}
        container={props.container}
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
function FloatingPopover({
  trigger,
  title,
  titleHidden = false,
  description,
  children,
  side = 'bottom',
  align = 'center',
  arrow = false,
  open,
  onOpenChange: changeOpen,
  container,
  className,
}: Omit<PopoverProps, 'presentation' | 'closeLabel' | 'defaultOpen' | 'open' | 'onOpenChange'> & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const portalContainer = usePortalContainer(container);
  const { anchorRef, scope } = useDensityScope(open);
  // 見出しの分の間は、見えている題か説明があるときだけ空ける（見えない題は場所を取らない）
  const heading = (title != null && !titleHidden) || description != null;
  return (
    <BasePopover.Root open={open} onOpenChange={changeOpen}>
      <BasePopover.Trigger ref={anchorRef} render={trigger} />
      <OverlayCloseContext value={() => changeOpen(false)}>
        <BasePopover.Portal container={portalContainer}>
          <BasePopover.Positioner
            side={side}
            align={align}
            sideOffset={() => readTokenLength('--popover-offset')}
            collisionPadding={8}
            data-density={scope.density}
            className={['z-10 outline-none', scope.large && 'coarse-large']
              .filter(Boolean)
              .join(' ')}
          >
            <BasePopover.Popup
              data-slot="popover"
              className={[
                popupSurfaceClass,
                popupMotionClass,
                'relative shadow-overlay max-w-[min(var(--popover-max-width),var(--available-width))] p-(--popover-padding) text-(length:--text-control) leading-(--leading-control)',
                overlayTitleLeading,
                className,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {/* 本体を指す矢印（arrow）。面と同じ白に、外側の2辺だけ輪郭を引いた四角を 45 度回す */}
              {arrow && (
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
              {/* 題は必ず出す（開いた面の読み上げの名前）。titleHidden では、読み上げにだけ届ける */}
              <BasePopover.Title className={titleHidden ? 'sr-only' : sheetTitleClass}>
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
            </BasePopover.Popup>
          </BasePopover.Positioner>
        </BasePopover.Portal>
      </OverlayCloseContext>
    </BasePopover.Root>
  );
}
