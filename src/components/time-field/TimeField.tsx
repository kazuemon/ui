'use client';

import { type ComponentProps, type Ref, useMemo, useState } from 'react';

import { type DateSegmentColor, dateSegmentColorClass } from '../../internal/date-segments/colors';
import { DateSegmentGroup } from '../../internal/date-segments/DateSegmentGroup';
import type { SegmentPlaceholder } from '../../internal/date-segments/labels';
import { parseTimeText } from '../../internal/date-segments/parse';
import { fromPlainTime, timeLayout, toPlainTime } from '../../internal/date-segments/segments';
import { type PlainTime, Temporal } from '../../internal/date/plain-date';
import { useLocale } from '../../internal/date/use-locale';
import { Field } from '../../internal/field/Field';
import { FieldBox } from '../../internal/field/FieldBox';
import { type HalfWidthNoticeProps, useHalfWidthNotice } from '../../internal/half-width';
import type { InputFieldProps } from '../../internal/field/input-field-props';
import { useFormSubmittingLock } from '../../internal/form-context';

export interface TimeFieldProps extends Omit<InputFieldProps, 'placeholder'>, HalfWidthNoticeProps {
  /** 値（制御）。時・分がそろっていないときは null */
  value?: PlainTime | null;
  /** はじめの値（非制御） */
  defaultValue?: PlainTime | null;
  /** 値が変わるときに、次の値を渡して呼びます（時・分（秒）がそろったとき。そろった値を消したときは null） */
  onValueChange?: (value: PlainTime | null) => void;
  /**
   * 入れてよいいちばん早い時刻。これより前の時刻が入ると、欄をエラーの見た目（赤い枠線・aria-invalid）にします。
   * 区切りの増減は止めません。理由の文は `errorText` で渡します
   */
  min?: PlainTime;
  /** 入れてよいいちばん遅い時刻。扱いは min と同じ */
  max?: PlainTime;
  /**
   * 12 時間制か 24 時間制か。12 では午前・午後の区切りが付きます
   * @default ロケールの既定（ja-JP は 24）
   */
  hourCycle?: 12 | 24;
  /**
   * 秒の区切りを出す
   * @default false
   */
  showSeconds?: boolean;
  /**
   * 分の区切りを ↑↓ で増減するときの刻み（5 なら 0・5・10…）。打てる値は刻みに縛りません
   * @default 1
   */
  minuteStep?: number;
  /** 中の区切りを並べる要素の id */
  id?: string;
  /** 中の区切りを並べる要素への ref */
  ref?: Ref<HTMLDivElement>;
  /** 中の区切りを並べる要素に渡すもの（class・data-* など）。欄の外枠には className を使います */
  inputProps?: ComponentProps<'div'>;
  /** フォームに送る名前。値は ISO 8601 の時刻（「15:05」、秒を出すときは「15:05:30」）で、そろっていないときは空 */
  name?: string;
  /** 押せない（Disabled）状態にします */
  disabled?: boolean;
  /** 読み取り専用。値は読めて写せますが、書き換えられません */
  readOnly?: boolean;
  /**
   * 必須にします。欄に required を付け、ラベルの後ろに印（既定は「必須」のタグ）を出します。印は読み上げから外れます
   * @default false
   */
  required?: boolean;
  /** 描いたあとに、最初の区切りへフォーカスを移します */
  autoFocus?: boolean;
  /**
   * 空の区切りに出す見本の書き方。letters は「hh:mm」、units は「時:分」、dashes は「--:--」
   * @default 'letters'
   */
  segmentPlaceholder?: SegmentPlaceholder;
  /**
   * 言語。区切りの並びと記号、午前・午後の書き方がこれに従います
   * @default ThemeProvider の locale、なければ 'ja-JP'
   */
  locale?: string;
  /**
   * 欄の色。いま打っている区切りの塗りと、フォーカスの枠線の色がこれに従います。
   * neutral（既定）はグレーの塗り、primary・secondary はその色の淡い塗りです。Select の color と同じ意味です
   * @default 'neutral'
   */
  color?: DateSegmentColor;
  /** 貼り付けた文字が時刻として読めなかったあとに呼びます。値は変えません。`infoText` などで知らせるときに使います */
  onParseFailed?: (text: string) => void;
  'aria-describedby'?: string;
}

/**
 * 時刻を時・分（秒）の区切りごとに打つ欄
 */
export function TimeField({
  label,
  caption,
  captionPlacement,
  errorText,
  warningText,
  successText,
  hideSuccessMark = false,
  infoText,
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
  hourCycle,
  showSeconds = false,
  minuteStep = 1,
  name,
  id,
  ref,
  inputProps,
  segmentPlaceholder = 'letters',
  locale: localeProp,
  color = 'neutral',
  onParseFailed,
  halfWidthNotice = false,
  validate,
  validationMode,
  validationDebounceTime,
  'aria-describedby': ariaDescribedBy,
}: TimeFieldProps) {
  const formLock = useFormSubmittingLock();
  const blocking = (loading && loadingBehavior === 'blocking') || formLock.blocking;
  // 全角を半角に直したことの知らせ（既定は知らせない）。直すのは区切りの欄（NFKC）で、ここは知らせるだけ
  const { notice, noticed } = useHalfWidthNotice(halfWidthNotice);
  const { locale } = useLocale(localeProp);
  const layout = useMemo(
    () => timeLayout(locale, { hourCycle, showSeconds }),
    [locale, hourCycle, showSeconds]
  );
  const [inner, setInner] = useState<PlainTime | null>(defaultValue ?? null);
  const current = value !== undefined ? value : inner;
  const outOfRange =
    current != null &&
    ((min != null && Temporal.PlainTime.compare(current, min) < 0) ||
      (max != null && Temporal.PlainTime.compare(current, max) > 0));

  return (
    <Field
      label={label}
      caption={caption}
      captionPlacement={captionPlacement}
      error={errorText}
      invalid={outOfRange}
      warning={warningText}
      success={successText}
      info={infoText ?? notice}
      disabled={disabled}
      loading={loading}
      loadingBehavior={loadingBehavior}
      required={required}
      requiredMark={requiredMark}
      optionalMark={optionalMark}
      className={className}
      nativeLabel={false}
      name={name}
      validate={validate}
      validationMode={validationMode}
      validationDebounceTime={validationDebounceTime}
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
          success={successText}
          successMark={!hideSuccessMark}
          error={errorText}
          describedBy={ariaDescribedBy}
          messageIds={messageIds}
          className={dateSegmentColorClass[color]}
          focusTarget={(box) => box.querySelector<HTMLElement>('[role="spinbutton"]')}
        >
          {(describedBy) => (
            <DateSegmentGroup<PlainTime>
              // 12 時間制・秒の有無を切り替えたら、区切りを作り直す
              key={`${layout.hourCycle}${showSeconds}`}
              layout={layout}
              locale={locale}
              placeholderStyle={segmentPlaceholder}
              value={value}
              defaultValue={defaultValue}
              onValueChange={(next) => {
                setInner(next);
                onValueChange?.(next);
              }}
              toValue={(values) => toPlainTime(values, layout)}
              fromValue={(time) => fromPlainTime(time, layout)}
              equals={(a, b) => a.equals(b)}
              placeholderValues={() => fromPlainTime({ hour: 0, minute: 0, second: 0 }, layout)}
              parseText={(text) => {
                const parsed = parseTimeText(text);
                return parsed && fromPlainTime(parsed, layout);
              }}
              steps={{ minute: minuteStep }}
              onParseFailed={onParseFailed}
              onHalfWidth={noticed}
              toFormValue={(time) =>
                time?.toString({ smallestUnit: showSeconds ? 'second' : 'minute' }) ?? ''
              }
              name={name}
              id={id}
              ref={ref}
              groupProps={inputProps}
              disabled={disabled}
              readOnly={readOnly}
              blocking={blocking}
              invalid={!!errorText || outOfRange}
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
