'use client';

import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import {
  type ComponentProps,
  type ReactElement,
  type ReactNode,
  use,
  useId,
  useState,
} from 'react';

import { useDensityScope } from '../../internal/density-scope';
import { ESCAPE_REASONS } from '../../internal/overlay/close-reasons';
import { initialFocusOf } from '../../internal/overlay/initial-focus';
import { OverlayActions, OverlayActionsStart } from '../../internal/overlay/overlay-actions';
import {
  OverlayActionsContext,
  useOverlayActionsSlot,
} from '../../internal/overlay/overlay-actions-context';
import { OverlayCloseContext } from '../../internal/overlay/overlay-close-context';
import {
  focusTargetRef,
  overlayNameAttributes,
  type OverlayFocusTarget,
  type OverlayModal,
  type OverlayNameProps,
  type PopupProps,
} from '../../internal/overlay/overlay-props';
import { type OverlayRole, OverlayRoleContext } from '../../internal/overlay/overlay-role-context';
import { SheetCloseButton, SheetHeader } from '../../internal/sheet/SheetHeader';
import { MoreCueScroll } from '../../internal/sheet/MoreCueScroll';
import { SheetMoreCue } from '../../internal/sheet/SheetMoreCue';
import {
  overlayTitleLeading,
  sheetDescriptionClass,
  sheetTitleClass,
} from '../../internal/sheet/sheet-styles';
import {
  type OverlayPresentation,
  useSheetPresentation,
} from '../../internal/sheet/use-narrow-screen';
import { cn } from '../../internal/tv';
import { useMoreCues } from '../../internal/sheet/use-more-cues';
import { useMergedRefs } from '../../internal/use-merged-refs';
import { Drawer, type OverlayActionsLayout } from '../drawer/Drawer';
import { usePortalContainer } from '../../internal/ui-config';

export type {
  OverlayFocusTarget,
  OverlayModal,
  OverlayNameProps,
  PopupProps,
} from '../../internal/overlay/overlay-props';

/**
 * 中央に浮かべるときの幅の段。sm は確かめや短い問い、md は入力が数個の面、lg は表や長い文を読ませる面。
 * 狭い画面では、どの段も左右に余白を残して縮みます
 */
export type DialogSize = 'sm' | 'md' | 'lg';

/**
 * 中身が画面より高いときのスクロールのしかた。viewport は面ごと画面の中でスクロールし、
 * content は題と下の操作を残して、中身だけをスクロールします
 */
export type DialogScrollBehavior = 'viewport' | 'content';

/** Dialog の props から、title・accessibleName の組み合わせの決まりを外したもの */
export interface DialogBaseProps {
  /** 題の下の説明。読み上げでは、開いた面の説明になる */
  description?: ReactNode;
  /** 面の中身（読ませる文や、答えてもらう欄） */
  children?: ReactNode;
  /**
   * 下の端に右寄せで並べる操作（ボタン）。押して閉じるボタンは OverlayClose の render に渡す。
   * 中身の Form の送信のボタンを並べるときは、actions の代わりに中身の Form の中に DialogActions を置きます
   */
  actions?: ReactNode;
  /**
   * 下の操作の左に置く文やチェックボックス（保存の状態、注記、「次から表示しない」など）。
   * 文字列だけを渡したときは、小さい淡い文字で描きます。要素を渡したときは、文字の大きさや色を付けません（Text などで決めます）。
   * 画面の下から出すシートで、操作を縦に積むときは操作の上に置きます。中身に DialogActions を置くときは、その start に渡します
   */
  actionsStart?: ReactNode;
  /**
   * 中央に浮かべるときの幅の段。シートで出すときは幅いっぱいです。決まった幅にするときは className に w-* を渡します
   * @default 'md'
   */
  size?: DialogSize;
  /**
   * 中身が画面より高いときのスクロールのしかた。viewport は面ごと画面の中でスクロールし、content は題と下の操作を残して中身だけをスクロールします。
   * シートで出すときは、いつも中身だけをスクロールします
   * @default 'content'
   */
  scrollBehavior?: DialogScrollBehavior;
  /** 開くボタン。Button などの要素を渡す。開閉を外から決めるときは省ける */
  trigger?: ReactElement;
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
   * 出し方。auto は指で操作していて画面が狭いときだけ、画面の下から出すシートにします。popover はいつも中央に浮かべ、sheet はいつもシートにします
   * 書かないときは ThemeProvider の presentation に従います
   * @default 'auto'
   */
  presentation?: OverlayPresentation;
  /**
   * 開いているあいだ、ほかの部分の操作とページのスクロールを止めるか。
   * passive は、裏を止めず後ろも暗くしませんが、外を押しても閉じません（後ろを見せたまま開いたままにするとき）
   * @default true
   */
  modal?: OverlayModal;
  /**
   * 後ろの画面を押したときに閉じるか。入力の途中で閉じると困るときは false にします（Esc と × では閉じます）
   * modal が false のときは、フォーカスが面の外へ出たときにも閉じるので、false にするとそれも止まります
   * @default true
   */
  dismissible?: boolean;
  /**
   * 画面の下から出すシートで出すときに、下へはじいて閉じられるか
   * @default dismissible と同じ
   */
  closeOnSwipe?: boolean;
  /**
   * 画面の下から出すシートで出すときの、下の操作（actions）の並べ方。既定の auto は、幅いっぱいで縦に積みます
   * （最後に渡した主な操作が上）。渡した順に上から積むときは stack、横に並べるときは end（右寄せ）か fill（幅を等分）です。
   * 中央に浮かべるときは、いつも右に寄せます。ボタンの文言・色・数・順は actions で決めます
   * @default 'auto'
   */
  actionsLayout?: OverlayActionsLayout;
  /**
   * Esc（Android の戻る操作を含む）で閉じるか。答えるまで閉じたくないときは false にし、actions に閉じる手段を置きます
   * @default true
   */
  closeOnEscape?: boolean;
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
  /** 開いた直後に焦点を当てる要素。要素そのものか、要素の ref を渡します。書かないときは面の中の最初のもの */
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
  /** 面（Popup）に足すクラス。幅を変えるときは w-* を渡す */
  className?: string;
}

/**
 * Dialog の props。題（title）か読み上げだけの名前（accessibleName）のどちらかが要ります。
 * 題を置かないのは、中身の見出しや画像で何の面か分かるときだけです
 */
export type DialogProps = DialogBaseProps & OverlayNameProps;

/**
 * ページの上に重ねて、ほかの操作を止めて答えや入力を求める面
 */
export function Dialog({
  presentation,
  dismissible = true,
  closeOnSwipe,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  children,
  actions,
  size,
  scrollBehavior,
  ...props
}: DialogProps) {
  // 読み上げの役割。AlertDialog が包んだときだけ alertdialog になる
  const role = use(OverlayRoleContext);
  // 中身と下の操作には dialog を配り直す（中に置いた Dialog に alertdialog が写らないようにする）
  const inner = (node: ReactNode) =>
    node == null || role === 'dialog' ? (
      node
    ) : (
      <OverlayRoleContext value="dialog">{node}</OverlayRoleContext>
    );
  // 開閉はここで持つ。出し方（シート・中央）が開いたまま切り替わっても（画面を回すなど）、閉じないようにするため
  const [openState, setOpenState] = useState(defaultOpen);
  const open = openProp ?? openState;
  const changeOpen = (next: boolean) => {
    setOpenState(next);
    onOpenChange?.(next);
  };
  const sheet = useSheetPresentation(presentation);
  // 指で操作していて画面が狭いときは、画面の下から出すシート（Drawer と同じ面）にする — 原則11
  // シートは中身の高さで開く（半分で止めない）。Dialog の中身は、上から順に読んで答えるものなので
  // 下へはじいて閉じるのは、既定では後ろの画面を押して閉じるのと同じ扱い（dismissible）
  if (sheet) {
    return (
      <Drawer
        {...props}
        actions={inner(actions)}
        open={open}
        onOpenChange={changeOpen}
        dismissible={dismissible}
        closeOnSwipe={closeOnSwipe ?? dismissible}
        detent="full"
      >
        {inner(children)}
      </Drawer>
    );
  }
  // 中央に浮かべるときは、下の操作をいつも右に寄せる（actionsLayout はシートのときだけ）
  const { actionsLayout: _actionsLayout, ...centered } = props;
  return (
    <CenteredDialog
      {...centered}
      size={size}
      scrollBehavior={scrollBehavior}
      role={role}
      actions={inner(actions)}
      open={open}
      onOpenChange={changeOpen}
      dismissible={dismissible}
    >
      {inner(children)}
    </CenteredDialog>
  );
}

// 中央に浮かべる形
//   面は浮かぶ面と同じ（白・細い輪郭・やわらかい影 — 原則1）。部品（ボタン）を包むので、角はカードの角（原則5）
//   後ろの画面は暗くする（--color-backdrop）。裏を止めないとき（modal が false・passive）は暗くせず、面の外は触れたままにする
//   見出しはシートと同じ並び（題・説明のまとまりと、右上に固定した ×）。余白は --dialog-padding
//   開閉は浮かぶ面と同じ動き（下に --popup-shift 寄った位置から、濃さと一緒に滑る）。動きを減らす設定では動かさない
//   幅は size の段（--dialog-width-sm・--dialog-width・--dialog-width-lg）
//   中身が画面より高いとき: viewport は面ごと画面の中でスクロールする。content は面の高さを画面に収め、中身だけをスクロールする
//     content では、シートと同じ続きの印（上は区切り線、下は内側の影と、下に操作があれば区切り線）を出し、
//     中身に置いた DialogActions は中身の下の端に貼り付ける
function CenteredDialog({
  role,
  title,
  accessibleName,
  description,
  children,
  actions,
  actionsStart,
  size = 'md',
  scrollBehavior = 'content',
  trigger,
  open,
  onOpenChange: changeOpen,
  onOpenChangeComplete,
  modal = true,
  dismissible,
  closeOnEscape = true,
  hideCloseButton = false,
  closeName,
  autoFocus,
  returnFocus,
  portalContainer: container,
  popupProps,
  className,
}: Omit<
  DialogBaseProps,
  'presentation' | 'defaultOpen' | 'open' | 'onOpenChange' | 'closeOnSwipe' | 'actionsLayout'
> & {
  title?: ReactNode;
  accessibleName?: string;
  role: OverlayRole;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const portalContainer = usePortalContainer(container);
  const { setAnchor, scope } = useDensityScope<HTMLElement>(open);
  const overlayId = useId();
  const popupRef = useMergedRefs<HTMLDivElement>(popupProps?.ref);
  // 中身に置いた下の操作の帯（DialogActions）。中央に浮かべるときは、いつも右に寄せる
  const scrollContent = scrollBehavior === 'content';
  const slot = useOverlayActionsSlot(
    scrollContent ? 'dialog-scroll' : 'dialog',
    'end',
    actions != null
  );
  const cues = useMoreCues();
  // passive は、裏を止めず後ろも暗くしないが、外を押しても（フォーカスが外れても）閉じない
  const passive = modal === 'passive';
  const { className: popupClassName, ref: _popupRef, ...restPopupProps } = popupProps ?? {};
  return (
    <BaseDialog.Root
      open={open}
      onOpenChange={(next, details) => {
        // Esc で閉じない設定のときは、閉じる合図を取り消す（Base UI が Esc を処理済みにしないようにする）
        if (!next && !closeOnEscape && ESCAPE_REASONS.has(details.reason)) {
          details.cancel();
          return;
        }
        changeOpen(next);
      }}
      onOpenChangeComplete={onOpenChangeComplete}
      modal={passive ? false : modal}
      disablePointerDismissal={!dismissible || passive}
    >
      {/* 開いた面に写す密度は、開くボタンの祖先から読む。ボタンがないときは、部品を置いた場所に描く空の印から読む */}
      {trigger ? (
        <BaseDialog.Trigger ref={setAnchor} render={trigger} />
      ) : (
        <span ref={setAnchor} hidden />
      )}
      <OverlayCloseContext value={() => changeOpen(false)}>
        <BaseDialog.Portal container={portalContainer}>
          {/* 裏を止めるときだけ、後ろを暗くする */}
          {modal === true && (
            <BaseDialog.Backdrop className="fixed inset-0 z-10 bg-backdrop transition-opacity duration-(--duration-normal) ease-(--ease-sheet) data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none" />
          )}
          {/* 裏を止めないときは、面を置く枠を素通しにし、面だけが触れるようにする */}
          <BaseDialog.Viewport
            data-slot="dialog-viewport"
            className={[
              'fixed inset-0 z-10 p-(--dialog-margin)',
              // content: 面の高さを枠に収める（max-h-full が効くよう、高さの決まった flex の中に置く）。
              //   題と下の操作だけで枠より高いとき（横向きのスマートフォンなど）は、枠ごとスクロールする
              scrollContent
                ? 'flex items-center justify-center overflow-x-hidden overflow-y-auto'
                : 'grid grid-cols-[minmax(0,1fr)] place-items-center overflow-y-auto',
              modal !== true && 'pointer-events-none',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <BaseDialog.Popup
              data-overlay-id={overlayId}
              initialFocus={focusTargetRef(autoFocus) ?? initialFocusOf(overlayId, 'dialog')}
              finalFocus={focusTargetRef(returnFocus)}
              // 読み上げの役割（Base UI の既定は dialog。AlertDialog が包んだときは alertdialog）
              role={role}
              data-slot="dialog"
              data-size={size}
              data-scroll-behavior={scrollBehavior}
              data-density={scope.density}
              {...overlayNameAttributes(accessibleName)}
              {...restPopupProps}
              ref={popupRef}
              className={[
                'relative flex w-(--dialog-width) max-w-full flex-col rounded-card border-(length:--border-width-thin) border-surface-line bg-surface text-(length:--text-control) leading-(--leading-control) text-fg shadow-overlay outline-none',
                overlayTitleLeading,
                size === 'sm' && '[--dialog-width:var(--dialog-width-sm)]',
                size === 'lg' && '[--dialog-width:var(--dialog-width-lg)]',
                scrollContent ? 'max-h-full min-h-0' : 'pb-(--dialog-padding)',
                '[--sheet-close-inset:calc(var(--dialog-padding)-(var(--spacing-control)-var(--overlay-title-leading))/2)] [--sheet-inset:0px] [--sheet-padding-x:var(--dialog-padding)]',
                'transition-[opacity,translate] duration-(--duration-normal) ease-(--ease-sheet) data-ending-style:duration-(--popup-duration-out)',
                'data-ending-style:opacity-0 data-starting-style:opacity-0',
                'data-ending-style:[translate:0_var(--popup-shift)] data-starting-style:[translate:0_var(--popup-shift)]',
                'motion-reduce:[transition:none]',
                modal !== true && 'pointer-events-auto',
                scope.large && 'coarse-large',
                cn(className, popupClassName),
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {/* 題の上端が面の上から --dialog-padding になるよう、見出しの上を詰める。× は題の行の中央にそろい、
                右の端からも上と同じだけ離れる（--sheet-close-inset） */}
              <SheetHeader
                handle={null}
                className="pt-(--sheet-close-inset)"
                close={
                  hideCloseButton ? null : (
                    <BaseDialog.Close
                      render={<SheetCloseButton label={closeName} />}
                      data-slot="dialog-close"
                    />
                  )
                }
              >
                {title != null && (
                  <BaseDialog.Title className={sheetTitleClass}>{title}</BaseDialog.Title>
                )}
                {description != null && (
                  <BaseDialog.Description className={sheetDescriptionClass}>
                    {description}
                  </BaseDialog.Description>
                )}
              </SheetHeader>
              {children != null &&
                (scrollContent ? (
                  // 中身だけをスクロールさせる。ScrollArea と同じ枠。続きの印は枠の上下に置く
                  //   角は面の角に合わせて丸める（貼り付けた DialogActions の面が、面の下の角からはみ出さないように）
                  <MoreCueScroll
                    surface="sheet"
                    viewportRef={cues}
                    viewportSlot="dialog-content"
                    className="min-h-0 flex-1 rounded-b-[calc(var(--radius-card)-var(--border-width-thin))]"
                    viewportClassName={[
                      'overscroll-contain px-(--dialog-padding) pt-2',
                      // 下の余白は、下の操作の帯（actions・DialogActions）か、なければ中身が持つ
                      actions == null && !slot.placed && 'pb-(--dialog-padding)',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    before={
                      <SheetMoreCue
                        edge="top"
                        sheet
                        sheetMoreCue="divider-always-shadow"
                        divider="scrollable"
                      />
                    }
                    after={
                      !slot.placed && (
                        <SheetMoreCue
                          edge="bottom"
                          sheet
                          sheetMoreCue="divider-always-shadow"
                          divider={actions != null ? 'shadow' : undefined}
                        />
                      )
                    }
                  >
                    <OverlayActionsContext value={slot.value}>{children}</OverlayActionsContext>
                  </MoreCueScroll>
                ) : (
                  <div data-slot="dialog-content" className="px-(--dialog-padding) pt-2">
                    <OverlayActionsContext value={slot.value}>{children}</OverlayActionsContext>
                  </div>
                ))}
              {actions != null && (
                <div
                  data-slot="dialog-footer"
                  className={[
                    'flex shrink-0 flex-wrap items-center justify-end gap-2 px-(--dialog-padding) pt-(--dialog-padding)',
                    scrollContent && 'pb-(--dialog-padding)',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {actionsStart != null && (
                    <OverlayActionsStart>{actionsStart}</OverlayActionsStart>
                  )}
                  {actions}
                </div>
              )}
            </BaseDialog.Popup>
          </BaseDialog.Viewport>
        </BaseDialog.Portal>
      </OverlayCloseContext>
    </BaseDialog.Root>
  );
}

export interface DialogActionsProps extends ComponentProps<'div'> {
  /** 下に並べる操作（ボタン）。最も進めたい操作を最後に置きます。押して閉じるボタンは OverlayClose の render に渡す */
  children?: ReactNode;
  /** 操作の左（縦に積むときは上）に置く文やチェックボックス。Dialog の actionsStart と同じ置き方・同じ文字の扱いです */
  start?: ReactNode;
  /** 帯（div）に付きます */
  className?: string;
}

/**
 * Dialog の下の操作（ボタン）の帯。中身のどこに置いても、actions と同じ下の帯に見えます（シートで出すときは、中身が長くても下に貼り付きます）。
 * 中身の Form の中に置くと、送信のボタンが Form の送信・Enter・送信中・FormData にそのまま加わります。
 * 中身の最後（Form の中なら、その最後）に 1 つだけ置き、Dialog の actions とは両方渡しません
 */
export function DialogActions(props: DialogActionsProps) {
  return <OverlayActions name="DialogActions" {...props} />;
}
