'use client';

import { Field as BaseField } from '@base-ui/react/field';
import { Switch as BaseSwitch } from '@base-ui/react/switch';
import { type ComponentProps, type ReactNode, type Ref, useId } from 'react';
import type { VariantProps } from 'tailwind-variants';

import {
  type CaptionPlacement,
  FieldMessageLine,
  mergeBaseFieldError,
  useFormFieldErrors,
} from '../../internal/field/Field';
import { FieldMark, type FieldMarkProps } from '../../internal/field/FieldMark';
import type { FieldMessage } from '../../internal/field/input-field-props';
import { focusRing } from '../../internal/focus-styles';
import { useChoiceLock } from '../../internal/form-context';
import { tv } from '../../internal/tv';

// OFF のトラックはグレー（チェックボックスの選んでいない箱と同じ色。--color-switch-off）で、輪郭を付けない（design/adr/0011）
// ON の色は利用者が選ぶ（原則6）。ピンクは面用（原則12: 文字を載せない塗り）
// 指定しないときはグレー（ON は濃いグレー）— design/adr/0028
// ノブの影は「押せること」の記号（原則1）。Disabled では影をなくす
// ラベル・キャプション・トラックは格子に置く。トラックは左（togglePlacement="start"、既定）か右（end）
//   列は --switch-columns-start・-end（線の名前 track・label・row で指す）。トラックはラベルの行の中央、間は --switch-gap
// キャプションの置き方（ADR-0068。既定は A、captionVariant="surface" は E）
//   トラックとラベルは部品の高さの1行に置き、その行の縦の中央に固定する（上下の margin で行の高さを作る）。
//   キャプションはその行の外（2行目のラベルの列）に置くので、有無や長さでトラックとラベルは動かない
//   frame があるときは、1行の高さに線を含める（行の線の内側で部品の高さ）
//   frame があるときは、トラックだけを行（囲み）の縦の中央に置く。ラベルとキャプションは囲みなしと同じ並び
// ラベルは押しても切り替わるので本体の一部。押せないときは、ほかの押せない文字と同じグレーにする（原則1）
//   キャプションは説明なので、押せないときも読めるまま
//   ラベルを押しているあいだも、トラックを押したときと同じくノブが縮む（チェックボックスの横の文字と同じ）。押せないときは縮まない
// 行全体を押せる形（frame。既定の none は上のとおり、押せるのは文字とトラックだけ）— 後半の軸 46（既定は none、card・divided を選べる）
//   押せる範囲を見せるため、行の範囲を囲み（card）か区切り線（divided）で描き、その内側を全部押せるようにする
//   ラベルの ::after を行いっぱい（線の上まで）に広げる。ラベルを押したのと同じなので、読み上げと切り替えは変わらない
//   トラックは ::after より後ろにあり、上に重なる（トラックを押すとトラックが反応する）
//   続けて置いた行（間をあけない兄弟）は、divided では線を1本に重ねる。card は --switch-row-gap だけ離す
//   hover は行の塗り（原則3。一覧の項目と同じ）。行は沈ませない（線や囲みごと動くと、ページが揺れて見える）
//   押しているあいだも行は濃くせず、hover と同じ塗り。押したことはノブの縮みで伝える — ADR-0067 の A
//     指で操作するとき（hover なし）は、押した瞬間に行が塗られる（押すときの動きは 0ms）
//   キーボードのフォーカスの線は行に出す（押せる範囲の全体を示す）。card は外側に離して、divided は隣の行と重ならないよう内側に描く
const rowBase = [
  'relative cursor-pointer data-disabled:cursor-not-allowed',
  // 1行の高さから引く線の太さ（上下の線の内側で1行を作る）
  '[--switch-line-inset:var(--border-width-thin)]',
  // 押しているあいだも hover と同じ塗り。指で操作するとき（hover なし）は、押した瞬間に塗る
  //   塗りは --switch-row-fill（theme.css で登録）に置き、background-color ではなく変数を動かす（ADR-0112）
  '[--switch-row-fill:transparent] bg-(color:--switch-row-fill)',
  'not-data-disabled:hover:[--switch-row-fill:var(--color-field)] not-data-disabled:active:[--switch-row-fill:var(--color-field)]',
  // 塗りの動きの長さ。hover の入り・抜けと、離して戻るときは入力欄と同じ長さ、押して塗りが変わるときは 0ms
  //   CSS の transition は移った先の状態の長さを使うので、hover の入りと離したときの戻りは同じ長さになる
  '[transition:--switch-row-fill_var(--duration-field)_var(--ease-press),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)]',
  'not-data-disabled:active:[transition-duration:0ms,var(--focus-ring-duration),var(--focus-ring-duration)]',
  'motion-reduce:[transition:none]',
  // フォーカスの線（focusRing と同じトークン）。トラックではなく行に描く。離し方は各形で --switch-row-focus-offset に置く
  '[outline-color:transparent] [outline-offset:var(--switch-row-focus-offset)]',
  '[--focus-ring-own:color-mix(in_srgb,var(--color-own-focus)_calc(var(--focus-follow-color)*100%),var(--color-focus-ring))]',
  'has-[[role=switch]:focus-visible]:[outline-style:solid] has-[[role=switch]:focus-visible]:[outline-width:var(--focus-ring-width)]',
  'has-[[role=switch]:focus-visible]:[outline-color:var(--focus-ring-own,var(--color-focus-ring))]',
];
// 隣の行と接する形（divided）: 線の内側に、外側の線と同じだけ（--focus-ring-offset）離して描く
const rowFocusInside =
  '[--switch-row-focus-offset:calc(-1*(var(--focus-ring-width)+var(--focus-ring-offset)))]';
// ラベルの ::after を、行の線の上まで広げる（押せる範囲 = 見えている行の範囲）
const rowLabel = 'after:absolute after:-inset-(--border-width-thin)';
// キャプションの下に、1行の上の余白と同じだけあける（線を含む）
const rowCaption =
  'mb-[calc((var(--spacing-control)-2*var(--border-width-thin)-var(--leading-control))/2)]';
// 囲みがあるときは、トラックを行（囲み）の縦の中央に置く。囲みなし（none）はラベルの行の中央のまま
//   「46 で区切り線か囲みがあるときは、トグルが縦中央に来るようにしてほしいです（囲みなしではそのまま）」
//   トラックは1行の margin を付けたまま中央にそろえるので、キャプションがなければ囲みなしと同じ位置
//   行の最後の2行はエラー・警告の行なので、トラックはその手前（線 -3）までを占める
const rowTrack = 'row-[1/-3] self-center';
const rowLine = 'border-line';

// 読み取り専用（軸 177）の上書き。トラックとノブは押せないときと同じ見た目のまま、ラベルだけ本文の色に戻す
//   ラベルは読むための文字なので薄くしません（原則13）。カーソルも、押せないときの禁止の形にはしません
const switchReadOnly = {
  root: 'data-disabled:cursor-default',
  label: 'group-data-disabled/field:cursor-default group-data-disabled/field:text-fg',
  track: 'data-disabled:cursor-default',
};

// 1行の高さ（部品の高さ。frame があるときは線の内側）から、中身の高さを引いた上下の余白
//   Tailwind がクラスを拾えるよう、ラベルとトラックの分を文字列のまま書く
const labelLineMargin =
  'my-[calc((var(--spacing-control)-2*var(--switch-line-inset,0px)-var(--leading-control))/2)]';
const trackLineMargin =
  'my-[calc((var(--spacing-control)-2*var(--switch-line-inset,0px)-var(--switch-h))/2)]';

const styles = tv({
  variants: {
    // --color-own-focus: フォーカスの線を部品の色に従わせるとき（--focus-follow-color: 1 — 後半の軸 41）の線の色
    //   線なので、ピンクは前景用（トラックの面用のピンクより少し暗い）。neutral は置かない
    color: {
      // 押せない OFF のノブ（ADR-0069 の A）: 色によらず、色なしの押せないノブと同じグレー
      primary: {
        track:
          '[--color-own-focus:var(--color-primary)] data-checked:[--switch-track:var(--color-primary)]',
        thumb: 'data-disabled:not-data-checked:bg-(color:--color-switch-off-disabled-knob)',
      },
      secondary: {
        track:
          '[--color-own-focus:var(--color-fg-secondary)] data-checked:[--switch-track:var(--color-secondary)]',
        thumb: 'data-disabled:not-data-checked:bg-(color:--color-switch-off-disabled-knob)',
      },
      // 色を持たないトグル。OFF（淡いグレー）と区別できるよう、ON は濃いグレー
      // 押せないときは色を残せないので、薄くせずグレーにする — design/adr/0029
      //   ON のトラックは押せない OFF と同じ地（--color-switch-neutral-on-disabled）、ノブはグレー。状態はノブの位置で見せる
      neutral: {
        track: [
          'data-checked:[--switch-track:var(--color-neutral-strong)]',
          'data-disabled:data-checked:bg-(color:--color-switch-neutral-on-disabled) data-disabled:data-checked:opacity-100',
        ],
        thumb: 'data-disabled:bg-(color:--color-switch-neutral-disabled-knob)',
      },
    },
    // トラックの位置。start は文字の左（既定）、end は文字の右。列の並びはトークン（線の名前で、トラック・ラベル・キャプションの列を指す）
    togglePlacement: {
      start: { root: '[grid-template-columns:var(--switch-columns-start)]' },
      end: { root: '[grid-template-columns:var(--switch-columns-end)]' },
    },
    // 行の形。none は囲みなし（押せるのは文字とトラック）。ほかは行の内側を全部押せる（上の rowBase）
    frame: {
      // キーボードのフォーカスの線はトラックに出す（design/adr/0031）
      none: { track: focusRing },
      // 1行ずつ細い線で囲む。角は部品の角（行そのものが押す本体）。フォーカスの線は外側に離す
      card: {
        root: [
          rowBase,
          rowLine,
          'rounded-control border-(length:--border-width-thin) px-[calc(var(--spacing-control-x)-var(--border-width-thin))]',
          '[--switch-row-focus-offset:var(--focus-ring-offset)]',
          '[[data-switch-frame=card]+&]:mt-(--switch-row-gap)',
        ],
        label: rowLabel,
        caption: rowCaption,
        track: rowTrack,
      },
      // 行の上下に区切り線。続けて並べると、行のあいだの線は1本（次の行を線の太さだけ上に重ねる）
      divided: {
        root: [
          rowBase,
          rowLine,
          rowFocusInside,
          'border-y-(length:--border-width-thin) px-(--spacing-control-x)',
          '[[data-switch-frame=divided]+&]:-mt-(--border-width-thin)',
        ],
        label: rowLabel,
        caption: rowCaption,
        track: rowTrack,
      },
    },
    // キャプションの見た目（ADR-0068）。plain は面なし（A）、surface はラベルの列に入力欄の塗りの面を敷く（E）
    //   plain は1行の下の余白を詰めて、ラベルのすぐ下に置く
    //   surface は1行の下端から面を始め（余白は詰めない）、角は部品の角、影・線なし
    captionVariant: {
      plain: {
        caption:
          '-mt-[calc((var(--spacing-control)-2*var(--switch-line-inset,0px)-var(--leading-control))/2)]',
      },
      surface: { caption: 'mt-0 rounded-control bg-field px-3 py-2' },
    },
  },
  // 行に描くフォーカスの線を、部品の色に従わせるとき（--focus-follow-color: 1）の色。トラックと同じ値を行にも置く
  compoundVariants: [
    {
      frame: ['card', 'divided'],
      color: 'primary',
      class: { root: '[--color-own-focus:var(--color-primary)]' },
    },
    {
      frame: ['card', 'divided'],
      color: 'secondary',
      class: { root: '[--color-own-focus:var(--color-fg-secondary)]' },
    },
  ],
  defaultVariants: {
    color: 'neutral',
    togglePlacement: 'start',
    frame: 'none',
    captionVariant: 'plain',
  },
  slots: {
    // 行の高さは部品の高さ。中身（ラベル・キャプション・トラック）は行の縦の中央に置く
    //   group/field group/toggle: ラベルを押しているか（ノブの縮み）を、このトグルの中だけで見る。外の Field のラベルには反応させない
    root: 'group/field group/toggle grid min-h-(--spacing-control) content-center items-center gap-x-(--switch-gap)',
    // 押せる範囲は文字の幅だけ（justify-self-start）。列いっぱいに広げると、文字の右の空白を押しても切り替わる（見えない広がり）
    //   チェックボックス・ラジオの横の文字と同じ。Web のフォームの <label> の既定（inline）とも同じ
    label: [
      // カーソルもチェックボックスの横の文字と同じ（押せるときは指、押せないときは禁止の形）
      '[grid-column:label] row-start-1 cursor-pointer justify-self-start text-(length:--text-control) leading-(--leading-control) text-fg',
      'self-baseline',
      labelLineMargin,
      'group-data-disabled/field:cursor-not-allowed',
      'group-data-disabled/field:text-(color:--color-on-field-disabled)',
    ],
    // 2行目のラベルの列。上の間と面は captionVariant で決める
    caption: [
      '[grid-column:label] [grid-row:2] self-baseline',
      'text-(length:--text-caption) leading-(--leading-caption) text-fg-subtle',
    ],
    track: [
      'group/switch relative [grid-column:track] row-[1/2] inline-flex h-(--switch-h) w-(--switch-w) shrink-0 cursor-pointer items-center rounded-pill p-(--switch-inset)',
      'self-start',
      trackLineMargin,
      '[--switch-track:var(--color-switch-off)]',
      'bg-(color:--switch-track)',
      // キーボードで操作したときのフォーカス（design/adr/0031）は、frame が none のときトラックの外側に描く（下の frame）
      // 塗りは、ノブの滑る動きと同じ長さ・緩急で一緒に動かす
      //   塗りだけを動かさないと、ノブが滑る前に明るさが跳び、一瞬白くなったように見える
      //   動かすのは background-color ではなく --switch-track（theme.css で登録した変数 — ADR-0112）
      '[transition:--switch-track_var(--duration-press)_var(--ease-press),box-shadow_var(--duration-press)_var(--ease-press),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)]',
      'motion-reduce:[transition:none]',
      'data-disabled:cursor-not-allowed data-disabled:opacity-(--disabled-opacity)',
      'data-disabled:bg-[color:var(--color-disabled,var(--switch-track))]',
      // 押せない OFF。ON（色を残して薄くする）とは別に指定する — design/adr/0029
      'data-disabled:not-data-checked:bg-(color:--color-switch-off-disabled) data-disabled:not-data-checked:opacity-100',
    ],
    thumb: [
      'block size-(--switch-knob) rounded-pill bg-surface shadow-(--shadow-switch-knob)',
      'transition-[translate,scale] duration-(--duration-press) ease-press motion-reduce:transition-none',
      'data-checked:translate-x-[calc(var(--switch-w)-var(--switch-knob)-var(--switch-inset)*2)]',
      // 押しているあいだ（トラックかラベル）は縮む。押せないときは縮まない
      'group-active/switch:scale-92 group-has-[label:active]/toggle:scale-92 data-disabled:scale-100! data-disabled:shadow-none',
    ],
  },
});

export interface SwitchProps
  extends
    Omit<
      ComponentProps<'span'>,
      'className' | 'color' | 'defaultChecked' | 'children' | 'onChange'
    >,
    VariantProps<typeof styles>,
    FieldMarkProps {
  /** トラックの横の文字。押しても切り替わります（本体の一部）。押せないときはトラックと一緒にグレーになります */
  label: ReactNode;
  /** 横の文字の下の説明。押せないときも読めるままです */
  caption?: ReactNode;
  /**
   * キャプションの場所。top はラベルの列（トラックの横）に、bottom は行の下に幅いっぱいで置きます（design/adr/0041）
   * @default 'top'
   */
  captionPlacement?: CaptionPlacement;
  /**
   * エラーの内容。行の下に丸の「!」と赤い文字で出し、トラックをエラーの状態（aria-invalid）にします。
   * 行は読み上げの説明（aria-describedby）につなぎます
   */
  errorText?: FieldMessage;
  /**
   * 警告の内容。行の下に三角とオリーブ色の文字で出します。トラックの見た目は変えません。
   * errorText と両方あるときは、エラーの行が上です
   */
  warningText?: FieldMessage;
  /** ON か（制御） */
  checked?: boolean;
  /** はじめに ON か（非制御） */
  defaultChecked?: boolean;
  /** 切り替わるときに、次の値を渡して呼びます */
  onCheckedChange?: (checked: boolean) => void;
  /** ON のときにフォームに送る値。書かないときは "on" を送ります */
  value?: string;
  /** OFF のときにフォームに送る値。書かないときは、OFF のトグルは何も送りません */
  uncheckedValue?: string;
  /** フォームに送るときの名前 */
  name?: string;
  /** トグルが属するフォームの id。フォームの外に置くときに使います */
  form?: string;
  /** 隠れた input の id */
  id?: string;
  /** 隠れた input への ref。フォーカスや検証の API に触るときに使います */
  inputRef?: Ref<HTMLInputElement>;
  /**
   * 押せない（Disabled）状態にします。トラックと横の文字がグレーになり、フォームでは値が送られません
   * @default false
   */
  disabled?: boolean;
  /**
   * 必須にします。横の文字の後ろに印（既定は「必須」のタグ）が出ます
   * @default false
   */
  required?: boolean;
  /** トラック・ラベル・キャプションを並べた行に付きます */
  className?: string;
  /**
   * ON のときの色。利用者が選ぶ primary・secondary に加え、色を持たない neutral（濃いグレー）を選べます（原則6）。
   * OFF のトラックは、色を指定していても常にグレー（チェックボックスの選んでいない箱と同じ）です。指定しないときは既定のグレー（neutral）になります
   * @default 'neutral'
   */
  color?: VariantProps<typeof styles>['color'];
  /**
   * トラックの位置。start は文字の左、end は文字の右です。
   * 設定の一覧のように、トラックを行の右端にそろえて並べたいときは end にします
   * @default 'start'
   */
  togglePlacement?: VariantProps<typeof styles>['togglePlacement'];
  /**
   * 行の形。none は囲みを付けず、押せるのは文字とトラックだけです。
   * ほかの形は行の範囲を線で描き、その内側のどこを押しても切り替わります。hover で行が淡く塗られます（指で操作するときは押したとき）。
   * 押しているあいだも行は濃くならず、ノブが縮みます。キーボードのフォーカスの線も行に出ます。
   * 設定の一覧のようにトラックを右に置く（togglePlacement="end"）ときに使います。
   * - card: 1行ずつ細い線の角丸で囲みます。続けて置くと少し離れます
   * - divided: 行の上下に区切り線を引きます。続けて置くと、行のあいだの線は1本になります
   *
   * 囲みがあるときは、トラックを行の縦の中央に置きます。ラベルとキャプションの並びは none と同じです。
   * divided は、行を間をあけずに続けて（兄弟として）置いてください
   * @default 'none'
   */
  frame?: SwitchFrame;
  /**
   * キャプションの見た目です。
   * - plain: 面を付けず、ラベルのすぐ下に小さいグレーの文字で置きます
   * - surface: ラベルの列に、入力欄と同じ淡いグレーの面を敷き、その中にキャプションを出します。説明を、トラックとラベルの1行と分けて読ませたいときに使います
   *
   * どちらでも、トラックとラベルの位置はキャプションの有無や長さで変わりません
   * @default 'plain'
   */
  captionVariant?: SwitchCaptionVariant;
  /**
   * 読み取り専用にします。トラックとノブは押せないとき（`disabled`）と同じ見た目になりますが、横の文字は本文の色のままです。
   * フォーカスでき、読み上げでは「読み取り専用」と伝わります。押してもキーボードでも切り替わらず、hover や押したときの変化も出ません。
   * フォームでは値が送られます（押せないトグルは送られません）
   * @default false
   */
  readOnly?: boolean;
}

/** 行の形。Switch の frame */
export type SwitchFrame = 'none' | 'card' | 'divided';

/** キャプションの見た目。Switch の captionVariant */
export type SwitchCaptionVariant = 'plain' | 'surface';

/**
 * トグル。トラックとラベル（とキャプション）を横に並べる。ラベルを押しても切り替わる
 */
export function Switch({
  label,
  caption,
  captionPlacement = 'top',
  errorText,
  warningText,
  checked,
  defaultChecked,
  onCheckedChange,
  value,
  uncheckedValue,
  name,
  form,
  id: idProp,
  inputRef,
  className,
  disabled,
  color,
  togglePlacement = 'start',
  frame = 'none',
  captionVariant = 'plain',
  readOnly,
  required,
  requiredMark,
  optionalMark,
  'aria-describedby': ariaDescribedBy,
  'aria-disabled': ariaDisabled,
  ...props
}: SwitchProps) {
  const s = styles({ color, togglePlacement, frame, captionVariant });
  const id = useId();
  // Form の送信中と読み取り専用（軸 177）は、押せないトグルと同じ見た目にして切り替えを止める（Checkbox.tsx の useChoiceLock）
  //   ラベル・行の塗り（root）とノブも押せないときの規則で描くので、root・トラック・ノブの3つに印を付ける
  const locked = useChoiceLock(disabled, readOnly);
  // 行を明示する（ラベルの行・キャプションの行・エラーの行・警告の行）。
  // 囲みのあるトラックの row-[1/-3] の -3 は明示した行の線を指すので、行を明示しないと数が合わない
  const rows = caption ? 'grid-rows-[auto_auto_auto_auto]' : 'grid-rows-[auto_auto_auto]';
  // 説明は見た目の順（キャプション → エラー → 警告）でつなぐ（design/adr/0041）
  const ids = { caption: `${id}caption`, error: `${id}error`, warning: `${id}warning` };
  const describedBy =
    [ariaDescribedBy, caption && ids.caption, errorText && ids.error, warningText && ids.warning]
      .filter(Boolean)
      .join(' ') || undefined;
  // キャプションは、top ではラベルの列（トラックの横）、bottom では行の下に幅いっぱいで置く
  const captionNode = caption ? (
    <BaseField.Description
      id={ids.caption}
      className={s.caption({
        className: captionPlacement === 'bottom' ? 'col-span-full' : undefined,
      })}
    >
      {caption}
    </BaseField.Description>
  ) : null;
  return (
    <BaseField.Root
      disabled={disabled}
      invalid={errorText ? true : undefined}
      // 続けて置いた行をつなぐ（card の間・divided の線）ための印。none には付けない
      data-switch-frame={frame === 'none' ? undefined : frame}
      className={s.root({
        className: [rows, locked.readOnlyLook && switchReadOnly.root, className],
      })}
      {...locked.data}
    >
      <BaseField.Label
        className={s.label({ className: locked.readOnlyLook ? switchReadOnly.label : undefined })}
      >
        {label}
        <FieldMark required={required} requiredMark={requiredMark} optionalMark={optionalMark} />
      </BaseField.Label>
      {captionNode}
      <BaseSwitch.Root
        className={s.track({ className: locked.readOnlyLook ? switchReadOnly.track : undefined })}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={onCheckedChange ? (next) => onCheckedChange(next) : undefined}
        value={value}
        uncheckedValue={uncheckedValue}
        name={name}
        form={form}
        id={idProp}
        inputRef={inputRef}
        disabled={disabled}
        // required は Base UI の隠れた input にネイティブの required を付け、送信時にブラウザが確かめて止めてしまう
        // （design/adr/0255 の影響）。渡さず、aria-required だけで必須であることを伝える
        required={false}
        aria-required={required || undefined}
        readOnly={locked.readOnly}
        aria-describedby={describedBy}
        aria-disabled={locked.ariaDisabled || ariaDisabled}
        {...locked.data}
        {...props}
      >
        <BaseSwitch.Thumb className={s.thumb()} {...locked.data} />
      </BaseSwitch.Root>
      {/* エラー・警告の行（入力欄と同じ — design/adr/0041・0044）。行の最後の2行に置く */}
      <SwitchErrorLine
        errorText={errorText}
        id={ids.error}
        className="col-span-full row-start-[-3] mt-0 data-open:mt-0"
        name={name}
        disabled={disabled}
      />
      <FieldMessageLine
        kind="warning"
        content={warningText}
        id={ids.warning}
        className="col-span-full row-start-[-2] mt-0 data-open:mt-0"
      />
    </BaseField.Root>
  );
}

// BaseField.Root の子。BaseField.Validity（公開 API）で、Base UI 自身が見つけたエラーを読む（design/adr/0255）
// validate など、Base UI 自身が見つけたエラーも、errorText と同じ行に出す（errorText があれば、そちらを優先）
function SwitchErrorLine({
  errorText,
  id,
  className,
  name,
  disabled,
}: {
  errorText?: FieldMessage;
  id: string;
  className?: string;
  name: string | undefined;
  disabled: boolean | undefined;
}) {
  const formErrors = useFormFieldErrors();
  return (
    <BaseField.Validity>
      {(validity) => {
        const baseError = mergeBaseFieldError({ name, disabled, formErrors, validity });
        return (
          <FieldMessageLine
            kind="error"
            content={errorText ?? baseError}
            id={id}
            className={className}
          />
        );
      }}
    </BaseField.Validity>
  );
}
