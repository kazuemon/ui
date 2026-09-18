import { type ReactElement, type ReactNode, useState } from 'react';

import { OverlayRoleContext } from '../../internal/overlay/overlay-role-context';
import { Button } from '../button/Button';
import { Dialog, type DialogPresentation } from '../dialog/Dialog';
import type { OverlayActionsLayout } from '../drawer/Drawer';

/** 実行する側のボタンの色。danger は危険の色、primary は主な色 */
export type AlertDialogTone = 'danger' | 'primary';

export interface AlertDialogProps {
  /** 見出しの題。何をするかを問いの形で書く。読み上げでは、開いた面の名前になる */
  title: ReactNode;
  /** 題の下の説明。何が起き、元に戻せないことを書く。読み上げでは、開いた面の説明になる */
  description?: ReactNode;
  /** 中身（消えるものの一覧など）。題と説明で足りるときは渡さない */
  children?: ReactNode;
  /** 実行する側のボタンの文言。何が起きるかを動詞で書く（「削除する」など） */
  actionLabel: ReactNode;
  /**
   * 取り消す側のボタンの文言
   * @default 'キャンセル'
   */
  cancelLabel?: ReactNode;
  /**
   * 実行する側のボタンを押したときの処理。Promise を返すと、終わるまでボタンを送信中にし、終わってから閉じます。
   * 失敗した（Promise が reject された）ときは閉じずに残します。失敗の知らせは onAction の中で出します
   */
  onAction?: () => unknown;
  /**
   * 実行する側のボタンの色。消す・外すなど失うものがある操作は danger、失うものはないが取り消せない操作（送信・公開など）は primary にします
   * @default 'danger'
   */
  tone?: AlertDialogTone;
  /** 開くボタン。Button などの要素を渡す。開閉を外から決めるときは省ける */
  trigger?: ReactElement;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * 出し方。auto は指で操作していて画面が狭いときだけ、画面の下から出すシートにします。popover はいつも中央に浮かべ、sheet はいつもシートにします
   * 書かないときは ThemeProvider の presentation に従います
   * @default 'auto'
   */
  presentation?: DialogPresentation;
  /**
   * 画面の下から出すシートで出すときの、2 つのボタンの並べ方。既定の auto は、幅いっぱいで縦に積み、実行する側を上にします。
   * 中央に浮かべるときは、いつも右に寄せ、実行する側を右端にします
   * @default 'auto'
   */
  actionsLayout?: OverlayActionsLayout;
  /**
   * 描く場所
   * @default document.body
   */
  container?: HTMLElement | null;
  /** 面（Popup）に足すクラス */
  className?: string;
}

/**
 * 取り消せない操作の前に、続けるかを確かめる面。閉じるのは下の 2 つのボタンだけで、後ろの画面・Esc・下へはじく操作では閉じません
 */
export function AlertDialog({
  title,
  description,
  children,
  actionLabel,
  cancelLabel = 'キャンセル',
  onAction,
  tone = 'danger',
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  ...props
}: AlertDialogProps) {
  const [openState, setOpenState] = useState(defaultOpen);
  const open = openProp ?? openState;
  const [pending, setPending] = useState(false);
  const changeOpen = (next: boolean) => {
    setOpenState(next);
    onOpenChange?.(next);
  };
  const run = async () => {
    const result = onAction?.();
    if (result instanceof Promise) {
      setPending(true);
      try {
        await result;
      } catch {
        // 失敗したときは閉じずに残す（知らせは onAction の中で出す）
        return;
      } finally {
        setPending(false);
      }
    }
    changeOpen(false);
  };
  return (
    <OverlayRoleContext value="alertdialog">
      <Dialog
        {...props}
        title={title}
        description={description}
        open={open}
        onOpenChange={changeOpen}
        // 閉じるのは下のボタンだけ（後ろの画面・下へはじく操作・Esc・× では閉じない）
        dismissible={false}
        closeOnEscape={false}
        closeButton={false}
        actions={
          <>
            {/* 開いた直後のフォーカスは取り消す側に置く（うっかり Enter で実行しないため） */}
            <Button
              appearance="outline"
              autoFocus
              disabled={pending}
              data-slot="alert-dialog-cancel"
              onClick={() => changeOpen(false)}
            >
              {cancelLabel}
            </Button>
            <Button
              color={tone}
              loading={pending}
              data-slot="alert-dialog-action"
              onClick={() => void run()}
            >
              {actionLabel}
            </Button>
          </>
        }
      >
        {children}
      </Dialog>
    </OverlayRoleContext>
  );
}
