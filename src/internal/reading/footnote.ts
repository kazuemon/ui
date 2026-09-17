// 脚注（FootnoteRef・Footnotes・FootnoteItem）の見た目。部品と Prose が同じクラス列を使う（書き方は heading.ts の先頭）— 軸 61
// 見た目は要素と属性（sup・[data-footnote-ref]・[data-footnotes]・[data-footnote-backref]）に当てる。GFM の HTML と同じ要素・属性
// フォーカスの線は、部品はそれぞれの要素に focusRing、Prose は focusRingInProse（src/internal/focus-styles.ts）で付ける
//
// 参照（軸 61 の A）: 上付きの [1] を Primary の青にする。角括弧は content で足す（読み上げには番号だけが残る）
//   下線と hover は文字のリンク（Link の text）と同じ: ふだんから淡い下線、hover で下線だけが濃くなり、押すと沈む
// 戻るリンク（軸 61 の C の色）: 濃い水色の、戻る向きの矢印のアイコン（文字の ↩ は端末で絵文字になり、形も揺れる）
//   文字のリンクと同じく、ふだんから淡い下線を引き、hover で下線だけを濃くし、押すと沈む。アイコンは文字ではないので、下線は下の枠線で描く
// 一覧: 注記の大きさ（14/24）で、文字は --color-fg-muted。数字はリスト（List の ol）と同じ作り

export const footnoteRefStyles = {
  // 行の高さは広げない
  sup: '[:where(&:not([data-prose]),&_sup:has(>[data-footnote-ref]))]:text-[0.75em] [:where(&:not([data-prose]),&_sup:has(>[data-footnote-ref]))]:leading-none',
  link: [
    "[:where(&:not([data-prose]),&_[data-footnote-ref])]:relative [:where(&:not([data-prose]),&_[data-footnote-ref])]:cursor-pointer [:where(&:not([data-prose]),&_[data-footnote-ref])]:rounded-xs [:where(&:not([data-prose]),&_[data-footnote-ref])]:px-px [:where(&:not([data-prose]),&_[data-footnote-ref])]:leading-none [:where(&:not([data-prose]),&_[data-footnote-ref])]:text-primary [:where(&:not([data-prose]),&_[data-footnote-ref])]:tabular-nums [:where(&:not([data-prose]),&_[data-footnote-ref])]:before:content-['['] [:where(&:not([data-prose]),&_[data-footnote-ref])]:after:content-[']']",
    '[:where(&:not([data-prose]),&_[data-footnote-ref])]:underline [:where(&:not([data-prose]),&_[data-footnote-ref])]:[text-decoration-color:var(--color-link-underline)] [:where(&:not([data-prose]),&_[data-footnote-ref])]:decoration-1 [:where(&:not([data-prose]),&_[data-footnote-ref])]:underline-offset-[0.3em]',
    '[:where(&:not([data-prose]),&_[data-footnote-ref])]:hover:[text-decoration-color:var(--color-link-underline-hover)] [:where(&:not([data-prose]),&_[data-footnote-ref])]:active:top-(--flat-press-depth)',
    '[:where(&:not([data-prose]),&_[data-footnote-ref])]:[transition:top_var(--duration-press)_var(--ease-press),text-decoration-color_var(--link-underline-duration)_var(--link-underline-ease),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)] [:where(&:not([data-prose]),&_[data-footnote-ref])]:motion-reduce:[transition:none]',
  ],
} as const;

export const footnotesStyles = {
  // 注記の大きさは、読みもの（data-reading）の中でも機能の画面と同じ値にする（脚注は記事の中に置くので 14/24 で書く）
  root: '[:where(&:not([data-prose]),&_[data-footnotes])]:text-fg-muted [:where(&:not([data-prose]),&_[data-footnotes])]:[--list-leading:24px] [:where(&:not([data-prose]),&_[data-footnotes])]:[--list-text:14px]',
  // 見出し（Footnotes）は読み上げだけ
  label: '[:where(&:not([data-prose]),&_[data-footnotes]>h2)]:sr-only',
  backref: [
    '[:where(&:not([data-prose]),&_[data-footnote-backref])]:relative [:where(&:not([data-prose]),&_[data-footnote-backref])]:inline-flex [:where(&:not([data-prose]),&_[data-footnote-backref])]:cursor-pointer [:where(&:not([data-prose]),&_[data-footnote-backref])]:items-center [:where(&:not([data-prose]),&_[data-footnote-backref])]:align-middle [:where(&:not([data-prose]),&_[data-footnote-backref])]:text-on-tag',
    '[:where(&:not([data-prose]),&_[data-footnote-backref])]:border-b [:where(&:not([data-prose]),&_[data-footnote-backref])]:border-(color:--color-link-underline) [:where(&:not([data-prose]),&_[data-footnote-backref])]:hover:border-(color:--color-link-underline-hover) [:where(&:not([data-prose]),&_[data-footnote-backref])]:active:top-(--flat-press-depth)',
    '[:where(&:not([data-prose]),&_[data-footnote-backref])]:[transition:top_var(--duration-press)_var(--ease-press),border-color_var(--link-underline-duration)_var(--link-underline-ease),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)] [:where(&:not([data-prose]),&_[data-footnote-backref])]:motion-reduce:[transition:none]',
  ],
  // 矢印のアイコン。部品は中に svg（ArrowUDownLeftIcon）を置く。1em の四角で、少し上げて文字の中央に見せる
  backrefIcon: '[&_svg]:size-[1em] [&_svg]:shrink-0 [&_svg]:-translate-y-[0.1em]',
  // Prose だけ: GFM の HTML では、中身が文字の ↩。文字を隠し（幅を 1em に切り、行の高さを 0 にする）、
  //   同じ形のアイコン（--footnote-backref-icon。ArrowUDownLeftIcon と同じ形の SVG）を ::before に mask で描く。大きさと上げる量は部品の svg と同じ
  backrefIconInProse: [
    '[&_[data-footnote-backref]]:w-[1em] [&_[data-footnote-backref]]:overflow-hidden [&_[data-footnote-backref]]:leading-[0]',
    "[&_[data-footnote-backref]]:before:size-[1em] [&_[data-footnote-backref]]:before:shrink-0 [&_[data-footnote-backref]]:before:-translate-y-[0.1em] [&_[data-footnote-backref]]:before:bg-current [&_[data-footnote-backref]]:before:content-['']",
    '[&_[data-footnote-backref]]:before:[mask:var(--footnote-backref-icon)_center/100%_no-repeat]',
  ],
} as const;
