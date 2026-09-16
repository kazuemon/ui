// キーボードで操作したときのフォーカス（focus-visible）。ボタン・リンク・トグルで共有する — design/adr/0031
// 輪郭の外側に outline で描き、寸法を変えない。クリックでは出ない
// 影（box-shadow）ではなく outline にするのは、ハイコントラストモード（forced-colors）でも線が残るため
// 入力欄は原則2の枠線で表す（クリックでも出る）ので、これは使わない
// 通常時も色を透明にして隙間（--focus-ring-offset-rest）を置いておき、出るときに隙間と色だけを動かす
// 動かす長さは --focus-ring-duration。各部品の transition に outline-color と outline-offset を含める
// 線の色は --color-focus-ring。部品の色に従わせるとき（--focus-follow-color: 1 — 後半の軸 41）は、部品が置いた自分の色
//   （--color-own-focus）にする。0 と 1 を srgb で混ぜるので、両端は元の色そのもの
//   --focus-follow-color が未設定（既定）か、部品が自分の色を置いていないときは、--focus-ring-own が無効になり、
//   混ぜずに --color-focus-ring をそのまま使う（color-mix に入らない -webkit-focus-ring-color などでも線が変わらない）
//   --focus-ring-follow-color を置くと、線だけそちらに従う（入力欄の枠線は部品の色、線は1色 — 後半の軸 41 の F）
// 二重の線（後半の軸 41 の F・G）は影で描く。Tailwind の ring（外側）と inset-ring（内側）の枠に入れ、ボタンの影（shadow）と重ねる
//   外側: 部品と線のあいだを --focus-ring-inner-width の幅だけ --color-focus-ring-inner で埋める
//   内側: 部品の縁の内側に、--focus-ring-edge-width の太さで部品の色（--color-own-focus）の線を引く。色を持たない部品には引かない
//   どちらも既定は太さ 0 で、見た目は変わらない。ハイコントラストモードでは影が消え、outline の線だけが残る
export const focusRing = [
  '[outline-offset:var(--focus-ring-offset-rest)] [outline-color:transparent]',
  '[--focus-ring-own:color-mix(in_srgb,var(--color-own-focus)_calc(var(--focus-ring-follow-color,var(--focus-follow-color))*100%),var(--color-focus-ring))]',
  'focus-visible:[outline-style:var(--focus-ring-style)] focus-visible:[outline-width:var(--focus-ring-width)]',
  'focus-visible:[outline-color:var(--focus-ring-own,var(--color-focus-ring))] focus-visible:[outline-offset:var(--focus-ring-offset)]',
  'focus-visible:ring-[length:var(--focus-ring-inner-width)] focus-visible:ring-[color:var(--color-focus-ring-inner)]',
  'focus-visible:inset-ring-[length:var(--focus-ring-edge-width)] focus-visible:inset-ring-[color:var(--color-own-focus,transparent)]',
];
