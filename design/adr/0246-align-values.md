# 0246. align の値は start・center・end。表のセルの縦は verticalAlign

- ステータス: Accepted
- 日付: 2026-09-21
- ラウンド: ループ外（props の監査）

## 背景

props の命名監査（`naming-analysis.md` N-18）で、`align` の値が部品ごとに 2 つの語彙（論理プロパティの `start`・`center`・`end` と、物理プロパティの `left`・`center`・`right`）に割れていることが分かりました。ADR-0049 は配置を選ぶ `<何>Placement` の値を `start`・`end` と決めていますが、`align` そのものには触れていません。

- `src/components/table/Table.tsx:130` — `type Align = 'left' | 'center' | 'right';`
- `src/components/table/Table.tsx:132,137` — `TableHeaderProps`（`Omit<ComponentProps<'th'>, 'align'>`）の `align?: Align`
- `src/components/table/Table.tsx:150,155` — `TableCellProps`（`Omit<ComponentProps<'td'>, 'align'>`）の `align?: Align`
- `src/components/menu/Menu.tsx:77` 付近 — `align?: MenuAlign`（`'start' | 'center' | 'end'`）
- `src/components/stack/Stack.tsx:84` 付近 — `align?: StackAlign`（`start`・`center`・`end` に加え `stretch` を含む）

別の未決事項として、表のセルの縦の寄せの props がありません。見本のページ（`apps/docs/examples/list.tsx:241`）では `className="[&_tbody_:is(th,td)]:align-middle"` で上書きしていて、上書きの詳しさが `src/internal/reading/table.ts:17` の `[&_:is(th,td)]:align-top` と同点で負ける問題（`[&_:is(th,td)]` だけだと勝てない）が起きていました。`design/backlog.md:285` に「表のセルの縦そろえ」として未決事項が残っています。

## 候補

### align の値（N-18）

| 案        | 内容                                                                                                                                                                          |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 現行版    | `start`・`center`・`end` が主（Menu・Popover・Combobox・Stack・Stat・Timeline・Pagination・DescriptionList・Link）。`TableCell`・`TableHeader` だけ `left`・`center`・`right` |
| A（採用） | `start`・`center`・`end` に統一する（`TableCell`・`TableHeader` を直す）。HTML の `align` 属性はすでに `Omit` 済みなので衝突しない                                            |
| B         | 表だけ `left`・`right` を残す（「文字の寄せは物理、要素の寄せは論理」という説明は立つが、縦書き・RTL で破れる）                                                               |

### 表のセルの縦そろえ（M-01）

| 案        | 内容                                                                                              |
| --------- | ------------------------------------------------------------------------------------------------- |
| 現行版    | props がなく、`className` の子孫セレクタで上書き。詳しさの争いに負けることがある                  |
| A（採用） | `Table`・`TableRow`・`TableCell` に `verticalAlign?: 'top'                                        | 'middle' | 'bottom'`を足し、子が親の値を上書きする。既定は`top` |
| B         | セル単位でだけ `valign` を足す（`TableCell`・`TableHeader` のみ。一覧では全セルに書くことになる） |
| C         | `className` のまま                                                                                |

## 決定

**`align` の値は `start`・`center`・`end` に統一します（`TableCell`・`TableHeader` を直します）。表のセルの縦そろえは `verticalAlign`（`top`・`middle`・`bottom`）を `Table`・`TableRow`・`TableCell` に足し、子が上書きします。既定は `top` です。**

## 理由

ユーザーの一言の原文です。

> M-01「Table, TableRow, TableCell のそれぞれで verticalAlign を親指定できるようにもしたいかもです（子で上書きも可）」

N-18（`align` の値の統一）は `decisions-memo.md` で「採用」の判定のみで、一言はありませんでした。

## 却下した案と理由

- **表だけ `left`・`right` を残す**: 採られませんでした。`naming-analysis.md` の直し方の候補どおり、text-align の値と一致するという説明は立ちますが、縦書き・RTL で破れます
- **セル単位でだけ `valign` を足す**: 採られませんでした。ユーザーの一言は「Table, TableRow, TableCell のそれぞれで」と、3 段階すべてでの指定を求めており、セル単位だけでは一覧の全セルに書くことになります
- **`className` のまま**: 採られませんでした。詳しさの争いに負ける実例（`apps/docs/examples/list.tsx:241`）があり、backlog にすでに未決事項として挙がっていたためです

## 影響

- `src/components/table/Table.tsx`: `TableCellProps.align`・`TableHeaderProps.align` の型 `Align`（`'left' | 'center' | 'right'`）を `'start' | 'center' | 'end'` に直します
- `src/components/table/Table.tsx`: `TableProps`・`TableRowProps` に `verticalAlign?: 'top' | 'middle' | 'bottom'`（既定 `top`）を足し、`TableCellProps`・`TableHeaderProps` にも同名の props を足して子で上書きできるようにします
- `src/internal/reading/table.ts:17`: 固定の `align-top` を、`verticalAlign` の値で切り替えられるように直します
- `apps/docs/examples/list.tsx:241`: `className="[&_tbody_:is(th,td)]:align-middle"` を `verticalAlign="middle"` に置き換えます
- `design/backlog.md:285` の「表のセルの縦そろえ」の未決事項は、この ADR で決着するので消します

## 原則への反映

反映なし。`align` は名前の統一だけの決定です。`verticalAlign` は原則4（本体・キャプションなどの層の考え方）の範囲内で、表という 1 部品に閉じた軸を足しただけです。

## 比較画像

なし。名前と API の決定で、見た目は変えていません（ADR-0013・ADR-0051 と同じ理由）。
