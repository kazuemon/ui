# 0238. shape は輪郭の形で、値は circle・square

- ステータス: Accepted
- 日付: 2026-09-21
- ラウンド: ループ外（props の監査）

## 背景

`shape` の値語彙が部品ごとに違いました。`Button`・`CopyButton`・`Link`・`Pagination`・`Calendar`・`Progress` は `round`・`square`、`Avatar` は `circle`・`rounded`、`Skeleton` は `block`・`circle`・`text`（角の丸めではなく「何の代わりに置くか」）でした。

## 候補

| 案     | 内容                                                                                                                                                                      |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 現行版 | `shape` の値が 3 通り（`round`・`square` / `circle`・`rounded` / `block`・`circle`・`text`）                                                                              |
| A      | `shape` ＝「輪郭の形」と定義し、値を `round`・`square` にそろえる。`Avatar` の `circle`・`rounded` → `round`・`square`。`Skeleton` は「何の代わりか」なので `kind` に改名 |
| B      | A と同じだが、`Skeleton` は `variant`（`block`・`text`・`circle`）にする                                                                                                  |
| C      | 現状維持し、型名（`ButtonShape`・`AvatarShape`・`SkeletonShape`）で区別する                                                                                               |

## 決定

**B を土台に、値は `circle`・`square` にそろえます（`round` → `circle`）。** `shape` ＝ 輪郭の形とし、値を `circle`・`square` に統一します。文字のあるボタンの `circle` は両端が丸い形（pill）です。`Skeleton` の `block`・`text`・`circle` は「何の代わりか」なので `variant` に移します（[0236](./0236-variant.md)）。

## 理由

ユーザーの返事の原文です。

> 揃えたいですが、現在の案は意味的には違う気がします。

値の綴りについては、次のメモです。

> round → circle も同時に変える必要がありそうですね

## 却下した案と理由

- **A・B の値をそのまま `round` にする案**: 選ばれませんでした。「round → circle も同時に変える必要がありそう」という返事のとおり、値の綴りを `circle` に変えました
- **C（現状維持、型名で区別する）**: 選ばれませんでした。「揃えたい」という返事のため

## 影響

`Button`・`CopyButton`・`Link`・`Pagination`・`Calendar`・`Progress`（`round` → `circle` に直します）、`Avatar`（`circle`・`rounded` → `circle`・`square` に直します）、`Skeleton`（`shape` → `variant` に直します。[0236](./0236-variant.md) の一部）を直します。

## 原則への反映

反映なし。[原則 5](../principles.md#5-角丸は部品と包むもので分ける)（角丸は部品と包むもので分ける）の範囲内で、値の綴りをそろえる決定です。

## 比較画像

なし。名前の決定で、見た目は変えていません（[0013](./0013-secondary-color.md)・[0051](./0051-prop-names.md) と同じ理由）。
