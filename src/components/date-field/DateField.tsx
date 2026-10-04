'use client';

import { useState } from 'react';

import {
  DateFieldControl,
  type DateFieldControlProps,
} from '../../internal/date-segments/DateFieldControl';
import type { PlainDate } from '../../internal/date/plain-date';
import { isDateOutOfRange } from '../../internal/date/range';
import { Field } from '../../internal/field/Field';
import {
  HalfWidthNoticedContext,
  type HalfWidthNoticeProps,
  useHalfWidthNotice,
} from '../../internal/half-width';
import {
  type FieldNamed,
  type InputFieldProps,
  splitFieldProps,
} from '../../internal/field/input-field-props';

export type { SegmentPlaceholder } from '../../internal/date-segments/labels';
export type { DateFieldControlProps } from '../../internal/date-segments/DateFieldControl';
export { DateFieldControl };

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
  const outOfRange = isDateOutOfRange(current, control.min, control.max);
  const { onValueChange } = control;
  return (
    <Field {...field} info={field.info ?? notice} invalid={outOfRange} nativeLabel={false}>
      {() => (
        <HalfWidthNoticedContext value={noticed}>
          <DateFieldControl
            {...control}
            onValueChange={(next) => {
              setInner(next);
              onValueChange?.(next);
            }}
          />
        </HalfWidthNoticedContext>
      )}
    </Field>
  );
}
