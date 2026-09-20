'use client';

import { useMemo, useState } from 'react';

import { type DateSegmentColor, dateSegmentColorClass } from '../../internal/date-segments/colors';
import { DateSegmentGroup } from '../../internal/date-segments/DateSegmentGroup';
import type { SegmentPlaceholder } from '../../internal/date-segments/labels';
import { parseDateText } from '../../internal/date-segments/parse';
import { dateLayout, fromPlainDate, toPlainDate } from '../../internal/date-segments/segments';
import { type PlainDate, Temporal, todayIn } from '../../internal/date/plain-date';
import { useLocale } from '../../internal/date/use-locale';
import { Field } from '../../internal/field/Field';
import { FieldBox } from '../../internal/field/FieldBox';
import { type HalfWidthNoticeProps, useHalfWidthNotice } from '../../internal/half-width';
import type { InputFieldProps } from '../../internal/field/input-field-props';
import { useFormSubmittingLock } from '../../internal/form-context';

export type { SegmentPlaceholder } from '../../internal/date-segments/labels';

export interface DateFieldProps extends Omit<InputFieldProps, 'placeholder'>, HalfWidthNoticeProps {
  /** 入っている日（制御するとき）。年・月・日がそろっていないときは null */
  value?: PlainDate | null;
  /** はじめに入れておく日 */
  defaultValue?: PlainDate | null;
  /** 年・月・日がそろったとき（そろった値を消したときは null） */
  onValueChange?: (value: PlainDate | null) => void;
  /**
   * 入れてよいいちばん前の日。これより前の日が入ると、欄をエラーの見た目（赤い枠線・aria-invalid）にします。
   * 区切りの増減は止めません。理由の文は `error` で渡します
   */
  min?: PlainDate;
  /** 入れてよいいちばん後の日。扱いは min と同じ */
  max?: PlainDate;
  /** フォームに送る名前。値は ISO 8601 の日付（「2026-09-20」）で、そろっていないときは空 */
  name?: string;
  disabled?: boolean;
  readOnly?: boolean;
  /**
   * 必須にします。欄に required を付け、ラベルの後ろに印（既定は「必須」のタグ）を出します。印は読み上げから外れます
   * @default false
   */
  required?: boolean;
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
  /** 貼り付けた文字が日付として読めなかったとき。値は変えません。`info` などで知らせるときに使います */
  onParseFail?: (text: string) => void;
  'aria-describedby'?: string;
}

/**
 * 日付を年・月・日の区切りごとに打つ欄
 */
export function DateField({
  label,
  caption,
  captionPlacement,
  error,
  warning,
  success,
  successMark = true,
  info,
  disabled,
  readOnly,
  required,
  requiredMark,
  optionalMark,
  autoFocus,
  className,
  prefix,
  suffix,
  addonShape = 'attached',
  loading = false,
  loadingBehavior = 'non-blocking',
  loadingIndicator = 'spinner',
  value,
  defaultValue,
  onValueChange,
  min,
  max,
  name,
  segmentPlaceholder = 'letters',
  locale: localeProp,
  timeZone: timeZoneProp,
  color = 'neutral',
  onParseFail,
  halfWidthNotice = false,
  'aria-describedby': ariaDescribedBy,
}: DateFieldProps) {
  const formLock = useFormSubmittingLock();
  const blocking = (loading && loadingBehavior === 'blocking') || formLock.blocking;
  // 全角を半角に直したことの知らせ（既定は知らせない）。直すのは区切りの欄（NFKC）で、ここは知らせるだけ
  const { notice, noticed } = useHalfWidthNotice(halfWidthNotice);
  const { locale, timeZone } = useLocale(localeProp, timeZoneProp);
  const layout = useMemo(() => dateLayout(locale), [locale]);
  // 範囲の外かどうかを決めるため、いまの値をここでも持つ
  const [inner, setInner] = useState<PlainDate | null>(defaultValue ?? null);
  const current = value !== undefined ? value : inner;
  const outOfRange =
    current != null &&
    ((min != null && Temporal.PlainDate.compare(current, min) < 0) ||
      (max != null && Temporal.PlainDate.compare(current, max) > 0));
  // 年が後ろの書き方（9/20/2026）は、並びで月が日より前なら 月/日 と読む
  const types = layout.parts.flatMap((part) => (part.kind === 'segment' ? [part.type] : []));
  const monthFirst = types.indexOf('month') < types.indexOf('day');

  return (
    <Field
      label={label}
      caption={caption}
      captionPlacement={captionPlacement}
      error={error}
      invalid={outOfRange}
      warning={warning}
      success={success}
      info={info ?? notice}
      disabled={disabled}
      loading={loading}
      loadingBehavior={loadingBehavior}
      required={required}
      requiredMark={requiredMark}
      optionalMark={optionalMark}
      className={className}
      nativeLabel={false}
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
          className={dateSegmentColorClass[color]}
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
              onParseFail={onParseFail}
              onHalfWidth={noticed}
              toFormValue={(date) => date?.toString() ?? ''}
              name={name}
              disabled={disabled}
              readOnly={readOnly}
              blocking={blocking}
              invalid={!!error || outOfRange}
              required={required}
              autoFocus={autoFocus}
              busy={loading}
              describedBy={describedBy}
            />
          )}
        </FieldBox>
      )}
    </Field>
  );
}
