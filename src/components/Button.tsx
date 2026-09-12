import type { ComponentProps } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

// 原則1: 影は「押せること」の記号。塗りのボタンにだけ付ける（design/adr/0006）
// 原則3: hover で影が輪郭だけになり、押下で影が消えて 1px 沈む（design/adr/0009）
// 原則7: 画面内で最も進めたい操作は塗り、それ以外は枠線
// 色は --button-fill・--button-text・--button-line に入れ、Disabled のときだけ差し替える
const button = tv({
  base: [
    'inline-flex h-(--size-control) shrink-0 cursor-pointer items-center justify-center gap-2 rounded-control px-(--space-control-x) whitespace-nowrap',
    'text-(length:--text-control) leading-(--leading-control) font-bold select-none',
    'transition-[box-shadow,translate,background-color] duration-(--duration-press) ease-press motion-reduce:transition-none',
    // Disabled（原則1）: 影をなくす。塗り・文字の色と透明度は後半の軸（未設定なら部品の色のまま）
    'disabled:cursor-not-allowed disabled:opacity-(--disabled-opacity)',
  ],
  variants: {
    appearance: {
      filled: [
        'bg-(color:--button-fill) text-(color:--button-text)',
        'shadow-raised enabled:hover:shadow-raised-hover enabled:active:translate-y-(--press-depth) enabled:active:shadow-none',
        'disabled:bg-[color:var(--color-disabled,var(--button-fill))] disabled:text-[color:var(--color-on-disabled,var(--button-text))] disabled:shadow-none',
      ],
      // 枠線のボタンは平らな要素（原則3）: hover と押下で文字の色を淡く敷き、押下で 1px 沈む（design/adr/0027）
      outline: [
        'border-[1.5px] border-(color:--button-line) bg-transparent text-(color:--button-line)',
        'enabled:hover:bg-flat-hover enabled:active:translate-y-(--flat-press-depth) enabled:active:bg-flat-press',
        'disabled:border-[color:var(--color-disabled-fg,var(--button-line))] disabled:text-[color:var(--color-disabled-fg,var(--button-line))]',
      ],
    },
    // 利用者が選ぶ色（原則6）。指定しないときはグレー（neutral）— design/adr/0028
    // surface は白いボタン。白い地では影だけでは区別がつかないので、輪郭も付ける（design/adr/0024・0025）
    color: { primary: '', secondary: '', danger: '', neutral: '', surface: '' },
  },
  compoundVariants: [
    {
      appearance: 'filled',
      color: 'primary',
      class: '[--button-fill:var(--color-primary)] [--button-text:var(--color-on-primary)]',
    },
    // 白文字を載せるので、ピンクは前景用（原則12）
    {
      appearance: 'filled',
      color: 'secondary',
      class: '[--button-fill:var(--color-fg-secondary)] [--button-text:var(--color-on-secondary)]',
    },
    {
      appearance: 'filled',
      color: 'danger',
      class: '[--button-fill:var(--color-danger)] [--button-text:var(--color-on-danger)]',
    },
    {
      appearance: 'filled',
      color: 'neutral',
      // グレーのボタンの Disabled は、薄くせず、塗りと文字の色を近づける（design/adr/0026）
      class: [
        '[--button-fill:var(--color-neutral)] [--button-text:var(--color-fg)]',
        'disabled:opacity-(--neutral-disabled-opacity)',
        'disabled:[--color-disabled:var(--color-neutral-disabled)] disabled:[--color-on-disabled:var(--color-on-neutral-disabled)]',
      ],
    },
    {
      appearance: 'filled',
      color: 'surface',
      class: [
        '[--button-fill:var(--color-surface)] [--button-text:var(--color-fg)]',
        'border-(length:--surface-line-width) border-surface-line',
      ],
    },
    { appearance: 'outline', color: 'primary', class: '[--button-line:var(--color-primary)]' },
    {
      appearance: 'outline',
      color: 'secondary',
      class: '[--button-line:var(--color-fg-secondary)]',
    },
    { appearance: 'outline', color: 'danger', class: '[--button-line:var(--color-danger)]' },
    // 色を持たない枠線のボタンは、枠線を細い境界線の色に、文字を本文の色にする
    // Disabled は、色を持つ枠線のボタン（薄くする）とは別に指定する — design/adr/0029
    {
      appearance: 'outline',
      color: ['neutral', 'surface'],
      class: [
        'text-fg [--button-line:var(--color-line)]',
        'disabled:bg-(color:--color-outline-neutral-disabled-fill) disabled:opacity-(--outline-neutral-disabled-opacity)',
        'disabled:border-(color:--color-outline-neutral-disabled-line) disabled:text-(color:--color-outline-neutral-disabled-text)',
        'disabled:border-(length:--outline-neutral-disabled-line-width)',
      ],
    },
  ],
  defaultVariants: { appearance: 'filled', color: 'neutral' },
});

export interface ButtonProps
  extends Omit<ComponentProps<'button'>, 'color'>, VariantProps<typeof button> {}

/**
 * ボタン
 */
export function Button({ appearance, color, className, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={button({ appearance, color, className })} {...props} />;
}
