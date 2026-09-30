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
    '[&_:is(th,td)]:px-3 [&_:is(th,td)]:py-2 [&_:is(th,td)]:text-start',
    // 縦の寄せ（verticalAlign）。表・行・セルのどこで --table-valign を決めても、いちばん内側の指定が効く
    '[&_:is(th,td)]:[vertical-align:var(--table-valign,top)]',
    // 狭い列で 1〜2 文字ずつ折れないよう、和文は文節の切れ目で折る（lang="ja" の中で効く。対応しないブラウザでは普通に折る）
    '[&_:is(th,td)]:[word-break:auto-phrase]',
    '[&_:is(th,td)]:border-0 [&_:is(th,td)]:border-solid [&_:is(th,td)]:border-line',
    // 列の寄せ（GFM の align 属性。style="text-align: …" を出す変換器ではそのまま効く）
    '[&_[align=center]]:text-center [&_[align=right]]:text-end',
    // 見出しの行
    '[&_thead_th]:font-bold [&_thead_th]:whitespace-nowrap',
    // 行のあいだの横線（本文の 2 行目から上に引く）
    '[&_tbody_tr+tr>*]:border-t',
    // 合計の行（tfoot）— 比較中（Design Review/421）。上の線・太さ・面は --table-foot-*（tokens.css）
    //   線は最初の行の上に引く。2 行目からは本文と同じ横線
    '[&_tfoot_:is(th,td)]:[font-weight:var(--table-foot-weight)] [&_tfoot_:is(th,td)]:bg-(--table-foot-bg)',
    '[&_tfoot_tr:first-child>*]:[border-top:var(--table-foot-line-width)_var(--table-foot-line-style)_var(--table-foot-line-color)]',
    '[&_tfoot_tr+tr>*]:border-t',
  ],
  // 見た目 lines: 見出しの下の線
  lines: '[&_thead_th]:border-b',
  // ここから下は部品（Table・DataTable）だけが使う。Prose は既定の見た目（lines）だけ
  // 見た目 framed: 外枠（スクロールの包みに付ける。部品の角）と、見出しのグレーの面
  framedFrame: 'rounded-control border border-line',
  framed: '[&_thead_th]:bg-field',
  // 見た目 banded: 見出しの行を丸い帯のグレーの面にし、セルの余白を広げる
  banded: [
    '[&_:is(th,td)]:px-4 [&_:is(th,td)]:py-3 [&_thead_th]:bg-field',
    '[&_thead_th:first-child]:rounded-s-control [&_thead_th:last-child]:rounded-e-control',
  ],
  // 列のあいだの縦線（2 列目から左に引く）
  columnDivider: '[&_tr>*+*]:border-l',
  // 縞（showStripes）— 比較中（Design Review/423）。本文の偶数行に面を敷く。面の色と、縞のときの行のあいだの線の太さは --table-stripe-*
  stripes:
    '[&_tbody_tr:nth-child(even)]:bg-(--table-stripe-bg) [&_tbody_tr+tr>*]:[border-top-width:var(--table-stripe-line-width)]',
  // 詰めた余白（size="sm"）— 比較中（Design Review/422）。セルの余白と文字は --table-sm-*。文字はマウスか指かで切り替える（表の文字と同じ計算）
  sm: [
    '[&_:is(th,td)]:px-(--table-sm-cell-px) [&_:is(th,td)]:py-(--table-sm-cell-py)',
    '[font-size:calc(var(--table-sm-text-fine)+var(--density-coarse)*(var(--table-sm-text-coarse)-var(--table-sm-text-fine)))]',
    '[line-height:calc(var(--table-sm-leading-fine)+var(--density-coarse)*(var(--table-sm-leading-coarse)-var(--table-sm-leading-fine)))]',
  ],
} as const;
