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

import { Drawer } from '../../components/drawer/Drawer';
import { FieldAddonButton } from '../../components/field-addon/FieldAddon';
import { type DensityScope, readDensityScope } from '../density-scope';
import { useFieldState } from '../field/Field';
import { popupSideOffset } from '../listbox/listbox-measure';
import type { PopupProps, PositionerProps } from '../overlay/overlay-props';
import { popupMotionClass, popupSurfaceClass } from '../overlay/popup-styles';
import { type OverlayPresentation, useSheetPresentation } from '../sheet/use-narrow-screen';
import { cn } from '../tv';
import { usePortalContainer } from '../ui-config';
import { useMergedRefs } from '../use-merged-refs';

// 欄の右端のボタン（開く口）から、選ぶ面を開く。DatePicker（カレンダー）と TimePicker（時刻の一覧）が使う
//   中身（panel）と本体（children）を受け取るだけにし、欄・ボタン・面の形はここでそろえる
//
// 開く口は欄の suffix（PickerTriggerButton）に置くが、面を置く位置の基準は欄の外枠（data-slot="control"）
//   Select・Combobox の一覧と同じく、欄の下に出す（間は popupSideOffset。エラーの離した線の外）。そろえる辺は部品が決める（align）
// 浮かべる形は Popover と同じ面（白・細い輪郭・--shadow-overlay）。Popover 部品は使わず、Base UI の Root で欄ごと包む
//   面（Portal）は欄の外に置く。Portal は裏を止めない面で見えない span（フォーカスの番人）を置き場に足すため、欄の中に置かない
//   開く口の後ろに Base UI が置くフォーカスの番人は、FieldAddon の側で「最後の子」から外して数える（右端の角と線を保つ）
// 開いているあいだ、欄はフォーカス中と同じ見た目を保つ（pickerOpenLook。Select の開いているあいだと同じ）
// 指で操作していて画面が狭いときは、画面の下から出すシート（Drawer）にする — 原則16。Popover と同じ判定
//   シートは開く口を持たない形（開閉を外から決める）で置き、開く口は押すと開くだけのボタンにする。閉じたら開く口へフォーカスを戻す

/**
 * 開いているあいだ、欄をフォーカス中と同じ見た目にするクラス。欄を包む要素（Field の外側）に付ける
 *   開く口（suffix のボタン）が aria-expanded を持つ欄の外枠と、開く口そのものが欄の外枠のとき（DatePicker の variant="button"）
 */
export const pickerOpenLook = [
  '[&_[data-slot=control]:has([aria-expanded=true])]:border-[color:var(--control-focus-line,var(--color-focus))]',
  '[&_[data-slot=control]:has([aria-expanded=true])]:[--control-bg:var(--color-field-focus)]',
  '[&_[data-slot=control][aria-expanded=true]]:border-[color:var(--control-focus-line,var(--color-focus))]',
  '[&_[data-slot=control][aria-expanded=true]]:[--control-bg:var(--color-field-focus)]',
];

/**
 * 欄の右端の、面を開くボタン。欄を止めているあいだ（待っている・Form の送信中）は、値を変える操作なので一緒に止める（ADR-0168）。
 * 押せない欄では FieldAddonButton が欄の disabled を受け継ぐ
 */
export function PickerTriggerButton({
  disabled,
  ...props
}: ComponentProps<typeof FieldAddonButton>) {
  const field = useFieldState();
  return <FieldAddonButton {...props} disabled={disabled || field?.blocking || undefined} />;
}

/** 開く口に付ける props。浮かべる形では Base UI の Trigger が、シートでは部品が付ける */
type TriggerElement = ReactElement<ComponentProps<'button'> & { ref?: Ref<HTMLButtonElement> }>;

export interface PickerOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 面の題。読み上げの名前。浮かべる形では画面に出さず、シートでは見出しに出す */
  title: ReactNode;
  presentation?: OverlayPresentation;
  portalContainer?: HTMLElement | null;
  /** 面（浮かべる形の Popup・シートの面）に足す props。余白・幅は className で渡す */
  popupProps?: PopupProps;
  /** 位置を決める要素（Positioner）に足す props。位置の基準は、書かないときは欄の外枠 */
  positionerProps?: PositionerProps;
  /**
   * 欄のどちらの端にそろえるか。画面の端に当たっても向きは変えず、はみ出す分だけずらす
   * @default 'start'
   */
  align?: 'start' | 'end';
  /**
   * フォーカスを面の中に閉じ込めるか（WAI-ARIA の日付選びのダイアログと同じ）。ページのスクロールと外の押下は止めない。
   * 閉じ込めるときは、読み上げで面から出られるよう、見えない閉じるボタンを面の中に置く
   * @default false
   */
  trapFocus?: boolean;
  /**
   * 開いたときに、Base UI が面の中の最初のものへフォーカスを移すか。false では中身が自分で移す（カレンダーは選んだ日か今日へ）
   * @default false
   */
  moveFocus?: boolean;
  /** 面の中身 */
  panel: ReactNode;
  /** 読み上げだけの閉じるボタンの名前（シートの × と、trapFocus のときに面の中へ置く閉じる手段） */
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
  positionerProps,
  align = 'start',
  trapFocus = false,
  moveFocus = false,
  panel,
  closeName,
  children,
}: PickerOverlayProps) {
  const sheet = useSheetPresentation(presentation);
  const portalContainer = usePortalContainer(container);
  // 開く口。面を置く基準（欄の外枠）と、閉じたあとにフォーカスを戻す先を、ここから読む
  const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(null);
  // 開く口の祖先に付いた密度（data-density・coarse-large）を、開くたびに読み、面に写す（Select・Popover と同じ）
  const scope: DensityScope = open ? readDensityScope(triggerElement) : { large: false };
  const anchor = triggerElement?.closest<HTMLElement>('[data-slot="control"]') ?? triggerElement;
  const { className: popupClassName, ref: userPopupRef, ...restPopupProps } = popupProps ?? {};
  const {
    className: positionerClassName,
    ref: userPositionerRef,
    ...restPositionerProps
  } = positionerProps ?? {};
  const popupRef = useMergedRefs<HTMLDivElement>(userPopupRef);
  const positionerRef = useMergedRefs<HTMLDivElement>(userPositionerRef);

  if (sheet) {
    const renderTrigger = (element: TriggerElement) =>
      cloneElement(element, {
        ref: setTriggerElement,
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
    <BasePopover.Trigger ref={setTriggerElement} render={element} />
  );
  return (
    <BasePopover.Root
      open={open}
      onOpenChange={(next) => onOpenChange(next)}
      modal={trapFocus ? 'trap-focus' : false}
    >
      {children(renderTrigger)}
      <BasePopover.Portal container={portalContainer}>
        <BasePopover.Positioner
          anchor={anchor}
          side="bottom"
          align={align}
          sideOffset={() => popupSideOffset(anchor)}
          collisionPadding={8}
          // 画面の端に当たっても、欄の端にそろえる向きは変えず、はみ出す分だけずらす
          collisionAvoidance={{ side: 'flip', align: 'shift' }}
          data-density={scope.density}
          {...restPositionerProps}
          ref={positionerRef}
          className={cn('z-10 outline-none', scope.large && 'coarse-large', positionerClassName)}
        >
          <BasePopover.Popup
            data-slot="picker-popup"
            initialFocus={moveFocus ? undefined : false}
            {...restPopupProps}
            ref={popupRef}
            className={cn(
              popupSurfaceClass,
              'shadow-overlay',
              popupMotionClass,
              'max-w-(--available-width)',
              popupClassName
            )}
          >
            <BasePopover.Title className="sr-only">{title}</BasePopover.Title>
            {panel}
            {/* 読み上げで面から出られるよう、閉じる手段を面の中に置く（Base UI は、これがないと焦点を閉じ込めない） */}
            {trapFocus && (
              <BasePopover.Close data-slot="picker-close" className="sr-only">
                {closeName}
              </BasePopover.Close>
            )}
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  );
}
