import { Field as BaseField } from '@base-ui/react/field';
import { Switch as BaseSwitch } from '@base-ui/react/switch';
import type { ComponentProps, ReactNode } from 'react';
import { tv } from 'tailwind-variants';

// OFF のトラックは入力欄と同じグレーで、輪郭を付けない（design/adr/0011）
// ON は Secondary の面用のピンク（原則6: 文字を載せない塗り）。既定の色は後半の軸で決める
// ノブの影は「押せること」の記号（原則1）。Disabled では影をなくす
const styles = tv({
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
      '[--switch-track:var(--color-field)] data-checked:[--switch-track:var(--color-secondary)]',
      'bg-(color:--switch-track) transition-[background-color] duration-(--duration-press) ease-press motion-reduce:transition-none',
      'data-disabled:cursor-not-allowed data-disabled:opacity-(--disabled-opacity)',
      'data-disabled:bg-[color:var(--color-disabled,var(--switch-track))]',
    ],
    thumb: [
      'block size-(--switch-knob) rounded-pill bg-surface shadow-[0_1px_2px_rgb(31_47_55/0.3)]',
      'transition-[translate,scale] duration-(--duration-press) ease-press motion-reduce:transition-none',
      'data-checked:translate-x-[calc(var(--switch-w)-var(--switch-knob)-var(--switch-inset)*2)]',
      'group-active/switch:scale-92 data-disabled:scale-100! data-disabled:shadow-none',
    ],
  },
});

export interface SwitchProps extends Omit<
  ComponentProps<typeof BaseSwitch.Root>,
  'className' | 'render'
> {
  label: ReactNode;
  caption?: ReactNode;
  className?: string;
}

/**
 * トグル。ラベルとキャプションを左に、トラックを右に置く
 */
export function Switch({ label, caption, className, disabled, ...props }: SwitchProps) {
  const s = styles();
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
