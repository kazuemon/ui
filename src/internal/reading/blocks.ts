// 引用（Blockquote）と区切り線（Divider）と画像（Figure の img）の見た目。部品と Prose が同じクラス列を使う（書き方は heading.ts の先頭）
// ページと同じレイヤーなので影は付けない（原則1）

// 引用（軸 54）。Prose は、既定の見た目（左のグレーの線）だけを使う
// 部品の blockquote は、アイコンと中身を横に並べる flex。Prose の blockquote は中身の段落を縦に並べるので、Prose が block に戻す
export const blockquoteStyles = {
  body: '[:where(&:not([data-prose]),&_blockquote)]:flex [:where(&:not([data-prose]),&_blockquote)]:gap-x-3 [:where(&:not([data-prose]),&_blockquote)]:text-body [:where(&:not([data-prose]),&_blockquote)]:text-fg-muted',
  line: '[:where(&:not([data-prose]),&_blockquote)]:pl-4 [:where(&:not([data-prose]),&_blockquote)]:border-l-(length:--blockquote-line-width) [:where(&:not([data-prose]),&_blockquote)]:border-(color:--blockquote-line)',
  neutral:
    '[:where(&:not([data-prose]),&_blockquote)]:[--blockquote-icon:var(--color-fg-subtle)] [:where(&:not([data-prose]),&_blockquote)]:[--blockquote-line:var(--color-line)]',
} as const;

// 区切り線（軸 58）。上下の余白は置く側（Prose・ページ）が決める。Prose は既定の見た目（幅いっぱいの細い線）だけを使う
export const dividerStyles = {
  base: '[:where(&:not([data-prose]),&_hr)]:mx-auto [:where(&:not([data-prose]),&_hr)]:my-0 [:where(&:not([data-prose]),&_hr)]:block [:where(&:not([data-prose]),&_hr)]:h-0 [:where(&:not([data-prose]),&_hr)]:max-w-full [:where(&:not([data-prose]),&_hr)]:border-0 [:where(&:not([data-prose]),&_hr)]:border-t [:where(&:not([data-prose]),&_hr)]:border-solid',
  full: '[:where(&:not([data-prose]),&_hr)]:w-full [:where(&:not([data-prose]),&_hr)]:border-line',
} as const;

// 画像（軸 59）。画像は幅いっぱいまで広がり、はみ出さない。縦横比は width・height から保つ
// 角はカードの角（軸 59 の C）。輪郭は既定で付ける（B。白い画像が白地に溶けない）。濃紺を 12% 透かした 1px を outline で内側に引く
//   outline は画像の上に描かれるので、白い画像でも縁が見え、角丸にも沿う
export const figureImageStyles = {
  base: '[:where(&:not([data-prose]),&_img)]:block [:where(&:not([data-prose]),&_img)]:h-auto [:where(&:not([data-prose]),&_img)]:max-w-full [:where(&:not([data-prose]),&_img)]:rounded-card',
  outline:
    '[:where(&:not([data-prose]),&_img)]:[outline:var(--border-width-thin)_solid_color-mix(in_oklab,var(--color-fg)_12%,transparent)] [:where(&:not([data-prose]),&_img)]:[outline-offset:calc(var(--border-width-thin)*-1)]',
} as const;
