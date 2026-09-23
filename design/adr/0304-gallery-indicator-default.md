# 0304. Gallery の位置の示し方は、dots を既定にし、Carousel と点・数を共有する

- ステータス: Accepted
- 日付: 2026-09-23
- ラウンド: 後半（軸外。軸 291〜292 の返事の中で決まりました）

## 背景

Gallery の位置の示し方（`indicator`）は、軸 291（[ADR-0289](./0289-gallery-controls-position.md)）で `'dots' | 'count' | 'none'` の語彙を Carousel（[ADR-0284](./0284-carousel-indicator.md)）とそろえましたが、`indicator` を書かないときの既定は別に確かめる必要がありました。

## 候補

| 案              | 内容                                                                          |
| --------------- | ----------------------------------------------------------------------------- |
| dots（採用）    | Carousel の既定（点）と同じ。全部で何枚あって、いまどのあたりかが一目で分かる |
| count（旧既定） | 「3 / 6」の数で示す                                                           |

## 決定

**Gallery の `indicator` の既定は `'dots'` です。点と数の見た目は `src/internal/position-indicator` に置き、Carousel と共有します。**

## 理由

ユーザーの返事の原文です（2 回目の返事）。

> Gallery の indicator: dots に揃えるでお願いします。

Carousel の位置の示し方は、点を既定にしています（[ADR-0284](./0284-carousel-indicator.md)）。Gallery も同じ「並べた画像を送って見る」場面なので、既定をそろえることで、Carousel と Gallery を同じページで使ったときに一貫します。点と数の見た目（大きさ・間隔・色）は、部品ごとに別々に持たず、`src/internal/position-indicator` の 1 つの実装を共有しています。

## 影響

- `src/components/gallery/Gallery.tsx`: `indicator` の既定を `'dots'` にしました
- `src/internal/position-indicator.tsx`: `PositionDots`・`PositionCount` を Carousel・Gallery で共有しました

## 原則への反映

反映なし。原則6（色は役割で持つ）・原則17（押せる範囲は見た目の範囲）の範囲内です。部品をまたいで見た目の実装を共有したのは、原則の変更ではなく実装の共通化です。

## 比較画像

比較画像はありません。Carousel（[ADR-0284](./0284-carousel-indicator.md)）と既定をそろえただけの決定で、新しい見た目の比較はしていません。

決めた時点のコミットは `d58855f` です。
