// 複数行のコード（CodeBlock）の見た目。部品と Prose の pre が同じクラス列を使う（書き方は heading.ts の先頭）
// 受け取る形は Shiki の transformers（@shikijs/transformers）の出力:
//   <pre class="shiki"><code><span class="line">…</span>\n<span class="line">…</span></code></pre>
//   強調行 .line.highlighted・差分 .line.diff.add / .line.diff.remove・フォーカス .line.focused・語の強調 .highlighted-word
//   色は createCssVariablesTheme の CSS 変数（style="color: var(--shiki-token-keyword)"）
// pre の has-highlighted などのクラスには頼らず、:has() で見る（クラスを出さない変換器でも同じ見た目になる）
// ページと同じレイヤーなので、外枠に影は付けない（原則1）
//
// 部品では、面（surface）は外枠の figure に、中身（body）は pre を包む div に付ける。Prose では、どちらも pre に当たる
//   面: [:where(&:not([data-prose]),&_pre:not([data-slot=code-block]_pre))]。部品の figure、または Prose の中の pre（部品の中の pre は除く）
//   中身: [&_pre]・[&_pre_code]・[&_pre_.line]。包みの div と Prose の根のどちらに付けても、中の pre に効く
// 色は面で --cb-*（と --shiki-token-*）に入れ直す。値は tokens の --color-codeblock-*・--palette-code-*
//   面の要素で指し直すので、祖先で tokens を上書きしても効く。Prose は既定の見た目（surface）だけを使う
// 文字はマウスでも指でも、読みものの中でも 14/24（軸 64 のあとの決定）。密度で変わらない -fine の値を使う
// 行の飾りは軸 66 の D: 強調行と語は Primary の青 10% の面、強調行と差分は左に 2px の線、フォーカスはほかの行を 30%、行番号は細い線で区切る

export const codeBlockStyles = {
  surface: [
    '[:where(&:not([data-prose]),&_pre:not([data-slot=code-block]_pre))]:overflow-clip [:where(&:not([data-prose]),&_pre:not([data-slot=code-block]_pre))]:rounded-control',
    '[:where(&:not([data-prose]),&_pre:not([data-slot=code-block]_pre))]:bg-(color:--cb-bg) [:where(&:not([data-prose]),&_pre:not([data-slot=code-block]_pre))]:text-(color:--cb-fg)',
    // Shiki の CSS 変数のテーマ: pre の style が読む前景と地。地は面が持つので透明にする
    '[:where(&:not([data-prose]),&_pre:not([data-slot=code-block]_pre))]:[--shiki-background:transparent] [:where(&:not([data-prose]),&_pre:not([data-slot=code-block]_pre))]:[--shiki-foreground:var(--cb-fg)]',
    '[:where(&:not([data-prose]),&_pre:not([data-slot=code-block]_pre))]:[--shiki-token-link:var(--shiki-token-string)] [:where(&:not([data-prose]),&_pre:not([data-slot=code-block]_pre))]:[--shiki-token-string-expression:var(--shiki-token-string)]',
    // フォーカス（.line.focused）: ほかの行を薄くする。載せているあいだとキーボードで中にいるあいだは戻す
    '[:where(&:not([data-prose]),&_pre:not([data-slot=code-block]_pre)):not(:hover,:focus-within)_code:has(.focused)_.line:not(.focused)]:opacity-30',
  ],
  // 見た目 surface の色: 入力欄のグレーの面（軸 64 の現行版）
  surfaceColors: [
    '[:where(&:not([data-prose]),&_pre:not([data-slot=code-block]_pre))]:[--cb-bg:var(--color-codeblock-bg)] [:where(&:not([data-prose]),&_pre:not([data-slot=code-block]_pre))]:[--cb-fg:var(--color-codeblock-fg)] [:where(&:not([data-prose]),&_pre:not([data-slot=code-block]_pre))]:[--cb-muted:var(--color-codeblock-muted)]',
    '[:where(&:not([data-prose]),&_pre:not([data-slot=code-block]_pre))]:[--cb-head-bg:var(--color-codeblock-head-bg)] [:where(&:not([data-prose]),&_pre:not([data-slot=code-block]_pre))]:[--cb-line:var(--color-codeblock-line)] [:where(&:not([data-prose]),&_pre:not([data-slot=code-block]_pre))]:[--cb-number:var(--color-codeblock-number)]',
    '[:where(&:not([data-prose]),&_pre:not([data-slot=code-block]_pre))]:[--cb-copy-line:var(--color-codeblock-copy-line)]',
    '[:where(&:not([data-prose]),&_pre:not([data-slot=code-block]_pre))]:[--cb-deleted:var(--color-codeblock-deleted)] [:where(&:not([data-prose]),&_pre:not([data-slot=code-block]_pre))]:[--cb-highlight:var(--color-codeblock-highlight)] [:where(&:not([data-prose]),&_pre:not([data-slot=code-block]_pre))]:[--cb-inserted:var(--color-codeblock-inserted)]',
    '[:where(&:not([data-prose]),&_pre:not([data-slot=code-block]_pre))]:[--cb-highlight-bg:color-mix(in_oklab,var(--cb-bg),var(--cb-highlight)_10%)]',
    '[:where(&:not([data-prose]),&_pre:not([data-slot=code-block]_pre))]:[--cb-deleted-bg:color-mix(in_oklab,var(--cb-bg),var(--cb-deleted)_8%)] [:where(&:not([data-prose]),&_pre:not([data-slot=code-block]_pre))]:[--cb-inserted-bg:color-mix(in_oklab,var(--cb-bg),var(--cb-inserted)_10%)]',
    '[:where(&:not([data-prose]),&_pre:not([data-slot=code-block]_pre))]:[--shiki-token-function:var(--palette-code-light-function)] [:where(&:not([data-prose]),&_pre:not([data-slot=code-block]_pre))]:[--shiki-token-keyword:var(--palette-code-light-keyword)]',
    '[:where(&:not([data-prose]),&_pre:not([data-slot=code-block]_pre))]:[--shiki-token-constant:var(--palette-code-light-constant)] [:where(&:not([data-prose]),&_pre:not([data-slot=code-block]_pre))]:[--shiki-token-string:var(--palette-code-light-string)]',
    '[:where(&:not([data-prose]),&_pre:not([data-slot=code-block]_pre))]:[--shiki-token-comment:var(--palette-code-light-comment)] [:where(&:not([data-prose]),&_pre:not([data-slot=code-block]_pre))]:[--shiki-token-parameter:var(--palette-code-light-parameter)]',
    '[:where(&:not([data-prose]),&_pre:not([data-slot=code-block]_pre))]:[--shiki-token-punctuation:var(--palette-code-light-punctuation)]',
  ],
  body: [
    // pre: 文字は 14/24。横にはみ出したら、pre だけがスクロールする
    '[&_pre]:m-0 [&_pre]:overflow-x-auto [&_pre]:py-3',
    '[&_pre]:font-mono [&_pre]:text-(length:--text-body-sm-fine) [&_pre]:leading-(--leading-body-sm-fine)',
    // スクロールできる pre にはキーボードで移れる。線は外枠の角で切れないよう内側に引く
    '[&_pre]:outline-none [&_pre:focus-visible]:[outline:var(--focus-ring-width)_solid_var(--color-focus-ring)] [&_pre:focus-visible]:[outline-offset:calc(var(--focus-ring-width)*-1)]',
    // code: 行を 1 行ずつの箱にし、いちばん長い行の幅まで広げる（強調行の面がスクロールの端まで届く）
    '[&_pre_code]:grid [&_pre_code]:w-max [&_pre_code]:min-w-full [&_pre_code]:[counter-reset:codeblock-line_var(--cb-start,0)] [&_pre_code]:[font:inherit]',
    // 差分があるときだけ、印の場所を左に 12px 空ける（--cb-diff。ないときは 0）
    '[&_pre_code:has(.diff)]:[--cb-diff:calc(var(--spacing)*3)]',
    // 行。行番号の幅は --cb-gutter（ないときは 0）
    '[&_pre_.line]:relative [&_pre_.line]:min-h-[1lh] [&_pre_.line]:pr-4 [&_pre_.line]:[counter-increment:codeblock-line]',
    '[&_pre_.line]:pl-(--cb-pad-left) [&_pre_.line]:[--cb-pad-left:calc(var(--spacing)*4+var(--cb-gutter,0px)+var(--cb-diff,0px))]',
    // 強調行: 青 10% の面と左 2px の線
    '[&_pre_.line.highlighted]:bg-(color:--cb-highlight-bg)',
    '[&_pre_.line.highlighted]:[box-shadow:inset_var(--border-width-thick)_0_0_0_var(--cb-highlight)]',
    // 差分: 面・左 2px の線・印（::after。コードの直前に置く）
    '[&_pre_.line.diff.add]:bg-(color:--cb-inserted-bg) [&_pre_.line.diff.remove]:bg-(color:--cb-deleted-bg)',
    '[&_pre_.line.diff.add]:[box-shadow:inset_var(--border-width-thick)_0_0_0_var(--cb-inserted)]',
    '[&_pre_.line.diff.remove]:[box-shadow:inset_var(--border-width-thick)_0_0_0_var(--cb-deleted)]',
    '[&_pre_.line.diff]:after:absolute [&_pre_.line.diff]:after:top-0 [&_pre_.line.diff]:after:[left:calc(var(--cb-pad-left)-var(--spacing)*1.5-1ch)] [&_pre_.line.diff]:after:select-none',
    "[&_pre_.line.diff.add]:after:text-(color:--cb-inserted) [&_pre_.line.diff.add]:after:content-['+']",
    "[&_pre_.line.diff.remove]:after:text-(color:--cb-deleted) [&_pre_.line.diff.remove]:after:content-['−']",
    // 語の強調: 強調行と同じ面
    '[&_pre_.highlighted-word]:rounded-sm [&_pre_.highlighted-word]:bg-(color:--cb-highlight-bg)',
    // フォーカスの薄さの移り変わり（値は面の規則）
    '[&_pre_.line]:[transition:opacity_var(--duration-normal)_var(--ease-press)] motion-reduce:[&_pre_.line]:[transition:none]',
  ],
} as const;
