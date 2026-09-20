import { Field as BaseField } from '@base-ui/react/field';
import { Radio as BaseRadio } from '@base-ui/react/radio';
import { RadioGroup as BaseRadioGroup } from '@base-ui/react/radio-group';
import { type ComponentProps, type ReactNode, useContext, useMemo } from 'react';

import { ChoiceGroupContext } from '../../internal/choice/choice-group-context';
import {
  type ChoiceColor,
  choiceGroupMessagePull,
  choiceRows,
  choiceStyles,
} from '../../internal/choice/choice-styles';
import { type CaptionPlacement, Field } from '../../internal/field/Field';
import { useChoiceLock } from '../../internal/form-context';

// ラジオ（原則8・原則5）— 後半の軸 40。見た目はチェックボックスと同じ（internal/choice/choice-styles.ts）で、形だけが完全な丸
// 選ぶと部品の色の塗りに白い丸（直径は箱の --radio-dot-ratio を 2px 単位に丸めたもの。箱と同じ偶数にし、ふちのぼかしが偏らないようにする）

export interface RadioProps extends Omit<
  ComponentProps<typeof BaseRadio.Root>,
  'className' | 'render' | 'color'
> {
  /** 丸の横の文字。押しても選ばれます（本体の一部）。押せないときは丸と一緒にグレーになります */
  label: ReactNode;
  /** 横の文字の下の説明。押せないときも読めるままです */
  caption?: ReactNode;
  className?: string;
}

/**
 * ラジオの選択肢。RadioGroup の中に value 付きで置きます
 */
export function Radio({
  label,
  caption,
  className,
  disabled,
  readOnly,
  'aria-disabled': ariaDisabled,
  ...props
}: RadioProps) {
  const group = useContext(ChoiceGroupContext);
  const s = choiceStyles({ color: group?.color });
  // Form の送信中は、押せない丸と同じ見た目にして切り替えを止める（form-context.ts の useChoiceLock。RadioGroup も止める）
  const locked = useChoiceLock(disabled);
  return (
    <BaseField.Item
      disabled={disabled}
      className={s.item({ className: [choiceRows(caption), className] })}
    >
      <BaseRadio.Root
        disabled={disabled}
        readOnly={locked.readOnly || readOnly}
        aria-disabled={locked.readOnly || ariaDisabled}
        className={s.box({ className: 'rounded-pill' })}
        {...locked.data}
        {...props}
      >
        <BaseRadio.Indicator className={s.dot()} />
      </BaseRadio.Root>
      <BaseField.Label className={s.label()}>{label}</BaseField.Label>
      {caption && <BaseField.Description className={s.caption()}>{caption}</BaseField.Description>}
    </BaseField.Item>
  );
}

export interface RadioGroupProps<Value> extends Omit<
  BaseRadioGroup.Props<Value>,
  'className' | 'render' | 'color'
> {
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
  error?: ReactNode;
  /** 警告の内容。選択肢の下に三角とオリーブ色の文字で出します。丸の見た目は変えません */
  warning?: ReactNode;
  /**
   * 必須にします。グループ（role="radiogroup"）に aria-required を付けます（読み上げで必須と伝わります）。
   * 見た目は変わらないので、必須であることは見出しかキャプションでも伝えます
   * @default false
   */
  required?: boolean;
  /**
   * 選んだときの色。利用者が選ぶ primary・secondary に加え、色を持たない neutral（濃いグレー）を選べます（原則6）
   * @default 'neutral'
   */
  color?: ChoiceColor;
  className?: string;
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
  error,
  warning,
  disabled,
  color,
  className,
  children,
  readOnly,
  'aria-describedby': ariaDescribedBy,
  ...props
}: RadioGroupProps<Value>) {
  const context = useMemo(() => ({ color }), [color]);
  // Form の送信中は、グループでも選び直し（矢印キーを含む）を止める。見た目は中の Radio が押せない丸にする
  const locked = useChoiceLock(disabled);
  return (
    <ChoiceGroupContext.Provider value={context}>
      <Field
        label={label}
        caption={caption}
        captionPlacement={captionPlacement}
        error={error}
        warning={warning}
        disabled={disabled}
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
            disabled={disabled}
            readOnly={locked.readOnly || readOnly}
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
