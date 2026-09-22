// 文字のリンク（Link の variant="text"）の見た目。Link と Prose の a が同じクラス列を使う（書き方は heading.ts の先頭）
// Prose では、脚注の参照と戻るリンク（footnote.ts）には当てない
// フォーカスの線は、Link は base の focusRing、Prose は focusRingInProse（src/internal/focus-styles.ts）で付ける
//
// 左右に 4px はみ出させ、フォーカスの線を文字から離す。前後の文字には少しかかる（design/adr/0031）
// 文章の中で折り返せるよう inline のまま沈める
// 下線はふだん淡く、hover で下線だけ濃くする。文字の色と下線の太さは変えない（design/adr/0030）
// hover・押下で背景を敷かず、押下で沈むだけ（design/adr/0027）
export const textLinkStyles = [
  '[:where(&:not([data-prose]),&_a:not([data-footnote-ref],[data-footnote-backref]))]:cursor-pointer [:where(&:not([data-prose]),&_a:not([data-footnote-ref],[data-footnote-backref]))]:text-(color:--link-color)',
  '[:where(&:not([data-prose]),&_a:not([data-footnote-ref],[data-footnote-backref]))]:relative [:where(&:not([data-prose]),&_a:not([data-footnote-ref],[data-footnote-backref]))]:-mx-1 [:where(&:not([data-prose]),&_a:not([data-footnote-ref],[data-footnote-backref]))]:rounded-(--link-text-radius) [:where(&:not([data-prose]),&_a:not([data-footnote-ref],[data-footnote-backref]))]:box-decoration-clone [:where(&:not([data-prose]),&_a:not([data-footnote-ref],[data-footnote-backref]))]:px-1 [:where(&:not([data-prose]),&_a:not([data-footnote-ref],[data-footnote-backref]))]:py-0.5 [:where(&:not([data-prose]),&_a:not([data-footnote-ref],[data-footnote-backref]))]:underline-offset-4',
  // 色は [text-decoration-color:…] で書く。decoration-(color:…) は tailwind-merge が太さ（decoration-1）と同じ種類とみなして消す
  '[:where(&:not([data-prose]),&_a:not([data-footnote-ref],[data-footnote-backref]))]:underline [:where(&:not([data-prose]),&_a:not([data-footnote-ref],[data-footnote-backref]))]:[text-decoration-color:var(--color-link-underline)] [:where(&:not([data-prose]),&_a:not([data-footnote-ref],[data-footnote-backref]))]:decoration-1',
  '[:where(&:not([data-prose]),&_a:not([data-footnote-ref],[data-footnote-backref]))]:not-data-disabled:hover:[text-decoration-color:var(--color-link-underline-hover)]',
  '[:where(&:not([data-prose]),&_a:not([data-footnote-ref],[data-footnote-backref]))]:not-data-disabled:active:top-(--flat-press-depth)',
  // 下線の色の変化は --link-underline-duration で動かす。位置は動かさない（離したときに抜ける向きを変えられる）
  '[:where(&:not([data-prose]),&_a:not([data-footnote-ref],[data-footnote-backref]))]:[transition:top_var(--duration-press)_var(--ease-press),color_var(--duration-press)_var(--ease-press),text-decoration-color_var(--link-underline-duration)_var(--link-underline-ease),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)]',
  '[:where(&:not([data-prose]),&_a:not([data-footnote-ref],[data-footnote-backref]))]:motion-reduce:[transition:none]',
];

// 色を指定しないリンクの色（グレー。Link の color="neutral"）
export const textLinkNeutral =
  '[:where(&:not([data-prose]),&_a:not([data-footnote-ref],[data-footnote-backref]))]:[--link-color:var(--color-fg-muted)]';

// Prose の中のリンクの色（Primary の青。Link の color="primary" と同じ）。記事の中では、押せる文字を本文のグレーと見分けやすくする
export const textLinkPrimaryInProse =
  '[&_a:not([data-footnote-ref],[data-footnote-backref])]:[--color-own-focus:var(--color-primary)] [&_a:not([data-footnote-ref],[data-footnote-backref])]:[--link-color:var(--color-primary)]';

// 文の中（Text・Heading・Prose の中）に置いた文字のリンクは、周りの文字の大きさのまま
// Link は、本文の外に置いたときの大きさを --link-text-size・--link-text-leading で持つ（部品の文字と同じ。マウス 16/24・指 14/20。src/styles/theme.css の密度の規則が入れる）。文を包む要素がこの 2 つを 1em と未設定に戻す
export const textLinkSizeReset = '[--link-text-leading:initial] [--link-text-size:1em]';
