'use client';

import { useState } from 'react';

import {
  TimeFieldControl,
  type TimeFieldControlProps,
} from '../../internal/date-segments/TimeFieldControl';
import type { PlainTime } from '../../internal/date/plain-date';
import { isTimeOutOfRange } from '../../internal/date/range';
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

export type { TimeFieldControlProps } from '../../internal/date-segments/TimeFieldControl';
export { TimeFieldControl };

/** TimeField の props から、label・accessibleName の組み合わせの決まりを外したもの */
export type TimeFieldBaseProps = Omit<TimeFieldControlProps, 'className'> &
  Omit<InputFieldProps, 'placeholder'> &
  HalfWidthNoticeProps & {
    /** フォームに送る名前。値は ISO 8601 の時刻（「15:05」、秒を出すときは「15:05:30」）で、そろっていないときは空 */
    name?: string;
    /**
     * 必須にします。欄に aria-required を付け、ラベルの後ろに印（既定は「必須」のタグ）を出します。印は読み上げから外れます
     * @default false
     */
    required?: boolean;
  };

/** TimeField の props。label か accessibleName のどちらかが要ります */
export type TimeFieldProps = FieldNamed<TimeFieldBaseProps>;

/**
 * 時刻を時・分（秒）の区切りごとに打つ欄
 */
export function TimeField(props: TimeFieldProps) {
  const [field, { halfWidthNotice = false, ...control }] = splitFieldProps(
    props as TimeFieldBaseProps
  );
  // 全角を半角に直したことの知らせ（既定は知らせない）。直すのは区切りの欄（NFKC）で、ここは知らせるだけ
  const { notice, noticed } = useHalfWidthNotice(halfWidthNotice);
  // 範囲の外のときは欄をエラーの見た目にする。いまの値を外枠でも持つ
  const [inner, setInner] = useState<PlainTime | null>(control.defaultValue ?? null);
  const current = control.value !== undefined ? control.value : inner;
  const outOfRange = isTimeOutOfRange(current, control.min, control.max);
  const { onValueChange } = control;
  return (
    <Field {...field} info={field.info ?? notice} invalid={outOfRange} nativeLabel={false}>
      {() => (
        <HalfWidthNoticedContext value={noticed}>
          <TimeFieldControl
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
