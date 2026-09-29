'use client';

import { Fieldset as BaseFieldset } from '@base-ui/react/fieldset';
import { type ComponentProps, type ReactNode, useContext, useId, useMemo } from 'react';

import { FieldMessageLine, type MessageKind } from '../../internal/field/Field';
import { fieldStyles } from '../../internal/field/field-styles';
import { FieldsetContext } from '../../internal/field/fieldset-context';
import type { FieldMessage, FieldNamed } from '../../internal/field/input-field-props';
import { tv } from '../../internal/tv';

// 欄のまとまり（原則4: 見出し / 中の欄 / ヘルプテキスト・ステータスメッセージ）。見出しは中の欄のラベルより一段強くする
// 囲み方と見出しの強さは部品のトークン（--fieldset-*）で決める（軸 389・390 で比べている途中）
// まとまり全体のステータスメッセージの置き場所と、エラーのときの線の色は軸 391 で比べている途中
const fieldset = tv({
  slots: {
    root: [
      'm-0 flex min-w-0 flex-col gap-(--spacing-field-gap) border-solid',
      'border-(color:--fieldset-line) data-invalid:border-(color:--fieldset-line-invalid)',
      '[border-width:var(--fieldset-border-top)_var(--fieldset-border-side)_var(--fieldset-border-bottom)]',
      'rounded-(--fieldset-radius) px-(--fieldset-pad-x) pt-(--fieldset-pad-top) pb-(--fieldset-pad-bottom)',
    ],
    // 見出し・ヘルプテキスト（と、上に置くときのステータスメッセージ）。行の箱は上の間を自分で打ち消す（Field と同じ）
    //   まとまりの間（行の間）に足して、中の欄までを --fieldset-gap にする
    head: 'mb-[calc(var(--fieldset-gap)-var(--spacing-field-gap))] flex flex-col gap-(--spacing-field-gap)',
    legend: [
      'text-(length:--fieldset-legend-size) leading-(--fieldset-legend-leading)',
      'font-(weight:--fieldset-legend-weight) text-(color:--fieldset-legend-color)',
    ],
    body: [
      'flex min-w-0 flex-col gap-(--fieldset-stack-gap)',
      'border-0 border-s-(length:--fieldset-rule-start) border-solid border-(color:--fieldset-line) ps-(--fieldset-indent)',
      'group-data-invalid/fieldset:border-(color:--fieldset-line-invalid)',
    ],
  },
});

/** まとまり全体のステータスメッセージの場所。bottom は中の欄の下、top は見出し（とヘルプテキスト）の下 */
export type FieldsetMessagePlacement = 'top' | 'bottom';

/** Fieldset の props から、label・accessibleName の組み合わせの決まりを外したもの */
export interface FieldsetBaseProps extends Omit<ComponentProps<'fieldset'>, 'children'> {
  /** まとまりの見出し。まとまり（fieldset）の名前として読み上げます */
  label?: ReactNode;
  /** 読み上げだけの名前。見える見出しを置かないときに要ります */
  accessibleName?: string;
  /** 見出しの補足（ヘルプテキスト）。見出しのすぐ下に出し、まとまりの説明として読み上げます */
  caption?: ReactNode;
  /**
   * まとまり全体のエラー（「開始日は終了日より前にしてください」など、1 つの欄に帰せないもの）。
   * 丸の「!」と赤い文字で出します。1 つの欄のエラーは、その欄の errorText に渡します
   */
  errorText?: FieldMessage;
  /** まとまり全体の警告。三角とオリーブ色の文字で出します */
  warningText?: FieldMessage;
  /** まとまり全体の情報。丸の「i」と青い文字で出します */
  infoText?: FieldMessage;
  /**
   * ステータスメッセージの場所（軸 391 で比べている途中）
   * @default 'bottom'
   */
  messagePlacement?: FieldsetMessagePlacement;
  /** エラーのとき、中の欄もすべてエラーの見た目にする（軸 391 の比較のためだけ。決まったら消す） */
  invalidFields?: boolean;
  /**
   * まとまりごと押せない（Disabled）状態にします。中の欄とボタンがすべて押せなくなります
   * @default false
   */
  disabled?: boolean;
  /** 中に置く欄。縦に並べます。ラベルを横に置いて列をそろえるときは、FieldGroup を置きます */
  children?: ReactNode;
}

/** Fieldset の props。label か accessibleName のどちらかが要ります */
export type FieldsetProps = FieldNamed<FieldsetBaseProps>;

const present = (value: ReactNode) => value !== undefined && value !== null && value !== false;

/**
 * いくつかの欄を、1 つの問いのまとまりにします（住所、支払い方法など）。
 * 見出しはまとまりの名前として、ヘルプテキストとステータスメッセージはまとまりの説明として読み上げます。
 * disabled を渡すと、中の欄をまとめて押せなくします
 */
export function Fieldset(props: FieldsetProps) {
  const {
    label,
    accessibleName,
    caption,
    errorText,
    warningText,
    infoText,
    messagePlacement = 'bottom',
    invalidFields = false,
    disabled = false,
    className,
    children,
    'aria-describedby': ariaDescribedBy,
    ...rest
  } = props as FieldsetBaseProps;
  const s = fieldset();
  const f = fieldStyles();
  const id = useId();
  const captionId = `${id}-caption`;
  const invalid = present(errorText);
  const parent = useContext(FieldsetContext);
  const context = useMemo(
    () => ({
      disabled: parent.disabled || disabled,
      invalid: parent.invalid || (invalid && invalidFields),
    }),
    [parent.disabled, parent.invalid, disabled, invalid, invalidFields]
  );
  const hasLabel = present(label);
  const hasCaption = present(caption);
  // 行は見た目の順（エラー → 警告 → 情報）。開いている行だけを説明につなぐ
  const lines: [MessageKind, FieldMessage | undefined][] = [
    ['error', errorText],
    ['warning', warningText],
    ['info', infoText],
  ];
  const messages = lines.map(([kind, content]) => (
    <FieldMessageLine key={kind} kind={kind} content={content} id={`${id}-${kind}`} />
  ));
  const describedBy = [
    hasCaption ? captionId : undefined,
    ...lines.filter(([, content]) => present(content)).map(([kind]) => `${id}-${kind}`),
    ariaDescribedBy,
  ]
    .filter(Boolean)
    .join(' ');
  const top = messagePlacement === 'top';
  return (
    <FieldsetContext value={context}>
      <BaseFieldset.Root
        {...rest}
        disabled={disabled}
        aria-label={hasLabel ? undefined : accessibleName}
        aria-describedby={describedBy || undefined}
        data-slot="fieldset"
        data-invalid={invalid ? '' : undefined}
        className={s.root({ className: ['group/fieldset', className].filter(Boolean).join(' ') })}
      >
        {(hasLabel || hasCaption || top) && (
          <div className={s.head()}>
            {hasLabel && <BaseFieldset.Legend className={s.legend()}>{label}</BaseFieldset.Legend>}
            {hasCaption && (
              <p id={captionId} className={f.caption({ className: 'm-0' })}>
                {caption}
              </p>
            )}
            {top && messages}
          </div>
        )}
        <div className={s.body()}>{children}</div>
        {!top && messages}
      </BaseFieldset.Root>
    </FieldsetContext>
  );
}
