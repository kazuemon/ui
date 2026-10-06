import { tv } from './tv';

// 小物（Tag・Chip）の先頭に置くアイコン・アバターの置き場所 — ADR-0399・0400（Tag と Chip で共有）
//   アイコンは文字と同じ大きさ（1em）。Icon（size="text"）も素の svg も同じ大きさにそろえる
//   アイコンの色は既定で文字の色。color は Tag・Chip の color と同じ色で、その色の小物の文字と同じ色になる
//   部品が子の間に gap を持つとき（Chip の消すボタン）は、その分（--small-parts-inner-gap）を引く
//   アバターは、置いた部品の高さ（--small-parts-host-height）から上下の余白（--small-parts-avatar-offset）を引いた大きさ
//   丸は上下と左が avatar-inset。四角は上下を広げ、丸い端の曲がりより右に置く（smallPartsAvatarClass — ADR-0475）
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
  '[--small-parts-avatar-size:calc(var(--small-parts-host-height)_-_var(--small-parts-avatar-offset)_*_2)]',
  '*:size-(--small-parts-avatar-size)! *:text-[length:calc(var(--small-parts-avatar-size)_*_0.45)]!',
  // 角は、アバターの段ではなく札の大きさで決める（smallPartsAvatarClass）
  '*:[--avatar-radius:var(--small-parts-avatar-radius)]!',
].join(' ');

/**
 * 先頭のアバターを置く部品（Tag・Chip）の root に付けるクラス。--small-parts-host-height を置いた要素に付ける — ADR-0475
 * - 札の中のアバターの角（--small-parts-avatar-radius）: 丸は pill。四角（square・tile）は、札の大きさの段が置く角
 * - 丸いアバターは札と同心なので、上下と左の余白は avatar-inset
 * - 四角いアバターは、角が札の丸い端の曲がりに寄らないよう、曲がりより右（まっすぐな部分）に置く。
 *   上下の余白は avatar-inset-square、左の余白は h/2 − r（角の丸みの中心が、丸い端の中心の真下に来る）
 */
export const smallPartsAvatarClass = [
  '[--small-parts-avatar-radius:var(--radius-pill)] [--small-parts-avatar-offset:var(--small-parts-avatar-inset)]',
  'has-[[data-slot$=-avatar]>[data-shape=square]]:[--small-parts-avatar-radius:var(--small-parts-avatar-radius-square)]',
  'has-[[data-slot$=-avatar]>[data-shape=tile]]:[--small-parts-avatar-radius:var(--small-parts-avatar-radius-tile)]',
  'has-[[data-slot$=-avatar]>:is([data-shape=square],[data-shape=tile])]:[--small-parts-avatar-offset:var(--small-parts-avatar-inset-square)]',
  // 左の余白。丸は h/2 − pill が負になるので、上下と同じ余白になる
  '[--small-parts-avatar-offset-x:max(var(--small-parts-avatar-offset),calc(var(--small-parts-host-height)_/_2_-_var(--small-parts-avatar-radius)))]',
].join(' ');
