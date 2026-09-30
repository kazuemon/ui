'use client';

import { Popover as BasePopover } from '@base-ui/react/popover';
import {
  cloneElement,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
  type Ref,
  useState,
} from 'react';

import { Drawer } from '../drawer/Drawer';
import { type DensityScope, readDensityScope } from '../../internal/density-scope';
import { popupSideOffset } from '../../internal/listbox/listbox-measure';
import type { PopupProps } from '../../internal/overlay/overlay-props';
import { popupMotionClass, popupSurfaceClass } from '../../internal/overlay/popup-styles';
import {
  type OverlayPresentation,
  useSheetPresentation,
} from '../../internal/sheet/use-narrow-screen';
import { cn } from '../../internal/tv';
import { usePortalContainer } from '../../internal/ui-config';
import { useMergedRefs } from '../../internal/use-merged-refs';

// 欄（またはボタン）の中の「開く口」から、選ぶ面（カレンダーなど）を開く。DatePicker が使う
// TimePicker・DateRangePicker も同じ形で作れるよう、中身（panel）と本体（children）を受け取るだけにしている
//
// 開く口は欄の suffix（FieldAddonButton）に置くが、面を置く位置の基準は欄の外枠（data-slot="control"）
//   Select・Combobox の一覧と同じく、欄の左端にそろえて下に出す（間は popupSideOffset。エラーの離した線の外）
// 浮かべる形は Popover と同じ面（白・細い輪郭・--shadow-overlay）。ただし Popover 部品は使わず、Base UI の Root で欄ごと包む
//   面（Portal）は欄の外に置く。Portal も裏を止めない面では見えない span（フォーカスの番人）を置き場に足すため、
//   欄の中に置くと開く口が欄の最後の子でなくなる（suffix の角と枠線は :last-child で決めている）
// 指で操作していて画面が狭いときは、画面の下から出すシート（Drawer）にする — 原則16。Popover と同じ判定
//   シートは開く口を持たない形（開閉を外から決める）で置き、開く口は押すと開くだけのボタンにする

/** 浮かべる面の見た目（Popover と同じ面）。比較のストーリーで、面をその場に描くときにも使う */
export const pickerPopupClass = cn(popupSurfaceClass, 'shadow-overlay');

/** 開く口に付ける props。浮かべる形では Base UI の Trigger が、シートでは部品が付ける */
type TriggerElement = ReactElement<ComponentProps<'button'> & { ref?: Ref<HTMLButtonElement> }>;

export interface PickerOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 面の題。読み上げの名前。浮かべる形では画面に出さず、シートでは見出しに出す */
  title: ReactNode;
  presentation?: OverlayPresentation;
  portalContainer?: HTMLElement | null;
  /** 面（浮かべる形の Popup・シートの面）に足す props。余白は className で渡す */
  popupProps?: PopupProps;
  /** 面の中身 */
  panel: ReactNode;
  /** 読み上げだけの閉じるボタンの名前 */
  closeName: string;
  /** 本体を描く。renderTrigger に開く口の要素を渡すと、開く口として働く要素が返る */
  children: (renderTrigger: (element: TriggerElement) => ReactElement) => ReactNode;
}

export function PickerOverlay({
  open,
  onOpenChange,
  title,
  presentation,
  portalContainer: container,
  popupProps,
  panel,
  closeName,
  children,
}: PickerOverlayProps) {
  const sheet = useSheetPresentation(presentation);
  const portalContainer = usePortalContainer(container);
  // 開く口。面を置く基準（欄の外枠）と、閉じたあとにフォーカスを戻す先を、ここから読む
  const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(null);
  const setTrigger = setTriggerElement;
  // 開く口の祖先に付いた密度（data-density・coarse-large）を、開くたびに読み、面に写す（Select・Popover と同じ）
  const scope: DensityScope = open ? readDensityScope(triggerElement) : { large: false };
  const anchor = triggerElement?.closest<HTMLElement>('[data-slot="control"]') ?? triggerElement;
  const { className: popupClassName, ref: userPopupRef, ...restPopupProps } = popupProps ?? {};
  const popupRef = useMergedRefs<HTMLDivElement>(userPopupRef);

  if (sheet) {
    const renderTrigger = (element: TriggerElement) =>
      cloneElement(element, {
        ref: setTrigger,
        'aria-haspopup': 'dialog',
        'aria-expanded': open,
        onClick: () => onOpenChange(!open),
      });
    return (
      <>
        {children(renderTrigger)}
        <Drawer
          title={title}
          open={open}
          onOpenChange={onOpenChange}
          returnFocus={triggerElement ?? undefined}
          closeName={closeName}
          portalContainer={container}
          popupProps={popupProps}
          detent="full"
        >
          {panel}
        </Drawer>
      </>
    );
  }

  const renderTrigger = (element: TriggerElement) => (
    <BasePopover.Trigger ref={setTrigger} render={element} />
  );
  return (
    <BasePopover.Root
      open={open}
      onOpenChange={(next) => onOpenChange(next)}
      // フォーカスを面の中に閉じ込める（WAI-ARIA の日付選びのダイアログと同じ）。ページのスクロールと外の押下は止めない
      // 閉じ込めないと、Base UI が開く口の前後にフォーカスの番人を置き、開く口が欄の最後の子でなくなる
      modal="trap-focus"
    >
      {children(renderTrigger)}
      <BasePopover.Portal container={portalContainer}>
        <BasePopover.Positioner
          anchor={anchor}
          side="bottom"
          align="start"
          sideOffset={() => popupSideOffset(anchor)}
          collisionPadding={8}
          // 画面の端に当たっても、欄の左端にそろえる向きは変えず、はみ出す分だけずらす
          collisionAvoidance={{ side: 'flip', align: 'shift' }}
          data-density={scope.density}
          className={cn('z-10 outline-none', scope.large && 'coarse-large')}
        >
          <BasePopover.Popup
            data-slot="picker-popup"
            // フォーカスは中身が決める（カレンダーは選んだ日か今日へ移す）。Base UI は動かさない
            initialFocus={false}
            {...restPopupProps}
            ref={popupRef}
            className={cn(
              pickerPopupClass,
              popupMotionClass,
              'max-w-(--available-width)',
              popupClassName
            )}
          >
            <BasePopover.Title className="sr-only">{title}</BasePopover.Title>
            {panel}
            {/* 読み上げで面から出られるよう、閉じる手段を面の中に置く（Base UI は、これがないと焦点を閉じ込めない） */}
            <BasePopover.Close data-slot="picker-close" className="sr-only">
              {closeName}
            </BasePopover.Close>
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  );
}
