import { Field as BaseField } from '@base-ui/react/field';
import { type ComponentProps, cloneElement, isValidElement, type ReactNode, useId } from 'react';

import {
  type CaptionPlacement,
  Field,
  type FieldLoadingBehavior,
  type FieldLoadingIndicator,
  FieldLoadingBar,
  FieldSpinner,
} from './Field';
import { FieldAddon } from './FieldAddon';
import { type AddonShape, FieldAddonDisabled } from './field-addon-context';
import { controlBox } from './field-styles';

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
  /** キャプションの場所。既定は top（ラベルと本体のあいだ）。bottom は本体の下（design/adr/0041） */
  captionPlacement?: CaptionPlacement;
  /** エラーの内容。本体の下に丸の「!」と赤い文字で出し、欄をエラーの状態にする */
  error?: ReactNode;
  /** 警告の内容。本体の下に三角とオリーブ色の文字で出す。欄の見た目は変えない。error と両方あるときは、エラーの行の下に出す */
  warning?: ReactNode;
  className?: string;
  /** 入力欄の前に付くもの。文字を渡すとグレーのラベルになる。ボタンは FieldAddonButton を渡す */
  prefix?: ReactNode;
  /** 入力欄の後ろに付くもの。文字を渡すとグレーのラベルになる。ボタンは FieldAddonButton を渡す */
  suffix?: ReactNode;
  /** prefix・suffix の形。既定は attached（本体の端に接する）、floating は本体の内側に浮かせる */
  addonShape?: AddonShape;
  /** 待っている（値を確かめているなど）。印を出し、aria-busy を付ける（design/adr/0042） */
  loading?: boolean;
  /**
   * 待っているあいだの欄の扱い。既定は non-blocking（書き換えられる）
   * blocking: 押せない欄と同じ見た目にし、書き換えられない（readOnly・aria-disabled）。フォーカスは外さず、枠線と印は薄くしない
   */
  loadingBehavior?: FieldLoadingBehavior;
  /** 待っているあいだの印。既定は spinner（右端に回る円。suffix の前）。bar は下端に流れる線 */
  loadingIndicator?: FieldLoadingIndicator;
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
  // 止めているあいだは、Disabled と同じく書き換えられない。disabled 属性は付けないので、フォーカスは外れない
  const blocking = loading && loadingBehavior === 'blocking';
  const before = renderAddon(prefix, `${id}prefix`);
  const after = renderAddon(suffix, `${id}suffix`);
  // 説明は prefix → suffix → 渡された説明 → キャプション → エラー → 警告の順（design/adr/0040・0041）
  // キャプションとエラー・警告の id は Field から見た目の順で受け取る（Base UI も後ろに足すが、重なった id は1回だけ）
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
      disabled={disabled}
      loading={loading}
      loadingBehavior={loadingBehavior}
      className={className}
    >
      {(messageIds) => (
        /* 余白は input 側に持たせ、欄のどこを押しても入力できるようにする（prefix・suffix の文字を押しても入力できる）
           待っているあいだの印（design/adr/0042）は input と suffix のあいだに置く。回る円は右端（suffix の前）、
           線は本体の下端（本体を位置の基準にする）。prefix・suffix が最初と最後の子のままになるよう、間に置く */
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
            {after.addon}
          </FieldAddonDisabled>
        </div>
      )}
    </Field>
  );
}
