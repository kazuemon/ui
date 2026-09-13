import { Field as BaseField } from '@base-ui/react/field';
import { Switch as BaseSwitch } from '@base-ui/react/switch';
import type { ComponentProps, ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

import { focusRing } from './focus-styles';

// OFF のトラックは入力欄と同じグレーで、輪郭を付けない（design/adr/0011）
// ON の色は利用者が選ぶ（原則6）。ピンクは面用（原則12: 文字を載せない塗り）
// 指定しないときはグレー（ON は濃いグレー）— design/adr/0028
// ノブの影は「押せること」の記号（原則1）。Disabled では影をなくす
// ラベル・キャプション・トラックは格子に置く。トラックは左（togglePlacement="start"、既定）か右（end）
//   トラックの縦の位置は --switch-track-rows（ラベルとキャプションのまとまりの中央か、ラベルの行の中央）、間は --switch-gap
// ラベルは押しても切り替わるので本体の一部。押せないときは、ほかの押せない文字と同じグレーにする（原則1）
//   キャプションは説明なので、押せないときも読めるまま
const styles = tv({
  variants: {
    color: {
      primary: { track: 'data-checked:[--switch-track:var(--color-primary)]' },
      secondary: { track: 'data-checked:[--switch-track:var(--color-secondary)]' },
      // 色を持たないトグル。OFF（入力欄のグレー）と区別できるよう、ON は濃いグレー
      // 押せないときは色を残せないので、グレーのボタンと同じく薄くせずグレーにできる — design/adr/0029
      neutral: {
        track: [
          'data-checked:[--switch-track:var(--color-fg-muted)]',
          'data-disabled:data-checked:bg-(color:--color-switch-neutral-on-disabled) data-disabled:data-checked:opacity-(--switch-neutral-disabled-opacity)',
        ],
        thumb: 'data-disabled:bg-(color:--color-switch-neutral-disabled-knob)',
      },
    },
    // トラックの位置。start は文字の左（既定）、end は文字の右
    togglePlacement: {
      start: {
        root: 'grid-cols-[auto_minmax(0,1fr)]',
        track: 'col-start-1',
        label: 'col-start-2',
        caption: 'col-start-2',
      },
      end: {
        root: 'grid-cols-[minmax(0,1fr)_auto]',
        track: 'col-start-2',
        label: 'col-start-1',
        caption: 'col-start-1',
      },
    },
  },
  defaultVariants: { color: 'neutral', togglePlacement: 'start' },
  slots: {
    // 行の高さは部品の高さ。中身（ラベル・キャプション・トラック）は行の縦の中央に置く
    root: 'group/field grid min-h-(--size-control) content-center items-center gap-x-(--switch-gap)',
    label: [
      'row-start-1 text-(length:--text-control) leading-(--leading-control) text-fg',
      // 薄さ（--disabled-label-opacity、いまは 1）も残す。軸 08 の比較で、ラベルを薄くする案を再現するため
      'group-data-disabled/field:text-(color:--color-switch-label-disabled) group-data-disabled/field:opacity-(--disabled-label-opacity)',
    ],
    caption: [
      'row-start-2 text-(length:--text-caption) leading-(--leading-caption) text-fg-subtle',
      'group-data-disabled/field:opacity-(--disabled-label-opacity)',
    ],
    track: [
      'group/switch relative row-(--switch-track-rows) inline-flex h-(--switch-h) w-(--switch-w) shrink-0 cursor-pointer items-center rounded-pill p-(--switch-inset)',
      '[--switch-track:var(--color-switch-off)]',
      // OFF のトラックの枠。内側に描き、寸法を変えない — design/adr/0029
      'not-data-checked:shadow-[inset_0_0_0_var(--switch-off-line-width)_var(--color-switch-off-line)]',
      'bg-(color:--switch-track)',
      // キーボードで操作したときのフォーカス（design/adr/0031）。トラックの外側に描く
      ...focusRing,
      '[transition:background-color_var(--duration-press)_var(--ease-press),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)]',
      'motion-reduce:[transition:none]',
      'data-disabled:cursor-not-allowed data-disabled:opacity-(--disabled-opacity)',
      'data-disabled:bg-[color:var(--color-disabled,var(--switch-track))]',
      // 押せない OFF。ON（色を残して薄くする）とは別に指定する — design/adr/0029
      'data-disabled:not-data-checked:bg-(color:--color-switch-off-disabled) data-disabled:not-data-checked:opacity-(--switch-off-disabled-opacity)',
    ],
    thumb: [
      'block size-(--switch-knob) rounded-pill bg-surface shadow-[0_1px_2px_rgb(31_47_55/0.3)]',
      'transition-[translate,scale] duration-(--duration-press) ease-press motion-reduce:transition-none',
      'data-checked:translate-x-[calc(var(--switch-w)-var(--switch-knob)-var(--switch-inset)*2)]',
      'group-active/switch:scale-92 data-disabled:scale-100! data-disabled:shadow-none',
    ],
  },
});

export interface SwitchProps
  extends
    Omit<ComponentProps<typeof BaseSwitch.Root>, 'className' | 'render' | 'color'>,
    VariantProps<typeof styles> {
  label: ReactNode;
  caption?: ReactNode;
  className?: string;
  /**
   * ON のときの色。利用者が選ぶ primary・secondary に加え、色を持たない neutral（濃いグレー）を選べます（原則6）。
   * OFF のトラックは、色を指定していても常に入力欄と同じグレーです。指定しないときは既定のグレー（neutral）になります
   * @default 'neutral'
   */
  color?: VariantProps<typeof styles>['color'];
  /**
   * トラックの位置。start は文字の左、end は文字の右です。
   * 設定の一覧のように、トラックを行の右端にそろえて並べたいときは end にします
   * @default 'start'
   */
  togglePlacement?: VariantProps<typeof styles>['togglePlacement'];
}

/**
 * トグル。トラックとラベル（とキャプション）を横に並べる。ラベルを押しても切り替わる
 */
export function Switch({
  label,
  caption,
  className,
  disabled,
  color,
  togglePlacement = 'start',
  ...props
}: SwitchProps) {
  const s = styles({ color, togglePlacement });
  // 行を明示する（キャプションがあれば2行）。--switch-track-rows の -1 は明示した行の最後の線を指すので、
  // 行を明示しないと 1 / -1（まとまりの中央）が 1行目だけになる
  const rows = caption ? 'grid-rows-[auto_auto]' : 'grid-rows-[auto]';
  return (
    <BaseField.Root disabled={disabled} className={s.root({ className: [rows, className] })}>
      <BaseField.Label className={s.label()}>{label}</BaseField.Label>
      {caption && <BaseField.Description className={s.caption()}>{caption}</BaseField.Description>}
      <BaseSwitch.Root className={s.track()} disabled={disabled} {...props}>
        <BaseSwitch.Thumb className={s.thumb()} />
      </BaseSwitch.Root>
    </BaseField.Root>
  );
}
