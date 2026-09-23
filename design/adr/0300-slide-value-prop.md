# 0300. いまの 1 枚は、Carousel・Gallery・Thumbnails のどれも value で持つ

- ステータス: Accepted
- 日付: 2026-09-23
- ラウンド: 後半（軸外。軸 285〜299 の返事の中で決まりました）

## 背景

Carousel・Gallery・Thumbnails は、どれも「いまの 1 枚（番号）」を持つ部品です。この値を渡す props の名前をそろえるかどうかを決めました。

## 候補

| 案                                                    | 内容                                                                  |
| ----------------------------------------------------- | --------------------------------------------------------------------- |
| value・defaultValue・onValueChange にそろえる（採用） | 3 部品とも、ほかの制御された部品（Select・Tabs など）と同じ命名にする |
| 部品ごとに別の名前にする（index・activeIndex など）   | 「いまの 1 枚」であることが名前からも分かる                           |

## 決定

**Carousel・Gallery・Thumbnails は、どれも `value`・`defaultValue`・`onValueChange`（0 から数える番号）で、いまの 1 枚を持ちます。**

## 理由

ユーザーの返事の原文です（「そろえる」の一部として答えています）。

> 今の 1 枚は value にそろえる

`value` は Tabs・Select などですでに使っている、変わる値の通知の名前（[ADR-0243](./0243-on-change-events.md)）です。Carousel・Gallery・Thumbnails も「選ばれている 1 つ」を持つ部品として同じ語彙にそろえることで、使う側は部品ごとに名前を覚え直す必要がありません。Thumbnails を Carousel の外で単体の部品として使うとき（[ADR-0299](./0299-thumbnails-name-and-standalone.md)）も、ほかの制御された部品と同じ書き方で組めます。

## 影響

- `src/components/carousel/Carousel.tsx`・`use-carousel-state.ts`: `value`・`defaultValue`・`onValueChange` を公開しました
- `src/components/gallery/Gallery.tsx`: `value`・`defaultValue`・`onValueChange`（拡大して見ている 1 枚）を公開しました
- `src/components/thumbnails/Thumbnails.tsx`: `value`・`defaultValue`・`onValueChange` を公開しました

## 原則への反映

反映なし。名前だけの決定で、見た目・構造は変えていません。

## 比較画像

比較画像はありません。props の名前についての決定で、見た目の比較はしていません。

決めた時点のコミットは `d58855f` です。
