# 0236. 見た目の型は variant の 1 本（appearance を廃止し、ADR-0051 の「variant を作らない」を覆す）

- ステータス: Accepted
- 日付: 2026-09-21
- ラウンド: ループ外（props の監査）

## 背景

`appearance` が 18 部品で 5 つの概念（面の見せ方・線の長さ・罫線・配色・隠し方・入れ子）を兼ねていました。`Text` の `label`・`caption` の段や濃さにも、まだ名前が要りました。[ADR-0051](./0051-prop-names.md) は「`tone`・`variant` などの別名を作らない」と決めていましたが、この決定はそこを覆します。

## 候補

| 案     | 内容                                                                                                                  |
| ------ | --------------------------------------------------------------------------------------------------------------------- |
| 現行版 | `appearance` が面の見せ方・長さ・罫線・配色・隠し方・入れ子の 5 概念を兼ねる。`Text` の濃さ・段は `tone` など別の名前 |
| A      | `appearance` を面の見せ方専用にし、他は概念名（`length`・`rules`・`theme`・`cover`・`nested`）にする                  |
| B      | `appearance` を「その部品の見た目の型」と広く定義し、改名しない                                                       |
| C      | 面の見せ方以外を `variant` にまとめる（面の見せ方は `appearance` のまま残す）                                         |
| D      | 全部 `variant` にそろえる（`appearance` を廃止する）                                                                  |

## 決定

**D を採用します。** 見た目の型は `variant` の 1 本にします。面の見せ方（`Button`・`Link`・`Notice`・`Accordion`・`Blockquote`・`Pager`・`Breadcrumb`・`Switch` の `captionAppearance`）も、部品ごとの型（`Divider`・`Table`・`CodeBlock`・`CodeGroup`・`Spoiler`・`Card`）も、複数の軸をまとめた既定の組（`Text` の `body`・`muted`・`subtle`・`label`・`caption`、`Skeleton` の `block`・`text`・`circle`）もすべて `variant` です。型名は `<部品>Variant` にします。文字の太さは別の軸として `weight`（`normal`・`medium`・`bold`）を `Text` に足します。

## 理由

ユーザーの返事の原文です。

> ADR は覆して、全部 variant に統一で良いです。

> appearance も variant に統一で良いです。appearance ちょっと長くて打ちづらく、variant で差支えないかなと

> emphasis は variant で、太さは weight ですかねえ

Text の段については、次のメモです。

> 文字のウェイト＋サイズ＋色も含まれていそうなので、variant が妥当な気がします

appearance が使い回されていたことについては、次のメモです。

> 他の概念名について、命名に迷うので、再考したいです

## 却下した案と理由

- **A（appearance を面の見せ方専用にし、他は概念名にする）**: いったんはこの形で候補に挙げましたが、「appearance ちょっと長くて打ちづらく、variant で差支えない」という返事で、面の見せ方も含めて全部 `variant` にしました
- **B（appearance を広く定義し直すだけ）**: 選ばれませんでした。概念ごとに違う名前を持つ状態が残るため
- **C（面の見せ方以外だけ variant にする）**: 選ばれませんでした。「全部 variant に統一で良い」という返事のとおり、面の見せ方も含めました

## 影響

`appearance` を持つ 18 部品（`Button`・`CopyButton`・`Link`・`Notice`・`Callout`・`ToastProvider`・`Breadcrumb`・`Accordion`・`Collapsible`・`Card`・`Divider`・`Table`・`CodeBlock`・`CodeGroup`・`Pager`・`Spoiler`・`Blockquote`・`Switch`）を `variant` に改名します（型名も `<部品>Variant` に直します）。`Text`・`Time`・`RelativeTime`・`NumberFormat` の `tone` → `variant`、`List.checkedTone` → `checkedVariant`、`Skeleton.shape` → `variant` に直します。`Text` に `weight` を足します。

[ADR-0051](./0051-prop-names.md) の「`tone`・`variant` などの別名を作らない」のうち `variant` の部分は、このため Superseded とします（0051 のステータス行をあわせて書き換えます）。

## 原則への反映

反映なし。見た目の型をどの名前でまとめるかという props の整理で、部品ごとの見た目の値そのものは変えていません。

## 比較画像

なし。名前と API の決定で、見た目は変えていません（[0013](./0013-secondary-color.md)・[0051](./0051-prop-names.md) と同じ理由）。
