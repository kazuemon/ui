import { Field as BaseField } from '@base-ui/react/field';
import { Mask, type MaskTokens } from 'maska';
import { type ComponentProps, useEffect, useMemo, useRef, useState } from 'react';

import { Field } from '../../internal/field/Field';
import { FieldBox, fieldInset } from '../../internal/field/FieldBox';
import {
  type HalfWidthKind,
  type HalfWidthNoticeProps,
  toHalfWidth,
  useHalfWidthNotice,
} from '../../internal/half-width';
import type { InputFieldProps } from '../../internal/field/input-field-props';
import { useFormSubmittingLock } from '../../internal/form-context';
import { tv } from '../../internal/tv';
import { hintRest } from './mask-hint';

// Base UI の input が渡すイベント（preventBaseUIHandler を持つ）
type ControlProps = ComponentProps<typeof BaseField.Control>;
type InputEventOf<K extends 'onChange' | 'onCompositionStart' | 'onCompositionEnd'> = Parameters<
  NonNullable<ControlProps[K]>
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

export interface MaskFieldProps
  extends
    Omit<
      ComponentProps<typeof BaseField.Control>,
      'className' | 'render' | 'prefix' | 'value' | 'defaultValue' | 'onValueChange'
    >,
    InputFieldProps,
    HalfWidthNoticeProps {
  /**
   * 書式。`#` は数字、`@` は英字、`*` は英数字の 1 桁で、ほかの文字はそのまま入ります（'###-####'）。
   * 桁数で書式が変わるときは配列（短い順に当てはめます）か、打った値から書式を返す関数を渡します
   */
  mask: MaskFieldMask;
  /** 桁の記号を足す・置き換える（maska の tokens）。例: `{ A: { pattern: /[A-Z]/ } }` */
  tokens?: MaskTokens;
  /** 値（制御するとき）。書式付きでも、記号を除いた値でも、書式を当てて出します */
  value?: string;
  /** はじめの値（制御しないとき） */
  defaultValue?: string;
  /** 値が変わったとき。書式付きの値と、記号を除いた値・埋まったかを渡します */
  onValueChange?: (value: string, details: MaskFieldValueDetails) => void;
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
 * 書式の決まった値（郵便番号・電話番号・カード番号・日付など）を打つ欄。打つと記号を補い、書式にない文字は受け付けません
 * 全角の英数字は黙って半角に直して受けます。書式の処理は maska を使います
 */
export function MaskField({
  mask,
  tokens,
  value: valueProp,
  defaultValue = '',
  onValueChange,
  maskHint = 'always',
  maskHintStyle = 'sample',
  halfWidthNotice = false,
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
  placeholder,
  inputMode,
  onChange,
  onCompositionStart,
  onCompositionEnd,
  'aria-describedby': ariaDescribedBy,
  'aria-disabled': ariaDisabled,
  'aria-busy': ariaBusy,
  ...props
}: MaskFieldProps) {
  const formLock = useFormSubmittingLock();
  const blocking = (loading && loadingBehavior === 'blocking') || formLock.blocking;
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
  // 全角を半角に直したことの知らせ（値が空になるまで残す）
  const { notice, noticed } = useHalfWidthNotice(halfWidthNotice);
  const composing = useRef(false);
  const wrapper = useRef<HTMLDivElement>(null);

  const value = draft ?? (valueProp !== undefined ? format(valueProp) : innerValue);

  // 制御しない欄では、フォームを戻したら（reset）はじめの値に戻す
  const defaultRef = useRef(defaultValue);
  defaultRef.current = defaultValue;
  useEffect(() => {
    const form = wrapper.current?.querySelector('input')?.form;
    if (!form || valueProp !== undefined) return undefined;
    const reset = () => {
      setInnerValue(format(defaultRef.current));
      noticed(null, true);
    };
    form.addEventListener('reset', reset);
    return () => form.removeEventListener('reset', reset);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 書式が変わっても登録し直さなくてよい
  }, [valueProp === undefined]);

  const commit = (next: string, wasConverted: HalfWidthKind | null) => {
    if (valueProp === undefined) setInnerValue(next);
    noticed(wasConverted, next === '');
    onValueChange?.(next, { unmasked: masker.unmasked(next), completed: masker.completed(next) });
  };

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
    <Field
      label={label}
      caption={caption}
      captionPlacement={captionPlacement}
      error={error}
      warning={warning}
      success={success}
      info={info ?? notice}
      disabled={disabled}
      loading={loading}
      loadingBehavior={loadingBehavior}
      className={className}
    >
      {(messageIds) => (
        <FieldBox
          prefix={prefix}
          suffix={suffix}
          addonShape={addonShape}
          readOnly={readOnly}
          disabled={disabled}
          loading={loading}
          loadingIndicator={loadingIndicator}
          success={success}
          successMark={successMark}
          error={error}
          describedBy={ariaDescribedBy}
          messageIds={messageIds}
          // フォーカスしているあいだだけ見本を出す（focus）ための目印。状態の固定（pseudo-states）も本体に当たる
          className="group/mask"
        >
          {(describedBy) => (
            <div ref={wrapper} className="relative flex h-full min-w-0 flex-1 items-center">
              <BaseField.Control
                className={[
                  'h-full w-full min-w-0 bg-transparent outline-none placeholder:text-(color:--field-placeholder) disabled:cursor-not-allowed',
                  fieldInset,
                  maskText({ hintStyle: maskHintStyle }),
                  blocking && 'cursor-progress',
                  // 見本を出しているあいだは、プレースホルダーを出さない（重なるため）
                  showHint && maskHint === 'always' && 'placeholder:text-transparent',
                  showHint &&
                    maskHint === 'focus' &&
                    'group-focus-within/mask:placeholder:text-transparent',
                ]
                  .filter(Boolean)
                  .join(' ')}
                value={value}
                placeholder={placeholder}
                inputMode={inputMode ?? (numericOnly(mask) ? 'numeric' : undefined)}
                disabled={disabled}
                readOnly={blocking || readOnly}
                aria-disabled={blocking || ariaDisabled}
                aria-busy={loading || ariaBusy}
                aria-describedby={describedBy}
                spellCheck={false}
                {...props}
                onChange={handleChange}
                onCompositionStart={handleCompositionStart}
                onCompositionEnd={handleCompositionEnd}
              />
              {showHint &&
                rest.length > 0 && (
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
      )}
    </Field>
  );
}
