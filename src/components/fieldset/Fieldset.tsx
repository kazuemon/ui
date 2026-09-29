'use client';

import { Fieldset as BaseFieldset } from '@base-ui/react/fieldset';
import { type ComponentProps, type ReactNode, useContext, useId, useMemo } from 'react';

import { FieldMessageLine, type MessageKind } from '../../internal/field/Field';
import { fieldStyles } from '../../internal/field/field-styles';
import { FieldsetContext, withFieldsetErrors } from '../../internal/field/fieldset-context';
import type { FieldMessage, FieldNamed } from '../../internal/field/input-field-props';
import { headingStyles } from '../../internal/reading/heading';
import { tv } from '../../internal/tv';
import type { HeadingSize } from '../heading/Heading';

// 欄のまとまり（原則4: 見出し / ヘルプテキスト / ステータスメッセージ / 中の欄）
// 見出しは本文の大きさの太字で、中の欄のラベルより一段強い。大きさは Heading と同じ段（labelSize）で選べる（design/adr/0371）
// 囲み方は、囲まないが既定。枠（カードのような薄いフチ）と、中の欄だけを縦線で字下げする形も選べる（design/adr/0370）
// まとまりのエラーは見出しの下に出し、中の欄をすべてエラーの見た目にする。囲みの線の色は変えない（design/adr/0372）
const fieldset = tv({
  slots: {
    root: 'm-0 flex min-w-0 flex-col gap-(--spacing-field-gap) border-0 p-0',
    // 見出し・ヘルプテキスト・ステータスメッセージ。行の箱は上の間を自分で打ち消す（Field と同じ）
    //   まとまりの行の間に足して、中の欄までを --stack-gap-md にする
    head: 'mb-[calc(var(--stack-gap-md)-var(--spacing-field-gap))] flex flex-col gap-(--spacing-field-gap)',
    legend: 'font-bold text-fg',
    body: 'flex min-w-0 flex-col gap-(--stack-gap-lg)',
  },
  variants: {
    variant: {
      plain: {},
      // 原則5: 包むものは部品より一段大きい角。線は細い境界線、影なし（原則1: ページと同じレイヤー）
      framed: {
        root: 'rounded-card border-(length:--border-width-thin) border-solid border-line p-(--spacing-control-x)',
      },
      indented: {
        body: 'border-s-(length:--border-width-thin) border-solid border-line ps-(--spacing-control-x)',
      },
    },
    // 見出しの大きさ。Heading の size と同じ段のクラス列（ADR-0369）
    labelSize: {
      md: { legend: headingStyles.size.md },
      lg: { legend: headingStyles.size.lg },
      xl: { legend: headingStyles.size.xl },
      '2xl': { legend: headingStyles.size['2xl'] },
      '3xl': { legend: headingStyles.size['3xl'] },
      '4xl': { legend: headingStyles.size['4xl'] },
      '5xl': { legend: headingStyles.size['5xl'] },
    },
  },
  defaultVariants: { variant: 'plain', labelSize: 'md' },
});

/** Fieldset の囲み方。plain は囲まない、framed は枠で囲む、indented は中の欄だけを左の縦線で字下げする */
export type FieldsetVariant = 'plain' | 'framed' | 'indented';

/** Fieldset の props から、label・accessibleName の組み合わせの決まりを外したもの */
export interface FieldsetBaseProps extends Omit<ComponentProps<'fieldset'>, 'children'> {
  /** まとまりの見出し。まとまり（fieldset）の名前として読み上げます */
  label?: ReactNode;
  /** 読み上げだけの名前。見える見出しを置かないときに要ります */
  accessibleName?: string;
  /**
   * 見出しの大きさ。Heading の size と同じ段の名前で、md が本文と同じ大きさです。
   * 太さはどの段でも太字です。フォームの中の節として大きく見せたいときに上げます
   * @default 'md'
   */
  labelSize?: HeadingSize;
  /** 見出しの補足（ヘルプテキスト）。見出しのすぐ下に出し、まとまりの説明として読み上げます */
  caption?: ReactNode;
  /**
   * まとまり全体のエラー（「チェックアウトはチェックインより後の日にしてください」のような、欄どうしを照らし合わせた結果）。
   * 見出しの下に丸の「!」と赤い文字で出し、中の欄をすべてエラーの見た目にします。
   * 1 つの欄だけのエラーは、その欄の errorText に渡します
   */
  errorText?: FieldMessage;
  /** まとまり全体の警告。見出しの下に三角とオリーブ色の文字で出します。中の欄の見た目は変えません */
  warningText?: FieldMessage;
  /** まとまり全体の情報。見出しの下に丸の「i」と青い文字で出します。中の欄の見た目は変えません */
  infoText?: FieldMessage;
  /**
   * 囲み方。plain は囲まず、見出しと間だけでまとめます。framed はカードのような薄いフチで見出しごと囲みます。
   * indented は見出しを左端に残し、中の欄だけを左の縦線で字下げします
   * @default 'plain'
   */
  variant?: FieldsetVariant;
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

// 見出し・ヘルプテキストは、空の文字も「ない」とみなす（空の要素を名前や説明につながない）
const present = (value: ReactNode) =>
  value !== undefined && value !== null && value !== false && value !== '';

/**
 * いくつかの欄を、1 つの問いのまとまりにします（住所、宿泊の期間など）。
 * 見出しはまとまりの名前として、ヘルプテキストとステータスメッセージはまとまりの説明として読み上げます。
 * errorText は欄どうしを照らし合わせたエラーで、中の欄をすべてエラーの見た目にします。
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
    variant,
    labelSize,
    disabled = false,
    className,
    children,
    id: idProp,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    ...rest
  } = props as FieldsetBaseProps;
  const s = fieldset({ variant, labelSize });
  const f = fieldStyles();
  const id = useId();
  const captionId = `${id}-caption`;
  // 見出しの id は自分で決めて根につなぐ。Base UI は描いたあとで見出しを登録するので、サーバーで描いた HTML に名前が入らない
  const legendId = `${id}-legend`;
  // 行を開くかは FieldMessageLine と同じ判定（空の文字では開かない）
  const invalid = Boolean(errorText);
  const parent = useContext(FieldsetContext);
  // まとまりのエラーは、中の欄の説明にもつなぐ（欄にじかにフォーカスしても理由が聞こえる — design/adr/0372）
  const context = useMemo(
    () => ({
      disabled: parent.disabled || disabled,
      invalid: parent.invalid || invalid,
      errorIds: withFieldsetErrors(parent.errorIds, invalid ? `${id}-error` : undefined),
    }),
    [parent.disabled, parent.invalid, parent.errorIds, disabled, invalid, id]
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
    ...lines.filter(([, content]) => Boolean(content)).map(([kind]) => `${id}-${kind}`),
    ariaDescribedBy,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <FieldsetContext value={context}>
      <BaseFieldset.Root
        {...rest}
        // Form のエラーの一覧が、まとまりのエラーのリンクの先にする
        id={idProp ?? `${id}-fieldset`}
        disabled={disabled}
        aria-labelledby={hasLabel ? legendId : undefined}
        aria-label={hasLabel ? undefined : (accessibleName ?? ariaLabel)}
        aria-describedby={describedBy || undefined}
        data-slot="fieldset"
        data-invalid={invalid ? '' : undefined}
        className={s.root({ className })}
      >
        {hasLabel || hasCaption ? (
          <div className={s.head()}>
            {hasLabel && (
              // Form のエラーの一覧が、まとまりの名前として読む（form-dom.ts）
              <BaseFieldset.Legend id={legendId} data-slot="fieldset-legend" className={s.legend()}>
                {label}
              </BaseFieldset.Legend>
            )}
            {hasCaption && (
              <p id={captionId} className={f.caption({ className: 'm-0' })}>
                {caption}
              </p>
            )}
            {messages}
          </div>
        ) : (
          // 見出しもヘルプテキストもないときは、行を中の欄の上にじかに置く（閉じた行は高さを持たない）
          messages
        )}
        <div
          className={s.body({
            // 見出しなしで行が開いているときも、行から中の欄までを見出しのあるときと同じ間にする
            className:
              !hasLabel && !hasCaption && lines.some(([, content]) => Boolean(content))
                ? 'mt-[calc(var(--stack-gap-md)-var(--spacing-field-gap))]'
                : undefined,
          })}
        >
          {children}
        </div>
      </BaseFieldset.Root>
    </FieldsetContext>
  );
}
