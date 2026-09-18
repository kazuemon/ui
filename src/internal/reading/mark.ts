// 目立たせたい言葉（Mark）の見た目。部品と Prose が同じクラス列を使う（書き方は heading.ts の先頭）
// 警告の黄色（面用）を 45% に薄めて全面に敷く蛍光ペンの形（軸 63 の C）。Primary の青の補色で、青いリンクと紛れない
// 文字の色は周りの文字のまま。折り返した行ごとに角と余白を付ける
// 文の中にあるので影は付けない（原則1）
export const markStyles = [
  '[:where(&:not([data-prose]),&_mark)]:rounded-xs [:where(&:not([data-prose]),&_mark)]:bg-[color-mix(in_oklab,var(--color-warning)_45%,transparent)] [:where(&:not([data-prose]),&_mark)]:box-decoration-clone [:where(&:not([data-prose]),&_mark)]:px-[0.1em] [:where(&:not([data-prose]),&_mark)]:text-inherit',
];
