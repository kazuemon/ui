// Select と TreeSelect が共有する、消すボタン（clearable）の置き方
//   本体（ボタン）と × を包み、× を本体の上に重ねる
//   幅（--select-clear-width）は suffix のボタンと同じ（左右の余白＋アイコン）。中のアイコンは入力欄の大きさ
//   × は右端に置き、本体は × の分の場所を空ける。▼ は × の左へずれる（Combobox と同じ）
//   × に hover しているあいだは、欄の塗りを通常に戻す（× だけが濃くなる。開く場所と消す場所の境目を見せる）
export const selectClearField = [
  'relative w-full min-w-0 [--spacing-icon:var(--spacing-icon-input)]',
  '[--select-clear-width:calc(var(--spacing-control-x)*2+var(--spacing-icon-input))]',
].join(' ');
export const selectClearTrigger = [
  'pe-[calc(var(--spacing-control-x)-var(--field-border-width)+var(--select-clear-width))]',
  '[[data-slot=select-field]:has(>[data-select-clear]:enabled:hover)>&]:not-focus-within:[--control-bg:var(--color-field)]',
].join(' ');
export const selectClearButton = [
  'absolute! inset-y-(--field-border-width) m-0! border-0! [--addon-inset:0px]',
  'end-(--field-border-width)',
  '[border-start-end-radius:var(--addon-radius)]! [border-end-end-radius:var(--addon-radius)]!',
].join(' ');
