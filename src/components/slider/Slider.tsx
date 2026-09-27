'use client';

import { Slider as BaseSlider } from '@base-ui/react/slider';
import { type ReactNode, type Ref, useEffect, useRef, useState } from 'react';
import type { VariantProps } from 'tailwind-variants';

import {
  type CaptionPlacement,
  Field,
  type FieldValidate,
  type FieldValidationMode,
} from '../../internal/field/Field';
import type { FieldMarkProps } from '../../internal/field/FieldMark';
import type { FieldMessage } from '../../internal/field/input-field-props';
import { useChoiceLock } from '../../internal/form-context';
import { tv } from '../../internal/tv';
import { useMergedRefs } from '../../internal/use-merged-refs';

// つまみを動かして、決まった範囲の中から 1 つの値を選ぶ。Base UI の Slider を土台にする（キーボード・指・読み上げ）
// 並びは入力欄と同じ 3 層（原則4。internal/field の Field）: ラベル → キャプション → 本体 → エラー・警告などの行
//   値の文字は Meter と同じく、ラベルの行の右端に、ラベルと同じ大きさで一段淡く置く（数字の幅をそろえる）
//   値は本体の読み上げ（aria-valuenow・aria-valuetext）が伝えるので、見える値の文字は読み上げから外す（原則15: 二度読ませない）
// 本体は Meter・Progress のバー（internal/bar）の延長: 地（トグルの OFF と同じグレー）の上に、値までを部品の色で塗る。角は pill
//   入力欄の仲間なので、影も枠線もなく、hover で地が半段濃くなる（チェックボックスの箱と同じ色 — 原則3）
//   エラーでは地を赤みのグレーにし、つまみの内側に赤い線を引く（チェックボックスの箱と同じ — 原則8）
// つまみはトグルのノブと同じ白い丸。影は押せることの記号（原則1）。白い地にも載るので、輪郭の線を持つ影（白いボタンと同じ）
//   つまみはそれ自体が動くので、沈ませない（原則3）。押しているあいだの手応えは pressEffect で選ぶ — ADR-0321
//     grow（既定）: つまみが膨らむ。halo: つまみの外側に塗りの色の淡い輪。lift: 影を濃くして持ち上げ、塗りを濃くする（原則3の「沈む」と逆向き）。none: 変えない
//   つまみはトラックの両端の内側に収める（値が端でも、欄の幅からはみ出さない）
// 押せる範囲は見た目の範囲（原則17）: つまみの高さの帯だけが押せる。行は部品の高さを占め、帯はその縦の中央
// フォーカスの線は、キーボードで操作したときだけつまみの外側に描く（トグルと同じ — design/adr/0031）。色は部品の色
// 押せないとき（原則13）: 地は押せない箱と同じ薄いグレー、塗りは色を残して薄く（色なしはグレー）、つまみは影を消してグレー
// 読み取り専用・Form の送信中（原則8・14）: 押せないときと同じ見た目で、フォーカスはでき、値も送られる（トグルと同じ useChoiceLock）
const slider = tv({
  slots: {
    root: 'flex h-(--spacing-control) items-center',
    control: [
      'group/slider relative flex h-(--slider-thumb-size) w-full cursor-pointer touch-none items-center select-none',
      // つまみの直径は密度（--density-coarse）から計算する
      '[--slider-thumb-size:calc(var(--slider-thumb-size-fine)_+_var(--density-coarse)_*_(var(--slider-thumb-size-coarse)_-_var(--slider-thumb-size-fine)))]',
      // 地の色。hover で半段濃くする。エラーと押せないときは、hover でも変えない
      '[--slider-ground:var(--color-choice)] hover:[--slider-ground:var(--color-choice-hover)]',
      'data-invalid:not-data-disabled:[--color-choice-hover:var(--color-choice-invalid)] data-invalid:not-data-disabled:[--color-choice:var(--color-choice-invalid)]',
      'data-disabled:cursor-not-allowed data-disabled:[--color-choice-hover:var(--color-switch-off-disabled)] data-disabled:[--color-choice:var(--color-switch-off-disabled)]',
      '[--slider-fill:var(--slider-own)]',
      // 押しているあいだに差し替える値。既定は変えない値で、pressEffect が置き換える（下の variants）
      '[--slider-fill-press-darken:0%] [--slider-thumb-press-halo:0px] [--slider-thumb-press-scale:1] [--slider-thumb-press-shadow:var(--slider-thumb-shadow)]',
      // 押しているあいだ（つまみかトラックを押してから離すまで。Base UI の data-dragging と :active）は、塗りを濃くする
      //   濃さは --slider-fill-press-darken（本文の色を混ぜる割合）。押せないとき・止めているときは変えない
      'not-data-disabled:active:[--slider-fill:color-mix(in_oklab,var(--slider-own),var(--color-fg)_var(--slider-fill-press-darken))]',
      'not-data-disabled:data-dragging:[--slider-fill:color-mix(in_oklab,var(--slider-own),var(--color-fg)_var(--slider-fill-press-darken))]',
    ],
    track: [
      'relative h-(--slider-track-height) w-full rounded-pill bg-(color:--slider-ground)',
      'transition-[background-color] duration-(--duration-field) ease-press motion-reduce:transition-none',
    ],
    indicator: 'rounded-pill bg-(color:--slider-fill) data-disabled:opacity-(--disabled-opacity)',
    thumb: [
      'size-(--slider-thumb-size) rounded-pill bg-surface',
      // 影は 3 つを重ねる: エラーの内側の赤い線、押しているあいだの外側の輪（塗りの色を淡く）、ふだんの影
      '[--slider-thumb-halo:0px] [--slider-thumb-invalid:0px] [--slider-thumb-shadow-now:var(--slider-thumb-shadow)]',
      'shadow-[inset_0_0_0_var(--slider-thumb-invalid)_var(--color-choice-invalid-line),0_0_0_var(--slider-thumb-halo)_color-mix(in_oklab,var(--slider-fill)_var(--slider-press-halo-mix),transparent),var(--slider-thumb-shadow-now)]',
      // エラー: つまみの内側に赤い線（押せないときは引かない）
      'data-invalid:not-data-disabled:[--slider-thumb-invalid:var(--choice-invalid-line-width)]',
      // 押しているあいだ（Base UI の data-dragging と、トラックの :active）: 大きさ・影・輪を、pressEffect の値に差し替える
      'not-data-disabled:group-active/slider:scale-(--slider-thumb-press-scale) not-data-disabled:data-dragging:scale-(--slider-thumb-press-scale)',
      'not-data-disabled:group-active/slider:[--slider-thumb-shadow-now:var(--slider-thumb-press-shadow)] not-data-disabled:data-dragging:[--slider-thumb-shadow-now:var(--slider-thumb-press-shadow)]',
      'not-data-disabled:group-active/slider:[--slider-thumb-halo:var(--slider-thumb-press-halo)] not-data-disabled:data-dragging:[--slider-thumb-halo:var(--slider-thumb-press-halo)]',
      // 押せないとき: 影を消し、色によらずグレー（トグルの押せないノブと同じ — 原則13）
      'data-disabled:bg-(color:--color-switch-neutral-disabled-knob) data-disabled:shadow-none',
      // キーボードで操作したときのフォーカスの線（focusRing と同じトークン）。フォーカスは中の input に当たるので、has で見る
      '[outline-offset:var(--focus-ring-offset)] [outline-color:transparent]',
      '[--focus-ring-own:color-mix(in_srgb,var(--color-own-focus)_calc(var(--focus-follow-color)*100%),var(--color-focus-ring))]',
      'has-[:focus-visible]:[outline-width:var(--focus-ring-width)] has-[:focus-visible]:[outline-style:solid]',
      'has-[:focus-visible]:[outline-color:var(--focus-ring-own,var(--color-focus-ring))]',
      // 位置は動かさない（引いているあいだに遅れないよう）。大きさ・影・線の色だけを、押す動きの長さで動かす
      '[transition:scale_var(--duration-press)_var(--ease-press),box-shadow_var(--duration-press)_var(--ease-press),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)]',
      'motion-reduce:[transition:none]',
    ],
    value:
      'shrink-0 text-(length:--text-label) leading-(--leading-label) whitespace-nowrap text-fg-muted tabular-nums',
  },
  variants: {
    // 塗りの色（原則6）。指定しないときは濃いグレー（トグルの ON・Meter と同じ）。ピンクは面用（原則12: 文字を載せない塗り）
    // --color-own-focus: フォーカスの線を部品の色に従わせるときの色。線なので、ピンクは前景用
    color: {
      primary: {
        control: '[--slider-own:var(--color-primary)]',
        thumb: '[--color-own-focus:var(--color-primary)]',
      },
      secondary: {
        control: '[--slider-own:var(--color-secondary)]',
        thumb: '[--color-own-focus:var(--color-fg-secondary)]',
      },
      // 色を持たないときは、押せないとき色を残せないので、薄くせずグレーにする（トグルの押せないノブと同じ）
      neutral: {
        control: [
          '[--slider-own:var(--color-neutral-strong)]',
          'data-disabled:[--slider-fill:var(--color-switch-neutral-disabled-knob)]',
        ],
        indicator: 'data-disabled:opacity-100',
      },
    },
    // 押しているあいだの手応え — ADR-0321。値はトークン（--slider-press-*）
    pressEffect: {
      none: {},
      grow: { control: '[--slider-thumb-press-scale:var(--slider-press-grow-scale)]' },
      halo: { control: '[--slider-thumb-press-halo:var(--slider-press-halo-width)]' },
      lift: {
        control:
          '[--slider-fill-press-darken:var(--slider-press-lift-darken)] [--slider-thumb-press-shadow:var(--slider-press-lift-shadow)]',
      },
    },
  },
  defaultVariants: { color: 'neutral', pressEffect: 'grow' },
});

/** 塗りの色。primary・secondary は利用者が選ぶ色、neutral は色を持たない濃いグレー */
export type SliderColor = NonNullable<VariantProps<typeof slider>['color']>;
/** 押しているあいだの手応え。grow はつまみが膨らむ、halo はつまみの周りに輪、lift はつまみが持ち上がり塗りが濃くなる、none は変えない */
export type SliderPressEffect = NonNullable<VariantProps<typeof slider>['pressEffect']>;

export interface SliderProps extends FieldMarkProps {
  /** 本体の上に置く見出し。読み上げの名前にもなります */
  label: ReactNode;
  /** 補足（ヘルプテキスト）。エラー・警告のあいだも消えない */
  caption?: ReactNode;
  /**
   * キャプションの場所。top はラベルと本体のあいだ、bottom は本体の下
   * @default 'top'
   */
  captionPlacement?: CaptionPlacement;
  /** エラーの内容。渡すと本体の下に丸の「!」と赤い文字で出し、本体をエラーの状態にする */
  errorText?: FieldMessage;
  /** 警告の内容。渡すと本体の下に三角とオリーブ色の文字で出す。本体の見た目は変えない */
  warningText?: FieldMessage;
  /** 成功の内容。渡すと本体の下に丸のチェックと緑の文字で出す。本体の見た目は変えない */
  successText?: FieldMessage;
  /** 情報の内容。渡すと本体の下に丸の「i」と青い文字で出す。本体の見た目は変えない */
  infoText?: FieldMessage;
  /** 値（制御） */
  value?: number;
  /** はじめの値（非制御）。渡さないときは min です */
  defaultValue?: number;
  /** 値が変わるときに、次の値を渡して呼びます。つまみを引いているあいだも、1 目盛り動くたびに呼ばれます */
  onValueChange?: (value: number) => void;
  /** 値が決まったあと（つまみを離した・トラックを押した・キーで動かした）に呼びます */
  onValueCommitted?: (value: number) => void;
  /**
   * 範囲の下端
   * @default 0
   */
  min?: number;
  /**
   * 範囲の上端
   * @default 100
   */
  max?: number;
  /**
   * つまみと ←→ キーで動く幅。値はこの倍数（min から数えて）にそろいます
   * @default 1
   */
  step?: number;
  /**
   * Shift を押しながら ←→ キー、または PageUp・PageDown で動く幅
   * @default 10
   */
  largeStep?: number;
  /** 値の文字の形（通貨・%・桁区切り・小数の桁）。Intl.NumberFormat のオプション。読み上げの値も同じ形になります */
  format?: Intl.NumberFormatOptions;
  /** 値を整えるときの地域（'ja-JP' など）。既定は、使っている人の環境の地域 */
  locale?: Intl.LocalesArgument;
  /**
   * 値の文字を作る関数。見えている文字と読み上げの文の両方に使います（例: (_, v) => `${v} 分`）。
   * 渡さないときは、format で整えた値です
   */
  getValueText?: (formattedValue: string, value: number) => string;
  /**
   * 値の文字を出さなくします。値の文字は、ふだんラベルの行の右端に出ます。隠しても、読み上げは値を伝えます
   * @default false
   */
  hideValue?: boolean;
  /**
   * 塗りとフォーカスの線の色。primary・secondary は利用者が選ぶ色、neutral は色を持たない濃いグレーです（原則6）
   * @default 'neutral'
   */
  color?: SliderColor;
  /**
   * つまみかトラックを押してから離すまでの手応え
   * - `grow`: つまみが一回り膨らむ
   * - `halo`: つまみの周りに、塗りの色を淡くした輪が出る
   * - `lift`: つまみの影が濃くなって持ち上がり、値までの塗りが一段濃くなる
   * - `none`: 何も変えない（つまみが動くことだけが手応え）
   * @default 'grow'
   */
  pressEffect?: SliderPressEffect;
  /**
   * 押せない（Disabled）状態にします。フォームでは値が送られません
   * @default false
   */
  disabled?: boolean;
  /**
   * 読み取り専用にします。本体は押せないとき（`disabled`）と同じ見た目になりますが、フォーカスでき、
   * 読み上げでは「読み取り専用」と伝わります。つまみもキーボードも値を変えません。フォームでは値が送られます
   * @default false
   */
  readOnly?: boolean;
  /** フォームに送るときの名前 */
  name?: string;
  /** スライダーが属するフォームの id。フォームの外に置くときに使います */
  form?: string;
  /** 中の input（type="range"）への ref。フォーカスや検証の API に触るときに使います */
  inputRef?: Ref<HTMLInputElement>;
  /**
   * 値を確かめる関数です。いまの値とフォーム全体の値を受け取り、正しくないときはエラーの文を返します。
   * 返したエラーの文は errorText と同じ行に出します。errorText があるときは、そちらを優先します
   */
  validate?: FieldValidate;
  /**
   * 検証のタイミングです。Form の validationMode より、この欄の指定が勝ちます
   * @default 'onSubmit'
   */
  validationMode?: FieldValidationMode;
  /**
   * validationMode="onChange" のとき、validate を呼ぶまでの待ち時間（ミリ秒）です
   * @default 0
   */
  validationDebounceTime?: number;
  /** ラベル・本体・キャプション・下の行を包むいちばん外の要素に付きます */
  className?: string;
  'aria-describedby'?: string;
}

/**
 * つまみを動かして、決まった範囲の中から 1 つの値を選ぶ。音量・明るさ・金額の上限など、おおよその値を手早く決めるときに使う
 */
export function Slider({
  label,
  caption,
  captionPlacement,
  errorText,
  warningText,
  successText,
  infoText,
  value,
  defaultValue,
  onValueChange,
  onValueCommitted,
  min = 0,
  max = 100,
  step = 1,
  largeStep = 10,
  format,
  locale,
  getValueText,
  hideValue = false,
  color,
  pressEffect = 'grow',
  disabled,
  readOnly,
  required,
  requiredMark,
  optionalMark,
  name,
  form,
  inputRef,
  validate,
  validationMode,
  validationDebounceTime,
  className,
  'aria-describedby': ariaDescribedBy,
}: SliderProps) {
  const s = slider({ color, pressEffect });
  // 読み取り専用と Form の送信中は、押せないときと同じ見た目で値を変えない（トグルと同じ）。フォーカスは外さない
  const locked = useChoiceLock(disabled, readOnly);
  // Base UI の Slider は読み取り専用を持たないので、値は部品が持ち、止めているあいだは変更を受け取らない
  const [uncontrolled, setUncontrolled] = useState(defaultValue ?? min);
  const current = value ?? uncontrolled;
  const formatted = new Intl.NumberFormat(locale, format).format(current);
  const valueText = getValueText ? getValueText(formatted, current) : formatted;

  // 読み取り専用・送信中は、中の input（role="slider"）に aria-readonly・aria-disabled を付ける
  //   Base UI の Thumb は、この 2 つを input に渡す口を持たないため
  const innerInputRef = useRef<HTMLInputElement>(null);
  const mergedInputRef = useMergedRefs(innerInputRef, inputRef);
  const ariaReadOnly = locked.readOnlyLook;
  const ariaDisabled = locked.ariaDisabled;
  useEffect(() => {
    const input = innerInputRef.current;
    if (!input) return;
    if (ariaReadOnly) input.setAttribute('aria-readonly', 'true');
    else input.removeAttribute('aria-readonly');
    if (ariaDisabled) input.setAttribute('aria-disabled', 'true');
    else input.removeAttribute('aria-disabled');
  }, [ariaReadOnly, ariaDisabled]);

  const lockedLook = locked.readOnlyLook ? 'data-disabled:cursor-default' : undefined;

  return (
    <Field
      label={label}
      caption={caption}
      captionPlacement={captionPlacement}
      error={errorText}
      warning={warningText}
      success={successText}
      info={infoText}
      disabled={disabled}
      required={required}
      requiredMark={requiredMark}
      optionalMark={optionalMark}
      className={className}
      name={name}
      validate={validate}
      validationMode={validationMode}
      validationDebounceTime={validationDebounceTime}
      labelAside={
        hideValue ? undefined : (
          <span aria-hidden data-slot="slider-value" className={s.value()}>
            {valueText}
          </span>
        )
      }
    >
      {(describedBy) => (
        <BaseSlider.Root
          value={current}
          onValueChange={(next) => {
            if (locked.readOnly) return;
            if (value === undefined) setUncontrolled(next);
            onValueChange?.(next);
          }}
          onValueCommitted={(next) => {
            if (locked.readOnly) return;
            onValueCommitted?.(next);
          }}
          min={min}
          max={max}
          step={step}
          largeStep={largeStep}
          format={format}
          locale={locale}
          name={name}
          form={form}
          disabled={disabled}
          thumbAlignment="edge"
          data-slot="slider"
          className={s.root()}
          {...locked.data}
        >
          <BaseSlider.Control
            data-slot="slider-control"
            className={s.control({ className: lockedLook })}
            {...locked.data}
          >
            <BaseSlider.Track className={s.track()} {...locked.data}>
              <BaseSlider.Indicator
                data-slot="slider-indicator"
                className={s.indicator()}
                {...locked.data}
              />
              <BaseSlider.Thumb
                data-slot="slider-thumb"
                className={s.thumb()}
                inputRef={mergedInputRef}
                aria-describedby={
                  [describedBy, ariaDescribedBy].filter(Boolean).join(' ') || undefined
                }
                getAriaValueText={getValueText ? (text, raw) => getValueText(text, raw) : undefined}
                {...locked.data}
              />
            </BaseSlider.Track>
          </BaseSlider.Control>
        </BaseSlider.Root>
      )}
    </Field>
  );
}
