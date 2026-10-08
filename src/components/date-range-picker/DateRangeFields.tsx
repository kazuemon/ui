'use client';

import { Field as BaseField } from '@base-ui/react/field';
import { type ReactNode, useMemo } from 'react';

import type { DateRangeValue } from './DateRangePickerPanel';
import type { AddonShape } from '../field-addon/field-addon-context';
import type { LoadingIndicator } from '../loading/Loading';
import { type PlainDate, todayIn } from '../../internal/date/plain-date';
import { type DateSegmentColor, dateSegmentColorClass } from '../../internal/date-segments/colors';
import { DateSegmentGroup } from '../../internal/date-segments/DateSegmentGroup';
import type { SegmentPlaceholder } from '../../internal/date-segments/labels';
import { parseDateText } from '../../internal/date-segments/parse';
import { dateLayout, fromPlainDate, toPlainDate } from '../../internal/date-segments/segments';
import { useFieldControlKind, useFieldState } from '../../internal/field/Field';
import { FieldBox } from '../../internal/field/FieldBox';
import { cn } from '../../internal/tv';

// 期間を打つ欄。始まりと終わりの 2 つの区切りの欄（DateField と同じ区切り）を、1 つの欄に並べる
//   2 つの区切りは、それぞれ見えない名前（開始日・終了日）を持つ。外側の group が欄のラベルを持つ
//   区切りの欄は Base UI の Field.Control を 1 つずつ持つので、それぞれ入れ子の Field.Root で包み、外の Field（ラベル・検証）と分ける
//   外の Field には、期間をまとめた隠れた input（ISO 8601 の期間「2026-09-20/2026-09-27」）を 1 つだけ登録する
// 間の記号は separator（既定は「〜」）。見た目だけで、読み上げには出さない（区切りの名前の 開始日・終了日 で分かる）

interface DateRangeFieldsProps {
  value: DateRangeValue;
  onStartChange: (date: PlainDate | null) => void;
  onEndChange: (date: PlainDate | null) => void;
  /** 始まりと終わりの区切りの名前（読み上げだけ） */
  startName: string;
  endName: string;
  /** 範囲の外・前後が逆のとき、その端の区切りを aria-invalid にする */
  invalidStart: boolean;
  invalidEnd: boolean;
  /** 始まりと終わりのあいだに置くもの（見た目だけ） */
  separator: ReactNode;
  prefix?: ReactNode;
  /** 終わりの欄の右端に付くもの（消去・カレンダーを開くボタン） */
  suffix?: ReactNode;
  addonShape: AddonShape;
  loadingIndicator: LoadingIndicator;
  hideSuccessMark: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
  segmentPlaceholder: SegmentPlaceholder;
  locale: string;
  timeZone: string;
  color: DateSegmentColor;
  onParseFailed?: (text: string) => void;
  form?: string;
  'aria-describedby'?: string;
  className?: string;
}

const firstSegment = (box: HTMLElement) => box.querySelector<HTMLElement>('[role="spinbutton"]');

export function DateRangeFields({
  value,
  onStartChange,
  onEndChange,
  startName,
  endName,
  invalidStart,
  invalidEnd,
  separator,
  prefix,
  suffix,
  addonShape,
  loadingIndicator,
  hideSuccessMark,
  readOnly,
  autoFocus,
  segmentPlaceholder,
  locale,
  timeZone,
  color,
  onParseFailed,
  form,
  'aria-describedby': ariaDescribedBy,
  className,
}: DateRangeFieldsProps) {
  // ラベルは <label> にしない（本体は区切りの group で、ラベルは aria-labelledby でつなぐ）
  useFieldControlKind({ nativeLabel: false });
  const field = useFieldState();
  const disabled = field?.disabled ?? false;
  const loading = field?.loading ?? false;
  const blocking = field?.blocking ?? false;
  const invalid = Boolean(field?.invalid);
  const layout = useMemo(() => dateLayout(locale), [locale]);
  const types = layout.parts.flatMap((part) => (part.kind === 'segment' ? [part.type] : []));
  const monthFirst = types.indexOf('month') < types.indexOf('day');
  // フォームに送る値。両端がそろったときだけ、ISO 8601 の期間（「2026-09-20/2026-09-27」）にする
  const formValue =
    value.start && value.end ? `${value.start.toString()}/${value.end.toString()}` : '';

  // 区切りの欄 1 つ分。入れ子の Field.Root で包み、見えない名前（開始日・終了日）を付ける
  const part = (
    which: 'start' | 'end',
    describedBy: string | undefined,
    partClassName: string | undefined
  ) => (
    <BaseField.Root
      key={which}
      disabled={disabled || undefined}
      data-range-part={which}
      // 幅が足りないときは、区切りを隣（記号・終わりの欄）へはみ出させず、ここで切る
      className={cn('flex h-full min-w-0 overflow-hidden', partClassName)}
    >
      <BaseField.Label nativeLabel={false} render={<span />} className="sr-only">
        {which === 'start' ? startName : endName}
      </BaseField.Label>
      <DateSegmentGroup<PlainDate>
        layout={layout}
        locale={locale}
        placeholderStyle={segmentPlaceholder}
        value={value[which]}
        defaultValue={null}
        onValueChange={which === 'start' ? onStartChange : onEndChange}
        toValue={toPlainDate}
        fromValue={fromPlainDate}
        equals={(a, b) => a.equals(b)}
        placeholderValues={() => fromPlainDate(todayIn(timeZone))}
        parseText={(text) => {
          const parsed = parseDateText(text, monthFirst);
          return parsed && { ...parsed };
        }}
        onParseFailed={onParseFailed}
        toFormValue={(date) => date?.toString() ?? ''}
        // 区切りの値はフォームに送らない（期間は外の隠れた input がまとめて送る）
        name=""
        disabled={disabled}
        readOnly={readOnly}
        blocking={blocking}
        invalid={invalid || (which === 'start' ? invalidStart : invalidEnd)}
        required={field?.required}
        autoFocus={which === 'start' && autoFocus}
        busy={loading}
        describedBy={describedBy}
        groupProps={{ className: partGroupClass[which] }}
      />
    </BaseField.Root>
  );

  const separatorNode = (
    <span
      aria-hidden
      data-slot="date-range-separator"
      // 記号は、区切りと同じ文字の色（押せないときは一緒に薄くする）。アイコンを渡されたときも中央にそろえる
      className="flex flex-none items-center px-(--date-range-picker-separator-gap) group-data-disabled/field:text-(color:--color-on-field-disabled)"
    >
      {separator}
    </span>
  );

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
            tabIndex={-1}
            data-slot="date-range"
            className="flex w-full min-w-0 items-center outline-none"
            // ラベルを押したとき（Base UI がこの group にフォーカスを移す）は、始まりの最初の区切りへ
            onFocus={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) control.onFocus?.(event);
              if (event.target === event.currentTarget) firstSegment(event.currentTarget)?.focus();
            }}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget))
                control.onBlur?.(event as never);
            }}
          >
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
              focusTarget={firstSegment}
            >
              {(describedBy) => (
                <>
                  {part('start', describedBy, 'flex-none')}
                  {separatorNode}
                  {part('end', describedBy, 'flex-1')}
                </>
              )}
            </FieldBox>
          </div>
          <input
            ref={control.ref}
            type="hidden"
            // Base UI の Field.Control は、Field.Root の name を render の props に入れる（型の HTMLProps には無い）
            name={(control as { name?: string }).name}
            form={form}
            value={formValue}
            disabled={disabled}
          />
        </>
      )}
    />
  );
}

// 始まりの区切りは中身の幅にし、終わりの区切りが残りを取る。間の記号の左右の余白は記号が持つ
const partGroupClass: Record<'start' | 'end', string> = {
  start: 'w-auto pe-0',
  end: 'ps-0',
};
