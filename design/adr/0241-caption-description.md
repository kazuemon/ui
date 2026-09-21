# 0241. caption は本体の下に添える文、description は題に対する説明

- ステータス: Accepted
- 日付: 2026-09-21
- ラウンド: ループ外（props の監査）

## 背景

`caption`（23 部品）と `description`（10 部品）の役割が、部品群ごとに違って見えていました。入力欄の `caption` はヘルプテキスト、`Figure` の `caption` は画像の下に出る見えるキャプション、`Table` の `caption` は表の `<caption>` 要素でした。`Dialog` の `description` は題の下の説明（読み上げの説明にもなる）、`MenuItem` の `description` は文字の下の 2 行目、`LinkCard` の `description` は移る先のページの概要（OGP）でした。

## 候補

| 案     | 内容                                                                                                          |
| ------ | ------------------------------------------------------------------------------------------------------------- |
| 現行版 | `caption` と `description` の役割が部品群ごとに違う                                                           |
| A      | `caption` ＝ 本体の下に小さく添える文、`description` ＝ 題に対する説明（`aria-describedby` になる）と定義する |
| B      | 読み上げに結びつく方を `description`、見た目だけの方を `caption` と定義する                                   |
| C      | 現状維持。部品ごとに JSDoc を読む                                                                             |

## 決定

**A を採用します。** `caption` ＝ 本体の下に小さく添える文（ヘルプテキスト・図のキャプション・表の `caption`）。`description` ＝ 題に対する説明で `aria-describedby` になります（`Dialog`・`Drawer`・`Popover`・`AlertDialog`・`Menu` の項目・`LinkCard`）。選択肢の 2 行目の説明は `ListboxItemNoteKind` に `'description'` を足します。

## 理由

ユーザーの一言の原文はありません。示した案のとおり、`caption`・`description` の定義（A）と、`ListboxItemNoteKind` への `'description'` の追加は、そのまま採用されました。

## 却下した案と理由

- **B（読み上げに結びつく方を description、見た目だけの方を caption とする）**: 選ばれませんでした。`Figure` の `caption` も `figcaption` として読み上げられるため、読み上げの有無では線引きが曖昧になります
- **C（現状維持）**: 選ばれませんでした

## 影響

改名はありません。JSDoc の 1 文目をこの定義で書き直します。`SelectItem`・`ComboboxItem` の note に `description` を足します。

## 原則への反映

反映なし。[原則 4](../principles.md#4-部品はラベル--本体--キャプションの-3-層)（部品は「ラベル / 本体 / キャプション」の 3 層）の範囲内の、定義の整理です。

## 比較画像

なし。名前と役割の定義の決定で、見た目は変えていません（[0013](./0013-secondary-color.md)・[0051](./0051-prop-names.md) と同じ理由）。
