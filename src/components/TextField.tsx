import { Field as BaseField } from '@base-ui/react/field';
import { type ComponentProps, cloneElement, isValidElement, type ReactNode, useId } from 'react';

import {
  type CaptionPlacement,
  Field,
  type FieldLoadingBehavior,
  FieldLoadingBar,
  FieldSpinner,
  FieldSuccessMark,
} from './Field';
import { FieldAddon } from './FieldAddon';
import { type AddonShape, FieldAddonDisabled } from './field-addon-context';
import { controlBox } from './field-styles';
import { useFormSubmittingLock } from './form-context';
import type { LoadingIndicator } from './Loading';

// 文字はグレーのラベルで包み、要素（FieldAddonButton など）はそのまま置く
// 文字（FieldAddon）は入力欄の説明（aria-describedby）につなぎ、文字そのものは読み上げから外す（aria-hidden — design/adr/0040）
//   Tab キーで入ったときに「https://」などが伝わり、前から順に読んでも1回だけ読まれる
//   ボタンはそれ自体にフォーカスが止まるので、つながない。FieldAddon に aria-hidden を渡したときは、読み上げは呼び出し側に任せ、つながない
function renderAddon(
  node: ReactNode,
  fallbackId: string
): { addon: ReactNode; describedBy?: string } {
  if (node == null || node === false) return { addon: null };
  if (typeof node === 'string' || typeof node === 'number') {
    return {
      addon: (
        <FieldAddon id={fallbackId} aria-hidden>
          {node}
        </FieldAddon>
      ),
      describedBy: fallbackId,
    };
  }
  if (
    isValidElement<ComponentProps<typeof FieldAddon>>(node) &&
    node.type === FieldAddon &&
    node.props['aria-hidden'] == null
  ) {
    const id = node.props.id ?? fallbackId;
    return { addon: cloneElement(node, { id, 'aria-hidden': true }), describedBy: id };
  }
  return { addon: node };
}

export interface TextFieldProps extends Omit<
  ComponentProps<typeof BaseField.Control>,
  'className' | 'render' | 'prefix'
> {
  label: ReactNode;
  /** 補足（ヘルプテキスト）。エラー・警告のあいだも消えない */
  caption?: ReactNode;
  /**
   * キャプションの場所。top はラベルと本体のあいだ、bottom は本体の下（design/adr/0041）
   * @default 'top'
   */
  captionPlacement?: CaptionPlacement;
  /** エラーの内容。本体の下に丸の「!」と赤い文字で出し、欄をエラーの状態にする */
  error?: ReactNode;
  /** 警告の内容。本体の下に三角とオリーブ色の文字で出す。欄の見た目は変えない。error と両方あるときは、エラーの行の下に出す */
  warning?: ReactNode;
  /**
   * 成功の内容（「使えるユーザー名です」など）。本体の下に丸のチェックと緑の文字で出し、欄の右端（回る円の場所）にもチェックを置きます。
   * 欄の枠線は変えません。error があるときは、欄の見た目はエラーを優先します
   */
  success?: ReactNode;
  /**
   * 成功のとき、欄の右端にチェックを置くか。false では下の行だけを出します
   * @default true
   */
  successMark?: boolean;
  /** 情報の内容（「全角の数字を半角に直しました」など）。本体の下に丸の「i」と青い文字で出す。欄の見た目は変えない */
  info?: ReactNode;
  className?: string;
  /** 入力欄の前に付くもの。文字を渡すとグレーのラベルになる。ボタンは FieldAddonButton を渡す */
  prefix?: ReactNode;
  /**
   * 入力欄の後ろに付くもの。文字を渡すとグレーのラベルになる。ボタンは FieldAddonButton を渡す。
   * suffix のボタンは、パスワードの表示・非表示のように入力欄そのものを操作するものに限ります。
   * 検索のように値を送るボタンは、欄の外に色付き・枠線のボタンとして置きます（design/adr/0024）
   */
  suffix?: ReactNode;
  /**
   * prefix・suffix の形。attached は本体の端に接する塊、floating は本体の内側に 4px 浮かせます。
   * floating は、欄の外形を入力欄だけのときと同じにしたいときや、グレーを軽く見せたいときに使います（design/adr/0035）
   * @default 'attached'
   */
  addonShape?: AddonShape;
  /**
   * 待っている（値を確かめている・送っているなど）。印を出し、aria-busy を付けます（design/adr/0042）
   * フォーム全体を送っているあいだは、欄ごとに渡さず、Form の submitting を使います
   * @default false
   */
  loading?: boolean;
  /**
   * 待っているあいだの欄の扱い（design/adr/0042）
   * non-blocking は書き換えられたままにします。blocking は押せない欄と同じ見た目にし、
   * 書き換えられなくします（readOnly・aria-disabled）。どちらもフォーカスは外さず、枠線と印は薄くしません
   * @default 'non-blocking'
   */
  loadingBehavior?: FieldLoadingBehavior;
  /**
   * 待っているあいだの印。spinner は右端（suffix の前）に回る円、bar は下端に流れる線です
   * @default 'spinner'
   */
  loadingIndicator?: LoadingIndicator;
}

/**
 * 1行のテキスト入力
 */
export function TextField({
  label,
  caption,
  captionPlacement,
  error,
  warning,
  success,
  successMark = true,
  info,
  disabled,
  className,
  prefix,
  suffix,
  addonShape = 'attached',
  loading = false,
  loadingBehavior = 'non-blocking',
  loadingIndicator = 'spinner',
  readOnly,
  'aria-describedby': ariaDescribedBy,
  'aria-disabled': ariaDisabled,
  'aria-busy': ariaBusy,
  ...props
}: TextFieldProps) {
  const id = useId();
  // Form の送信中（後半の軸 38）。blocking では、値を確かめるときの止める形と同じ見た目にし、書き換えを止める
  const formLock = useFormSubmittingLock();
  // 止めているあいだは、Disabled と同じく書き換えられない。disabled 属性は付けないので、フォーカスは外れない
  const blocking = (loading && loadingBehavior === 'blocking') || formLock.blocking;
  const before = renderAddon(prefix, `${id}prefix`);
  const after = renderAddon(suffix, `${id}suffix`);
  // 説明は prefix → suffix → 渡された説明 → キャプション → エラー → 警告 → 成功 → 情報の順（design/adr/0040・0041）
  // キャプションと本体の下の行の id は Field から見た目の順で受け取る（Base UI も後ろに足すが、重なった id は1回だけ）
  const describe = (messageIds: string | undefined) =>
    [before.describedBy, after.describedBy, ariaDescribedBy, messageIds]
      .filter(Boolean)
      .join(' ') || undefined;
  return (
    <Field
      label={label}
      caption={caption}
      captionPlacement={captionPlacement}
      error={error}
      warning={warning}
      success={success}
      info={info}
      disabled={disabled}
      loading={loading}
      loadingBehavior={loadingBehavior}
      className={className}
    >
      {(messageIds) => (
        /* 余白は input 側に持たせ、欄のどこを押しても入力できるようにする（prefix・suffix の文字を押しても入力できる）
           待っているあいだの印（design/adr/0042）は input と suffix のあいだに置く。回る円は右端（suffix の前）、
           線は本体の下端（本体を位置の基準にする）。prefix・suffix が最初と最後の子のままになるよう、間に置く
           成功のチェック（軸 37）も、回る円と同じ場所に置く。待っているあいだは回る円を優先する */
        <div
          data-slot="control"
          data-addon-shape={addonShape}
          className={controlBox({ className: ['gap-0 px-0', loading && 'relative'] })}
          onMouseDown={(event) => {
            if (
              event.target instanceof Element &&
              event.target.closest('[data-slot="field-addon"]')
            ) {
              event.preventDefault();
              event.currentTarget.querySelector('input')?.focus();
            }
          }}
        >
          <FieldAddonDisabled value={!!disabled}>
            {before.addon}
            <BaseField.Control
              className={[
                'h-full w-full min-w-0 bg-transparent px-[calc(var(--space-control-x)-var(--field-border-width))] outline-none placeholder:text-fg-subtle disabled:cursor-not-allowed',
                blocking && 'cursor-progress',
              ]
                .filter(Boolean)
                .join(' ')}
              disabled={disabled}
              readOnly={blocking || readOnly}
              aria-disabled={blocking || ariaDisabled}
              aria-busy={loading || ariaBusy}
              aria-describedby={describe(messageIds)}
              {...props}
            />
            {loading && loadingIndicator === 'spinner' && (
              <FieldSpinner className="pr-[calc(var(--space-control-x)-var(--field-border-width))]" />
            )}
            {loading && loadingIndicator === 'bar' && <FieldLoadingBar />}
            {success && successMark && !error && !loading && (
              <FieldSuccessMark className="pr-[calc(var(--space-control-x)-var(--field-border-width))]" />
            )}
            {after.addon}
          </FieldAddonDisabled>
        </div>
      )}
    </Field>
  );
}
