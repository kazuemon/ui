'use client';

import type { ComponentProps, ReactNode } from 'react';
import type { VariantProps } from 'tailwind-variants';

import { focusRing } from '../../internal/focus-styles';
import { XIcon } from '../../internal/icons';
import { warnOnce } from '../../internal/link-parts';
import { chipSizeClass, type SmallPartsSize } from '../../internal/small-parts-size';
import { tv } from '../../internal/tv';

// チップ（消せる小物。Combobox の複数選択や TagsInput の中に並ぶ）。原則5: 小物は pill。design/adr/0061・0074
//   Tag（押せない文字のラベル）と同じ色と面（design/adr/0007・0028・0038・0043）
//   影は付けない: 入力欄の中に並ぶ小物で、ページと同じレイヤーにある（原則1）
// 消す（×）ボタンは、チップの右端に、チップの中に収まる丸として置く。hover で文字の色を淡く敷く（原則3・平らな押すもの）
//   ×の読み上げの名前は使う側が渡す（原則20。部品は文を作らない）
// 押せない（原則13）: 色を持つものは色を残して薄くし、グレーは塗りと文字を近づける。読み取り専用は消すボタンを出さない
// 大きさ（sm・md・lg・inherit）は Tag・Badge・Chip 共通の 1 本の軸 — ADR-0259（値は src/internal/small-parts-size.ts）。既定は md（今の欄の中のチップ）
//   単体の Chip（今までの既定）は lg（部品の高さ）で選べる。Combobox・TagsInput の chipSize もこの size をそのまま渡す
const chip = tv({
  base: [
    'inline-flex max-w-full items-center rounded-pill font-bold whitespace-nowrap',
    // 大きさは size 変化が --chip-height・--chip-pad-x・--chip-font・--chip-leading を差し替える
    'h-[var(--chip-height)] pl-[var(--chip-pad-x)]',
    'text-[length:var(--chip-font)] leading-[var(--chip-leading)]',
    // 消すボタンがあるとき、右は ×（丸）の分だけ空ける。丸は上下左右とも 6px 内側に置く（フォーカスの線がチップの外に出ない）
    'pr-[var(--chip-pad-x)] has-data-[slot=chip-remove]:gap-1 has-data-[slot=chip-remove]:pr-1.5',
    'data-disabled:cursor-not-allowed data-disabled:opacity-(--disabled-opacity)',
    // 見た目は --chip-*（tokens.css）で差し替えられる。未設定なら、色ごとの面と文字（--chip-color-*）を使う
    'bg-(--chip-bg,var(--chip-color-bg)) text-(color:--chip-fg,var(--chip-color-fg))',
    '[border:var(--chip-border-width)_var(--chip-border-style)_var(--chip-border-color)]',
    'data-disabled:border-(--chip-disabled-border-color,var(--chip-border-color)) data-disabled:bg-(--chip-disabled-bg,var(--chip-bg,var(--chip-color-bg))) data-disabled:text-(color:--chip-disabled-fg,var(--chip-fg,var(--chip-color-fg)))',
    'data-readonly:[border-width:var(--chip-readonly-border-width,var(--chip-border-width))] data-readonly:[border-style:var(--chip-readonly-border-style,var(--chip-border-style))] data-readonly:border-(--chip-readonly-border-color,var(--chip-border-color)) data-readonly:bg-(--chip-readonly-bg,var(--chip-bg,var(--chip-color-bg))) data-readonly:text-(color:--chip-readonly-fg,var(--chip-fg,var(--chip-color-fg)))',
  ],
  variants: {
    color: {
      primary:
        '[--chip-color-bg:var(--color-primary-subtle)] [--chip-color-fg:var(--color-on-primary-subtle)]',
      secondary:
        '[--chip-color-bg:var(--color-secondary-subtle)] [--chip-color-fg:var(--color-on-secondary-subtle)]',
      neutral:
        '[--chip-color-bg:var(--color-neutral)] [--chip-color-fg:var(--color-fg-muted)] data-disabled:opacity-100 data-disabled:[--chip-color-bg:var(--color-neutral-disabled)] data-disabled:[--chip-color-fg:var(--color-on-neutral-disabled)]',
      info: '[--chip-color-bg:var(--color-info-subtle)] [--chip-color-fg:var(--color-fg-info)]',
      success:
        '[--chip-color-bg:var(--color-success-subtle)] [--chip-color-fg:var(--color-fg-success)]',
      warning:
        '[--chip-color-bg:var(--color-warning-subtle)] [--chip-color-fg:var(--color-fg-warning)]',
      danger:
        '[--chip-color-bg:var(--color-danger-subtle)] [--chip-color-fg:var(--color-fg-danger)]',
    },
    size: {
      ...chipSizeClass,
      // sm（高さ 20px）は、既定の計算（高さ − 12px）だと × の丸が 8px まで小さくなり押しにくい。
      // 原則にない判断: sm だけ、丸をチップの高さいっぱいに広げ、中の × を 12px に固定する
      sm: `${chipSizeClass.sm} [--chip-remove-icon-override:12px] [--chip-remove-size-override:var(--chip-height)]`,
    },
  },
  defaultVariants: { color: 'neutral', size: 'md' },
});

const chipRemove = tv({
  base: [
    // 丸の大きさはチップの高さから決める。中の × は丸より大きくしない（チップを小さくしたとき、×がチップからはみ出さない）
    // sm だけ、Chip の size が丸・アイコンの大きさを直に差し替える（--chip-remove-*-override）
    '[--chip-remove-size:var(--chip-remove-size-override,calc(var(--chip-height)_-_var(--spacing)_*_3))]',
    '[--chip-remove-icon:var(--chip-remove-icon-override,min(var(--spacing-icon),var(--chip-remove-size)))]',
    'relative inline-flex size-(--chip-remove-size) shrink-0 cursor-pointer items-center justify-center rounded-pill bg-transparent p-0 text-current',
    '[&>svg]:size-[var(--chip-remove-icon,var(--spacing-icon))]',
    ...focusRing,
    '[transition:background-color_var(--duration-press)_var(--ease-press),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)]',
    'motion-reduce:[transition:none]',
    'not-disabled:not-data-disabled:hover:bg-(--color-flat-hover)',
    'not-disabled:not-data-disabled:active:bg-[color-mix(in_oklab,currentColor_var(--flat-press-mix),transparent)]',
    'disabled:cursor-not-allowed data-disabled:cursor-not-allowed',
  ],
});

export interface ChipRemoveProps extends Omit<ComponentProps<'button'>, 'aria-label'> {
  /** 読み上げの名前。「デザインを外す」のように、何を消すのかが分かる文を渡します。部品は文を作りません */
  'aria-label': string;
  /** 中身。書かないときは × のアイコンを置きます */
  children?: ReactNode;
  /** ボタンそのものに付きます */
  className?: string;
}

/**
 * チップの中に置く消すボタン。`Chip` の `onRemove` を使うときは自動で置かれます。
 * Base UI の `Combobox.ChipRemove` の `render` に渡して使います
 */
export function ChipRemove({ className, type = 'button', children, ...props }: ChipRemoveProps) {
  return (
    <button type={type} data-slot="chip-remove" className={chipRemove({ className })} {...props}>
      {children ?? <XIcon standalone />}
    </button>
  );
}

/** チップの色。primary・secondary・neutral は利用者が選ぶ色、info・success・warning・danger は状態を表す色（Tag と同じ） */
export type ChipColor = NonNullable<VariantProps<typeof chip>['color']>;

interface ChipBaseProps
  extends Omit<ComponentProps<'span'>, 'color' | 'onChange'>, VariantProps<typeof chip> {
  /**
   * 色。primary・secondary・neutral は利用者が選ぶ色、info・success・warning・danger は状態を表す色です（`Tag` と同じ）
   * @default 'neutral'
   */
  color?: ChipColor;
  /**
   * 大きさ。既定の md は今までの欄の中のチップと同じ高さです。lg は部品の高さ（今までの単体 Chip の既定）、
   * sm は Tag と同じ高さ（このときだけ × の丸をチップの高さいっぱいに広げます）。
   * inherit は段を持たず、周りの文字の大きさ（em）に従います。Tag・Badge・Chip で共通の軸です（ADR-0259）
   * @default 'md'
   */
  size?: SmallPartsSize;
  /**
   * 押せない。薄くなり、消すボタンも押せなくなります
   * @default false
   */
  disabled?: boolean;
  /**
   * 読み取り専用。消すボタンを出しません。文字は押せないときのようには薄くしません
   * @default false
   */
  readOnly?: boolean;
  /** チップの中に入れる文字。長い文字は … で省略されます */
  children?: ReactNode;
  /** チップそのもの（pill の面）に付きます */
  className?: string;
}

export interface ChipProps extends ChipBaseProps {
  /** 消すボタンを押したときに呼ばれます。渡すと、右端に消すボタン（×）が出ます */
  onRemove?: () => void;
  /**
   * 消すボタンの読み上げの名前。`onRemove` を渡すときは必ず渡します（例: 「デザインを外す」）。
   * 部品は文を作らないので、渡さないと名前のないボタンになり、開発時に警告が出ます
   */
  removeName?: string;
}

/**
 * 消せる小物
 */
export function Chip({
  color,
  size,
  disabled = false,
  readOnly = false,
  onRemove,
  removeName,
  className,
  children,
  ...props
}: ChipProps) {
  if (onRemove && !readOnly && !removeName) {
    warnOnce(
      'Chip: onRemove を渡すときは、消すボタンの読み上げの名前 removeName も渡してください。'
    );
  }
  return (
    <span
      data-disabled={disabled ? '' : undefined}
      data-readonly={readOnly ? '' : undefined}
      className={chip({ color, size, className })}
      {...props}
    >
      {children}
      {onRemove && !readOnly && (
        <ChipRemove aria-label={removeName ?? ''} disabled={disabled} onClick={() => onRemove()} />
      )}
    </span>
  );
}
