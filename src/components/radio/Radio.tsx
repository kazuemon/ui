'use client';

import { Field as BaseField } from '@base-ui/react/field';
import { Radio as BaseRadio } from '@base-ui/react/radio';
import { RadioGroup as BaseRadioGroup } from '@base-ui/react/radio-group';
import { type ComponentProps, type ReactNode, type Ref, useContext, useMemo } from 'react';

import { ChoiceGroupContext } from '../../internal/choice/choice-group-context';
import {
  type ChoiceColor,
  choiceGroupMessagePull,
  choiceReadOnly,
  choiceRows,
  choiceStyles,
} from '../../internal/choice/choice-styles';
import { type CaptionPlacement, Field } from '../../internal/field/Field';
import type { FieldMarkProps } from '../../internal/field/FieldMark';
import type { FieldMessage } from '../../internal/field/input-field-props';
import { useChoiceLock } from '../../internal/form-context';

// ラジオ（原則8・原則5）— 後半の軸 40。見た目はチェックボックスと同じ（internal/choice/choice-styles.ts）で、形だけが完全な丸
// 選ぶと部品の色の塗りに白い丸（直径は箱の --radio-dot-ratio を 2px 単位に丸めたもの。箱と同じ偶数にし、ふちのぼかしが偏らないようにする）

export interface RadioProps extends Omit<
  ComponentProps<'span'>,
  'className' | 'color' | 'value' | 'children' | 'onChange'
> {
  /** 丸の横の文字。押しても選ばれます（本体の一部）。押せないときは丸と一緒にグレーになります */
  label: ReactNode;
  /** 横の文字の下の説明。押せないときも読めるままです */
  caption?: ReactNode;
  /** この選択肢の値。RadioGroup の value と突き合わせ、選ばれているかが決まります */
  value: unknown;
  /**
   * 押せない（Disabled）状態にします。丸と横の文字がグレーになります
   * @default false
   */
  disabled?: boolean;
  /**
   * 必須にします。グループの required を使うのがふつうです
   * @default false
   */
  required?: boolean;
  /** 隠れた input への ref。フォーカスや検証の API に触るときに使います */
  inputRef?: Ref<HTMLInputElement>;
  /**
   * 読み取り専用にします。丸は押せないとき（`disabled`）と同じ見た目になりますが、横の文字は本文の色のままです。
   * フォーカスでき、読み上げでは「読み取り専用」と伝わります。押してもキーボードでも選び直せません。フォームでは値が送られます。
   * ふつうは RadioGroup の readOnly で、グループごと読み取り専用にします
   * @default false
   */
  readOnly?: boolean;
  /** 丸と横の文字を並べた行に付きます */
  className?: string;
}

/**
 * ラジオの選択肢。RadioGroup の中に value 付きで置きます
 */
export function Radio({
  label,
  caption,
  className,
  value,
  disabled,
  required,
  inputRef,
  readOnly,
  'aria-disabled': ariaDisabled,
  ...props
}: RadioProps) {
  const group = useContext(ChoiceGroupContext);
  const s = choiceStyles({ color: group?.color });
  // Form の送信中と読み取り専用（軸 177）は、押せない丸と同じ見た目にして選び直しを止める
  // 読み取り専用はグループ（RadioGroup の readOnly）からも来る
  const locked = useChoiceLock(disabled, readOnly ?? group?.readOnly);
  return (
    <BaseField.Item
      disabled={disabled}
      className={s.item({ className: [choiceRows(caption), className] })}
    >
      <BaseRadio.Root
        value={value}
        required={required}
        inputRef={inputRef}
        disabled={disabled}
        readOnly={locked.readOnly}
        aria-disabled={locked.ariaDisabled || ariaDisabled}
        className={s.box({
          className: ['rounded-pill', locked.readOnlyLook && choiceReadOnly.box],
        })}
        {...locked.data}
        {...props}
      >
        <BaseRadio.Indicator className={s.dot()} />
      </BaseRadio.Root>
      <BaseField.Label
        className={s.label({ className: locked.readOnlyLook ? choiceReadOnly.label : undefined })}
      >
        {label}
      </BaseField.Label>
      {caption && <BaseField.Description className={s.caption()}>{caption}</BaseField.Description>}
    </BaseField.Item>
  );
}

export interface RadioGroupProps<Value>
  extends
    Omit<ComponentProps<'div'>, 'className' | 'color' | 'defaultValue' | 'onChange' | 'children'>,
    FieldMarkProps {
  /** グループの見出し（太字）。グループ（role="radiogroup"）の名前になります */
  label: ReactNode;
  /** 見出しの補足（ヘルプテキスト）。エラー・警告のあいだも消えません */
  caption?: ReactNode;
  /**
   * キャプションの場所。top は見出しと選択肢のあいだ、bottom は選択肢の下（design/adr/0041）
   * @default 'top'
   */
  captionPlacement?: CaptionPlacement;
  /** エラーの内容。選択肢の下に丸の「!」と赤い文字で出し、選んでいない丸の塗りを淡い赤にします。押せない丸は、押せない色のままです */
  errorText?: FieldMessage;
  /** 警告の内容。選択肢の下に三角とオリーブ色の文字で出します。丸の見た目は変えません */
  warningText?: FieldMessage;
  /** 情報の内容。選択肢の下に丸の「i」と青い文字で出します。丸の見た目は変えません */
  infoText?: FieldMessage;
  /** 選んでいる値（制御） */
  value?: Value;
  /** はじめに選んでいる値（非制御） */
  defaultValue?: Value;
  /** 選び方が変わるときに、次の値を渡して呼びます */
  onValueChange?: (value: Value) => void;
  /** フォームに送るときの名前 */
  name?: string;
  /** グループが属するフォームの id。フォームの外に置くときに使います */
  form?: string;
  /** 隠れた input への ref。フォーカスや検証の API に触るときに使います */
  inputRef?: Ref<HTMLInputElement>;
  /**
   * グループごと押せない（Disabled）状態にします。中の丸がすべてグレーになります
   * @default false
   */
  disabled?: boolean;
  /**
   * 必須にします。グループ（role="radiogroup"）に aria-required を付け、見出しの後ろに印（既定は「必須」のタグ）を出します。
   * 印は読み上げから外れ、必須であることは aria-required が伝えます
   * @default false
   */
  required?: boolean;
  /**
   * グループごと読み取り専用にします。丸は押せないとき（`disabled`）と同じ見た目になりますが、横の文字は本文の色のままです。
   * フォーカスでき、読み上げではグループが「読み取り専用」と伝わります。矢印キーでも押しても選び直せません。フォームでは値が送られます
   * @default false
   */
  readOnly?: boolean;
  /**
   * 選んだときの色。利用者が選ぶ primary・secondary に加え、色を持たない neutral（濃いグレー）を選べます（原則6）
   * @default 'neutral'
   */
  color?: ChoiceColor;
  /** グループの外枠（見出し・選択肢・下の行をまとめた縦の並び）に付きます */
  className?: string;
  /** 中に置く選択肢。Radio を value 付きで並べます */
  children: ReactNode;
}

/**
 * ラジオのグループ。見出し / 選択肢 / キャプション・エラー・警告の3層（原則4）
 * エラー・警告の行と読み上げは入力欄と同じ（design/adr/0041・0044）。行はグループの説明（aria-describedby）につなぐ
 * キャプションと行はグループにだけ付け、中のラジオ1つずつの説明には入れない（原則15: 見えている文字を、二度読ませない）
 * 選択肢ごとの説明は、その Radio の caption（2 行目）だけ
 */
export function RadioGroup<Value>({
  label,
  caption,
  captionPlacement,
  errorText,
  warningText,
  infoText,
  value,
  defaultValue,
  onValueChange,
  name,
  form,
  inputRef,
  disabled,
  color,
  className,
  children,
  readOnly,
  required,
  requiredMark,
  optionalMark,
  'aria-describedby': ariaDescribedBy,
  ...props
}: RadioGroupProps<Value>) {
  const context = useMemo(() => ({ color, readOnly }), [color, readOnly]);
  // Form の送信中と読み取り専用は、グループでも選び直し（矢印キーを含む）を止める。見た目は中の Radio が押せない丸にする
  const locked = useChoiceLock(disabled, readOnly);
  return (
    <ChoiceGroupContext.Provider value={context}>
      <Field
        label={label}
        caption={caption}
        captionPlacement={captionPlacement}
        error={errorText}
        warning={warningText}
        info={infoText}
        disabled={disabled}
        required={required}
        requiredMark={requiredMark}
        optionalMark={optionalMark}
        className={[...choiceGroupMessagePull(captionPlacement), className]
          .filter(Boolean)
          .join(' ')}
        nativeLabel={false}
        // グループのキャプションは、グループにだけ付ける。中のラジオ1つずつの説明には入れない（原則15）
        registerCaption={false}
      >
        {(describedBy) => (
          <BaseRadioGroup<Value>
            {...props}
            value={value}
            defaultValue={defaultValue}
            onValueChange={onValueChange ? (next) => onValueChange(next) : undefined}
            name={name}
            form={form}
            inputRef={inputRef}
            disabled={disabled}
            required={required}
            readOnly={locked.readOnly}
            aria-describedby={[ariaDescribedBy, describedBy].filter(Boolean).join(' ') || undefined}
            className="flex flex-col"
          >
            {children}
          </BaseRadioGroup>
        )}
      </Field>
    </ChoiceGroupContext.Provider>
  );
}
