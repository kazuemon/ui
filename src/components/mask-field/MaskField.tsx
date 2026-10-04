'use client';

import { Field as BaseField } from '@base-ui/react/field';
import { Mask, type MaskTokens } from 'maska';
import { type ComponentProps, createContext, useContext, useMemo, useRef, useState } from 'react';

import { Field, useFieldState } from '../../internal/field/Field';
import { useFormReset } from '../../internal/field/use-form-reset';
import { FieldBox, fieldInset } from '../../internal/field/FieldBox';
import {
  type HalfWidthKind,
  type HalfWidthNoticeProps,
  toHalfWidth,
  useHalfWidthNotice,
} from '../../internal/half-width';
import {
  type FieldNamed,
  type InputFieldProps,
  splitFieldProps,
} from '../../internal/field/input-field-props';
import { cn, tv } from '../../internal/tv';
import { useMergedRefs } from '../../internal/use-merged-refs';
import { hintRest } from './mask-hint';

type InputProps = ComponentProps<'input'>;
type InputEventOf<K extends 'onChange' | 'onCompositionStart' | 'onCompositionEnd'> = Parameters<
  NonNullable<InputProps[K]>
>[0];

/** 書式。'###-####' のような文字列、桁で書式が変わるときは配列か、値から書式を返す関数 */
export type MaskFieldMask = string | string[] | ((value: string) => string);

/** 残りの桁の見本（000-0000）を出すか */
export type MaskFieldHint = 'none' | 'focus' | 'always';

/**
 * 残りの桁の見本の形。sample は淡い見本の文字（数字の桁は 0、英字の桁は A）、
 * dot は •、underscore は字間を空けた _
 */
export type MaskFieldHintStyle = 'sample' | 'dot' | 'underscore';

/** onValueChange で、書式付きの値と一緒に渡すもの */
export interface MaskFieldValueDetails {
  /** 記号を除いた値（'123-4567' なら '1234567'） */
  unmasked: string;
  /** 書式の桁がすべて埋まったか */
  completed: boolean;
}

/** MaskField の本体（MaskFieldControl）の props。ラベル・キャプション・状態の文は、包む Field に渡します */
export interface MaskFieldControlProps
  extends
    Omit<
      ComponentProps<'input'>,
      'className' | 'prefix' | 'value' | 'defaultValue' | 'disabled' | 'required' | 'name' | 'size'
    >,
    Pick<
      InputFieldProps,
      'prefix' | 'suffix' | 'addonShape' | 'loadingIndicator' | 'hideSuccessMark'
    > {
  /**
   * 書式。`#` は数字、`@` は英字、`*` は英数字の 1 桁で、ほかの文字はそのまま入ります（'###-####'）。
   * 桁数で書式が変わるときは配列（短い順に当てはめます）か、打った値から書式を返す関数を渡します
   */
  mask: MaskFieldMask;
  /** 桁の記号を足す・置き換える（maska の tokens）。例: `{ A: { pattern: /[A-Z]/ } }` */
  tokens?: MaskTokens;
  /** 値（制御）。書式付きでも、記号を除いた値でも、書式を当てて出します */
  value?: string;
  /** はじめの値（非制御） */
  defaultValue?: string;
  /** 値が変わるときに、次の値（書式付き）と、記号を除いた値・埋まったかを渡して呼びます */
  onValueChange?: (value: string, details: MaskFieldValueDetails) => void;
  /** 中の input に渡すもの（class・data-*・autoComplete など） */
  inputProps?: ComponentProps<'input'>;
  /**
   * 残りの桁の見本（000-0000）の出し方。always はいつも、focus はフォーカスしているあいだだけ、none は出しません。
   * 見本はプレースホルダーと同じ淡さで、見本を出しているあいだはプレースホルダーを出しません
   * @default 'always'
   */
  maskHint?: MaskFieldHint;
  /**
   * 残りの桁の見本の形。sample は淡い見本の文字（数字の桁は 0、英字の桁は A。打ち終えたときの形がそのまま見えます）、
   * dot は 1 桁ずつの •、underscore は 1 桁ずつの _ です。underscore は打った文字にも字間を空けます
   * @default 'sample'
   */
  maskHintStyle?: MaskFieldHintStyle;
  /**
   * @deprecated MaskField は残りの桁の見本で打つ形を出すので、プレースホルダーは使いません。
   * 書式や例（「ハイフンは自動で入ります」「例: 150-0042」）は `caption`（入力欄の説明のテキスト）で伝えます
   */
  placeholder?: string;
  /** 本体（灰色の欄）に付くクラス */
  className?: string;
}

// 打った文字と見本の、字間と数字の幅。input と見本の層の両方に当て、打っても桁の位置をずらさない
//   数字の幅はそろえ（tabular-nums）、見本の 1 桁と打った 1 桁を同じ幅にする
//   underscore だけ字間（--mask-field-tracking）を空け、_ を 1 桁ずつ離す。プレースホルダーには空けない
const maskText = tv({
  base: 'tabular-nums placeholder:tracking-normal',
  variants: {
    hintStyle: {
      sample: '',
      dot: '',
      underscore: 'tracking-(--mask-field-tracking)',
    },
  },
});

// 見本の桁 1 つ。見本の文字（0・A）で打った文字と同じ幅を取る。
//   sample はその文字を淡く描き、dot・underscore は文字を消して、その幅の真ん中に印を描く（underscore は字間を除いた幅）
const glyph =
  'relative text-transparent before:absolute before:inset-y-0 before:start-0 before:text-center before:tracking-normal before:text-(color:--field-placeholder)';
const hintSlot = tv({
  variants: {
    hintStyle: {
      sample: 'text-(color:--field-placeholder)',
      dot: `${glyph} before:end-0 before:content-['•']`,
      // _ は Tailwind では空白の意味になるので、\_ と書く（String.raw で \ を残す）
      underscore: `${glyph} before:end-(--mask-field-tracking) ${String.raw`before:content-['\_']`}`,
    },
  },
});

// 書式が数字の桁（#）だけなら、スマートフォンで数字のキーボードを出す
function numericOnly(mask: MaskFieldMask) {
  if (typeof mask === 'function') return false;
  const masks = typeof mask === 'string' ? [mask] : mask;
  return masks.every((m) => !/[@*]/.test(m));
}

/**
 * 書式の決まった値を打つ欄の本体（組み立て用）。Field の中に置き、ラベル・キャプション・状態の行は FieldLabel などで並べます。
 * 押せない・待っている・エラー・成功の状態と、説明のつながり（aria-describedby）は、包む Field から受け取ります。
 * halfWidthNotice（全角を直したことの知らせ）は内蔵の形（MaskField）だけで出します
 */
export function MaskFieldControl({
  mask,
  tokens,
  value: valueProp,
  defaultValue = '',
  onValueChange,
  maskHint = 'always',
  maskHintStyle = 'sample',
  className,
  prefix,
  suffix,
  addonShape = 'attached',
  loadingIndicator = 'spinner',
  hideSuccessMark = false,
  readOnly,
  placeholder,
  inputMode,
  inputProps,
  onChange,
  onCompositionStart,
  onCompositionEnd,
  'aria-describedby': ariaDescribedBy,
  'aria-disabled': ariaDisabled,
  'aria-busy': ariaBusy,
  ...props
}: MaskFieldControlProps) {
  const field = useFieldState();
  const disabled = field?.disabled ?? false;
  const loading = field?.loading ?? false;
  const blocking = field?.blocking ?? false;
  const { className: _inputClassName, ref: inputPropsRef, ...inputPropsRest } = inputProps ?? {};
  // 書式を当てる処理。配列の書式は、中身が同じなら作り直さない
  const maskKey = typeof mask === 'function' ? mask : JSON.stringify(mask);
  const masker = useMemo(
    () => new Mask({ mask, tokens }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 配列の書式は中身（maskKey）で見る
    [maskKey, tokens]
  );
  const format = (raw: string) => masker.masked(toHalfWidth(raw).value);

  const [innerValue, setInnerValue] = useState(() => format(defaultValue));
  // IME で打っているあいだ（変換を確定する前）の生の値。確定するまで書式を当てない
  const [draft, setDraft] = useState<string | null>(null);
  // 全角を半角に直したことの知らせ（内蔵の形で halfWidthNotice を渡したとき。値が空になるまで残す）
  const noticed = useContext(HalfWidthNoticedContext);
  const composing = useRef(false);

  const value = draft ?? (valueProp !== undefined ? format(valueProp) : innerValue);

  const commit = (next: string, wasConverted: HalfWidthKind | null) => {
    if (valueProp === undefined) setInnerValue(next);
    noticed?.(wasConverted, next === '');
    onValueChange?.(next, { unmasked: masker.unmasked(next), completed: masker.completed(next) });
  };

  // 制御しない欄では、フォームを戻したら（reset）はじめの値に（いまの書式で）戻し、onValueChange でも知らせる。
  //   全角を直したことの知らせも消す
  const resetRef = useFormReset(() => {
    const next = format(defaultValue);
    setDraft(null);
    setInnerValue(next);
    noticed?.(null, true);
    onValueChange?.(next, { unmasked: masker.unmasked(next), completed: masker.completed(next) });
  }, valueProp === undefined);
  const inputRef = useMergedRefs(inputPropsRef, props.ref, resetRef);

  // 書式を当て、カーソルの位置を直す（maska の MaskInput と同じ考え方）
  //   input の値をここで書き換えるので、React が値を入れ直さず、カーソルが末尾へ飛ばない
  const apply = (input: HTMLInputElement, deleting: boolean) => {
    const before = input.value;
    const caret = input.selectionStart;
    const half = toHalfWidth(before);
    const next = masker.masked(half.value);
    if (next !== before) {
      input.value = next;
      if (caret !== null && !(caret === before.length && !deleting)) {
        const headBefore = half.value.slice(0, caret);
        let position = caret;
        if (headBefore !== next.slice(0, caret)) {
          const typed = masker.unmasked(headBefore).length;
          if (deleting) position += next.length - before.length;
          else if (typed === 0) position = 0;
          else {
            position = next.length;
            for (let i = 1; i <= next.length; i++) {
              if (masker.unmasked(next.slice(0, i)).length >= typed) {
                position = i;
                break;
              }
            }
          }
        }
        input.setSelectionRange(position, position);
      }
    }
    setDraft(null);
    commit(next, half.converted);
  };

  const handleChange = (event: InputEventOf<'onChange'>) => {
    onChange?.(event);
    const native = event.nativeEvent;
    if (composing.current || ('isComposing' in native && native.isComposing === true)) {
      setDraft(event.currentTarget.value);
      return;
    }
    const inputType =
      'inputType' in native && typeof native.inputType === 'string' ? native.inputType : '';
    apply(event.currentTarget, inputType.startsWith('delete'));
  };
  const handleCompositionStart = (event: InputEventOf<'onCompositionStart'>) => {
    onCompositionStart?.(event);
    composing.current = true;
  };
  const handleCompositionEnd = (event: InputEventOf<'onCompositionEnd'>) => {
    onCompositionEnd?.(event);
    composing.current = false;
    apply(event.currentTarget, false);
  };

  const editable = !disabled && !readOnly && !blocking;
  const showHint = maskHint !== 'none' && editable;
  const rest = showHint ? hintRest(value, mask, masker, tokens) : [];

  return (
    <FieldBox
      prefix={prefix}
      suffix={suffix}
      addonShape={addonShape}
      readOnly={readOnly}
      disabled={disabled}
      loading={loading}
      loadingIndicator={loadingIndicator}
      success={field?.messages.success}
      successMark={!hideSuccessMark}
      error={field?.messages.error}
      describedBy={ariaDescribedBy}
      messageIds={field?.describedBy}
      // フォーカスしているあいだだけ見本を出す（focus）ための目印。状態の固定（pseudo-states）も本体に当たる
      className={cn('group/mask', className)}
    >
      {(describedBy) => (
        <div className="relative flex h-full min-w-0 flex-1 items-center">
          <BaseField.Control
            className={cn(
              'h-full w-full min-w-0 bg-transparent outline-none placeholder:text-(color:--field-placeholder) disabled:cursor-not-allowed',
              fieldInset,
              maskText({ hintStyle: maskHintStyle }),
              blocking && 'cursor-progress',
              // 見本を出しているあいだは、プレースホルダーを出さない（重なるため）
              showHint && maskHint === 'always' && 'placeholder:text-transparent',
              showHint &&
                maskHint === 'focus' &&
                'group-focus-within/mask:placeholder:text-transparent',
              inputProps?.className
            )}
            value={value}
            placeholder={placeholder}
            inputMode={inputMode ?? (numericOnly(mask) ? 'numeric' : undefined)}
            disabled={disabled}
            // required はブラウザのネイティブな検証を起こすので渡さない（design/adr/0255 の影響）
            // aria-required だけで必須であることを伝える
            required={false}
            aria-required={field?.required || undefined}
            readOnly={blocking || readOnly}
            aria-disabled={blocking || ariaDisabled}
            aria-busy={loading || ariaBusy}
            spellCheck={false}
            {...inputPropsRest}
            {...props}
            ref={inputRef}
            aria-describedby={describedBy}
            onChange={handleChange}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
          />
          {showHint && rest.length > 0 && (
            // 残りの桁の見本。打った値と同じ位置に、見えない値を置いて並べる。読み上げには出さない
            <span
              aria-hidden
              data-slot="mask-hint"
              className={[
                'pointer-events-none absolute inset-0 flex items-center overflow-hidden whitespace-pre',
                fieldInset,
                maskText({ hintStyle: maskHintStyle }),
                maskHint === 'focus' && 'invisible group-focus-within/mask:visible',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span className="invisible">{value}</span>
              {rest.map((cell, i) =>
                cell.token ? (
                  <span
                    key={i}
                    data-slot="mask-hint-slot"
                    className={hintSlot({ hintStyle: maskHintStyle })}
                  >
                    {cell.sample}
                  </span>
                ) : (
                  <span key={i} className="text-(color:--field-placeholder)">
                    {cell.char}
                  </span>
                )
              )}
            </span>
          )}
        </div>
      )}
    </FieldBox>
  );
}

// 内蔵の形（MaskField）が、全角を直したことの知らせを受け取る口。知らせは Field の情報の行に出す
const HalfWidthNoticedContext = createContext<
  ((kind: HalfWidthKind | null, empty: boolean) => void) | null
>(null);

/** MaskField の props から、label・accessibleName の組み合わせの決まりを外したもの */
export type MaskFieldBaseProps = Omit<MaskFieldControlProps, 'className'> &
  Omit<InputFieldProps, 'placeholder'> &
  HalfWidthNoticeProps & {
    /** 中の input に渡すもの（class・data-*・autoComplete など）。欄の外枠には className を使います */
    inputProps?: ComponentProps<'input'>;
  };

/** MaskField の props。label か accessibleName のどちらかが要ります */
export type MaskFieldProps = FieldNamed<MaskFieldBaseProps>;

/**
 * 書式の決まった値（郵便番号・電話番号・カード番号・日付など）を打つ欄。打つと記号を補い、書式にない文字は受け付けません
 * 全角の英数字は黙って半角に直して受けます。書式の処理は maska を使います
 */
export function MaskField(props: MaskFieldProps) {
  const [field, { halfWidthNotice = false, ...control }] = splitFieldProps(
    props as MaskFieldBaseProps
  );
  // 全角を半角に直したことの知らせ（既定は知らせない）。infoText を渡したときは、そちらを出す
  const { notice, noticed } = useHalfWidthNotice(halfWidthNotice);
  return (
    <Field {...field} info={field.info ?? notice}>
      {() => (
        <HalfWidthNoticedContext value={noticed}>
          <MaskFieldControl {...control} />
        </HalfWidthNoticedContext>
      )}
    </Field>
  );
}
