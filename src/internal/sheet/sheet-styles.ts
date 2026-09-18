import { focusRing } from '../focus-styles';

// 閉じる × の見た目。アイコンだけのボタンなので線は Bold（adr/0018）。hover と押下は平らなボタンと同じ（adr/0027）
export const sheetCloseButtonClass = [
  'flex size-(--spacing-control) cursor-pointer items-center justify-center rounded-(--sheet-close-radius) text-fg-muted',
  ...focusRing,
  // 塗りは --flat-bg（theme.css で登録）に置き、background-color ではなく変数を動かす（ADR-0112）
  //   登録した変数は currentColor を補間できないので、文字の色（--color-fg-muted）を --flat-hover-mix・--flat-press-mix で混ぜる（--color-flat-* と同じ色）
  '[--flat-bg:transparent] bg-(color:--flat-bg)',
  '[transition:--flat-bg_var(--duration-press)_var(--ease-press),outline-color_var(--focus-ring-duration)_var(--ease-press)]',
  'hover:[--flat-bg:color-mix(in_oklab,var(--color-fg-muted)_var(--flat-hover-mix),transparent)] active:[--flat-bg:color-mix(in_oklab,var(--color-fg-muted)_var(--flat-press-mix),transparent)] motion-reduce:[transition:none]',
].join(' ');

// Dialog・Drawer・Popover の題（太字）と説明。大きさは --overlay-title-*・--overlay-description-*（密度で変わる — src/styles/theme.css）
// 見出しの × を題の行の中央にそろえるため、面に --sheet-title-leading として題の行の高さを渡す（overlayTitleLeading）
export const sheetTitleClass =
  'text-(length:--overlay-title-size) leading-(--overlay-title-leading) font-bold';
export const sheetDescriptionClass =
  'text-(length:--overlay-description-size) leading-(--overlay-description-leading) text-fg-subtle';
export const overlayTitleLeading = '[--sheet-title-leading:var(--overlay-title-leading)]';
