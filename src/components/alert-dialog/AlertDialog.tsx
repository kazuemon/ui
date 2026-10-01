'use client';

import {
  type ComponentProps,
  createContext,
  type FormEvent,
  type ReactElement,
  type ReactNode,
  use,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useState,
} from 'react';

import { warnOnce } from '../../internal/link-parts';
import { OverlayActions } from '../../internal/overlay/overlay-actions';
import { OverlayRoleContext } from '../../internal/overlay/overlay-role-context';
import type { OverlayFocusTarget, PopupProps } from '../../internal/overlay/overlay-props';
import { Button } from '../button/Button';
import type { OverlayPresentation } from '../../internal/sheet/use-narrow-screen';
import { Dialog } from '../dialog/Dialog';
import type { OverlayActionsLayout } from '../drawer/Drawer';

/** 実行する側のボタンの色。パレットの色と意味を持った色を 1 つの軸に並べる（ADR-0235） */
export type AlertDialogColor = 'danger' | 'primary';

export interface AlertDialogProps {
  /** 見出しの題。何をするかを問いの形で書く。読み上げでは、開いた面の名前になる */
  title: ReactNode;
  /** 題の下の説明。何が起き、元に戻せないことを書く。読み上げでは、開いた面の説明になる */
  description?: ReactNode;
  /**
   * 中身（消えるものの一覧など）。題と説明で足りるときは渡さない。
   * 2 つのボタンを中身の中の決まった場所に描くときは、AlertDialogActions を置きます
   */
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
   * 実行する側のボタンを押せなくするか。確かめの入力（消すものの名前を打つなど）が済むまで止めるときに使います
   * @default false
   */
  actionDisabled?: boolean;
  /**
   * 実行する側のボタンの色。消す・外すなど失うものがある操作は danger、
   * 失うものはないが取り消せない操作（送信・公開など）は primary にします
   * @default 'danger'
   */
  color?: AlertDialogColor;
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
   * 画面の下から出すシートで出すときの、2 つのボタンの並べ方。既定の auto は、幅いっぱいで縦に積み、実行する側を上にします。
   * 中央に浮かべるときは、いつも右に寄せ、実行する側を右端にします
   * @default 'auto'
   */
  actionsLayout?: OverlayActionsLayout;
  /**
   * 開いた直後に焦点を当てる要素。要素そのものか、要素の ref を渡します（中身に置いた入力欄など）。
   * 書かないときは取り消す側のボタンです（うっかり Enter で実行しないため）
   */
  autoFocus?: OverlayFocusTarget;
  /** 閉じたあとに焦点を戻す要素。要素そのものか、要素の ref を渡します。書かないときは開いたボタン */
  returnFocus?: OverlayFocusTarget;
  /**
   * 描く場所。まとめて決めるときは ThemeProvider の portalContainer を使います
   * @default document.body
   */
  portalContainer?: HTMLElement | null;
  /** 面（Popup）に足す props（id・data-*・aria-*・ref など） */
  popupProps?: PopupProps;
  /** 面（Popup）に足すクラス */
  className?: string;
}

// 中身に置いた AlertDialogActions に、2 つのボタンを配る。置かれたら、AlertDialog は下の帯にボタンを描かない
//   帯は、置かれたことが AlertDialog に届いてからボタンを描く（同じボタンが 2 か所に同時に出て、開いた直後のフォーカスが消えた側に移らないように）
const AlertDialogActionsContext = createContext<{
  buttons: ReactNode;
  placed: boolean;
  register: () => () => void;
} | null>(null);

/**
 * 取り消せない操作の前に、続けるかを確かめる面。閉じるのは下の 2 つのボタンだけで、後ろの画面・Esc・下へはじく操作では閉じません
 *
 * 中身は form で包まれ、実行する側のボタンはその送信のボタンです。中身に置いた入力欄で Enter を押すと実行します
 * （入力欄の required などの確かめを通ったときだけ）
 */
export function AlertDialog({
  title,
  description,
  children,
  actionLabel,
  cancelLabel = 'キャンセル',
  onAction,
  color = 'danger',
  actionDisabled = false,
  autoFocus,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  ...props
}: AlertDialogProps) {
  const [openState, setOpenState] = useState(defaultOpen);
  const open = openProp ?? openState;
  const [pending, setPending] = useState(false);
  const formId = useId();
  // 中身に置いた AlertDialogActions の数
  const [placed, setPlaced] = useState(0);
  const register = useCallback(() => {
    setPlaced((n) => n + 1);
    return () => setPlaced((n) => n - 1);
  }, []);
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
  // 実行は form の送信にする。中身の入力欄で Enter を押すと、実行する側のボタンが押されたのと同じになる
  //   面は画面の外（portal）に描くが、React のイベントは部品の木を上るので、外の form に送信を伝えない
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (actionDisabled || pending) return;
    void run();
  };
  // 取り消す側と実行する側のボタン。下の帯か、中身に置いた AlertDialogActions に描く
  const buttons = (
    <>
      {/* 開いた直後のフォーカスは、渡されなければ取り消す側に置く（うっかり Enter で実行しないため） */}
      <Button
        variant="outline"
        autoFocus={autoFocus === undefined}
        disabled={pending}
        data-slot="alert-dialog-cancel"
        onClick={() => changeOpen(false)}
      >
        {cancelLabel}
      </Button>
      <Button
        type="submit"
        form={formId}
        color={color}
        loading={pending}
        disabled={actionDisabled}
        data-slot="alert-dialog-action"
      >
        {actionLabel}
      </Button>
    </>
  );
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
        hideCloseButton
        autoFocus={autoFocus}
        actions={
          placed > 0 ? undefined : (
            <>
              {/* 中身がないときは、送信の先になる form を下の操作の中に置く（隠す。並びの隙間にもならない） */}
              {children == null && <form id={formId} hidden onSubmit={submit} />}
              {buttons}
            </>
          )
        }
      >
        {children == null ? null : (
          <form id={formId} data-slot="alert-dialog-form" onSubmit={submit}>
            <AlertDialogActionsContext value={{ buttons, placed: placed > 0, register }}>
              {children}
            </AlertDialogActionsContext>
          </form>
        )}
      </Dialog>
    </OverlayRoleContext>
  );
}

export interface AlertDialogActionsProps extends Omit<ComponentProps<'div'>, 'children'> {
  /** 帯（div）に付きます */
  className?: string;
}

/**
 * AlertDialog の 2 つのボタン（取り消す側と実行する側）を、中身の中の置いた場所に描く帯。見た目は下の帯と同じです。
 * ボタンの文言・色・押したときの処理は AlertDialog の props で決めます。中身の最後に 1 つだけ置きます
 */
export function AlertDialogActions(props: AlertDialogActionsProps) {
  const alert = use(AlertDialogActionsContext);
  const register = alert?.register;
  useLayoutEffect(() => register?.(), [register]);
  const outside = alert == null;
  useEffect(() => {
    if (outside) warnOnce('AlertDialogActions は AlertDialog の中身に置きます');
  }, [outside]);
  if (!alert) return null;
  return (
    <OverlayActions name="AlertDialogActions" {...props}>
      {alert.placed && alert.buttons}
    </OverlayActions>
  );
}
