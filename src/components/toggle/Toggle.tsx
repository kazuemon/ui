'use client';

import { Toggle as BaseToggle } from '@base-ui/react/toggle';
import { type ComponentProps, type ReactElement, useContext } from 'react';
import type { VariantProps } from 'tailwind-variants';

import { focusRing } from '../../internal/focus-styles';
import { warnOnce } from '../../internal/link-parts';
import { tv } from '../../internal/tv';
import { ToggleGroupContext } from './toggle-group-context';

// Toggle: 二値（押した・押していない）を切り替えるボタン。Base UI の Toggle（<button>）が土台（design/tokens.css の --toggle-*）
// 原則6: 選んでいることを示す印は部品の色に従う。OFF はどの color でも同じグレー（Checkbox の選んでいない箱と同じ考え）。色が付くのは ON だけ
// 原則3: 押しても残り、状態が切り替わる押すものは沈む。Switch のようにノブ自体が動いて手応えになるわけではないので、
//   OFF→ON・ON→OFF のどちらの押下でも hover で塗りが濃くなり、押すと沈む（平らな押すものと同じ濃さ・深さ）
// 影は持たない（浮いた押すものではなく、平らな押すもの寄り）
// 角丸は control で決定（軸267）。ON の塗りの強さは variant（filled 既定・soft・outline から選べる。軸270）で決定
// 枠線は常に --border-width-medium を確保し、色（--toggle-border-color）だけを透明⇄部品の色で切り替える。
//   幅を 0 ⇄ medium で切り替えると、幅いっぱいの文字ボタン（auto width）が outline の ON で膨らんで見えるため（軸270 の直し）。
//   border-color が透明のときは background-clip: border-box（既定）で塗りが枠の下まで届くので、見た目は枠なしのときと変わらない
const toggle = tv({
  base: [
    'relative inline-flex h-(--spacing-control) shrink-0 cursor-pointer items-center justify-center gap-2',
    'rounded-(--radius-control) px-(--spacing-control-x) whitespace-nowrap select-none',
    'text-(length:--text-control) leading-(--leading-control) font-bold',
    'border-(length:--border-width-medium) border-(color:--toggle-border-color)',
    'bg-(color:--toggle-bg) text-(color:--toggle-fg)',
    '[--toggle-bg:var(--color-neutral)] [--toggle-border-color:transparent] [--toggle-fg:var(--toggle-off-fg)]',
    ...focusRing,
    // 動かすのは background-color ではなく --toggle-bg（theme.css で登録した変数 — ADR-0112）
    '[transition:--toggle-bg_var(--duration-press)_var(--ease-press),color_var(--duration-press)_var(--ease-press),border-color_var(--duration-press)_var(--ease-press),translate_var(--duration-press)_var(--ease-press),opacity_var(--duration-loading)_var(--ease-press),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)]',
    'motion-reduce:[transition:none]',
    // OFF: 平らな押すものと同じ hover・押下（原則3・design/adr/0027）
    'not-data-pressed:not-[:disabled,[data-disabled]]:hover:[--toggle-bg:var(--toggle-off-hover-bg)]',
    'not-data-pressed:not-[:disabled,[data-disabled]]:active:translate-y-(--flat-press-depth) not-data-pressed:not-[:disabled,[data-disabled]]:active:[--toggle-bg:color-mix(in_oklab,var(--toggle-off-hover-bg),var(--color-fg)_var(--flat-press-mix))]',
    // ON: variant・color が決めた塗り。hover・押下は黒を混ぜて濃くし、沈みも重ねる
    'data-pressed:[--toggle-bg:var(--toggle-on-bg)] data-pressed:[--toggle-fg:var(--toggle-on-fg)]',
    'data-pressed:[--toggle-border-color:var(--toggle-on-border-color,transparent)]',
    'data-pressed:not-[:disabled,[data-disabled]]:hover:[--toggle-bg:color-mix(in_oklab,var(--toggle-on-bg),black_var(--flat-hover-mix))]',
    'data-pressed:not-[:disabled,[data-disabled]]:active:translate-y-(--flat-press-depth) data-pressed:not-[:disabled,[data-disabled]]:active:[--toggle-bg:color-mix(in_oklab,var(--toggle-on-bg),black_var(--flat-press-mix))]',
    // 押せない（原則13）: OFF は入力欄と同じグレーに寄せ、薄くしない。ON は色を残して薄くする
    'disabled:cursor-not-allowed data-disabled:cursor-not-allowed',
    'not-data-pressed:disabled:opacity-100 not-data-pressed:disabled:[--toggle-bg:var(--color-neutral-disabled)] not-data-pressed:disabled:[--toggle-fg:var(--color-on-neutral-disabled)]',
    'not-data-pressed:data-disabled:opacity-100 not-data-pressed:data-disabled:[--toggle-bg:var(--color-neutral-disabled)] not-data-pressed:data-disabled:[--toggle-fg:var(--color-on-neutral-disabled)]',
    'data-pressed:disabled:opacity-(--disabled-opacity) data-pressed:data-disabled:opacity-(--disabled-opacity)',
    // ToggleGroup の詰め方（frame="connected"）のときだけ、両端以外の角丸を消す（design/stories/axis-269）
    // 向き（data-orientation。ToggleGroup が常に持つ）で、丸める辺を左右（horizontal）と上下（vertical）に分ける
    'in-data-[frame=connected]:rounded-none',
    'in-data-[frame=connected]:in-data-[orientation=horizontal]:first:rounded-s-(--radius-control) in-data-[frame=connected]:in-data-[orientation=horizontal]:last:rounded-e-(--radius-control)',
    'in-data-[frame=connected]:in-data-[orientation=vertical]:first:rounded-t-(--radius-control) in-data-[frame=connected]:in-data-[orientation=vertical]:last:rounded-b-(--radius-control)',
  ],
  variants: {
    color: {
      primary: [
        '[--toggle-accent-fg:var(--color-on-primary)] [--toggle-accent:var(--color-primary)]',
        '[--toggle-accent-subtle-fg:var(--color-on-primary-subtle)] [--toggle-accent-subtle:var(--color-primary-subtle)]',
        '[--color-own-focus:var(--color-primary)]',
      ],
      secondary: [
        '[--toggle-accent-fg:var(--color-on-secondary)] [--toggle-accent:var(--color-fg-secondary)]',
        '[--toggle-accent-subtle-fg:var(--color-on-secondary-subtle)] [--toggle-accent-subtle:var(--color-secondary-subtle)]',
        '[--color-own-focus:var(--color-fg-secondary)]',
      ],
      neutral: [
        '[--toggle-accent-fg:var(--color-on-neutral-strong)] [--toggle-accent:var(--color-neutral-strong)]',
        '[--toggle-accent-subtle-fg:var(--color-fg)] [--toggle-accent-subtle:var(--color-neutral)]',
      ],
    },
    // ON の塗りの強さ。filled: 部品の色の濃い塗り（原則6）。soft: 淡い面（Chip・Tag と同じ）。outline: 淡い面に部品の色の枠線を足す
    //   underline だけは OFF の形も変える（下）
    variant: {
      filled: '[--toggle-on-bg:var(--toggle-accent)] [--toggle-on-fg:var(--toggle-accent-fg)]',
      soft: '[--toggle-on-bg:var(--toggle-accent-subtle)] [--toggle-on-fg:var(--toggle-accent-subtle-fg)]',
      outline: [
        '[--toggle-on-bg:var(--toggle-accent-subtle)] [--toggle-on-fg:var(--toggle-accent-subtle-fg)]',
        '[--toggle-on-border-color:var(--toggle-accent)]',
      ],
      // underline: OFF を下線のボタン（Button の underline）と同じ平らな形にし、ON だけ部品の色の濃い塗り（filled と同じ）にする
      //   OFF は塗りなし・本文の色で、文字にだけ淡い下線を引く。hover・押下は下線のボタンと同じ（文字の色を淡く敷き、押下で沈む）
      //   帯（Toolbar）の中で、下線のボタンと並べたときに OFF のトグルだけがグレーの塊に見えないようにする
      //   押せない OFF は塗りなしのまま、文字を押せない色にして下線を外す（下線のボタンと同じ）
      underline: [
        '[--toggle-on-bg:var(--toggle-accent)] [--toggle-on-fg:var(--toggle-accent-fg)]',
        '[--toggle-bg:transparent] [--toggle-off-fg:var(--color-fg)]',
        'not-data-pressed:underline not-data-pressed:[text-decoration-color:var(--color-link-underline)] not-data-pressed:decoration-1 not-data-pressed:underline-offset-4',
        '[--toggle-off-hover-bg:color-mix(in_oklab,var(--color-fg)_var(--flat-hover-mix),transparent)]',
        'not-data-pressed:not-[:disabled,[data-disabled]]:active:[--toggle-bg:color-mix(in_oklab,var(--color-fg)_var(--flat-press-mix),transparent)]',
        'not-data-pressed:disabled:no-underline not-data-pressed:disabled:[--toggle-bg:transparent]',
        'not-data-pressed:data-disabled:no-underline not-data-pressed:data-disabled:[--toggle-bg:transparent]',
      ],
    },
    // 大きさの段。Button の size と同じ値（sm は密度の寸法を、自分の中だけ小さい段に差し替える。密度では変えない）
    //   アイコンだけのトグルの正方形も --spacing-control を読むので、一緒に小さくなる
    size: {
      md: '',
      sm: [
        '[--spacing-control:var(--spacing-control-sm)]',
        '[--spacing-control-x:var(--spacing-control-x-sm)] [--spacing-icon:var(--spacing-icon-sm)]',
        '[--leading-control:var(--leading-control-sm)] [--text-control:var(--text-control-sm)]',
      ],
    },
  },
  defaultVariants: { color: 'neutral', variant: 'filled', size: 'md' },
});

// アイコンだけのトグル（iconOnly）: 部品の高さの正方形。square（既定）は文字のトグルと同じ角、circle は丸（Button と同じ考え。軸268で決定）
const iconOnlyClass = {
  square: 'min-w-(--spacing-control) px-0',
  circle: 'min-w-(--spacing-control) px-0 rounded-pill',
} as const;

/** アイコンだけのトグルの形 */
export type ToggleShape = keyof typeof iconOnlyClass;

/** ON になったときの色（原則6）。OFF は色を指定していても同じグレーです */
export type ToggleColor = NonNullable<VariantProps<typeof toggle>['color']>;

/** ON の塗りの強さ（underline は OFF も塗りのない形にする） */
export type ToggleVariant = NonNullable<VariantProps<typeof toggle>['variant']>;

/** 大きさの段（Button の size と同じ） */
export type ToggleSize = NonNullable<VariantProps<typeof toggle>['size']>;

interface ToggleBaseProps extends Omit<ComponentProps<'button'>, 'color' | 'value' | 'onChange'> {
  /** 押しているか（制御） */
  pressed?: boolean;
  /**
   * はじめに押しているか（非制御）
   * @default false
   */
  defaultPressed?: boolean;
  /** 押した・外したときに、次の値を渡して呼びます */
  onPressedChange?: (pressed: boolean) => void;
  /**
   * 押せない（Disabled）状態にします
   * @default false
   */
  disabled?: boolean;
  /** ToggleGroup の中で、このトグルを識別する値。ToggleGroup の中に置くときは必ず渡します */
  value?: string;
  /**
   * ON になったときの色（原則6）。OFF は色を指定していても同じグレーです。ToggleGroup の中では、
   * 指定しなければ ToggleGroup の color になります
   * @default 'neutral'
   */
  color?: ToggleColor;
  /**
   * ON の塗りの強さ。filled は部品の色の濃い塗り、soft は淡い面（Chip・Tag と同じ）、outline は淡い面に
   * 部品の色の枠線を足します。underline は、OFF を下線のボタン（Button の underline）と同じ塗りのない形にし、
   * ON だけ filled と同じ濃い塗りにします（帯の中で、下線のボタンと並べるとき）。
   * ToggleGroup の中では、指定しなければ ToggleGroup の variant になります
   * @default 'filled'
   */
  variant?: ToggleVariant;
  /**
   * 大きさ。sm は表の行や小さな面の中に置く、一段小さいトグルです（Button の size と同じ段）。
   * 指で操作するときも同じ大きさで、押せる高さ（44px）より低くなります。指で押すことが多い画面の主な操作には md を使います。
   * ToggleGroup の中では、指定しなければ ToggleGroup の size になります
   * @default 'md'
   */
  size?: ToggleSize;
  /** トグルそのもの（button）に付きます */
  className?: string;
}

export interface ToggleProps extends ToggleBaseProps {
  /**
   * アイコンだけのトグルにします。部品の高さの正方形になります。
   * 文字がないので、読み上げの名前を aria-label で必ず付けます（ToggleIconOnlyProps）
   * @default false
   */
  iconOnly?: false;
  /** 形はアイコンだけのトグル（iconOnly）でだけ選べる */
  shape?: never;
}

/** アイコンだけのトグル（iconOnly）の props。読み上げの名前（aria-label）が要ります */
export interface ToggleIconOnlyProps extends Omit<ToggleBaseProps, 'aria-label'> {
  /** アイコンだけのトグルにします。部品の高さの正方形になります */
  iconOnly: true;
  /**
   * 形。square は文字のトグルと同じ角の正方形、circle は丸です
   * @default 'square'
   */
  shape?: ToggleShape;
  /** 読み上げの名前。文字がないので必ず付けます（例: 「太字」） */
  'aria-label': string;
}

/**
 * 二値（押した・押していない）を切り替えるボタンです。単独でも、値を持たせて ToggleGroup の中に並べても使えます。
 *
 * 中のアイコンは Icon で包みます（`<Icon icon={StarIcon} />`）。アイコンだけのトグル（iconOnly）は、
 * 読み上げの名前を aria-label で付け、アイコンに `standalone` を付けます。
 *
 * 型はふつうのトグルとアイコンだけのトグルの2つで重ねます（overload）。アイコンだけのトグルでは aria-label が要ります
 */
export function Toggle(props: ToggleIconOnlyProps): ReactElement;
export function Toggle(props: ToggleProps): ReactElement;
export function Toggle({
  color,
  variant,
  size,
  className,
  iconOnly = false,
  shape = 'square',
  pressed,
  defaultPressed,
  onPressedChange,
  ...props
}: ToggleProps | ToggleIconOnlyProps) {
  const group = useContext(ToggleGroupContext);
  if (iconOnly && !props['aria-label'] && !props['aria-labelledby'])
    warnOnce('Toggle: アイコンだけのトグル（iconOnly）には aria-label で読み上げの名前を付けます');
  return (
    <BaseToggle
      pressed={pressed}
      defaultPressed={defaultPressed}
      onPressedChange={onPressedChange ? (next) => onPressedChange(next) : undefined}
      data-icon-only={iconOnly ? shape : undefined}
      className={toggle({
        color: color ?? group?.color,
        variant: variant ?? group?.variant,
        size: size ?? group?.size,
        className: [iconOnly && iconOnlyClass[shape], className],
      })}
      {...props}
    />
  );
}
