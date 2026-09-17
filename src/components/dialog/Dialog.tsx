import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { type ReactElement, type ReactNode, useId, useState } from 'react';

import { useDensityScope } from '../../internal/density-scope';
import { initialFocusOf } from '../../internal/overlay/initial-focus';
import { OverlayCloseContext } from '../../internal/overlay/overlay-close-context';
import { SheetCloseButton, SheetHeader } from '../../internal/sheet/SheetHeader';
import {
  overlayTitleLeading,
  sheetDescriptionClass,
  sheetTitleClass,
} from '../../internal/sheet/sheet-styles';
import {
  type OverlayPresentation,
  useSheetPresentation,
} from '../../internal/sheet/use-narrow-screen';
import { Drawer, ESCAPE_REASONS, type OverlayActionsLayout } from '../drawer/Drawer';

export type DialogPresentation = OverlayPresentation;

export interface DialogProps {
  /** 見出しの題。読み上げでは、開いた面の名前になる */
  title: ReactNode;
  /** 題の下の説明。読み上げでは、開いた面の説明になる */
  description?: ReactNode;
  /** 中身 */
  children?: ReactNode;
  /** 下の端に右寄せで並べる操作（ボタン）。押して閉じるボタンは OverlayClose の render に渡す */
  actions?: ReactNode;
  /** 開くボタン。Button などの要素を渡す。開閉を外から決めるときは省ける */
  trigger?: ReactElement;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * 出し方。auto は指で操作していて画面が狭いときだけ、画面の下から出すシートにします。popover はいつも中央に浮かべ、sheet はいつもシートにします
   * @default 'auto'
   */
  presentation?: DialogPresentation;
  /**
   * 開いているあいだ、ほかの部分の操作とページのスクロールを止めるか
   * @default true
   */
  modal?: boolean;
  /**
   * 後ろの画面を押したときに閉じるか。入力の途中で閉じると困るときは false にします（Esc と × では閉じます）
   * @default true
   */
  dismissible?: boolean;
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
   * 右上に閉じる × を置くか。false のときは、actions に閉じる手段を置きます
   * @default true
   */
  closeButton?: boolean;
  /**
   * 閉じる × の読み上げの名前
   * @default '閉じる'
   */
  closeLabel?: string;
  /**
   * 描く場所。トリガーの祖先に付いた data-density と coarse-large は、描く場所がその外でも写します
   * @default document.body
   */
  container?: HTMLElement | null;
  /** 面（Popup）に足すクラス。幅を変えるときは w-* を渡す */
  className?: string;
}

/**
 * ページの上に重ねて、ほかの操作を止めて答えや入力を求める面
 */
export function Dialog({ presentation = 'auto', dismissible = true, ...props }: DialogProps) {
  const sheet = useSheetPresentation(presentation);
  // 指で操作していて画面が狭いときは、画面の下から出すシート（Drawer と同じ面）にする — 原則11
  // シートは中身の高さで開く（半分で止めない）。Dialog の中身は、上から順に読んで答えるものなので
  if (sheet) return <Drawer {...props} dismissible={dismissible} detent="full" />;
  // 中央に浮かべるときは、下の操作をいつも右に寄せる（actionsLayout はシートのときだけ）
  const { actionsLayout: _actionsLayout, ...centered } = props;
  return <CenteredDialog {...centered} dismissible={dismissible} />;
}

// 中央に浮かべる形
//   面は浮かぶ面と同じ（白・細い輪郭・やわらかい影 — 原則1）。部品（ボタン）を包むので、角はカードの角（原則5）
//   後ろの画面は暗くする（--color-backdrop）
//   見出しはシートと同じ並び（題・説明のまとまりと、右上に固定した ×）。余白は --dialog-padding
//   開閉は浮かぶ面と同じ動き（下に --popup-shift 寄った位置から、濃さと一緒に滑る）。動きを減らす設定では動かさない
//   中身が画面より高いときは、面ごと画面の中でスクロールする
function CenteredDialog({
  title,
  description,
  children,
  actions,
  trigger,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  modal = true,
  dismissible,
  closeOnEscape = true,
  closeButton = true,
  closeLabel,
  container,
  className,
}: Omit<DialogProps, 'presentation'>) {
  const [openState, setOpenState] = useState(defaultOpen);
  const open = openProp ?? openState;
  const { anchorRef, scope } = useDensityScope(open);
  const overlayId = useId();
  const changeOpen = (next: boolean) => {
    setOpenState(next);
    onOpenChange?.(next);
  };
  return (
    <BaseDialog.Root
      open={open}
      onOpenChange={(next, details) => {
        if (!next && !closeOnEscape && ESCAPE_REASONS.has(details.reason)) return;
        changeOpen(next);
      }}
      modal={modal}
      disablePointerDismissal={!dismissible}
    >
      {trigger && <BaseDialog.Trigger ref={anchorRef} render={trigger} />}
      <OverlayCloseContext value={() => changeOpen(false)}>
        <BaseDialog.Portal container={container}>
          <BaseDialog.Backdrop className="fixed inset-0 z-10 bg-backdrop transition-opacity duration-(--popup-duration-in) ease-(--popup-ease) data-ending-style:opacity-0 data-ending-style:duration-(--popup-duration-out) data-starting-style:opacity-0 motion-reduce:transition-none" />
          <BaseDialog.Viewport className="fixed inset-0 z-10 grid place-items-center overflow-y-auto p-(--dialog-margin)">
            <BaseDialog.Popup
              data-overlay-id={overlayId}
              initialFocus={initialFocusOf(overlayId, 'dialog')}
              data-slot="dialog"
              data-density={scope.density}
              className={[
                'relative flex w-(--dialog-width) max-w-full flex-col rounded-card pb-(--dialog-padding) border-(length:--border-width-thin) border-surface-line bg-surface text-(length:--text-control) leading-(--leading-control) text-fg shadow-overlay outline-none',
                overlayTitleLeading,
                '[--sheet-close-inset:calc(var(--dialog-padding)-(var(--spacing-control)-var(--overlay-title-leading))/2)] [--sheet-inset:0px] [--sheet-padding-x:var(--dialog-padding)]',
                'transition-[opacity,translate] duration-(--popup-duration-in) ease-(--popup-ease) data-ending-style:duration-(--popup-duration-out)',
                'data-ending-style:opacity-0 data-starting-style:opacity-0',
                'data-ending-style:[translate:0_var(--popup-shift)] data-starting-style:[translate:0_var(--popup-shift)]',
                'motion-reduce:[transition:none]',
                scope.large && 'coarse-large',
                className,
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
                  closeButton ? (
                    <BaseDialog.Close
                      render={<SheetCloseButton label={closeLabel} />}
                      data-slot="dialog-close"
                    />
                  ) : null
                }
              >
                <BaseDialog.Title className={sheetTitleClass}>{title}</BaseDialog.Title>
                {description != null && (
                  <BaseDialog.Description className={sheetDescriptionClass}>
                    {description}
                  </BaseDialog.Description>
                )}
              </SheetHeader>
              {children != null && (
                <div data-slot="dialog-content" className="px-(--dialog-padding) pt-2">
                  {children}
                </div>
              )}
              {actions != null && (
                <div
                  data-slot="dialog-footer"
                  className="flex flex-wrap justify-end gap-2 px-(--dialog-padding) pt-(--dialog-padding)"
                >
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
