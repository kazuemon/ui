// 表（Table）の見た目。部品と Prose が同じクラス列を使う（書き方は heading.ts の先頭）— 軸 62
// GFM を変換した HTML と同じ要素・属性に当てる（table・thead・tbody・tr・th・td、列の寄せは align 属性）
// ページと同じレイヤーなので影は付けない（原則1）
// 文字はマウスで 16/28、指で 14/24。読みもの（data-reading）の中でも、指では小さくする（表は一度に見える列の数を優先する）
//   値は --density-coarse（指 1・マウス 0。読みものの規則では変わらない）と、読む文字の -fine・-coarse から表の要素で計算する
// Prose は既定の見た目（lines）だけを使う

export const tableStyles = {
  // table の要素そのもの
  table: [
    '[:where(&:not([data-prose]),&_table)]:w-full [:where(&:not([data-prose]),&_table)]:[border-collapse:separate] [:where(&:not([data-prose]),&_table)]:[border-spacing:0] [:where(&:not([data-prose]),&_table)]:text-fg [:where(&:not([data-prose]),&_table)]:tabular-nums',
    '[:where(&:not([data-prose]),&_table)]:[font-size:calc(var(--text-body-fine)+var(--density-coarse)*(var(--text-body-coarse)-var(--text-body-fine)))]',
    '[:where(&:not([data-prose]),&_table)]:[line-height:calc(var(--leading-body-fine)+var(--density-coarse)*(var(--leading-body-coarse)-var(--leading-body-fine)))]',
  ],
  // 中の要素（table と Prose の根のどちらに付けても、中のセルに効く）
  cells: [
    '[&_:is(th,td)]:px-3 [&_:is(th,td)]:py-2 [&_:is(th,td)]:text-start [&_:is(th,td)]:align-top',
    // 狭い列で 1〜2 文字ずつ折れないよう、和文は文節の切れ目で折る（lang="ja" の中で効く。対応しないブラウザでは普通に折る）
    '[&_:is(th,td)]:[word-break:auto-phrase]',
    '[&_:is(th,td)]:border-0 [&_:is(th,td)]:border-solid [&_:is(th,td)]:border-line',
    // 列の寄せ（GFM の align 属性。style="text-align: …" を出す変換器ではそのまま効く）
    '[&_[align=center]]:text-center [&_[align=right]]:text-end',
    // 見出しの行
    '[&_thead_th]:font-bold [&_thead_th]:whitespace-nowrap',
    // 行のあいだの横線（本文の 2 行目から上に引く）
    '[&_tbody_tr+tr>*]:border-t',
  ],
  // 見た目 lines: 見出しの下の線
  lines: '[&_thead_th]:border-b',
} as const;
