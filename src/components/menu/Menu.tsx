'use client';

import type { ScrollAreaScrollbar } from '../../internal/scroll-area-styles';
import { Menu as BaseMenu } from '@base-ui/react/menu';
import type { ReactElement, ReactNode } from 'react';

import {
  type MenuAlign,
  type MenuColor,
  MenuContext,
  type MenuGroupLabelStyle,
  type MenuMarkPlacement,
  type MenuRadioMark,
  type MenuSide,
  type MenuSubmenuSheet,
} from '../../internal/menu/menu-context';
import { MenuSurface } from '../../internal/menu/MenuSurface';
import { useMenuRoot } from '../../internal/menu/use-menu-root';
import type {
  OverlayFocusTarget,
  PopupProps,
  PositionerProps,
} from '../../internal/overlay/overlay-props';
import type { OverlayPresentation } from '../../internal/sheet/use-narrow-screen';

export type {
  MenuAlign,
  MenuColor,
  MenuGroupLabelStyle,
  MenuMarkPlacement,
  MenuRadioMark,
  MenuSide,
  MenuSubmenuSheet,
} from '../../internal/menu/menu-context';

export interface MenuProps {
  /** 開くボタン。Button などの要素を渡す。押すと開き、もう一度押すと閉じる */
  trigger: ReactElement;
  /**
   * 押せないか。押しても開かず、押せないことが読まれます
   * @default false
   */
  disabled?: boolean;
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
   * 開いているあいだ、ほかの部分の操作とページのスクロールを止めるか
   * @default true
   */
  modal?: boolean;
  /**
   * 本体に hover したときにも開くか。押して開くこともできます。サイドバーを畳んだ列の、入れ子の行き先を出すときなどに使います
   * @default false
   */
  openOnHover?: boolean;
  /**
   * hover してから開くまで（ms）。openOnHover のときだけ効きます
   * @default 100
   */
  openDelay?: number;
  /**
   * 離れてから閉じるまで（ms）。openOnHover のときだけ効きます。斜めに動いて別の要素をかすめても、すぐには閉じません
   * @default 0
   */
  closeDelay?: number;
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
  /**
   * 入れ子の一覧で Esc を押したとき、親の一覧まで閉じるか。false では入れ子だけを閉じます
   * @default true
   */
  closeParentOnEsc?: boolean;
  /** 閉じたあとに焦点を戻す要素。要素そのものか、要素の ref を渡します。書かないときは開いたボタン */
  returnFocus?: OverlayFocusTarget;
  /**
   * 出し方。auto は指で操作していて画面が狭いときだけ、画面の下から出すシートにします。popover はいつも本体のそばに浮かべ、sheet はいつもシートにします
   * 書かないときは ThemeProvider の presentation に従います
   * @default 'auto'
   */
  presentation?: OverlayPresentation;
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
   * 浮かべたときに、一覧が長くてスクロールするときのつまみの出し方。scroll は一覧に載せたときとスクロール中だけ、
   * always はいつも出します（ScrollArea の scrollbar と同じ）。シートでは、スクロール中だけ出します
   * @default 'scroll'
   */
  popoverScrollbar?: ScrollAreaScrollbar;
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
   * 描く場所。トリガーの祖先に付いた data-density と coarse-large は、描く場所がその外でも写します。
   * まとめて決めるときは ThemeProvider の portalContainer を使います
   * @default document.body
   */
  portalContainer?: HTMLElement | null;
  /** 面（Popup）に足す props（id・data-*・aria-*・ref など） */
  popupProps?: PopupProps;
  /** 位置を決める要素（Positioner）に足す props（anchor・collisionAvoidance・sideOffset など） */
  positionerProps?: PositionerProps;
  /** 面（Popup）に足すクラス。幅を変えるときは w-*・min-w-* を渡す */
  className?: string;
}

/**
 * 押して開く、操作の一覧。項目を押すと実行して閉じます。
 * 別の場所へ移る項目は MenuLinkItem、その場で切り替える項目は MenuCheckboxItem・MenuRadioItem にします
 */
export function Menu({
  trigger,
  children,
  title,
  disabled,
  side = 'bottom',
  align = 'start',
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  onOpenChangeComplete,
  // 既定は true（Base UI の既定）。値を置かずに渡すのは、Menubar の中では Base UI が帯の modal を使い、メニューごとの modal を受けないため（渡すと警告が出る）
  modal,
  // 既定は false。値を置かずに渡すのは、Menubar の中で Base UI が「隣が開いていれば hover で開く」を決めるため（undefined のときだけ働く）
  openOnHover,
  openDelay = 100,
  closeDelay = 0,
  dismissible = true,
  closeOnEscape = true,
  closeParentOnEsc = true,
  returnFocus,
  presentation,
  color = 'neutral',
  markPlacement = 'start',
  radioMark = 'radio',
  alignMarks = true,
  groupLabelStyle = 'label',
  submenuSheet = 'fixed',
  closeOnSwipe = false,
  popoverScrollbar = 'scroll',
  closeName,
  backName,
  portalContainer: container,
  popupProps,
  positionerProps,
  className,
}: MenuProps) {
  const { rootProps, anchorRef, context, generation, close } = useMenuRoot({
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
  });
  return (
    <BaseMenu.Root
      {...rootProps}
      modal={modal}
      disabled={disabled}
      closeParentOnEsc={closeParentOnEsc}
    >
      <BaseMenu.Trigger
        ref={anchorRef}
        render={trigger}
        openOnHover={openOnHover}
        delay={openDelay}
        closeDelay={closeDelay}
      />
      <MenuContext value={context}>
        <MenuSurface
          key={generation}
          title={title}
          side={side}
          align={align}
          onClose={close}
          returnFocus={returnFocus}
          popupProps={popupProps}
          positionerProps={positionerProps}
          className={className}
        >
          {children}
        </MenuSurface>
      </MenuContext>
    </BaseMenu.Root>
  );
}
