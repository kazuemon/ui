'use client';

import { OTPField } from '@base-ui/react/otp-field';
import { Fragment, type ReactNode, useRef } from 'react';

import { Field, FieldSpinner, FieldSuccessMark } from '../../internal/field/Field';
import { controlBox } from '../../internal/field/field-styles';
import {
  type HalfWidthKind,
  type HalfWidthNoticeProps,
  toHalfWidth,
  useHalfWidthNotice,
} from '../../internal/half-width';
import type { InputFieldProps } from '../../internal/field/input-field-props';
import { useFormSubmittingLock } from '../../internal/form-context';

/** 1 桁に入れてよい文字。numeric は数字、alpha は英字、alphanumeric は英数字、none は何でも */
export type PinFieldValidationType = 'numeric' | 'alpha' | 'alphanumeric' | 'none';

const rejected: Record<Exclude<PinFieldValidationType, 'none'>, RegExp> = {
  numeric: /[^0-9]/g,
  alpha: /[^a-zA-Z]/g,
  alphanumeric: /[^a-zA-Z0-9]/g,
};

// 箱 1 つずつは、文字を打つ欄の本体（controlBox）と同じ規則（原則2・8・13）
//   グレーの塗り・枠線なし、フォーカスの箱だけ枠線、エラーは赤い枠線と淡い赤の塗り、押せない・読み取り専用・送信中も同じ
// 箱は離して並べる（軸 170 で決定）
const boxClass = controlBox({
  className: [
    'w-(--pin-field-box-width) min-w-0 shrink px-0 text-center text-(length:--pin-field-text) tabular-nums',
    'caret-(color:--color-fg) disabled:cursor-not-allowed',
  ],
});

// まだ打っていない箱の淡い点（emptyDots）。フォーカスの箱ではキャレットと重ならないよう消す
// 伏せ字では打った ● と見分けられるよう、塗った点ではなく輪にする
const emptyDotClass = {
  dot: 'not-data-filled:bg-[image:radial-gradient(circle,var(--field-placeholder)_var(--pin-field-dot-size),transparent_calc(var(--pin-field-dot-size)+0.5px))]',
  ring: 'not-data-filled:bg-[image:radial-gradient(circle,transparent_calc(var(--pin-field-dot-size)-var(--border-width-thick)),var(--field-placeholder)_calc(var(--pin-field-dot-size)-var(--border-width-thick)+0.5px),var(--field-placeholder)_var(--pin-field-dot-size),transparent_calc(var(--pin-field-dot-size)+0.5px))]',
};
const emptyDotFocusClass = 'not-data-filled:focus-within:bg-none';

export interface PinFieldProps
  extends
    Pick<
      InputFieldProps,
      | 'label'
      | 'caption'
      | 'captionPlacement'
      | 'error'
      | 'warning'
      | 'success'
      | 'successMark'
      | 'info'
      | 'className'
      | 'loadingBehavior'
      | 'requiredMark'
      | 'optionalMark'
    >,
    HalfWidthNoticeProps {
  /**
   * 待っている（コードを確かめている・送っているなど）。箱の列の右に回る円を出し、aria-busy を付けます
   * @default false
   */
  loading?: boolean;
  /**
   * 桁の数
   * @default 6
   */
  length?: number;
  /** 値（制御するとき） */
  value?: string;
  /** はじめの値（制御しないとき） */
  defaultValue?: string;
  /** 値が変わったとき。全角の数字は半角に直し、入れてよくない文字は除いた値を受け取ります */
  onValueChange?: (value: string) => void;
  /** 全部の桁が埋まったとき（貼り付けで埋まったときも） */
  onValueComplete?: (value: string) => void;
  /**
   * 打った文字を伏せ字（●）にする
   * @default false
   */
  mask?: boolean;
  /**
   * 全部の桁が埋まったら、囲んでいる form を送る
   * @default false
   */
  autoSubmit?: boolean;
  /**
   * 1 桁に入れてよい文字
   * @default 'numeric'
   */
  validationType?: PinFieldValidationType;
  /**
   * 値を直す関数。全角を半角に直したあと、入れてよくない文字を除く前に呼びます（大文字にそろえるなど）
   */
  normalizeValue?: (value: string) => string;
  /**
   * 区切りを入れる位置。桁の数の並びで、たとえば [3, 3] は 3 桁と 3 桁のあいだに区切りを置きます。
   * 合計が length と合わないときは区切りません
   */
  group?: number[];
  /**
   * group の区切りに置くもの。文字（`'-'`・`'/'` など）を渡すと、打った文字と同じ大きさで淡い色に描きます。
   * `null` は何も置かず、間だけ空けます。区切りは読み上げません。既定は短い横線です
   */
  groupSeparator?: ReactNode;
  /**
   * まだ打っていない箱の真ん中に淡い点を置く。あと何桁あるかが、箱を数えなくても分かります。
   * 伏せ字（mask）では、打った ● と見分けられるよう輪にします
   * @default false
   */
  emptyDots?: boolean;
  /** 押せない */
  disabled?: boolean;
  /** 読み取り専用。値は読めて写せますが、書き換えられません */
  readOnly?: boolean;
  /** 送るときの名前（form の値の名前） */
  name?: string;
  /** 関連づける form の id */
  form?: string;
  /**
   * 必須にします。箱の列に required を付け、ラベルの後ろに印（既定は「必須」のタグ）を出します。印は読み上げから外れます
   * @default false
   */
  required?: boolean;
  /** 1 桁目の input の id。2 桁目からは `{id}-2` のように続きます */
  id?: string;
  /**
   * 1 桁目の autocomplete。SMS で届いたコードを端末が差し出せるよう、既定は one-time-code です
   * @default 'one-time-code'
   */
  autoComplete?: string;
  /**
   * 2 桁目からの読み上げの名前。既定は「2 桁目（全 6 桁）」の形です。1 桁目はラベルで読みます
   */
  slotLabel?: (index: number, length: number) => string;
}

const defaultSlotLabel = (index: number, length: number) => `${index + 1} 桁目（全 ${length} 桁）`;

// group の合計が length と合うときだけ、区切りの位置（何桁目のあとか）を返す
function splitGroups(length: number, group: number[] | undefined): number[] {
  if (!group || group.length < 2) return [length];
  const valid = group.every((size) => Number.isInteger(size) && size > 0);
  const total = group.reduce((sum, size) => sum + size, 0);
  return valid && total === length ? group : [length];
}

// group の区切り。undefined は既定の短い横線、null は何も置かない、それ以外は渡されたものを淡い色で描く
// 区切りは値の一部ではないので読ませない
function GroupSeparator({ separator }: { separator: ReactNode }) {
  if (separator === null) return null;
  if (separator === undefined) {
    return (
      <span
        aria-hidden
        data-slot="pin-field-separator"
        className="h-(--border-width-thick) w-(--pin-field-dash-width) shrink-0 rounded-pill bg-(--pin-field-separator-color)"
      />
    );
  }
  return (
    <span
      aria-hidden
      data-slot="pin-field-separator"
      className="shrink-0 text-(length:--pin-field-text) leading-none text-(--pin-field-separator-color) select-none"
    >
      {separator}
    </span>
  );
}

/**
 * 確認コード・PIN を 1 桁ずつの箱に打つ欄。SMS やメールで届いたコードの入力に使う
 */
export function PinField({
  label,
  caption,
  captionPlacement,
  error,
  warning,
  success,
  successMark = true,
  info,
  className,
  loading = false,
  loadingBehavior = 'non-blocking',
  length = 6,
  validationType = 'numeric',
  normalizeValue,
  group,
  groupSeparator,
  emptyDots = false,
  disabled,
  readOnly,
  required,
  requiredMark,
  optionalMark,
  onValueChange,
  onValueComplete,
  slotLabel = defaultSlotLabel,
  halfWidthNotice = false,
  ...props
}: PinFieldProps) {
  // Form の送信中・blocking の待ちは、TextField と同じく押せない欄の見た目にし、書き換えを止める。フォーカスは外さない
  const formLock = useFormSubmittingLock();
  const blocking = (loading && loadingBehavior === 'blocking') || formLock.blocking;
  // 全角を半角に直したことの知らせ（既定は知らせない）。値を直す normalizeValue は描くときにも呼ばれるので、
  //   ここでは種類を覚えるだけにして、値が変わったとき（onValueChange）に知らせる
  const { notice, noticed } = useHalfWidthNotice(halfWidthNotice);
  const pending = useRef<HalfWidthKind | null>(null);
  // 文字の種類は部品の側で絞る。Base UI の numeric は全角の数字を直す前に捨ててしまうため
  const normalize = (value: string) => {
    const half = toHalfWidth(value);
    if (half.converted) pending.current = half.converted;
    const converted = normalizeValue ? normalizeValue(half.value) : half.value;
    return validationType === 'none' ? converted : converted.replace(rejected[validationType], '');
  };
  // 区切りごとの桁の範囲（何桁目から、何桁）
  const groups = splitGroups(length, group).map((size, i, all) => ({
    first: all.slice(0, i).reduce((sum, n) => sum + n, 0),
    size,
  }));
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
      required={required}
      requiredMark={requiredMark}
      optionalMark={optionalMark}
      className={className}
    >
      {(messageIds) => (
        <div
          data-slot="pin-field"
          className="flex items-center gap-(--pin-field-mark-gap) [--spacing-icon:var(--spacing-icon-input)]"
        >
          <OTPField.Root
            {...props}
            length={length}
            validationType="none"
            inputMode={validationType === 'numeric' ? 'numeric' : 'text'}
            normalizeValue={normalize}
            required={required}
            disabled={disabled}
            readOnly={blocking || readOnly}
            aria-describedby={messageIds}
            aria-busy={loading || undefined}
            onValueChange={(value) => {
              noticed(pending.current, value === '');
              pending.current = null;
              onValueChange?.(value);
            }}
            onValueComplete={onValueComplete && ((value) => onValueComplete(value))}
            className="flex min-w-0 items-center gap-(--pin-field-group-gap)"
          >
            {groups.map(({ first, size }, groupIndex) => {
              return (
                <Fragment key={first}>
                  {groupIndex > 0 && <GroupSeparator separator={groupSeparator} />}
                  <div data-slot="pin-field-group" className="flex min-w-0 gap-(--pin-field-gap)">
                    {Array.from({ length: size }, (_, offset) => {
                      const index = first + offset;
                      return (
                        <OTPField.Input
                          key={index}
                          data-slot="control"
                          data-field-readonly={readOnly || undefined}
                          aria-label={index === 0 ? undefined : slotLabel(index, length)}
                          // 1 桁目にだけ説明をつなぐ。どの桁でも読むと、1 桁ごとに同じ説明が続くため
                          aria-describedby={index === 0 ? messageIds : undefined}
                          aria-disabled={blocking || undefined}
                          className={[
                            boxClass,
                            emptyDots && emptyDotClass[props.mask ? 'ring' : 'dot'],
                            emptyDots && emptyDotFocusClass,
                            blocking && 'cursor-progress',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        />
                      );
                    })}
                  </div>
                </Fragment>
              );
            })}
          </OTPField.Root>
          {loading && <FieldSpinner />}
          {success && successMark && !error && !loading && <FieldSuccessMark />}
        </div>
      )}
    </Field>
  );
}
