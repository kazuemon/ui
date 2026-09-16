// キーボードで操作したときのフォーカス（focus-visible）。ボタン・リンク・トグルで共有する — design/adr/0031
// 輪郭の外側に outline で描き、寸法を変えない。クリックでは出ない
// 影（box-shadow）ではなく outline にするのは、ハイコントラストモード（forced-colors）でも線が残るため
// 入力欄は原則2の枠線で表す（クリックでも出る）ので、これは使わない
// 通常時も色を透明にして隙間（--focus-ring-offset）を置いておき、出るときに色だけを動かす
// 動かす長さは --focus-ring-duration。各部品の transition に outline-color と outline-offset を含める
// 線の色は、部品が置いた自分の色（--color-own-focus — ADR-0071 の M）。色を持たない部品は --color-focus-ring
//   --focus-follow-color（1 か 0）で部品の色と --color-focus-ring を srgb で混ぜるので、両端は元の色そのもの
//   お知らせの中は --focus-follow-color を未設定にする。そのときと、部品が自分の色を置いていないときは、--focus-ring-own が無効になり、
//   混ぜずに --color-focus-ring をそのまま使う（color-mix に入らない -webkit-focus-ring-color などでも線が変わらない）
export const focusRing = [
  '[outline-offset:var(--focus-ring-offset)] [outline-color:transparent]',
  '[--focus-ring-own:color-mix(in_srgb,var(--color-own-focus)_calc(var(--focus-follow-color)*100%),var(--color-focus-ring))]',
  'focus-visible:[outline-style:solid] focus-visible:[outline-width:var(--focus-ring-width)]',
  'focus-visible:[outline-color:var(--focus-ring-own,var(--color-focus-ring))]',
];
