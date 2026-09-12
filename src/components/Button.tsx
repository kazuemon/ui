import type { ComponentProps } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

import { focusRing } from './focus-styles';

// 原則1: 影は「押せること」の記号。塗りのボタンにだけ付ける（design/adr/0006）
// 原則3: hover で影が輪郭だけになり、押下で 1px 沈む（design/adr/0009）。押しても輪郭の線は残す（design/adr/0033）
// 原則7: 画面内で最も進めたい操作は塗り、それ以外は枠線
// 色は --button-fill・--button-text・--button-line に入れ、Disabled のときだけ差し替える
// 送信中（loading、design/adr/0034）: 押せないボタンと同じ見た目にし、送信中の印を出す。data-loading で表す
//   印（回る円・線）は薄くしないので、ボタン全体を薄くする opacity は使わず、塗り・文字・枠線の色を
//   Disabled の薄さ（--disabled-opacity）で混ぜた色にする。白地の上では Disabled と同じ色になる
//   印の色: 回る円は元の文字の色（--button-ink）、線はボタンの濃い色（--button-accent）
// hover と押下は、押せるとき（enabled）で送信中でないとき（not-data-loading）だけ
const button = tv({
  base: [
    'relative inline-flex h-(--size-control) shrink-0 cursor-pointer items-center justify-center gap-2 rounded-control px-(--space-control-x) whitespace-nowrap',
    'text-(length:--text-control) leading-(--leading-control) font-bold select-none',
    // キーボードで操作したときのフォーカス（design/adr/0031）。線の隙間と色は --focus-ring-duration で動かす
    ...focusRing,
    // 押下は --duration-press、送信中への切り替わり（色・薄さ）は --duration-loading で動かす
    // 塗りは押下（枠線のボタン）と送信中の両方で変わるので、送信中だけ --duration-loading にする
    '[transition:box-shadow_var(--duration-press)_var(--ease-press),translate_var(--duration-press)_var(--ease-press),background-color_var(--button-bg-duration)_var(--ease-press),color_var(--duration-loading)_var(--ease-press),border-color_var(--duration-loading)_var(--ease-press),opacity_var(--duration-loading)_var(--ease-press),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)]',
    '[--button-bg-duration:var(--duration-press)] data-loading:[--button-bg-duration:var(--duration-loading)]',
    'motion-reduce:[transition:none]',
    // Disabled（原則1、design/adr/0026）: 影をなくす。塗り・文字の色と透明度はトークンで指定する（未設定なら部品の色のまま）
    'disabled:cursor-not-allowed disabled:opacity-(--disabled-opacity)',
    // 送信中: 押せない。下端の線を角丸で切り抜く
    'data-loading:cursor-progress data-loading:overflow-hidden',
  ],
  variants: {
    appearance: {
      filled: [
        'bg-(color:--button-fill) text-(color:--button-text)',
        '[--button-accent:var(--button-fill)] [--button-ink:var(--button-text)]',
        // 押したときの影は --shadow-raised-press（hover と同じ輪郭の線だけ — design/adr/0033）
        'shadow-raised enabled:not-data-loading:hover:shadow-raised-hover enabled:not-data-loading:active:translate-y-(--press-depth) enabled:not-data-loading:active:shadow-(--shadow-raised-press)',
        'disabled:bg-[color:var(--color-disabled,var(--button-fill))] disabled:text-[color:var(--color-on-disabled,var(--button-text))] disabled:shadow-none',
        // 送信中: Disabled の「本体を薄くする」を、塗りと文字の色で表す（文字は地の色に混ぜる）
        'data-loading:bg-[color:color-mix(in_oklab,var(--button-fill)_calc(var(--disabled-opacity)*100%),transparent)] data-loading:text-[color:color-mix(in_oklab,var(--button-text)_calc(var(--disabled-opacity)*100%),var(--color-bg))] data-loading:shadow-none',
      ],
      // 枠線のボタンは平らな要素（原則3）: hover と押下で文字の色を淡く敷き、押下で 1px 沈む（design/adr/0027）
      outline: [
        'border-[1.5px] border-(color:--button-line) bg-transparent text-(color:--button-line)',
        '[--button-accent:var(--button-line)] [--button-ink:var(--button-line)]',
        'enabled:not-data-loading:hover:bg-flat-hover enabled:not-data-loading:active:translate-y-(--flat-press-depth) enabled:not-data-loading:active:bg-flat-press',
        'disabled:border-[color:var(--color-disabled-fg,var(--button-line))] disabled:text-[color:var(--color-disabled-fg,var(--button-line))]',
        'data-loading:border-[color:color-mix(in_oklab,var(--button-line)_calc(var(--disabled-opacity)*100%),transparent)] data-loading:text-[color:color-mix(in_oklab,var(--button-line)_calc(var(--disabled-opacity)*100%),transparent)]',
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
        '[--button-accent:var(--color-fg)] [--button-fill:var(--color-neutral)] [--button-text:var(--color-fg)]',
        // 枠線（付けない）と影（ほかの塗りのボタンと同じ）。比べた案を比較のストーリーで再現するためトークンにしている — design/adr/0033
        'border-(length:--neutral-line-width) border-(color:--color-neutral-line)',
        'shadow-(--shadow-neutral) enabled:not-data-loading:hover:shadow-(--shadow-neutral-hover) enabled:not-data-loading:active:shadow-(--shadow-neutral-press)',
        'disabled:opacity-(--neutral-disabled-opacity)',
        'disabled:[--color-disabled:var(--color-neutral-disabled)] disabled:[--color-on-disabled:var(--color-on-neutral-disabled)]',
        'data-loading:bg-(color:--color-neutral-disabled) data-loading:text-(color:--color-on-neutral-disabled)',
      ],
    },
    {
      appearance: 'filled',
      color: 'surface',
      class: [
        '[--button-accent:var(--color-fg)] [--button-fill:var(--color-surface)] [--button-text:var(--color-fg)]',
        'border-(length:--surface-line-width) border-surface-line',
        'data-loading:border-[color:color-mix(in_oklab,var(--color-surface-line)_calc(var(--disabled-opacity)*100%),transparent)]',
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
        'text-fg [--button-accent:var(--color-fg)] [--button-ink:var(--color-fg)] [--button-line:var(--color-line)]',
        'disabled:bg-(color:--color-outline-neutral-disabled-fill) disabled:opacity-(--outline-neutral-disabled-opacity)',
        'disabled:border-(color:--color-outline-neutral-disabled-line) disabled:text-(color:--color-outline-neutral-disabled-text)',
        'disabled:border-(length:--outline-neutral-disabled-line-width)',
        'data-loading:border-(color:--color-outline-neutral-disabled-line) data-loading:bg-(color:--color-outline-neutral-disabled-fill) data-loading:text-(color:--color-outline-neutral-disabled-text)',
        'data-loading:border-(length:--outline-neutral-disabled-line-width)',
      ],
    },
  ],
  defaultVariants: { appearance: 'filled', color: 'neutral' },
});

/** 送信中の印。overlay: 薄くしたラベルに回る円を重ねる（既定）、inline: ラベルの左に回る円、bar: 下端に流れる線 */
export type LoadingIndicator = 'overlay' | 'inline' | 'bar';

export interface ButtonProps
  extends Omit<ComponentProps<'button'>, 'color'>, VariantProps<typeof button> {
  /**
   * 送信中。押せないボタンと同じ見た目になり、押しても onClick を呼ばない（フォームも送信しない）。
   * disabled と違い、フォーカスは外れない（aria-disabled・aria-busy）
   */
  loading?: boolean;
  /** 送信中の印。既定は overlay */
  loadingIndicator?: LoadingIndicator;
}

// 回る円。薄い輪の上を、濃い弧が1秒で1周する。色は元の文字の色
function Spinner() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="size-(--size-icon) shrink-0 animate-spin text-(color:--button-ink)"
      aria-hidden
    >
      <circle
        cx="8"
        cy="8"
        r="6"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.3"
        strokeWidth="2"
      />
      <path
        d="M8 2a6 6 0 0 1 6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * ボタン
 */
export function Button({
  appearance,
  color,
  className,
  type = 'button',
  loading,
  loadingIndicator = 'overlay',
  onClick,
  children,
  ...props
}: ButtonProps) {
  const busy = !!loading;
  return (
    <button
      type={type}
      {...props}
      data-loading={busy || undefined}
      aria-busy={busy || undefined}
      aria-disabled={busy || props['aria-disabled']}
      onClick={(event) => {
        if (busy) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
      className={button({ appearance, color, className })}
    >
      {busy && loadingIndicator === 'inline' && <Spinner />}
      {/* loading を使うボタンは、ラベルを包んで薄くできるようにする（包みは送信中でも変えない） */}
      {loading === undefined ? (
        children
      ) : (
        <span
          className={[
            'inline-flex items-center gap-2 [transition:opacity_var(--duration-loading)_var(--ease-press)] motion-reduce:[transition:none]',
            busy && loadingIndicator === 'overlay' && 'opacity-(--loading-label-opacity)',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {children}
        </span>
      )}
      {busy && loadingIndicator === 'overlay' && (
        <span
          aria-hidden
          className="absolute inset-0 flex animate-loading-in items-center justify-center"
        >
          <Spinner />
        </span>
      )}
      {busy && loadingIndicator === 'bar' && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 overflow-hidden"
        >
          <span className="absolute inset-y-0 left-0 w-2/5 animate-loading-bar bg-(color:--button-accent) opacity-60" />
        </span>
      )}
    </button>
  );
}
