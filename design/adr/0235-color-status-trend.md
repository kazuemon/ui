# 0235. 色の props は color の 1 本。意味の色だけを受ける部品は status、Stat の増減は trend

- ステータス: Accepted
- 日付: 2026-09-21
- ラウンド: ループ外（props の監査）

## 背景

[ADR-0051](./0051-prop-names.md) で色の props は `color` に統一しましたが、`tone` が 6 か所（`AlertDialog`・`Stat`・`List.checkedTone`・`Text`・`Time`・`RelativeTime`・`NumberFormat`）に残っていました。また `color` に並ぶ値の集合が部品ごとに 6 通りあり、パレットの色（`primary`・`secondary`・`neutral`・`brand`・`white`）と意味を持った色（`info`・`success`・`warning`・`danger`）の区別が名前から読めませんでした。

## 候補

| 案     | 内容                                                                                                         |
| ------ | ------------------------------------------------------------------------------------------------------------ |
| 現行版 | `color` に統一済みの部品と `tone` が残る部品が混在。パレットの色と意味の色は同じ `color` の値の列挙          |
| A      | `color` 1 本のまま。改名は `tone` → `color` だけで、パレットの色と意味の色は区別しない                       |
| B      | `color`（パレットの色）と `status`（意味を持った色）に分ける。意味の色しか受けない部品は `status` だけを持つ |
| C      | B に加えて、`status` を持つ部品では `color` を型で受け付けない（排他）                                       |

## 決定

**B を採用します。** パレットの色（`primary`・`secondary`・`neutral`・`brand`・`white`）と意味の色（`info`・`success`・`warning`・`danger`）を合わせて `color` の 1 本の軸とし、意味の色しか受けない部品（`Notice`・`Callout`・`Toast`・`AlertDialog`・`MenuItem`）は `status` にします。`AlertDialog` の `tone` は `status`（`danger` のときだけ指定）に、`MenuItem` の真偽値 `danger` は `status="danger"` にします。`Stat` の増減は色の意味とは別ものなので `trend`（`positive`・`negative`・`neutral`）にします。Text 系の `tone`（濃さ）は色ではないので、色の決定からは外し `variant`（[0236](./0236-variant.md)）に移します。

## 理由

ユーザーの返事の原文です。

> 基本は color でよく、status しか受け付けられないところでは status を採用する、としたいですね。パレット + 意味色(status) = color

> status のように意味を持った色もあれば、primary や secondary, neutral のような単なる色もあります。そこを意味的に分けるか（color だがステータス色しか指定できない）は再考したいです

`Stat` の増減の名前については、続けて次の返事でした。

> R-01: trend でお願いします

## 却下した案と理由

- **A（`color` 1 本のまま、区別しない）**: 選ばれませんでした。「パレット + 意味色(status) = color」という返事のとおり、意味の色しか受けない部品は `status` だけを持つ形にしました
- **C（`status` を持つ部品で `color` を型で排他する）**: 候補には挙がりましたが、指定がなく今回は採りませんでした

## 影響

`AlertDialog`（`tone` → `status`。型 `AlertDialogTone` を直します）、`MenuItem`（真偽値 `danger` → `status="danger"`）、`Stat`（`tone` → `trend`。型 `StatDeltaTone` を直します）、`Notice`・`Callout`・`Toast`（`color` → `status`。型 `NoticeColor` を直します）を直します。`--color-*` のトークン名は変えません。コードはまだ直していないので、これから直します。

## 原則への反映

反映なし。[原則 6](../principles.md#6-色は役割で持つ)（色は役割で持つ）の範囲内の決定です。props の名前の整理で、色の役割やトークンの構造そのものは変わっていません。

## 比較画像

なし。名前と API の決定で、見た目は変えていません（[0013](./0013-secondary-color.md)・[0051](./0051-prop-names.md) と同じ理由）。
