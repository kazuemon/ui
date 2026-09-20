'use client';

import { Field as BaseField } from '@base-ui/react/field';
import { useEffect, useId, useRef, useState } from 'react';

import {
  emptyLabel,
  segmentLabel,
  type SegmentPlaceholder,
  segmentPlaceholder,
  segmentValueText,
} from './labels';
import { type SegmentLayout, segmentRange, type SegmentType } from './segments';
import { type DateSegmentsOptions, useDateSegments } from './use-date-segments';
import { tv } from '../tv';

// 区切りの欄（DateField・TimeField）の本体。FieldBox（controlBox）の中に置く
// 区切りは role="spinbutton"、全体は role="group" でラベルにつなぐ
// 区切りは contentEditable にし、指の端末でも数字のキーボードが出るようにする。文字はすべて自分で受け、ブラウザには書き換えさせない
// 見た目の値は design/tokens.css の --date-segment-*（軸 172）
const segmentStyles = tv({
  slots: {
    group: [
      'flex h-full w-full min-w-0 cursor-text items-center gap-(--date-segment-gap)',
      // 先頭の区切りの余白の分を本体の内側の余白から引き、値の文字の先頭を TextField とそろえる
      'ps-[calc(var(--spacing-control-x)-var(--field-border-width)-var(--date-segment-pad-x))]',
      'pe-[calc(var(--spacing-control-x)-var(--field-border-width))]',
      'group-data-disabled/field:cursor-not-allowed group-data-[loading=blocking]/field:cursor-progress',
    ],
    segment: [
      'rounded-(--date-segment-radius) px-(--date-segment-pad-x) whitespace-pre tabular-nums caret-transparent outline-none',
      'data-placeholder:text-(color:--field-placeholder)',
      // いま打っている区切り（軸 172）。欄の枠線（フォーカス）と重ならないよう、線ではなく塗りで示す。マウスで押したときも出す
      'focus:bg-(--date-segment-focus-bg) focus:text-(color:--date-segment-focus-fg)',
      'focus:data-placeholder:text-(color:--date-segment-focus-placeholder)',
      'selection:bg-transparent',
    ],
    literal: 'whitespace-pre data-placeholder:text-(color:--field-placeholder)',
  },
});

export interface DateSegmentGroupProps<T> extends Omit<DateSegmentsOptions<T>, 'editable'> {
  layout: SegmentLayout;
  locale: string;
  placeholderStyle: SegmentPlaceholder;
  /** form に送る文字（ISO 8601） */
  toFormValue: (value: T | null) => string;
  name?: string;
  disabled?: boolean;
  readOnly?: boolean;
  /** 待っているあいだ・送信中に止めている。書き換えられないが、フォーカスは外さない */
  blocking?: boolean;
  invalid?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  busy?: boolean;
  describedBy?: string;
  /** 区切りの読み上げの名前を差し替える */
  segmentLabels?: Partial<Record<SegmentType, string>>;
}

/** 区切りの欄の本体。DateField・TimeField が FieldBox の中に置く */
export function DateSegmentGroup<T>({
  layout,
  locale,
  placeholderStyle,
  toFormValue,
  name,
  disabled,
  readOnly,
  blocking,
  invalid,
  required,
  autoFocus,
  busy,
  describedBy,
  segmentLabels,
  ...options
}: DateSegmentGroupProps<T>) {
  const id = useId();
  const editable = !disabled && !readOnly && !blocking;
  const segments = useDateSegments({ ...options, layout, editable });
  const styles = segmentStyles();
  // IME で確定した文字は、ブラウザが区切りの中に書き込んでしまう。確定したら中身を描き直す
  const [composed, setComposed] = useState(0);
  const allEmpty = segments.order.every((type) => segments.text(type).placeholder);

  // 指の端末のキーボードは keydown で文字を伝えない（key が Unidentified）ので、beforeinput で受ける
  // keydown で受けた文字は preventDefault しているので、ここには来ない
  const latest = useRef(segments);
  latest.current = segments;
  useEffect(() => {
    const elements = [...segments.refs.current.entries()];
    const listeners = elements.map(([type, element]) => {
      const listener = (event: InputEvent) => {
        if (event.inputType === 'insertCompositionText' || event.isComposing) return;
        event.preventDefault();
        if (event.inputType.startsWith('delete')) latest.current.erase(type);
        else if (event.data) latest.current.input(type, event.data);
      };
      element.addEventListener('beforeinput', listener);
      return () => element.removeEventListener('beforeinput', listener);
    });
    return () => listeners.forEach((remove) => remove());
  }, [segments.refs, layout]);

  useEffect(() => {
    if (autoFocus) segments.focus(segments.order[0]);
    // はじめの 1 回だけ
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const firstEmpty = () =>
    segments.order.find((type) => segments.values[type] == null) ?? segments.order.at(-1);

  const formValue = toFormValue(segments.value);

  return (
    <BaseField.Control
      value={formValue}
      disabled={disabled}
      render={(control) => (
        <>
          <div
            role="group"
            id={control.id}
            aria-labelledby={control['aria-labelledby']}
            aria-disabled={disabled || undefined}
            aria-busy={busy || undefined}
            tabIndex={-1}
            data-slot="date-segments"
            className={styles.group()}
            // ラベルを押したとき（Base UI がこの箱にフォーカスを移す）は、最初の空の区切りへ
            onFocus={(event) => {
              if (event.target === event.currentTarget) segments.focus(firstEmpty());
              else if (!event.currentTarget.contains(event.relatedTarget)) control.onFocus?.(event);
            }}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                control.onBlur?.(event as never);
              }
            }}
            // 区切りの外（余白）を押したときも、最初の空の区切りへ
            onMouseDown={(event) => {
              if (disabled || event.target !== event.currentTarget) return;
              event.preventDefault();
              segments.focus(firstEmpty());
            }}
            onPaste={(event) => {
              event.preventDefault();
              const target =
                event.target instanceof HTMLElement ? event.target.closest('[data-segment]') : null;
              const type = segments.order.find(
                (segment) => target?.getAttribute('data-segment') === segment
              );
              if (type) segments.input(type, event.clipboardData.getData('text'));
            }}
          >
            {layout.parts.map((part, index) => {
              if (part.kind === 'literal') {
                return (
                  <span
                    key={index}
                    aria-hidden
                    data-placeholder={allEmpty || undefined}
                    className={styles.literal()}
                  >
                    {part.text}
                  </span>
                );
              }
              const { type } = part;
              const { text, placeholder } = segments.text(type);
              const range = segmentRange(type, segments.values, layout);
              const value = segments.values[type];
              const segmentId = `${id}${type}`;
              return (
                <span
                  key={type}
                  ref={(element) => {
                    if (element) segments.refs.current.set(type, element);
                    else segments.refs.current.delete(type);
                  }}
                  id={segmentId}
                  role="spinbutton"
                  aria-label={segmentLabels?.[type] ?? segmentLabel(type, locale)}
                  aria-labelledby={[segmentId, control['aria-labelledby']]
                    .filter(Boolean)
                    .join(' ')}
                  aria-valuemin={range.min}
                  aria-valuemax={range.max}
                  aria-valuenow={value}
                  aria-valuetext={
                    value == null
                      ? emptyLabel(locale)
                      : segmentValueText(type, value, locale, layout)
                  }
                  aria-describedby={describedBy}
                  aria-invalid={invalid || undefined}
                  aria-required={required || undefined}
                  aria-readonly={readOnly || blocking || undefined}
                  aria-disabled={disabled || blocking || undefined}
                  tabIndex={disabled ? undefined : 0}
                  contentEditable={editable || undefined}
                  suppressContentEditableWarning
                  inputMode={type === 'dayPeriod' ? 'text' : 'numeric'}
                  enterKeyHint="next"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  data-segment={type}
                  data-placeholder={placeholder || undefined}
                  className={styles.segment()}
                  onKeyDown={(event) => segments.onKeyDown(type, event)}
                  onBlur={() => segments.leave(type)}
                  onCompositionEnd={(event) => {
                    const element = event.currentTarget;
                    // ブラウザが書き込んだ文字を消し、描き直す
                    for (const node of [...element.childNodes]) {
                      if (!(node instanceof HTMLElement && node.dataset.text != null))
                        node.remove();
                    }
                    setComposed((count) => count + 1);
                    segments.input(type, event.data);
                  }}
                >
                  <span key={composed} data-text="">
                    {placeholder ? segmentPlaceholder(type, placeholderStyle, locale, range) : text}
                  </span>
                </span>
              );
            })}
          </div>
          <input
            ref={control.ref}
            type="hidden"
            name={name}
            value={formValue}
            disabled={disabled}
          />
        </>
      )}
    />
  );
}
