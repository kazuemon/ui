'use client';

import { type ComponentProps, type Ref, useMemo, useState } from 'react';

import { type DateSegmentColor, dateSegmentColorClass } from '../../internal/date-segments/colors';
import { DateSegmentGroup } from '../../internal/date-segments/DateSegmentGroup';
import type { SegmentPlaceholder } from '../../internal/date-segments/labels';
import { parseDateText } from '../../internal/date-segments/parse';
import { dateLayout, fromPlainDate, toPlainDate } from '../../internal/date-segments/segments';
import { type PlainDate, Temporal, todayIn } from '../../internal/date/plain-date';
import { useLocale } from '../../internal/date/use-locale';
import { Field, useFieldControlKind, useFieldState } from '../../internal/field/Field';
import { FieldBox } from '../../internal/field/FieldBox';
import {
  type HalfWidthKind,
  type HalfWidthNoticeProps,
  useHalfWidthNotice,
} from '../../internal/half-width';
import {
  type FieldNamed,
  type InputFieldProps,
  splitFieldProps,
} from '../../internal/field/input-field-props';
import { cn } from '../../internal/tv';

export type { SegmentPlaceholder } from '../../internal/date-segments/labels';

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

/** 本体の中だけで使う口。内蔵の形（DateField）が、全角を直したことを Field の info に渡すために使います */
interface DateFieldControlInnerProps extends DateFieldControlProps {
  onHalfWidth?: (kind: HalfWidthKind | null, empty: boolean) => void;
}

/** いまの値が min・max の外か */
function isOutOfRange(current: PlainDate | null, min?: PlainDate, max?: PlainDate) {
  return (
    current != null &&
    ((min != null && Temporal.PlainDate.compare(current, min) < 0) ||
      (max != null && Temporal.PlainDate.compare(current, max) > 0))
  );
}

/**
 * 日付の区切りの欄の本体（組み立て用）。Field の中に置き、ラベル・キャプション・状態の行は FieldLabel などで並べます。
 * 押せない・待っている・エラー・成功・必須の状態と、説明のつながり（aria-describedby）は、包む Field から受け取ります。
 * フォームに送る名前は Field の name です。min・max の外の値は区切りを aria-invalid にしますが、欄の枠線を赤くするには Field に errorText を渡します
 */
export function DateFieldControl(props: DateFieldControlProps) {
  return <DateFieldControlInner {...props} />;
}

function DateFieldControlInner({
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
  const outOfRange = isOutOfRange(value !== undefined ? value : inner, min, max);
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

/** DateField の props から、label・accessibleName の組み合わせの決まりを外したもの */
export type DateFieldBaseProps = Omit<DateFieldControlProps, 'className'> &
  Omit<InputFieldProps, 'placeholder'> &
  HalfWidthNoticeProps & {
    /** フォームに送る名前。値は ISO 8601 の日付（「2026-09-20」）で、そろっていないときは空 */
    name?: string;
    /**
     * 必須にします。欄に aria-required を付け、ラベルの後ろに印（既定は「必須」のタグ）を出します。印は読み上げから外れます
     * @default false
     */
    required?: boolean;
  };

/** DateField の props。label か accessibleName のどちらかが要ります */
export type DateFieldProps = FieldNamed<DateFieldBaseProps>;

/**
 * 日付を年・月・日の区切りごとに打つ欄
 */
export function DateField(props: DateFieldProps) {
  const [field, { halfWidthNotice = false, ...control }] = splitFieldProps(
    props as DateFieldBaseProps
  );
  // 全角を半角に直したことの知らせ（既定は知らせない）。直すのは区切りの欄（NFKC）で、ここは知らせるだけ
  const { notice, noticed } = useHalfWidthNotice(halfWidthNotice);
  // 範囲の外のときは欄をエラーの見た目にする。いまの値を外枠でも持つ
  const [inner, setInner] = useState<PlainDate | null>(control.defaultValue ?? null);
  const current = control.value !== undefined ? control.value : inner;
  const outOfRange = isOutOfRange(current, control.min, control.max);
  const { onValueChange } = control;
  return (
    <Field {...field} info={field.info ?? notice} invalid={outOfRange} nativeLabel={false}>
      {() => (
        <DateFieldControlInner
          {...control}
          onValueChange={(next) => {
            setInner(next);
            onValueChange?.(next);
          }}
          onHalfWidth={noticed}
        />
      )}
    </Field>
  );
}
