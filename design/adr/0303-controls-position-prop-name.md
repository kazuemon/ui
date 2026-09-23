# 0303. 前後のボタンの置き場所の props 名は、controlsPosition にそろえる

- ステータス: Accepted
- 日付: 2026-09-23
- ラウンド: 後半（軸外。軸 285〜299 の返事の中で決まりました）

## 背景

Carousel（[ADR-0283](./0283-carousel-controls-position.md)）と Gallery（[ADR-0289](./0289-gallery-controls-position.md)）で、前後のボタンをどこに置くかを選ぶ props の名前を決めました。作業中は `controlsPlacement` という仮の名前で進めていました。

## 候補

| 案                       | 内容                           |
| ------------------------ | ------------------------------ |
| controlsPosition（採用） | 「置き場所」を position で表す |
| controlsPlacement（仮）  | 作業中に使っていた仮の名前     |

## 決定

**props の名前は `controlsPosition` にします。Carousel（`'bottom' | 'bottom-end' | 'overlay'`）・Gallery（`'bottom' | 'sides' | 'overlay'`）で共通の名前です。**

## 理由

ユーザーの返事の原文です。

> 「constolsPosition はどうでしょうか？」（controlsPlacement → controlsPosition）

`design/props.md` の語彙表に沿って、値の集合というより「どこに置くか」という 1 つの場所を選ぶ意味が強いため、`position` を使う名前を採用しました。Carousel と Gallery で同じ名前にすることで、両方を同じページで使うときに迷いません。

## 影響

- `src/components/carousel/CarouselBase.tsx`: `controlsPosition`（`CarouselControlsPosition`）を公開しました
- `src/components/gallery/Gallery.tsx`: `controlsPosition`（`GalleryControlsPosition`）を公開しました

## 原則への反映

反映なし。名前だけの決定で、見た目・構造は変えていません。

## 比較画像

比較画像はありません。props の名前についての決定で、見た目の比較はしていません。

決めた時点のコミットは `d58855f` です。
