import { Field as BaseField } from '@base-ui/react/field';
import { Switch as BaseSwitch } from '@base-ui/react/switch';
import type { ComponentProps, ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

import { focusRing } from './focus-styles';

// OFF のトラックは入力欄と同じグレーで、輪郭を付けない（design/adr/0011）
// ON の色は利用者が選ぶ（原則6）。ピンクは面用（原則12: 文字を載せない塗り）
// 指定しないときはグレー（ON は濃いグレー）— design/adr/0028
// ノブの影は「押せること」の記号（原則1）。Disabled では影をなくす
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
  },
  defaultVariants: { color: 'neutral' },
  slots: {
    // Disabled では、本体（トラック）とラベル・キャプションの透明度を別々に指定する
    root: 'group/field flex min-h-(--size-control) items-center gap-3',
    text: 'flex min-w-0 flex-1 flex-col',
    label: [
      'text-(length:--text-control) leading-(--leading-control) text-fg',
      'group-data-disabled/field:opacity-(--disabled-label-opacity)',
    ],
    caption: [
      'text-(length:--text-caption) leading-(--leading-caption) text-fg-subtle',
      'group-data-disabled/field:opacity-(--disabled-label-opacity)',
    ],
    track: [
      'group/switch relative inline-flex h-(--switch-h) w-(--switch-w) shrink-0 cursor-pointer items-center rounded-pill p-(--switch-inset)',
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
}

/**
 * トグル。ラベルとキャプションを左に、トラックを右に置く
 */
export function Switch({ label, caption, className, disabled, color, ...props }: SwitchProps) {
  const s = styles({ color });
  return (
    <BaseField.Root disabled={disabled} className={s.root({ className })}>
      <div className={s.text()}>
        <BaseField.Label className={s.label()}>{label}</BaseField.Label>
        {caption && (
          <BaseField.Description className={s.caption()}>{caption}</BaseField.Description>
        )}
      </div>
      <BaseSwitch.Root className={s.track()} disabled={disabled} {...props}>
        <BaseSwitch.Thumb className={s.thumb()} />
      </BaseSwitch.Root>
    </BaseField.Root>
  );
}
