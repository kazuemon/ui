// 文中のコード（Code）とキー（Kbd）の見た目。部品と Prose が同じクラス列を使う（書き方は heading.ts の先頭）
// Prose では、複数行のコード（pre の中の code）には当てない

// 文中のコード。周りの文字に対する比（em）で大きさと余白を持ち、見出しの中でも本文の中でも同じ形になる
// 面は周りの文字の色を 8% 敷き、文字も周りの色にする（軸 52 の A）。平らなボタンの hover（design/adr/0027）と同じ考え方で、
//   白地・グレーの面・淡い色の面・濃い塗りのどこに置いても、地より一段濃い面になる
// 押せないので影は付けない（原則1）
export const codeStyles = {
  base: [
    '[:where(&:not([data-prose]),&_:not(pre)>code)]:rounded-sm [:where(&:not([data-prose]),&_:not(pre)>code)]:px-[0.3em] [:where(&:not([data-prose]),&_:not(pre)>code)]:py-[0.1em] [:where(&:not([data-prose]),&_:not(pre)>code)]:font-mono [:where(&:not([data-prose]),&_:not(pre)>code)]:text-[0.875em]',
    '[:where(&:not([data-prose]),&_:not(pre)>code)]:bg-[color-mix(in_oklab,currentColor_8%,transparent)] [:where(&:not([data-prose]),&_:not(pre)>code)]:text-inherit',
    // 折り返した行ごとに角と余白を付ける
    '[:where(&:not([data-prose]),&_:not(pre)>code)]:box-decoration-clone',
  ],
  wrap: {
    // ふつうの行の区切り（空白・ハイフン・スラッシュのあと）で折り返し、1 行に収まらない長さのときだけ語の途中でも折る
    normal: '[:where(&:not([data-prose]),&_:not(pre)>code)]:wrap-anywhere',
    // 折り返さない。Prose では使わない
    nowrap: 'whitespace-nowrap',
  },
} as const;

// キーボードのキー。周りの文字に対する比（em）で大きさを持つ
// 白い面に白いボタンと同じ細い輪郭、下辺だけを太くしてキーの厚みを線で見せる（軸 53 の B）
// キーは押すものの絵だが、部品としては押せないので影は付けない（原則1）
export const kbdStyles = [
  '[:where(&:not([data-prose]),&_kbd)]:inline-block [:where(&:not([data-prose]),&_kbd)]:min-w-(--kbd-min-width) [:where(&:not([data-prose]),&_kbd)]:rounded-sm [:where(&:not([data-prose]),&_kbd)]:px-(--kbd-pad-x) [:where(&:not([data-prose]),&_kbd)]:text-center [:where(&:not([data-prose]),&_kbd)]:align-[0.05em]',
  '[:where(&:not([data-prose]),&_kbd)]:text-(length:--kbd-size) [:where(&:not([data-prose]),&_kbd)]:leading-[1.6] [:where(&:not([data-prose]),&_kbd)]:font-semibold [:where(&:not([data-prose]),&_kbd)]:whitespace-nowrap',
  '[:where(&:not([data-prose]),&_kbd)]:bg-surface [:where(&:not([data-prose]),&_kbd)]:text-fg-muted',
  '[:where(&:not([data-prose]),&_kbd)]:border [:where(&:not([data-prose]),&_kbd)]:border-b-(length:--kbd-line-bottom-width) [:where(&:not([data-prose]),&_kbd)]:border-surface-line',
];
