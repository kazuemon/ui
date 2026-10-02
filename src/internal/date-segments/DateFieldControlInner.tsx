'use client';

import { type ComponentProps, type Ref, useMemo, useState } from 'react';

import { type DateSegmentColor, dateSegmentColorClass } from './colors';
import { DateSegmentGroup } from './DateSegmentGroup';
import type { SegmentPlaceholder } from './labels';
import { parseDateText } from './parse';
import { dateLayout, fromPlainDate, toPlainDate } from './segments';
import { type PlainDate, todayIn } from '../date/plain-date';
import { isDateOutOfRange } from '../date/range';
import { useLocale } from '../date/use-locale';
import { useFieldControlKind, useFieldState } from '../field/Field';
import { FieldBox } from '../field/FieldBox';
import type { InputFieldProps } from '../field/input-field-props';
import type { HalfWidthKind } from '../half-width';
import { cn } from '../tv';

// 日付の区切りの欄の本体。DateField（DateFieldControl）と DatePicker が使う。公開の入口には並べない

/** DateField の本体（DateFieldControl）の props。ラベル・キャプション・状態の文は、包む Field に渡します */
export interface DateFieldControlProps extends Pick<
  InputFieldProps,
  'prefix' | 'suffix' | 'addonShape' | 'loadingIndicator' | 'hideSuccessMark'
> {
  /** 値（制御）。年・月・日がそろっていないときは null */
  value?: PlainDate | null;
  /** はじめの値（非制御） */
  defaultValue?: PlainDate | null;
  /** 値が変わるときに、次の値を渡して呼びます（年・月・日がそろったとき。そろった値を消したときは null） */
  onValueChange?: (value: PlainDate | null) => void;
  /**
   * 入れてよいいちばん前の日。これより前の日が入ると、欄をエラーの見た目（赤い枠線・aria-invalid）にします。
   * 区切りの増減は止めません。理由の文は `errorText` で渡します
   */
  min?: PlainDate;
  /** 入れてよいいちばん後の日。扱いは min と同じ */
  max?: PlainDate;
  /** 中の区切りを並べる要素の id */
  id?: string;
  /** 欄が属するフォームの id。フォームの外に置くときに使います */
  form?: string;
  /** 中の区切りを並べる要素への ref */
  ref?: Ref<HTMLDivElement>;
  /** 中の区切りを並べる要素に渡すもの（class・data-* など）。欄の外枠には className を使います */
  inputProps?: ComponentProps<'div'>;
  /** 読み取り専用。値は読めて写せますが、書き換えられません */
  readOnly?: boolean;
  /** 描いたあとに、最初の区切りへフォーカスを移します */
  autoFocus?: boolean;
  /**
   * 空の区切りに出す見本の書き方。letters は「yyyy/mm/dd」、units は「年/月/日」、dashes は「----/--/--」
   * @default 'letters'
   */
  segmentPlaceholder?: SegmentPlaceholder;
  /**
   * 言語。区切りの並びと記号（ja-JP は 年/月/日）がこれに従います
   * @default ThemeProvider の locale、なければ 'ja-JP'
   */
  locale?: string;
  /**
   * 空の区切りで ↑↓ を押したときに入る「今日」を決めるタイムゾーン
   * @default ThemeProvider の timeZone、なければ 'Asia/Tokyo'
   */
  timeZone?: string;
  /**
   * 欄の色。いま打っている区切りの塗りと、フォーカスの枠線の色がこれに従います。
   * neutral（既定）はグレーの塗り、primary・secondary はその色の淡い塗りです。Select の color と同じ意味です
   * @default 'neutral'
   */
  color?: DateSegmentColor;
  /** 貼り付けた文字が日付として読めなかったあとに呼びます。値は変えません。`infoText` などで知らせるときに使います */
  onParseFailed?: (text: string) => void;
  'aria-describedby'?: string;
  /** 本体（灰色の欄）に付くクラス */
  className?: string;
}

/** 本体の中だけで使う口。内蔵の形（DateField・DatePicker）が、全角を直したことを Field の info に渡すために使います */
export interface DateFieldControlInnerProps extends DateFieldControlProps {
  onHalfWidth?: (kind: HalfWidthKind | null, empty: boolean) => void;
}

export function DateFieldControlInner({
  hideSuccessMark = false,
  readOnly,
  autoFocus,
  prefix,
  suffix,
  addonShape = 'attached',
  loadingIndicator = 'spinner',
  value,
  defaultValue,
  onValueChange,
  min,
  max,
  id,
  form,
  ref,
  inputProps,
  segmentPlaceholder = 'letters',
  locale: localeProp,
  timeZone: timeZoneProp,
  color = 'neutral',
  onParseFailed,
  onHalfWidth,
  className,
  'aria-describedby': ariaDescribedBy,
}: DateFieldControlInnerProps) {
  // ラベルは <label> にしない（本体は区切りの group で、ラベルは aria-labelledby でつなぐ）
  useFieldControlKind({ nativeLabel: false });
  const field = useFieldState();
  const disabled = field?.disabled ?? false;
  const loading = field?.loading ?? false;
  const blocking = field?.blocking ?? false;
  const { locale, timeZone } = useLocale(localeProp, timeZoneProp);
  const layout = useMemo(() => dateLayout(locale), [locale]);
  // 範囲の外かどうかを決めるため、いまの値をここでも持つ
  const [inner, setInner] = useState<PlainDate | null>(defaultValue ?? null);
  const outOfRange = isDateOutOfRange(value !== undefined ? value : inner, min, max);
  // 年が後ろの書き方（9/20/2026）は、並びで月が日より前なら 月/日 と読む
  const types = layout.parts.flatMap((part) => (part.kind === 'segment' ? [part.type] : []));
  const monthFirst = types.indexOf('month') < types.indexOf('day');

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
      className={cn(dateSegmentColorClass[color], className)}
      focusTarget={(box) => box.querySelector<HTMLElement>('[role="spinbutton"]')}
    >
      {(describedBy) => (
        <DateSegmentGroup<PlainDate>
          layout={layout}
          locale={locale}
          placeholderStyle={segmentPlaceholder}
          value={value}
          defaultValue={defaultValue}
          onValueChange={(next) => {
            setInner(next);
            onValueChange?.(next);
          }}
          toValue={toPlainDate}
          fromValue={fromPlainDate}
          equals={(a, b) => a.equals(b)}
          placeholderValues={() => fromPlainDate(todayIn(timeZone))}
          parseText={(text) => {
            const parsed = parseDateText(text, monthFirst);
            return parsed && { ...parsed };
          }}
          onParseFailed={onParseFailed}
          onHalfWidth={onHalfWidth}
          toFormValue={(date) => date?.toString() ?? ''}
          id={id}
          form={form}
          ref={ref}
          groupProps={inputProps}
          disabled={disabled}
          readOnly={readOnly}
          blocking={blocking}
          invalid={Boolean(field?.invalid) || outOfRange}
          required={field?.required}
          autoFocus={autoFocus}
          busy={loading}
          describedBy={describedBy}
        />
      )}
    </FieldBox>
  );
}
