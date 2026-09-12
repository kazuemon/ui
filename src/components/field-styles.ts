import { tv } from 'tailwind-variants';

// 原則4: ラベル / 本体 / キャプションの3層
// エラーのときは、状態の枠線（--color-focus）を赤に、塗りをエラーの塗りに差し替える（原則2）
// hover でも塗りを変えず、エラーの見た目を保つ
export const fieldStyles = tv({
  slots: {
    root: [
      'group/field flex flex-col gap-(--space-field-gap)',
      'data-invalid:[--color-focus:var(--color-danger)]',
      'data-invalid:[--color-field-focus:var(--color-field-invalid)]',
      'data-invalid:[--color-field-hover:var(--color-field-invalid)]',
      // Disabled（原則1、design/adr/0026）: 本体の透明度・塗り・文字の色はトークンで指定する（未設定なら部品の色のまま）。hover でも変えない
      'data-disabled:[--color-field-hover:var(--color-field-disabled,var(--color-field))]',
    ],
    label: [
      'text-(length:--text-label) leading-(--leading-label) font-bold text-fg',
      'group-data-disabled/field:opacity-(--disabled-label-opacity)',
    ],
    caption: [
      'text-(length:--text-caption) leading-(--leading-caption) text-fg-subtle',
      'group-data-disabled/field:opacity-(--disabled-label-opacity)',
    ],
    error: 'text-(length:--text-caption) leading-(--leading-caption) text-danger',
  },
});

// 編集できる入力欄の本体（原則8）。TextField と Select のボタンで共有する
// 原則2: 通常はグレーの塗り・枠線なし。フォーカスでは塗りを変えず、2px の枠線を足す（design/adr/0019）
// 枠線は通常時も透明で確保しておき、フォーカスで文字がずれないようにする
export const controlBox = tv({
  base: [
    'flex h-(--size-control) w-full min-w-0 items-center gap-(--space-control-x) rounded-control',
    'border-(length:--field-border-width) border-transparent bg-field',
    'px-[calc(var(--space-control-x)-var(--field-border-width))] text-(length:--text-control) leading-(--leading-control) text-fg',
    'transition-[background-color,border-color] duration-(--duration-field) ease-press motion-reduce:transition-none',
    'hover:not-focus-within:bg-field-hover',
    // フォーカスは枠線だけで表す。ブラウザのフォーカスの線は出さない（Select のボタンで枠線と重なっていた）
    'outline-none focus-within:border-focus focus-within:bg-field-focus',
    'group-data-invalid/field:border-danger group-data-invalid/field:bg-field-invalid',
    'group-data-disabled/field:cursor-not-allowed group-data-disabled/field:opacity-(--field-disabled-opacity)',
    'group-data-disabled/field:bg-[color:var(--color-field-disabled,var(--color-field))]',
    'group-data-disabled/field:text-[color:var(--color-on-field-disabled,var(--color-fg))]',
  ],
});
