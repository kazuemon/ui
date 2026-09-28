# 0343. DataTable は Table とは別の部品（Table の行・セルと罫線のクラスは共有）。props は TanStack Table の値をそのまま受ける形

- ステータス: Accepted
- 日付: 2026-09-28
- ラウンド: 後半 ／ ループ外

## 背景

データの一覧を表で見せる部品（並べ替え・行の選択・固定ヘッダー）を作るにあたり、既存の `Table`（[ADR-0090](./0090-table.md)）に並べ替え・選択・固定ヘッダーの props を足すか、別の部品として切り出すかを決める必要がありました。

`Table` は、Markdown（GFM）を変換した HTML と同じ要素・属性を出す、読みものの部品です。`Prose` の素の `<table>` にも同じ見た目のクラス列（`src/internal/reading/table.ts`）を当てます。一方、データの一覧に要る機能（固定ヘッダー、行の hover と選択、見出しを押す並べ替えのボタン）は、アプリの画面（一覧・管理画面）でしか使わず、記事の中の表には要りません。固定ヘッダーには、`Table` の横スクロールの枠（単純な `div`）とは別に、縦にもスクロールする枠（`ScrollFrame`。`ScrollArea` と同じ枠）が要ります。

あわせて、部品を作ったエージェントの判断として、DataTable の props に語彙表（`design/props.md`）にない名前（`sorted`・`onSortClick`・`maxHeight`・`sortIndicator`）が要るかどうかも確かめる必要がありました。

## 候補

| 案                                 | 内容                                                                                                  |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `Table` に props を足す            | `Table` 自体に、並べ替え・選択・固定ヘッダーの props を足す。記事の中の表とデータの表が同じ部品になる |
| DataTable を別の部品にする（採用） | `Table` とは別の部品にし、行・セルと罫線のクラス列（`internal/reading/table.ts`）だけを共有する       |

## 決定

**DataTable を `Table` とは別の部品にします。** 行（`TableRow`）とセル（`TableCell`・`TableHeader`）は `Table` のものをそのまま使い、罫線・見出し・余白・文字の大きさのクラス列は `src/internal/reading/table.ts`（`tableStyles`）で共有します。

DataTable 固有の部分は、部品を分けて持ちます。

- `DataTable`: 表そのもの。`ScrollFrame` で包み、`maxHeight` を渡すと縦にもスクロールし、見出しの行が上に貼り付きます
- `DataTableHeader`: 見出しのセル。`onSortClick` を渡すと文字が並べ替えのボタンになります
- `DataTableRow`: 本文の行。`selected` を渡すと面を敷きます
- `DataTableSelectHeader`・`DataTableSelectCell`: 選択の列
- `DataTableEmpty`・`DataTableLoading`: 行がないとき・読み込み中の行

props は、並べ替え・選択・ページ送りの状態を DataTable 自身が持たず、TanStack Table v9 が計算した値をそのまま受ける形にしました。

| props（DataTableHeader）       | TanStack Table の対応                                                             |
| ------------------------------ | --------------------------------------------------------------------------------- |
| `sorted`                       | `column.getIsSorted()`                                                            |
| `onSortClick`                  | `column.getToggleSortingHandler()`                                                |
| props（DataTableSelectHeader） | TanStack Table の対応                                                             |
| `checked`                      | `table.getIsAllPageRowsSelected()`                                                |
| `indeterminate`                | `table.getIsSomePageRowsSelected()`                                               |
| `onCheckedChange`              | `table.toggleAllPageRowsSelected`                                                 |
| props（DataTableSelectCell）   | TanStack Table の対応                                                             |
| `checked`                      | `row.getIsSelected()`                                                             |
| `onCheckedChange`              | `row.toggleSelected`                                                              |
| props（DataTableRow）          | TanStack Table の対応                                                             |
| `selected`                     | `row.getIsSelected()`                                                             |
| props（DataTable）             | 内容                                                                              |
| `maxHeight`                    | 高さの上限（px か CSS の長さ）。渡すと縦にスクロールする                          |
| `sortIndicator`                | 並べ替えていない列の印の出し方（[ADR-0344](./0344-data-table-sort-indicator.md)） |

語彙表にない名前（`sorted`・`onSortClick`・`maxHeight`・`sortIndicator`）は、ユーザーが確かめました。`sortIndicatorReveal` としていた名前だけ `sortIndicator` に改めます。

## 理由

`Table` と分けた理由は、次の 3 点です。

- `Table` は GFM の表と同じ要素を約束する読みものの部品で、`Prose` と同じクラス列を使います（[ADR-0090](./0090-table.md)）。並べ替え・選択の状態を持つ props を足すと、この約束が崩れます
- 固定ヘッダー・行の hover と選択・見出しのボタンは、アプリの画面でしか要りません。記事の中の表にこれらの props が並ぶと、使わない props ばかりになります
- 固定ヘッダーには縦にもスクロールする枠（`ScrollFrame`）が要り、`Table` の横スクロールだけの枠とは仕組みが違います

props の名前について、ユーザーの返事の原文です。

> sortIndicatorReveal は sortIndicator だけでもよいなと思いました。そのほかはこれでよさそうです。

## 却下した案と理由

- **`Table` に props を足す**: 選ばれませんでした。上の理由のとおり、読みものの部品としての `Table` の約束と、データの一覧としての機能が両立しないためです

## 影響

- `src/components/data-table/` を新設しました: `DataTable.tsx`・`DataTableHeader.tsx`・`DataTableRow.tsx`・`DataTableSelect.tsx`・`DataTableEmpty.tsx`・`DataTableLoading.tsx`・`sort-icons.tsx`・`data-table-context.ts`
- `src/internal/reading/table.ts` の `tableStyles` を `DataTable` と `Table`・`Prose` で共有します
- セルの縦の寄せ（`verticalAlign`）の既定は、`Table` の `top` に対し、`DataTable` は `middle` にしました。選択の箱や行の操作と、文字の行をそろえるためです（原則にない判断。理由はコードのコメントにあります）
- 右寄せの列（数字）は折り返しません。「3,200 円」が 2 行に割れると桁がそろわないためです（原則にない判断）
- 行を押しても選びません。押せる範囲は選択の箱だけです（原則17。原則にない判断としてコードのコメントに残しています）
- `DataTableSortIndicator`（`subtle`・`always`・`hover`）は [ADR-0344](./0344-data-table-sort-indicator.md) で、選んだ行の面は [ADR-0345](./0345-data-table-selected-row.md) で、既定の見た目は [ADR-0346](./0346-data-table-variant.md) で、固定した見出しの境目は [ADR-0347](./0347-data-table-sticky-edge.md) で決めます
- TanStack Table でつなぐ見本は `src/recipes/data-table/OrdersDataTable.tsx`（レシピの方針は [ADR-0335](./0335-headless-look-only-recipes.md)）
- backlog に足す未決事項（列の幅の調整、最初の列の固定、複数の列での並べ替えの番号、行を押して選ぶ、範囲選択など）は `design/backlog.md` の「DataTable」の節にまとめます

## 原則への反映

反映なし。既存の原則の範囲内の、部品の切り分けの判断です。

## 比較画像

この決定は見た目の候補を比べるものではなく、部品の切り分けと props の形の決定なので、比較画像はありません。
