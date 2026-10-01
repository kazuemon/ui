'use client';

import { Drawer as BaseDrawer } from '@base-ui/react/drawer';
import {
  type ComponentProps,
  type ReactElement,
  type ReactNode,
  use,
  useCallback,
  useRef,
  useState,
} from 'react';

import { useDensityScope } from '../../internal/density-scope';
import { ESCAPE_REASONS } from '../../internal/overlay/close-reasons';
import { OverlayActions } from '../../internal/overlay/overlay-actions';
import { OverlayCloseContext } from '../../internal/overlay/overlay-close-context';
import type {
  OverlayFocusTarget,
  OverlayModal,
  OverlayNameProps,
  PopupProps,
} from '../../internal/overlay/overlay-props';
import { OverlayRoleContext } from '../../internal/overlay/overlay-role-context';
import {
  type OverlayActionsLayout,
  type SheetSide,
  SheetPopup,
} from '../../internal/sheet/SheetPopup';

export type { OverlayActionsLayout, SheetSide } from '../../internal/sheet/SheetPopup';

/** 下から出すときの、開いたときの高さ。half は中身が長いときに画面の半分で開き、つまみを出す。full は中身の高さ（上限まで）で開く */
export type DrawerDetent = 'half' | 'full';

/** Drawer の props から、title・accessibleName の組み合わせの決まりを外したもの */
export interface DrawerBaseProps {
  /** 題の下の説明。読み上げでは、開いた面の説明になる */
  description?: ReactNode;
  /** 面の中身。長いときはスクロールし、上下の端に続きの印を出す */
  children?: ReactNode;
  /**
   * 下の端に置く操作（ボタンの並び）。中身をスクロールしても動かない。押して閉じるボタンは OverlayClose の render に渡す。
   * 中身の Form の送信のボタンを並べるときは、actions の代わりに中身の Form の中に DrawerActions を置きます
   */
  actions?: ReactNode;
  /**
   * 下の操作の左に置く文やチェックボックス（保存の状態、注記など）。操作を縦に積むとき（stack・stack-reverse）と幅を等分するとき（fill）は、操作の上に置きます。
   * 中身に DrawerActions を置くときは、その start に渡します
   */
  actionsStart?: ReactNode;
  /** 開くボタン。Button などの要素を渡す。開閉を外から決めるときは省ける */
  trigger?: ReactElement;
  /**
   * 出す向き。bottom は画面の下から出すシート、top は画面の上から出すシート、left・right は画面の横から出すパネル。その向きへはじくと閉じる
   * @default 'bottom'
   */
  side?: SheetSide;
  /**
   * 下から出すときの、開いたときの高さ。half は中身が長いときに画面の半分で開き、つまみを出します。上へ引くと高さいっぱいに広がります
   * @default 'half'
   */
  detent?: DrawerDetent;
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
   * 開いているあいだ、ほかの部分の操作とページのスクロールを止めるか。
   * passive は、裏を止めず後ろも暗くしませんが、外を押しても閉じません（後ろを見せたまま開いたままにするとき）
   * @default true
   */
  modal?: OverlayModal;
  /**
   * 後ろの画面を押したときに閉じるか。入力の途中で閉じると困るときは false にします（Esc・×・はじく操作では閉じます）
   * modal が false のときは、フォーカスが面の外へ出たときにも閉じるので、false にするとそれも止まります
   * @default true
   */
  dismissible?: boolean;
  /**
   * 下の操作（actions）の並べ方。既定の auto は、下から出すシートでは幅いっぱいで縦に積み（最後に渡した主な操作が上）、
   * 横から出すパネルでは右に寄せます。渡した順に上から積むときは stack、横に並べるときは end（右寄せ）か fill（幅を等分）です。
   * ボタンの文言・色・数・順は actions で決めます
   * @default 'auto'
   */
  actionsLayout?: OverlayActionsLayout;
  /**
   * Esc（Android の戻る操作を含む）で閉じるか。答えるまで閉じたくないときは false にし、actions に閉じる手段を置きます
   * @default true
   */
  closeOnEscape?: boolean;
  /**
   * 出した向きへはじいて閉じられるか。false では、はじいても閉じません（上へ引いて広げることはできます）
   * つまみは「引けること」の印なので、これを false にし、上へ広げられないときは、つまみを出しません
   * @default true
   */
  closeOnSwipe?: boolean;
  /**
   * 右上の閉じる × を消すか。消すときは、actions に閉じる手段を置きます
   * @default false
   */
  hideCloseButton?: boolean;
  /**
   * 閉じる × の読み上げの名前
   * @default '閉じる'
   */
  closeName?: string;
  /** 開いた直後に焦点を当てる要素。要素そのものか、要素の ref を渡します。書かないときは面そのもの */
  autoFocus?: OverlayFocusTarget;
  /** 閉じたあとに焦点を戻す要素。要素そのものか、要素の ref を渡します。書かないときは開いたボタン */
  returnFocus?: OverlayFocusTarget;
  /**
   * 描く場所。トリガーの祖先に付いた data-density と coarse-large は、描く場所がその外でも写します。
   * まとめて決めるときは ThemeProvider の portalContainer を使います
   * @default document.body
   */
  portalContainer?: HTMLElement | null;
  /** 面（Popup）に足す props（id・data-*・aria-*・ref など） */
  popupProps?: PopupProps;
  /** 面（Popup）に足すクラス */
  className?: string;
}

/** Drawer の props。題（title）か読み上げだけの名前（accessibleName）のどちらかが要ります */
export type DrawerProps = DrawerBaseProps & OverlayNameProps;

// 中身が画面の半分より長いときの、開いたときの高さ（画面の高さに対する割合）
const HALF = 0.5;
const SNAP_POINTS = [HALF, 1];

/**
 * 画面の端から出す面。既定は画面の下から出すシートで、横から出すパネルも選べます
 */
export function Drawer({
  title,
  accessibleName,
  description,
  children,
  actions,
  actionsStart,
  trigger,
  side = 'bottom',
  detent = 'half',
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  onOpenChangeComplete,
  modal = true,
  dismissible = true,
  actionsLayout = 'auto',
  closeOnEscape = true,
  closeOnSwipe = true,
  hideCloseButton = false,
  closeName,
  autoFocus,
  returnFocus,
  portalContainer,
  popupProps,
  className,
}: DrawerProps) {
  // 読み上げの役割。AlertDialog が包んだときだけ alertdialog になる
  const role = use(OverlayRoleContext);
  // passive は、裏を止めず後ろも暗くしないが、外を押しても（フォーカスが外れても）閉じない
  const passive = modal === 'passive';
  const [openState, setOpenState] = useState(defaultOpen);
  const open = openProp ?? openState;
  const { setAnchor, scope } = useDensityScope<HTMLElement>(open);

  // 下から出すとき: 中身が画面の半分より長ければ、半分の高さで開いてつまみを出す（Select のシートと同じ決まり — adr/0037）
  // 高さは Base UI の snap points で変える。中身の高さは、開いたときと大きさが変わったときに測る
  const [long, setLong] = useState(false);
  const [snapPoint, setSnapPoint] = useState<number | string | null>(HALF);
  const observer = useRef<ResizeObserver | null>(null);
  const measure = useCallback(
    (popup: HTMLDivElement | null) => {
      observer.current?.disconnect();
      observer.current = null;
      if (!popup || side !== 'bottom' || detent !== 'half') return;
      const content = popup.querySelector<HTMLElement>('[data-slot="sheet-content"]');
      if (!content) return;
      const read = () => {
        // 引いているあいだは測らない。面の下の余白（段のずれの分）が動くので、中身の高さが変わって見える
        if (popup.hasAttribute('data-swiping')) return;
        // 画面の高さは、Base UI と同じく面を置く枠（Viewport）の高さで見る
        const screen = popup.parentElement?.offsetHeight ?? window.innerHeight;
        // 中身をすべて出したときの高さ。段のずれの分に足した面の下の余白は、中身の高さではないので引く
        const offsetPadding = parseFloat(getComputedStyle(popup).paddingBottom) || 0;
        const natural =
          popup.offsetHeight - offsetPadding - content.clientHeight + content.scrollHeight;
        const next = natural > screen * HALF + 1;
        setLong(next);
        // 長いと分かる前に Base UI が段を空（null）に戻していても、半分から始める
        if (next) setSnapPoint((point) => point ?? HALF);
      };
      read();
      observer.current = new ResizeObserver(read);
      observer.current.observe(content);
      for (const child of content.children) observer.current.observe(child);
    },
    [side, detent]
  );
  // 上へ引いて広げられるか（中身が開いた高さに収まらず、半分の段があるとき）
  const snap = side === 'bottom' && detent === 'half' && long;
  // つまみは「引けること」の印。はじいて閉じられるか、上へ引いて広げられるときに出す（横から出すパネルには出さない）
  // 出さないときも場所は取る。出し入れで見出しの位置と余白が動かないようにするため
  // 上から出すシートは段を持たない（中身の高さで開く）。はじいて閉じられるときだけ出す
  const handle = (side === 'bottom' || side === 'top') && (closeOnSwipe || snap);
  // はじいて閉じず、上へ広げることもできないときは、引く操作そのものを始めさせない（面を指に追従させない）
  // Base UI には、はじいて閉じるのを止める prop がなく、data-base-ui-swipe-ignore で引く操作を無視させる
  // 広げられるとき（段があるとき）は引く操作が要るので、閉じる合図だけを onSnapPointChange で取り消す
  const swipeLocked = !closeOnSwipe && !snap;
  const changeOpen = (next: boolean) => {
    if (next) setSnapPoint(HALF);
    setOpenState(next);
    onOpenChange?.(next);
  };

  return (
    <BaseDrawer.Root
      open={open}
      onOpenChange={(next, details) => {
        if (!next && !closeOnEscape && ESCAPE_REASONS.has(details.reason)) {
          details.cancel();
          return;
        }
        // はじいて閉じない設定のときの保険。引く操作は swipeLocked と onSnapPointChange で先に止めている
        if (!next && !closeOnSwipe && details.reason === 'swipe') {
          details.cancel();
          return;
        }
        changeOpen(next);
      }}
      onOpenChangeComplete={onOpenChangeComplete}
      modal={passive ? false : modal}
      disablePointerDismissal={!dismissible || passive}
      swipeDirection={side === 'bottom' ? 'down' : side === 'top' ? 'up' : side}
      snapPoints={snap ? SNAP_POINTS : undefined}
      // 段はいつも部品が持つ（途中で Base UI に任せる形と切り替えると、段が空に戻る）
      snapPoint={snap ? snapPoint : null}
      onSnapPointChange={(point, details) => {
        // 段があり、はじいて閉じない設定のとき: 下へ引いて離すと Base UI は段を null（閉じる）にする
        // その合図を取り消すと、Base UI は閉じる動きを始めずにその場へ戻す。いちばん低い段に留める
        if (point === null && !closeOnSwipe && details.reason === 'swipe') {
          details.cancel();
          setSnapPoint(HALF);
          return;
        }
        if (snap) setSnapPoint(point);
      }}
    >
      {/* 開いた面に写す密度は、開くボタンの祖先から読む。ボタンがないときは、部品を置いた場所に描く空の印から読む */}
      {trigger ? (
        <BaseDrawer.Trigger ref={setAnchor} render={trigger} />
      ) : (
        <span ref={setAnchor} hidden />
      )}
      <OverlayCloseContext value={() => changeOpen(false)}>
        <SheetPopup
          side={side}
          role={role}
          title={title}
          accessibleName={accessibleName}
          description={description}
          footer={actions}
          footerStart={actionsStart}
          footerLayout={actionsLayout}
          handle={handle}
          swipeLocked={swipeLocked}
          swipeFade={!snap}
          modal={modal === true}
          closeName={closeName}
          hideCloseButton={hideCloseButton}
          autoFocus={autoFocus}
          returnFocus={returnFocus}
          portalContainer={portalContainer}
          densityScope={scope}
          popupRef={measure}
          popupProps={popupProps}
          className={className}
        >
          {children}
        </SheetPopup>
      </OverlayCloseContext>
    </BaseDrawer.Root>
  );
}

export interface DrawerActionsProps extends ComponentProps<'div'> {
  /** 下に並べる操作（ボタン）。押して閉じるボタンは OverlayClose の render に渡す */
  children?: ReactNode;
  /** 操作の左（縦に積むときは上）に置く文やチェックボックス。Drawer の actionsStart と同じ置き方です */
  start?: ReactNode;
  /** 帯（div）に付きます */
  className?: string;
}

/**
 * Drawer の下の操作（ボタン）の帯。中身のどこに置いても、actions と同じ下の帯に見え、中身が長いときは下に貼り付きます。
 * 並べ方は Drawer の actionsLayout に従います。
 * 中身の Form の中に置くと、送信のボタンが Form の送信・Enter・送信中・FormData にそのまま加わります。
 * 中身の最後（Form の中なら、その最後）に 1 つだけ置き、Drawer の actions とは両方渡しません
 */
export function DrawerActions(props: DrawerActionsProps) {
  return <OverlayActions name="DrawerActions" {...props} />;
}
