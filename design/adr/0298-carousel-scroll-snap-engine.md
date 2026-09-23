# 0298. Carousel は CSS の scroll-snap で送り、見た目と送る仕組みを分ける

- ステータス: Accepted
- 日付: 2026-09-23
- ラウンド: 後半（軸外。Carousel の作りはじめに決まりました）

## 背景

Carousel を作りはじめる時点で、送る仕組み（どの 1 枚を見せているか・その 1 枚へ送る・指の動きとの同期）をどう作るかを決める必要がありました。自前で CSS の `scroll-snap` を使う形と、Embla Carousel のような外部ライブラリに乗せる形があります。@kazuemon/ui はここまで、見た目だけの部品として外のライブラリに直接依存させない方針で作ってきました（[ADR-0116](./0116-image.md) など）が、Carousel は「端でつながる送り方」「自動で送る動き」「複数枚ずつ送る」のように、あとから機能が増えていく部品でもあります。

## 候補

| 案                                      | 内容                                                                                                                          |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| CSS の scroll-snap を自前で作る（採用） | ブラウザの scroll-snap で送る。軽く、依存を増やさない。見た目（枠・前へ・次へ・位置の印）と、送る仕組み（engine）を分けて作る |
| Embla Carousel などに最初から乗せる     | 端でつながる・自動で送る・複数枚送るといった機能を、最初から持てる。外部ライブラリへの依存が増える                            |

## 決定

**Carousel は、いまの 1 枚を持つ状態（`useCarouselState`）・見た目（`CarouselView`）・送る仕組み（`carousel-engine.ts` の形の hook）の 3 つに分けて作ります。既定の仕組みは CSS の `scroll-snap`（`use-scroll-snap-engine.ts`）ですが、同じ形の hook を書けば、Embla Carousel などの外の仕組みも差し込めます。**

## 理由

ユーザーの返事の原文です。

> 基本は 1 でいいかなと思いますが、うまい拡張方法があれば embla による機能も使えるようにもしたいですね

いまの見た目（1 枚ずつ幅いっぱい、または peek で両隣を少し見せる — [ADR-0285](./0285-carousel-peek.md)）には、CSS の `scroll-snap` で十分で、追加の依存もパフォーマンスのコストもありません。一方で、将来「端でつながる」「自動で送る」のような機能が要るときに Embla を差し込めるよう、送る仕組みのインターフェース（`CarouselEngineOptions`・`CarouselEngine`）を先に決めておきました。仕組みは、いまの 1 枚の番号（`index`）を受けてその 1 枚へ送り、指・ホイール・トラックパッドで動いたときは `onIndexChange` で知らせる、という最小限の形です。Embla を差し込む部品（`@kazuemon/ui/carousel-embla` など）は、まだ作っていません（[backlog](../backlog.md)）。

## 影響

- `src/components/carousel/carousel-engine.ts`: `CarouselEngineOptions`・`CarouselEngine`・`UseCarouselEngine` の型を internal に置きました（公開はしていません）
- `src/components/carousel/use-scroll-snap-engine.ts`: 既定の仕組み（`scroll-snap`）です
- `src/components/carousel/CarouselBase.tsx`: 見た目（`CarouselView`）は engine を受け取るだけで、`scroll-snap` を直接知りません
- Embla などを差し込む形の部品は、まだ作っていません。作るときの入口（peer dependency にするか）は [backlog](../backlog.md) にあります

## 原則への反映

反映なし。部品の作り方（内部の分け方）についての決定で、見た目・原則は変えていません。

## 比較画像

比較画像はありません。実装方式についての決定で、見た目の比較はしていません。

決めた時点のコミットは `d58855f` です。
