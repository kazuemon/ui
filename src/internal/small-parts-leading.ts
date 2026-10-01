import { tv } from './tv';

// 小物（Tag・Chip）の先頭に置くアイコン・アバターの置き場所 — ADR-0399・0400（Tag と Chip で共有）
//   アイコンは文字と同じ大きさ（1em）。Icon（size="text"）も素の svg も同じ大きさにそろえる
//   アイコンの色は既定で文字の色。color は Tag・Chip の color と同じ色で、その色の小物の文字と同じ色になる
//   部品が子の間に gap を持つとき（Chip の消すボタン）は、その分（--small-parts-inner-gap）を引く
//   アバターは、置いた部品の高さ（--small-parts-host-height）から上下の余白を引いた大きさ。左の余白も同じ値（部品が has-data で差し替える）
//   値は tokens.css の --small-parts-icon-gap・--small-parts-avatar-*

/** 先頭のアイコンを包む span の見た目 */
export const leadingIcon = tv({
  base: [
    'me-[calc(var(--small-parts-icon-gap)_-_var(--small-parts-inner-gap,0px))] inline-flex shrink-0 items-center',
    '[&_svg]:size-[1em]!',
  ],
  variants: {
    color: {
      primary: 'text-on-primary-subtle',
      secondary: 'text-on-secondary-subtle',
      neutral: 'text-fg-muted',
      info: 'text-fg-info',
      success: 'text-fg-success',
      warning: 'text-fg-warning',
      danger: 'text-fg-danger',
    },
  },
});

/** 先頭のアバターを包む span のクラス */
export const leadingAvatarClass = [
  'inline-flex shrink-0 items-center me-[calc(var(--small-parts-avatar-gap)_-_var(--small-parts-inner-gap,0px))]',
  '[--small-parts-avatar-size:calc(var(--small-parts-host-height)_-_var(--small-parts-avatar-inset)_*_2)]',
  '*:size-(--small-parts-avatar-size)! *:text-[length:calc(var(--small-parts-avatar-size)_*_0.45)]!',
].join(' ');
