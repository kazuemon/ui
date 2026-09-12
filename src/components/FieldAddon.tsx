import { type ComponentProps, type ReactNode, use } from 'react';
import { tv } from 'tailwind-variants';

import { FieldAddonDisabled } from './field-addon-context';
import { focusRing } from './focus-styles';

// 入力欄に付く prefix・suffix（原則8、design/adr/0024）。入力欄の本体（controlBox）の最初か最後の子に置く
// 色はグレー（--color-field-addon）で、エラーのときは赤み（--color-field-addon-invalid）にする
// 形はトークンで決める（design/tokens.css の --field-addon-*、design/adr/0035）。既定は本体の端に接する
//   本体の端に接するとき（inset が負）は、本体の枠線の場所に同じ太さの枠線を持ち、本体の枠線の色を受け継ぐ
//   外側の角は本体の角丸と同心。Select のボタンのように本体に左右の余白があるときは --field-addon-pad で打ち消す
const fieldAddon = tv({
  base: [
    'flex shrink-0 items-center self-stretch px-(--space-control-x) whitespace-nowrap',
    // 塗り。エラーのときは --color-field-addon-invalid に差し替える
    'bg-(color:--addon-fill) [--addon-fill:var(--color-field-addon)] group-data-invalid/field:[--addon-fill:var(--color-field-addon-invalid)]',
    '[--addon-radius:calc(var(--radius-control)-var(--field-border-width)-var(--addon-inset))]',
    '[--addon-radius-inner:calc(var(--addon-radius)*var(--addon-round-inner))]',
    '[--addon-edge:max(0px,calc(-1*var(--addon-inset)))]',
    '[margin-block:var(--addon-inset)] [border-block-width:var(--addon-edge)] [border-block-color:inherit]',
    // prefix（本体の最初の子）
    'first:[margin-inline-start:calc(var(--addon-inset)-var(--field-addon-pad,0px))]',
    'first:[border-inline-start-width:var(--addon-edge)] first:[border-inline-start-color:inherit]',
    'first:[border-inline-end:var(--field-addon-divider)_solid_var(--color-bg)]',
    'first:[border-start-start-radius:var(--addon-radius)] first:[border-end-start-radius:var(--addon-radius)]',
    'first:[border-start-end-radius:var(--addon-radius-inner)] first:[border-end-end-radius:var(--addon-radius-inner)]',
    // suffix（本体の最後の子）
    'last:[margin-inline-end:calc(var(--addon-inset)-var(--field-addon-pad,0px))]',
    'last:[border-inline-end-width:var(--addon-edge)] last:[border-inline-end-color:inherit]',
    'last:[border-inline-start:var(--field-addon-divider)_solid_var(--color-bg)]',
    'last:[border-start-end-radius:var(--addon-radius)] last:[border-end-end-radius:var(--addon-radius)]',
    'last:[border-start-start-radius:var(--addon-radius-inner)] last:[border-end-start-radius:var(--addon-radius-inner)]',
  ],
  variants: {
    kind: {
      // 文字（ラベル）: 本文より一段淡い文字。押しても入力欄にフォーカスが移る（TextField）
      text: [
        '[--addon-inset:var(--field-addon-inset)] [--addon-round-inner:var(--field-addon-round-inner)]',
        'text-fg-muted group-data-invalid/field:text-[color:var(--color-on-field-addon-invalid,var(--color-fg-muted))]',
        'group-data-disabled/field:text-[color:var(--color-on-field-disabled,var(--color-fg-muted))]',
      ],
      // ボタン: 平らな要素（原則3）。hover と押下で文字の色を淡く敷き、押下で中身が 1px 沈む（design/adr/0027）
      button: [
        '[--addon-inset:var(--field-addon-button-inset)] [--addon-round-inner:var(--field-addon-button-round-inner)]',
        'group/addon cursor-pointer font-bold text-fg select-none',
        'group-data-invalid/field:text-[color:var(--color-on-field-addon-invalid,var(--color-fg))]',
        ...focusRing,
        '[transition:background-color_var(--duration-press)_var(--ease-press),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)]',
        'motion-reduce:[transition:none]',
        // 淡く敷く濃さは --color-flat-hover・--color-flat-press と同じ（文字の色を 8%・16%）。グレーの上に重ねた色にする
        'enabled:hover:bg-[color:color-mix(in_oklab,var(--addon-fill),currentColor_8%)]',
        'enabled:active:bg-[color:color-mix(in_oklab,var(--addon-fill),currentColor_16%)]',
        'disabled:cursor-not-allowed disabled:text-[color:var(--color-on-field-disabled,var(--color-fg))]',
      ],
    },
  },
});

/**
 * 入力欄に付く文字（prefix・suffix）。TextField・Select の prefix・suffix に文字を渡すと、これで包む
 */
export function FieldAddon({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span data-slot="field-addon" className={fieldAddon({ kind: 'text', className })} {...props} />
  );
}

export interface FieldAddonButtonProps extends ComponentProps<'button'> {
  children: ReactNode;
}

/**
 * 入力欄に付くボタン（検索・パスワードを表示など）。入力欄のすぐ横に置くボタンは、独立したボタンではなくこれで作る
 */
export function FieldAddonButton({
  className,
  type = 'button',
  disabled,
  children,
  ...props
}: FieldAddonButtonProps) {
  const fieldDisabled = use(FieldAddonDisabled);
  return (
    <button
      type={type}
      data-slot="field-addon-button"
      disabled={disabled ?? fieldDisabled}
      className={fieldAddon({ kind: 'button', className })}
      {...props}
    >
      <span className="flex items-center gap-2 transition-[translate] duration-(--duration-press) ease-press group-active/addon:translate-y-(--flat-press-depth) group-disabled/addon:translate-y-0 motion-reduce:transition-none">
        {children}
      </span>
    </button>
  );
}
