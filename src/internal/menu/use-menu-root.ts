'use client';

import type { ScrollAreaScrollbar } from '../scroll-area-styles';
import { type ReactNode, useState } from 'react';

import { useDensityScope } from '../density-scope';
import { DISMISS_REASONS, ESCAPE_REASONS } from '../overlay/close-reasons';
import { type OverlayPresentation, useSheetPresentation } from '../sheet/use-narrow-screen';
import { usePortalContainer } from '../ui-config';
import type {
  MenuColor,
  MenuContextValue,
  MenuGroupLabelStyle,
  MenuMarkPlacement,
  MenuRadioMark,
  MenuSubmenuSheet,
} from './menu-context';
import { menuChildrenHaveMarks } from './menu-marks';

export interface MenuRootOptions {
  children?: ReactNode;
  open?: boolean;
  defaultOpen: boolean;
  onOpenChange?: (open: boolean) => void;
  onOpenChangeComplete?: (open: boolean) => void;
  dismissible: boolean;
  closeOnEscape: boolean;
  presentation?: OverlayPresentation;
  portalContainer?: HTMLElement | null;
  color: MenuColor;
  markPlacement: MenuMarkPlacement;
  radioMark: MenuRadioMark;
  alignMarks: boolean;
  groupLabelStyle: MenuGroupLabelStyle;
  submenuSheet: MenuSubmenuSheet;
  closeOnSwipe: boolean;
  popoverScrollbar: ScrollAreaScrollbar;
  closeName?: string;
  backName?: string;
}

// Menu と ContextMenu の根（Base UI の Root）が共有する、開閉と中に配る値
//   開閉はここで持つ（シートの × で閉じるため。出し方が開いたまま切り替わっても閉じないようにするため）
//   Esc で閉じない設定・外を押しても閉じない設定のときは、閉じる合図を取り消す
//   閉じ終えたら面を作り直す（slide のシートで開いていた入れ子を、次に開くときに持ち越さない）。generation を面の key に渡す
export function useMenuRoot<T extends HTMLElement = HTMLButtonElement>({
  children,
  open: openProp,
  defaultOpen,
  onOpenChange,
  onOpenChangeComplete,
  dismissible,
  closeOnEscape,
  presentation,
  portalContainer: container,
  color,
  markPlacement,
  radioMark,
  alignMarks,
  groupLabelStyle,
  submenuSheet,
  closeOnSwipe,
  popoverScrollbar,
  closeName,
  backName,
}: MenuRootOptions) {
  const [openState, setOpenState] = useState(defaultOpen);
  const open = openProp ?? openState;
  const changeOpen = (next: boolean) => {
    setOpenState(next);
    onOpenChange?.(next);
  };
  const close = () => changeOpen(false);
  const sheet = useSheetPresentation(presentation);
  const portalContainer = usePortalContainer(container);
  const { anchorRef, scope } = useDensityScope<T>(open);
  const [generation, setGeneration] = useState(0);
  const context: MenuContextValue = {
    sheet,
    container: portalContainer,
    densityScope: scope,
    color,
    markPlacement,
    radioMark,
    reserveMarkSpace: alignMarks && menuChildrenHaveMarks(children),
    groupLabelStyle,
    submenuSheet,
    closeOnSwipe,
    popoverScrollbar,
    closeName,
    backName,
    closeAll: close,
  };
  return {
    /** Base UI の Root に渡す */
    rootProps: {
      open,
      onOpenChange: (next: boolean, details: { reason: string; cancel: () => void }) => {
        if (!next && !closeOnEscape && ESCAPE_REASONS.has(details.reason)) {
          details.cancel();
          return;
        }
        if (!next && !dismissible && DISMISS_REASONS.has(details.reason)) {
          details.cancel();
          return;
        }
        changeOpen(next);
      },
      onOpenChangeComplete: (next: boolean) => {
        if (!next) setGeneration((current) => current + 1);
        onOpenChangeComplete?.(next);
      },
    },
    /** 開くボタン（範囲）に付ける。開いているあいだ、ここの密度を面へ写す */
    anchorRef,
    context,
    generation,
    close,
  };
}
