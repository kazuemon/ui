'use client';

import { type ReactElement, type ReactNode, useRef, useState } from 'react';

import { WarningIcon } from '../../internal/icons';
import type { OverlayFocusTarget, PopupProps } from '../../internal/overlay/overlay-props';
import type { OverlayPresentation } from '../../internal/sheet/use-narrow-screen';
import type { AlertDialogColor } from '../alert-dialog/AlertDialog';
import { Button } from '../button/Button';
import { Popover, type PopoverAlign, type PopoverSide } from '../popover/Popover';

export type PopconfirmActionsLayout = 'end' | 'fill';

export interface PopconfirmProps {
  /** 確かめを開くボタン。Button などの要素を渡す。開閉を外から決めるときは省き、open と positionerProps の anchor を使います */
  trigger?: ReactElement;
  /** 問い。何をするかを問いの形で書く（「この下書きを削除しますか？」）。読み上げでは、開いた面の名前になる */
  title: ReactNode;
  /** 問いの下の説明。起きることや、元に戻せないことを書く。省けます（一言で足りる問いは題だけにします） */
  description?: ReactNode;
  /** 実行する側のボタンの文言。何が起きるかを動詞で書く（「削除する」など） */
  actionLabel: ReactNode;
  /**
   * 取り消す側のボタンの文言
   * @default 'キャンセル'
   */
  cancelLabel?: ReactNode;
  /**
   * 実行する側のボタンを押したときの処理。Promise を返すと、終わるまでボタンを送信中にし、面を閉じずに待ち、終わってから閉じます。
   * 失敗した（Promise が reject された）ときは閉じずに残します。失敗の知らせは onAction の中で出します
   */
  onAction?: () => unknown;
  /**
   * 実行する側のボタンの色。消す・外すなど失うものがある操作は danger、
   * 失うものはないが取り消しにくい操作（送信・公開など）は primary にします
   * @default 'danger'
   */
  color?: AlertDialogColor;
  /**
   * 警告の印（三角の「!」）を題の前に出すか
   * @default false
   */
  showIcon?: boolean;
  /**
   * 2 つのボタンの並べ方。end は右に寄せ、実行する側を右端にします。fill は幅を等分して面いっぱいに広げます
   * @default 'end'
   */
  actionsLayout?: PopconfirmActionsLayout;
  /**
   * 2 つのボタンの大きさ
   * @default 'md'
   */
  buttonSize?: 'sm' | 'md';
  /**
   * 開いた直後に焦点を当てる要素。要素そのものか、要素の ref を渡します。cancel・action は、2 つのボタンのどちらかです。
   * 書かないときは color で決まります。失うものがある danger は取り消す側（うっかり Enter で実行しないため）、primary は実行する側です
   * @default color が danger なら 'cancel'、primary なら 'action'
   */
  autoFocus?: OverlayFocusTarget | 'cancel' | 'action';
  /** 閉じたあとに焦点を戻す要素。要素そのものか、要素の ref を渡します。書かないときは開いたボタン */
  returnFocus?: OverlayFocusTarget;
  /**
   * 本体のどちら側に出すか。画面の端に当たるときは反対側に出します
   * @default 'bottom'
   */
  side?: PopoverSide;
  /**
   * 本体に対して、どこにそろえるか
   * @default 'center'
   */
  align?: PopoverAlign;
  /**
   * 本体を指す小さな矢印を出すか
   * @default false
   */
  showArrow?: boolean;
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
   * 出し方。auto は指で操作していて画面が狭いときだけ、画面の下から出すシートにします
   * @default 'auto'
   */
  presentation?: OverlayPresentation;
  /**
   * 描く場所。まとめて決めるときは ThemeProvider の portalContainer を使います
   * @default document.body
   */
  portalContainer?: HTMLElement | null;
  /** 面（Popup）に足す props（id・data-*・aria-*・ref など） */
  popupProps?: PopupProps;
  /** 位置を決める要素（Positioner）に足す props（anchor・sideOffset など） */
  positionerProps?: React.ComponentProps<typeof Popover>['positionerProps'];
  /** 面（Popup）に足すクラス。幅を変えるときは w-*・max-w-* を渡す */
  className?: string;
}

function isThenable(value: unknown): value is PromiseLike<unknown> {
  return typeof (value as PromiseLike<unknown> | null)?.then === 'function';
}

/**
 * ボタンのそばに出る、小さな確かめの面。「削除しますか？」のような一言の問いと、取り消す・実行するの 2 つのボタンを見せます。
 * 取り消せない大きな操作や、入力での確かめが要るときは AlertDialog を使います
 *
 * 外を押す・Esc では取り消したのと同じに閉じます。onAction が Promise を返すあいだは、実行する側のボタンを送信中にし、閉じません。
 * 読み上げでは dialog として伝わります（裏を止めない面なので、alertdialog にはしません）
 */
export function Popconfirm({
  title,
  description,
  actionLabel,
  cancelLabel = 'キャンセル',
  onAction,
  color = 'danger',
  showIcon = false,
  actionsLayout = 'end',
  buttonSize = 'md',
  autoFocus,
  side = 'bottom',
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  popupProps,
  ...props
}: PopconfirmProps) {
  const [openState, setOpenState] = useState(defaultOpen);
  const open = openProp ?? openState;
  const [pending, setPending] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const actionRef = useRef<HTMLButtonElement>(null);
  const changeOpen = (next: boolean) => {
    // 送信中は、トリガーをもう一度押しても閉じない（外を押す・Esc は dismissible・closeOnEscape で止める）
    if (!next && pending) return;
    setOpenState(next);
    onOpenChange?.(next);
  };
  const run = async () => {
    try {
      const result: unknown = onAction?.();
      // Promise（と then を持つもの）を返したときだけ、終わるまで実行中にする
      if (isThenable(result)) {
        setPending(true);
        await result;
      }
    } catch {
      // 失敗したときは閉じずに残す（知らせは onAction の中で出す）
      return;
    } finally {
      setPending(false);
    }
    changeOpen(false);
  };
  const target = autoFocus ?? (color === 'danger' ? 'cancel' : 'action');
  const focus = target === 'cancel' ? cancelRef : target === 'action' ? actionRef : target;
  const heading = showIcon ? (
    <span className="flex items-start gap-2">
      <span
        className={[
          'flex h-(--leading-control) items-center',
          color === 'danger' ? 'text-fg-danger' : 'text-fg-muted',
        ].join(' ')}
      >
        <WarningIcon />
      </span>
      <span>{title}</span>
    </span>
  ) : (
    title
  );
  return (
    <Popover
      {...props}
      side={side}
      title={heading}
      description={description}
      open={open}
      onOpenChange={changeOpen}
      // 送信中は閉じない（外を押す・Esc でも）
      dismissible={!pending}
      closeOnEscape={!pending}
      autoFocus={focus}
      popupProps={popupProps}
    >
      <div
        data-slot="popconfirm-actions"
        data-layout={actionsLayout}
        className="flex justify-end gap-2 data-[layout=fill]:*:flex-1"
      >
        <Button
          ref={cancelRef}
          variant="outline"
          size={buttonSize}
          disabled={pending}
          data-slot="popconfirm-cancel"
          onClick={() => changeOpen(false)}
        >
          {cancelLabel}
        </Button>
        <Button
          ref={actionRef}
          color={color}
          size={buttonSize}
          loading={pending}
          data-slot="popconfirm-action"
          onClick={() => void run()}
        >
          {actionLabel}
        </Button>
      </div>
    </Popover>
  );
}
