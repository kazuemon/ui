'use client';

import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';
import { Field as BaseField } from '@base-ui/react/field';
import { type ComponentProps, type ReactNode, type Ref, useContext, useId } from 'react';

import { CheckboxMark } from '../../internal/choice/CheckboxMark';
import { ChoiceGroupContext } from '../../internal/choice/choice-group-context';
import {
  type ChoiceColor,
  choiceMessagePull,
  choiceReadOnly,
  choiceRows,
  choiceStyles,
} from '../../internal/choice/choice-styles';
import { type FieldValidate, type FieldValidationMode } from '../../internal/field/Field';
import { fieldMessageIds } from '../../internal/field/field-messages';
import { FieldsetContext } from '../../internal/field/fieldset-context';
import { SoloFieldValidity } from '../../internal/field/SoloFieldValidity';
import { FieldMark, type FieldMarkProps } from '../../internal/field/FieldMark';
import type { FieldMessage } from '../../internal/field/input-field-props';
import { useAppInvalid, useChoiceLock } from '../../internal/form-context';

export type {
  ChoiceColor,
  ChoiceGroupDirection,
  ChoiceGroupItemWidth,
} from '../../internal/choice/choice-styles';

// 1つだけ置くチェックボックスの行。上下の行が行の余白（--choice-row-pad-y — design/adr/0101）。最後の3行がエラー・警告・情報の行
//   下の行は、最後の3行に置く（位置を決めないと、上の余白の空いた行に入ってしまう）
const soloRows = (caption: ReactNode) =>
  caption
    ? 'grid-rows-[var(--choice-row-pad-y)_auto_auto_var(--choice-row-pad-y)_auto_auto_auto_auto]'
    : 'grid-rows-[var(--choice-row-pad-y)_auto_var(--choice-row-pad-y)_auto_auto_auto_auto]';

export interface CheckboxProps
  extends
    Omit<
      ComponentProps<'span'>,
      'color' | 'onChange' | 'defaultChecked' | 'defaultValue' | 'children'
    >,
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
  /** 選んでいるか（制御） */
  checked?: boolean;
  /** はじめに選んでいるか（非制御） */
  defaultChecked?: boolean;
  /** 選んだ・外したときに、次の値を渡して呼びます */
  onCheckedChange?: (checked: boolean) => void;
  /**
   * 中間の状態（選んだものと外したものが混ざっている）にします。箱には横線を出します
   * @default false
   */
  indeterminate?: boolean;
  /** CheckboxGroup に送る値。書かないときは name を使います */
  value?: string;
  /** フォームに送るときの名前 */
  name?: string;
  /** 箱が属するフォームの id。フォームの外に置くときに使います。CheckboxGroup の中では、指定しなければグループの form になります */
  form?: string;
  /** 隠れた input の id */
  id?: string;
  /** 隠れた input への ref。フォーカスや検証の API に触るときに使います */
  inputRef?: Ref<HTMLInputElement>;
  /** 外したままでもフォームに送る値。書かないときは、外した箱は何も送りません */
  uncheckedValue?: string;
  /**
   * CheckboxGroup の「すべて選ぶ」の箱にします。子がすべて選ばれていれば選んだ状態、
   * いくつかなら中間の状態に、部品が自分で切り替えます。CheckboxGroup の allValues と組で使います
   * @default false
   */
  parent?: boolean;
  /**
   * エラーの内容。1つだけ置くとき（同意など）に使います。箱の行の下に丸の「!」と赤い文字で出し、選んでいない箱の塗りを淡い赤にします。
   * 行は箱の説明（aria-describedby）につなぎ、読み上げと出る・消える動きは入力欄と同じです。
   * Form で送信したときは、エラーのある最初の欄としてこの箱にフォーカスが移ります。
   * CheckboxGroup の中では使いません（グループの errorText を使います）
   */
  errorText?: FieldMessage;
  /**
   * 警告の内容。1つだけ置くときに使います。箱の行の下に三角とオリーブ色の文字で出します。箱の見た目は変えません。
   * errorText と両方あるときは、エラーの行が上です。CheckboxGroup の中では使いません（グループの warningText を使います）
   */
  warningText?: FieldMessage;
  /**
   * 成功の内容。1つだけ置くときに使います。箱の行の下に丸のチェックと緑の文字で出します。箱の見た目は変えません。
   * エラー・警告の行の下に出ます。CheckboxGroup の中では使いません
   */
  successText?: FieldMessage;
  /**
   * 情報の内容。1つだけ置くときに使います。箱の行の下に丸の「i」と青い文字で出します。箱の見た目は変えません。
   * エラー・警告・成功の行の下に出ます。CheckboxGroup の中では使いません（グループの infoText を使います）
   */
  infoText?: FieldMessage;
  /**
   * 値を確かめる関数です（design/adr/0255）。1つだけ置くとき（同意など）に使います。選んでいるか（真偽値）とフォーム全体の値を受け取り、
   * 正しくないときはエラーの文（複数あれば配列）を返します。何も返さない・null・空文字・空配列は「正しい」とみなします。
   * 返したエラーの文は errorText と同じ行に出します。errorText があるときは、そちらを優先します。
   * CheckboxGroup の中では使いません（グループの validate を使います）
   */
  validate?: FieldValidate;
  /**
   * 検証のタイミングです（design/adr/0255）。Form の validationMode より、この指定が勝ちます。CheckboxGroup の中では使いません
   * @default 'onSubmit'
   */
  validationMode?: FieldValidationMode;
  /**
   * validationMode="onChange" のとき、validate を呼ぶまでの待ち時間（ミリ秒）です。CheckboxGroup の中では使いません
   * @default 0
   */
  validationDebounceTime?: number;
  /**
   * 押せない（Disabled）状態にします。箱と横の文字がグレーになり、フォームでは値が送られません
   * @default false
   */
  disabled?: boolean;
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
  /** 箱と横の文字を並べた行に付きます */
  className?: string;
}

/**
 * チェックボックス。箱と横の文字（とキャプション）を並べる。横の文字を押しても切り替わる
 * 1つだけ置くとき（同意など）はそのまま、複数を1つの問いにまとめるときは CheckboxGroup の中に置く
 * 中間の状態は indeterminate で表します。「すべて選ぶ」の箱は、CheckboxGroup の selectAll と allValues で付けます
 */
export function Checkbox({
  label,
  caption,
  color,
  checked,
  defaultChecked,
  onCheckedChange,
  indeterminate,
  value,
  name,
  form,
  id: idProp,
  inputRef,
  uncheckedValue,
  errorText,
  warningText,
  successText,
  infoText,
  validate,
  validationMode,
  validationDebounceTime,
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
}: CheckboxProps) {
  const group = useContext(ChoiceGroupContext);
  const id = useId();
  const solo = !group;
  const s = choiceStyles({ color: color ?? group?.color, layout: solo ? 'solo' : 'item' });
  // Form の送信中と読み取り専用（軸 177）は、どちらも押せない箱と同じ見た目にして切り替えを止める
  // 読み取り専用はグループ（CheckboxGroup の readOnly）からも来る
  const locked = useChoiceLock(disabled, readOnly ?? group?.readOnly);
  // Fieldset のまとまりのエラーと押せない状態も受ける（Field を通らないので、ここで足す）
  const fieldset = useContext(FieldsetContext);
  const appInvalid = useAppInvalid(errorText || fieldset.invalid);
  // 読み取り専用では、横の文字を本文の色に戻す（箱は押せないときと同じ見た目のまま — 軸 177）
  const labelReadOnly = locked.readOnlyLook ? choiceReadOnly.label : undefined;
  const box = (describedBy: string | undefined) => (
    <BaseCheckbox.Root
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={onCheckedChange ? (next) => onCheckedChange(next) : undefined}
      indeterminate={indeterminate}
      value={value}
      name={name}
      form={form ?? group?.form}
      id={idProp}
      inputRef={inputRef}
      uncheckedValue={uncheckedValue}
      disabled={disabled}
      readOnly={locked.readOnly}
      aria-disabled={locked.ariaDisabled || ariaDisabled}
      parent={parent}
      // required は Base UI の隠れた input にネイティブの required を付け、送信時にブラウザが確かめて止めてしまう
      // （design/adr/0255 の影響）。渡さず、aria-required だけで必須であることを伝える
      required={false}
      aria-required={required || undefined}
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
  // 1つだけ置くときは自分の Field.Root。エラー・警告・情報の行（入力欄と同じ — design/adr/0041・0044）を箱の行の下に置き、
  // 箱の説明を見た目の順（キャプション → エラー → 警告 → 情報）でつなぐ
  // data-slot="field-label": Form のエラーの一覧が、欄の名前として読む（Field と同じ）
  const ids = fieldMessageIds(id);
  return (
    <BaseField.Root
      // Form のエラーの一覧が、欄の名前をこの根の中のラベルから読む（form-dom.ts）
      data-slot="field"
      disabled={disabled}
      invalid={appInvalid}
      validate={validate}
      validationMode={validationMode}
      validationDebounceTime={validationDebounceTime}
      className={s.item({
        className: [soloRows(caption), ...choiceMessagePull, className],
      })}
    >
      <SoloFieldValidity
        ids={ids}
        name={name}
        disabled={disabled || fieldset.disabled}
        caption={caption}
        errorText={errorText}
        warningText={warningText}
        successText={successText}
        infoText={infoText}
        ariaDescribedBy={ariaDescribedBy}
        messageClassName={s.message()}
      >
        {(describedBy) => (
          <>
            {box(describedBy)}
            <BaseField.Label
              data-slot="field-label"
              className={s.label({ className: labelReadOnly })}
            >
              {label}
              <FieldMark
                required={required}
                requiredMark={requiredMark}
                optionalMark={optionalMark}
              />
            </BaseField.Label>
            {caption && (
              <BaseField.Description id={ids.caption} className={s.caption()}>
                {caption}
              </BaseField.Description>
            )}
          </>
        )}
      </SoloFieldValidity>
    </BaseField.Root>
  );
}
