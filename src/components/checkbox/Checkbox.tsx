'use client';

import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';
import { Field as BaseField } from '@base-ui/react/field';
import { type ComponentProps, type ReactNode, useContext, useId } from 'react';

import { ChoiceGroupContext } from '../../internal/choice/choice-group-context';
import {
  type ChoiceColor,
  choiceMessagePull,
  choiceReadOnly,
  choiceRows,
  choiceStyles,
} from '../../internal/choice/choice-styles';
import { FieldMessageLine } from '../../internal/field/Field';
import { FieldMark, type FieldMarkProps } from '../../internal/field/FieldMark';
import { useChoiceLock } from '../../internal/form-context';

export type { ChoiceColor } from '../../internal/choice/choice-styles';

// 1つだけ置くチェックボックスの行。上下の行が行の余白（--choice-row-pad-y — design/adr/0101）。最後の2行がエラー・警告の行
//   エラー・警告の行は、最後の2行に置く（位置を決めないと、上の余白の空いた行に入ってしまう）
const soloRows = (caption: ReactNode) =>
  caption
    ? 'grid-rows-[var(--choice-row-pad-y)_auto_auto_var(--choice-row-pad-y)_auto_auto]'
    : 'grid-rows-[var(--choice-row-pad-y)_auto_var(--choice-row-pad-y)_auto_auto]';

// チェック（✓）と中間の横線。線の太さは画面の px（--checkbox-mark-width）で、箱の大きさによらない
function CheckboxMark() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-full"
      style={{ strokeWidth: 'var(--checkbox-mark-width)' }}
    >
      <polyline
        points="4 8.5 6.75 11.25 12 5.5"
        vectorEffect="non-scaling-stroke"
        className="group-data-indeterminate/box:hidden"
      />
      <line
        x1="4.5"
        y1="8"
        x2="11.5"
        y2="8"
        vectorEffect="non-scaling-stroke"
        className="hidden group-data-indeterminate/box:inline"
      />
    </svg>
  );
}

export interface CheckboxProps
  extends
    Omit<ComponentProps<typeof BaseCheckbox.Root>, 'className' | 'render' | 'color' | 'parent'>,
    FieldMarkProps {
  /** 箱の横の文字。押しても切り替わります（本体の一部）。押せないときは箱と一緒にグレーになります */
  label: ReactNode;
  /** 横の文字の下の説明。押せないときも読めるままです */
  caption?: ReactNode;
  /**
   * 選んだときの色。利用者が選ぶ primary・secondary に加え、色を持たない neutral（濃いグレー）を選べます（原則6）。
   * 選んでいない箱は、色を指定していてもトグルの OFF と同じグレーです。CheckboxGroup の中では、指定しなければグループの color になります
   * @default 'neutral'
   */
  color?: ChoiceColor;
  /**
   * エラーの内容。1つだけ置くとき（同意など）に使います。箱の行の下に丸の「!」と赤い文字で出し、選んでいない箱の塗りを淡い赤にします。
   * 行は箱の説明（aria-describedby）につなぎ、読み上げと出る・消える動きは入力欄と同じです。
   * Form で送信したときは、エラーのある最初の欄としてこの箱にフォーカスが移ります。
   * CheckboxGroup の中では使いません（グループの error を使います）
   */
  error?: ReactNode;
  /**
   * 警告の内容。1つだけ置くときに使います。箱の行の下に三角とオリーブ色の文字で出します。箱の見た目は変えません。
   * error と両方あるときは、エラーの行が上です。CheckboxGroup の中では使いません（グループの warning を使います）
   */
  warning?: ReactNode;
  /**
   * 必須にします。1つだけ置くとき（同意など）に使い、箱に aria-required を付けます（読み上げで必須と伝わります）。
   * 横の文字の後ろに印（既定は「必須」のタグ）も出ます。印は読み上げから外れます。
   * CheckboxGroup の必須は、グループの required と caption の文で書きます
   * @default false
   */
  required?: boolean;
  /**
   * 読み取り専用にします。箱は押せないとき（`disabled`）と同じ見た目になりますが、横の文字は本文の色のままです。
   * フォーカスでき、読み上げでは「読み取り専用」と伝わります。押してもキーボードでも値は変わらず、hover や押したときの変化も出ません。
   * フォームでは値が送られます（押せない箱は送られません）。CheckboxGroup の readOnly を渡すと、中の箱がすべて読み取り専用になります
   * @default false
   */
  readOnly?: boolean;
  className?: string;
}

/**
 * チェックボックス。箱と横の文字（とキャプション）を並べる。横の文字を押しても切り替わる
 * 1つだけ置くとき（同意など）はそのまま、複数を1つの問いにまとめるときは CheckboxGroup の中に置く
 * 中間の状態は indeterminate で表します。「すべて選ぶ」の箱は、CheckboxGroup の selectAll で部品が持ちます
 */
export function Checkbox(props: CheckboxProps) {
  return <CheckboxBase {...props} />;
}

// parent: CheckboxGroup の「すべて選ぶ」の箱（Base UI の親の箱）。部品の中だけで使う
export function CheckboxBase({
  label,
  caption,
  color,
  error,
  warning,
  className,
  disabled,
  readOnly,
  required,
  requiredMark,
  optionalMark,
  parent,
  'aria-describedby': ariaDescribedBy,
  'aria-disabled': ariaDisabled,
  ...props
}: CheckboxProps & { parent?: boolean }) {
  const group = useContext(ChoiceGroupContext);
  const id = useId();
  const solo = !group;
  const s = choiceStyles({ color: color ?? group?.color, layout: solo ? 'solo' : 'item' });
  // Form の送信中と読み取り専用（軸 177）は、どちらも押せない箱と同じ見た目にして切り替えを止める
  // 読み取り専用はグループ（CheckboxGroup の readOnly）からも来る
  const locked = useChoiceLock(disabled, readOnly ?? group?.readOnly);
  // 読み取り専用では、横の文字を本文の色に戻す（箱は押せないときと同じ見た目のまま — 軸 177）
  const labelReadOnly = locked.readOnlyLook ? choiceReadOnly.label : undefined;
  const box = (describedBy: string | undefined) => (
    <BaseCheckbox.Root
      disabled={disabled}
      readOnly={locked.readOnly}
      aria-disabled={locked.ariaDisabled || ariaDisabled}
      parent={parent}
      required={required}
      aria-describedby={describedBy}
      className={s.box({
        className: ['rounded-(--checkbox-radius)', locked.readOnlyLook && choiceReadOnly.box],
      })}
      {...locked.data}
      {...props}
    >
      <BaseCheckbox.Indicator className={s.mark()}>
        <CheckboxMark />
      </BaseCheckbox.Indicator>
    </BaseCheckbox.Root>
  );
  // グループの中では Field.Item（横の文字とキャプションをこの箱に結ぶ）
  if (!solo) {
    return (
      <BaseField.Item
        disabled={disabled}
        className={s.item({ className: [choiceRows(caption), className] })}
      >
        {box(ariaDescribedBy)}
        <BaseField.Label className={s.label({ className: labelReadOnly })}>
          {label}
          <FieldMark required={required} requiredMark={requiredMark} optionalMark={optionalMark} />
        </BaseField.Label>
        {caption && (
          <BaseField.Description className={s.caption()}>{caption}</BaseField.Description>
        )}
      </BaseField.Item>
    );
  }
  // 1つだけ置くときは自分の Field.Root。エラー・警告の行（入力欄と同じ — design/adr/0041・0044）を箱の行の下に置き、
  // 箱の説明を見た目の順（キャプション → エラー → 警告）でつなぐ
  // data-slot="field-label": Form のエラーの一覧が、欄の名前として読む（Field と同じ）
  const ids = { caption: `${id}caption`, error: `${id}error`, warning: `${id}warning` };
  const describedBy =
    [ariaDescribedBy, caption && ids.caption, error && ids.error, warning && ids.warning]
      .filter(Boolean)
      .join(' ') || undefined;
  return (
    <BaseField.Root
      disabled={disabled}
      invalid={error ? true : undefined}
      className={s.item({
        className: [soloRows(caption), ...choiceMessagePull, className],
      })}
    >
      {box(describedBy)}
      <BaseField.Label data-slot="field-label" className={s.label({ className: labelReadOnly })}>
        {label}
        <FieldMark required={required} requiredMark={requiredMark} optionalMark={optionalMark} />
      </BaseField.Label>
      {caption && (
        <BaseField.Description id={ids.caption} className={s.caption()}>
          {caption}
        </BaseField.Description>
      )}
      <FieldMessageLine
        kind="error"
        content={error}
        id={ids.error}
        className={s.message({ className: 'row-start-[-3]' })}
      />
      <FieldMessageLine
        kind="warning"
        content={warning}
        id={ids.warning}
        className={s.message({ className: 'row-start-[-2]' })}
      />
    </BaseField.Root>
  );
}
