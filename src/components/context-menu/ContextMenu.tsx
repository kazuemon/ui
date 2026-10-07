'use client';

import { ContextMenu as BaseContextMenu } from '@base-ui/react/context-menu';
import { type ReactElement, type ReactNode, useState } from 'react';

import { useDensityScope } from '../../internal/density-scope';
import { DISMISS_REASONS, ESCAPE_REASONS } from '../../internal/overlay/close-reasons';
import type {
  OverlayFocusTarget,
  PopupProps,
  PositionerProps,
} from '../../internal/overlay/overlay-props';
import type { OverlayPresentation } from '../../internal/sheet/use-narrow-screen';
import { useSheetPresentation } from '../../internal/sheet/use-narrow-screen';
import { usePortalContainer } from '../../internal/ui-config';
import {
  type MenuColor,
  MenuContext,
  type MenuGroupLabelStyle,
  type MenuMarkPlacement,
  type MenuRadioMark,
  type MenuSubmenuSheet,
} from '../menu/menu-context';
import { MenuSurface } from '../menu/Menu';
import { menuChildrenHaveMarks } from '../menu/MenuItem';

// 印の色（Menu と同じ）は MenuSurface が context の color から作る
export interface ContextMenuProps {
  /**
   * 右クリック・長押しを受ける範囲。要素（`div` など）を渡し、その中身は要素の子に書きます。
   * 範囲そのものは、自分で大きさと見た目を決めます。部品を渡すときは、受け取った props（className を含む）を DOM の要素へ渡し、ref も受けます
   */
  trigger: ReactElement;
  /** 項目（MenuItem・MenuLinkItem・MenuCheckboxItem・MenuRadioGroup・MenuGroup・MenuSeparator・MenuSubmenu） */
  children?: ReactNode;
  /**
   * 開かない。範囲を右クリックしても、ブラウザの一覧が出ます
   * @default false
   */
  disabled?: boolean;
  /**
   * 題。シートで出すときに見出しに出し、読み上げでは開いた一覧の名前になる。浮かべるときは出さない
   * 書かないときは、見出しには閉じる × だけを置く
   */
  title?: ReactNode;
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
   * 外を押したときに閉じるか。false にすると、フォーカスが一覧の外へ出たときにも閉じません
   * @default true
   */
  dismissible?: boolean;
  /**
   * Esc（Android の戻る操作を含む）で閉じるか
   * @default true
   */
  closeOnEscape?: boolean;
  /** 閉じたあとに焦点を戻す要素。要素そのものか、要素の ref を渡します。書かないときは範囲 */
  returnFocus?: OverlayFocusTarget;
  /**
   * 出し方。auto は指で操作していて画面が狭いときだけ、画面の下から出すシートにします。popover はいつもポインタの位置に浮かべ、sheet はいつもシートにします
   * 書かないときは ThemeProvider の presentation に従います
   * @default 'auto'
   */
  presentation?: OverlayPresentation;
  /**
   * チェックとラジオの印の色（Menu と同じ）
   * @default 'neutral'
   */
  color?: MenuColor;
  /**
   * チェックとラジオの印の場所（Menu と同じ）
   * @default 'start'
   */
  markPlacement?: MenuMarkPlacement;
  /**
   * 1 つだけを選ぶ項目の印（Menu と同じ）
   * @default 'radio'
   */
  radioMark?: MenuRadioMark;
  /**
   * 印を持たない項目にも印の場所を空けて、文字の左をそろえるか（Menu と同じ）
   * @default true
   */
  alignMarks?: boolean;
  /**
   * グループの見出しの文字（Menu と同じ）
   * @default 'label'
   */
  groupLabelStyle?: MenuGroupLabelStyle;
  /**
   * シートで入れ子のメニューを開く形（Menu と同じ）
   * @default 'fixed'
   */
  submenuSheet?: MenuSubmenuSheet;
  /**
   * シートを、はじく・下へ引いて閉じられるか（Menu と同じ）
   * @default false
   */
  closeOnSwipe?: boolean;
  /**
   * シートの閉じる × の読み上げの名前
   * @default '閉じる'
   */
  closeName?: string;
  /**
   * 入れ子のシートで、親のメニューへ戻るボタンの読み上げの名前
   * @default '戻る'
   */
  backName?: string;
  /**
   * 描く場所
   * @default document.body
   */
  portalContainer?: HTMLElement | null;
  /**
   * 開いているあいだ、範囲に入力欄と同じ淡い面を敷いて、どの範囲に対する操作かを示します。しないときは範囲を変えません
   * @default false
   */
  highlightArea?: boolean;
  /**
   * 一覧の左上の角を、ポインタから右へずらす長さ（px）。負の値は左へ
   * @default 0
   */
  offsetX?: number;
  /**
   * 一覧の左上の角を、ポインタから下へずらす長さ（px）。負の値は上へ
   * @default 0
   */
  offsetY?: number;
  /** 面（Popup）に足す props（id・data-*・aria-*・ref など） */
  popupProps?: PopupProps;
  /** 位置を決める要素（Positioner）に足す props。anchor を渡すと、ポインタの位置ではなくその要素に出します */
  positionerProps?: PositionerProps;
  /** 面（Popup）に足すクラス。幅を変えるときは w-*・min-w-* を渡す */
  className?: string;
}

/**
 * 範囲（trigger）を右クリック・長押しすると、ポインタの位置に開く、操作の一覧。
 * 中の項目は Menu と同じです（MenuItem・MenuCheckboxItem・MenuSubmenu など）。
 * 右クリックだけが操作の入口にならないよう、同じ操作を画面のどこかにも置きます
 */
export function ContextMenu({
  trigger,
  children,
  disabled,
  title,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  onOpenChangeComplete,
  dismissible = true,
  closeOnEscape = true,
  returnFocus,
  presentation,
  color = 'neutral',
  markPlacement = 'start',
  radioMark = 'radio',
  alignMarks = true,
  groupLabelStyle = 'label',
  submenuSheet = 'fixed',
  closeOnSwipe = false,
  closeName,
  backName,
  highlightArea = false,
  offsetX = 0,
  offsetY = 0,
  portalContainer: container,
  popupProps,
  positionerProps,
  className,
}: ContextMenuProps) {
  const [openState, setOpenState] = useState(defaultOpen);
  const open = openProp ?? openState;
  const changeOpen = (next: boolean) => {
    setOpenState(next);
    onOpenChange?.(next);
  };
  const sheet = useSheetPresentation(presentation);
  const portalContainer = usePortalContainer(container);
  const { anchorRef, scope } = useDensityScope<HTMLDivElement>(open);
  const [generation, setGeneration] = useState(0);
  const reserveMarkSpace = alignMarks && menuChildrenHaveMarks(children);
  return (
    <BaseContextMenu.Root
      open={open}
      onOpenChange={(next, details) => {
        if (!next && !closeOnEscape && ESCAPE_REASONS.has(details.reason)) {
          details.cancel();
          return;
        }
        if (!next && !dismissible && DISMISS_REASONS.has(details.reason)) {
          details.cancel();
          return;
        }
        changeOpen(next);
      }}
      onOpenChangeComplete={(next) => {
        if (!next) setGeneration((current) => current + 1);
        onOpenChangeComplete?.(next);
      }}
      disabled={disabled}
    >
      <BaseContextMenu.Trigger
        ref={anchorRef}
        render={trigger}
        className={highlightArea && open ? 'bg-field' : undefined}
      />
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
          closeName,
          backName,
          closeAll: () => changeOpen(false),
        }}
      >
        <MenuSurface
          key={generation}
          title={title}
          offset={() => ({ side: offsetY, align: offsetX })}
          onClose={() => changeOpen(false)}
          returnFocus={returnFocus}
          popupProps={popupProps}
          positionerProps={positionerProps}
          className={className}
        >
          {children}
        </MenuSurface>
      </MenuContext>
    </BaseContextMenu.Root>
  );
}
