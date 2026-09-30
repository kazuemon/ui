'use client';

import { type ComponentProps, type Ref, useMemo, useState } from 'react';

import { type DateSegmentColor, dateSegmentColorClass } from './colors';
import { DateSegmentGroup } from './DateSegmentGroup';
import type { SegmentPlaceholder } from './labels';
import { parseTimeText } from './parse';
import { fromPlainTime, timeLayout, toPlainTime } from './segments';
import type { PlainTime } from '../date/plain-date';
import { isTimeOutOfRange } from '../date/range';
import { useLocale } from '../date/use-locale';
import { useFieldControlKind, useFieldState } from '../field/Field';
import { FieldBox } from '../field/FieldBox';
import type { InputFieldProps } from '../field/input-field-props';
import type { HalfWidthKind } from '../half-width';
import { cn } from '../tv';

// 時刻の区切りの欄の本体。TimeField（TimeFieldControl）と TimePicker が使う。公開の入口には並べない

/** TimeField の本体（TimeFieldControl）の props。ラベル・キャプション・状態の文は、包む Field に渡します */
export interface TimeFieldControlProps extends Pick<
  InputFieldProps,
  'prefix' | 'suffix' | 'addonShape' | 'loadingIndicator' | 'hideSuccessMark'
> {
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
  /** 本体（灰色の欄）に付くクラス */
  className?: string;
}

/**
 * 本体の中だけで使う口。内蔵の形（TimeField・TimePicker）が、全角を直したことを Field の info に渡すために使います。
 * 公開の入口には並べません
 */
export interface TimeFieldControlInnerProps extends TimeFieldControlProps {
  onHalfWidth?: (kind: HalfWidthKind | null, empty: boolean) => void;
}

export function TimeFieldControlInner({
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
  hourCycle,
  showSeconds = false,
  minuteStep = 1,
  id,
  form,
  ref,
  inputProps,
  segmentPlaceholder = 'letters',
  locale: localeProp,
  color = 'neutral',
  onParseFailed,
  onHalfWidth,
  className,
  'aria-describedby': ariaDescribedBy,
}: TimeFieldControlInnerProps) {
  // ラベルは <label> にしない（本体は区切りの group で、ラベルは aria-labelledby でつなぐ）
  useFieldControlKind({ nativeLabel: false });
  const field = useFieldState();
  const disabled = field?.disabled ?? false;
  const loading = field?.loading ?? false;
  const blocking = field?.blocking ?? false;
  const { locale } = useLocale(localeProp);
  const layout = useMemo(
    () => timeLayout(locale, { hourCycle, showSeconds }),
    [locale, hourCycle, showSeconds]
  );
  const [inner, setInner] = useState<PlainTime | null>(defaultValue ?? null);
  const outOfRange = isTimeOutOfRange(value !== undefined ? value : inner, min, max);

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
          onHalfWidth={onHalfWidth}
          toFormValue={(time) =>
            time?.toString({ smallestUnit: showSeconds ? 'second' : 'minute' }) ?? ''
          }
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
