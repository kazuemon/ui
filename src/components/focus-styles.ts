// キーボードで操作したときのフォーカス（focus-visible）。ボタン・リンク・トグルで共有する — design/adr/0031
// 輪郭の外側に outline で描き、寸法を変えない。クリックでは出ない
// 影（box-shadow）ではなく outline にするのは、ハイコントラストモード（forced-colors）でも線が残るため
// 入力欄は原則2の枠線で表す（クリックでも出る）ので、これは使わない
// 通常時も色を透明にして隙間（--focus-ring-offset-rest）を置いておき、出るときに隙間と色だけを動かす
// 動かす長さは --focus-ring-duration。各部品の transition に outline-color と outline-offset を含める
export const focusRing = [
  '[outline-offset:var(--focus-ring-offset-rest)] [outline-color:transparent]',
  'focus-visible:[outline-style:var(--focus-ring-style)] focus-visible:[outline-width:var(--focus-ring-width)]',
  'focus-visible:[outline-color:var(--color-focus-ring)] focus-visible:[outline-offset:var(--focus-ring-offset)]',
];
