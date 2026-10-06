import { tv } from './tv';

// 小物（Tag・Chip）の先頭に置くアイコン・アバターの置き場所 — ADR-0399・0400（Tag と Chip で共有）
//   アイコンは文字と同じ大きさ（1em）。Icon（size="text"）も素の svg も同じ大きさにそろえる
//   アイコンの色は既定で文字の色。color は Tag・Chip の color と同じ色で、その色の小物の文字と同じ色になる
//   部品が子の間に gap を持つとき（Chip の消すボタン）は、その分（--small-parts-inner-gap）を引く
//   アバターは、置いた部品の高さ（--small-parts-host-height）から上下の余白（--small-parts-avatar-offset）を引いた大きさ。左の余白も同じ値
//   余白は avatar-inset。四角いアバターは、角が札の外周に接さないよう、角の丸さと札の高さから余白を広げる（smallPartsAvatarClass）
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
 * 先頭のアバターを置く部品（Tag・Chip）の root に付けるクラス。--small-parts-host-height を置いた要素に付ける
 * - 札の中のアバターの角（--small-parts-avatar-radius）: 丸は pill。四角は、札の大きさの段が置く角（--small-parts-avatar-radius-square・-rounded）
 * - 余白（--small-parts-avatar-offset）: avatar-inset と、角が外周に接さないための余白の大きいほう
 *   札の丸い端（半径 h/2）の中心から、四角の角の丸み（半径 r）のいちばん外の点までは (h/2 − 余白 − r)·√2 + r。
 *   これが外周（縁の線の外側）から edge-gap 以上内側（h/2 − edge-gap）に収まる余白は、h/2 − r − (h/2 − edge-gap − r) / √2
 *   丸いアバターは札と同心なので、外周からの離れはいつも avatar-inset
 */
export const smallPartsAvatarClass = [
  '[--small-parts-avatar-radius:var(--radius-pill)]',
  'has-[[data-slot$=-avatar]>[data-shape=square]]:[--small-parts-avatar-radius:var(--small-parts-avatar-radius-square)]',
  'has-[[data-slot$=-avatar]>[data-shape=rounded]]:[--small-parts-avatar-radius:var(--small-parts-avatar-radius-rounded)]',
  // 札の左の角を、四角いアバターの角と同心にする（軸 526 の G の比較用。--small-parts-avatar-concentric が 1 のとき。決まったら畳む）
  'has-[[data-slot$=-avatar]>:is([data-shape=square],[data-shape=rounded])]:rounded-s-[calc(var(--radius-pill)_*_(1_-_var(--small-parts-avatar-concentric))_+_(var(--small-parts-avatar-radius)_+_var(--small-parts-avatar-inset))_*_var(--small-parts-avatar-concentric))]',
  // 右へずらす形（軸 526 の H・I の比較用。--small-parts-avatar-shift が 1 のとき。決まったら畳む）
  //   アバターを札の丸い端の曲がりより右に置き、上下の余白は --small-parts-avatar-shift-inset にする。左の余白は h/2 − r
  '[--small-parts-avatar-k:0]',
  'has-[[data-slot$=-avatar]>:is([data-shape=square],[data-shape=rounded])]:[--small-parts-avatar-k:var(--small-parts-avatar-shift)]',
  '[--small-parts-avatar-offset:calc(max(var(--small-parts-avatar-inset),calc(var(--small-parts-host-height)_/_2_-_var(--small-parts-avatar-radius)_-_(var(--small-parts-host-height)_/_2_-_var(--small-parts-avatar-edge-gap)_-_var(--small-parts-avatar-radius))_*_0.70710678))_*_(1_-_var(--small-parts-avatar-k))_+_var(--small-parts-avatar-shift-inset)_*_var(--small-parts-avatar-k))]',
  '[--small-parts-avatar-offset-x:max(var(--small-parts-avatar-offset),calc((var(--small-parts-host-height)_/_2_-_var(--small-parts-avatar-radius))_*_var(--small-parts-avatar-k)))]',
].join(' ');
