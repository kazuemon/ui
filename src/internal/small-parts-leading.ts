// 小物（Tag・Chip）の先頭に置くアイコン・アバターの置き場所 — 比較中（Design Review/419・420）
//   値は tokens.css の --small-parts-icon-*・--small-parts-avatar-*（Tag と Chip で共有）
//   アイコンは文字の大きさ（em）に比例させ、色は文字の色を薄めて敷く。Icon（size="text"）も素の svg も同じ大きさにそろえる
//   部品が子の間に gap を持つとき（Chip の消すボタン）は、その分（--small-parts-inner-gap）を引く
//   アバターは、置いた部品の高さ（--small-parts-host-height）から上下の余白を引いた大きさ。左の余白も同じ値（部品が has-data で差し替える）

/** 先頭のアイコンを包む span のクラス */
export const leadingIconClass = [
  'inline-flex shrink-0 items-center me-[calc(var(--small-parts-icon-gap)_-_var(--small-parts-inner-gap,0px))]',
  'text-[color-mix(in_oklab,currentColor_var(--small-parts-icon-mix),transparent)]',
  '[&_svg]:size-[calc(1em_*_var(--small-parts-icon-scale))]!',
].join(' ');

/** 先頭のアバターを包む span のクラス */
export const leadingAvatarClass = [
  'inline-flex shrink-0 items-center me-[calc(var(--small-parts-avatar-gap)_-_var(--small-parts-inner-gap,0px))]',
  '[--small-parts-avatar-size:calc(var(--small-parts-host-height)_-_var(--small-parts-avatar-inset)_*_2)]',
  '*:size-(--small-parts-avatar-size)! *:text-[length:calc(var(--small-parts-avatar-size)_*_0.45)]!',
].join(' ');
