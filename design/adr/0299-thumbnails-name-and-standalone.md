# 0299. 小さな画像の帯は Thumbnails という名前にし、Carousel の外でも組める

- ステータス: Accepted
- 日付: 2026-09-23
- ラウンド: 後半（軸外。Carousel・Thumbnails の作りはじめに決まりました）

## 背景

Carousel と組み合わせる、小さな画像の帯の部品名と、Carousel の外だけで使えるかどうかを決める必要がありました。

## 候補

| 案                                          | 内容                                                                                                    |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Thumbnails（採用）。Carousel の外でも使える | 独立した部品にし、Carousel の `thumbnails` に渡すとつながる。それ以外は `value`・`onValueChange` で組む |
| Carousel の一部（Carousel にしか使えない）  | Carousel の内部部品にし、単体では公開しない                                                             |

## 決定

**部品名は Thumbnails にします。Carousel の `thumbnails` に渡すと、Carousel のいまの 1 枚とつながります（`src/internal/carousel-context.ts`）。それ以外（Gallery など）では、`value`・`onValueChange` で組みます。どちらも渡したときは `value`・`onValueChange` を先に使います。**

## 理由

ユーザーの返事の原文です。

> Thumbnails

名前は、選択肢に出した案からユーザーが選びました。Carousel の内部部品にすると、記事の見出し画像を選ばせる、作品一覧の切り替えなど、Carousel を伴わない使い方ができなくなります。WAI-ARIA の Tabs パターン（tablist・tab）で作ってあるので、単体でも「押して選ぶ、選んだものが変わる」部品として成り立ちます。Carousel と組むときだけ、内部の Context 経由でいまの 1 枚を受け渡し、値の props を渡す手間を省きます。

## 影響

- `src/components/thumbnails/Thumbnails.tsx`: 独立した部品として公開しました（`value`・`defaultValue`・`onValueChange`）
- `src/internal/carousel-context.ts`: Carousel の `thumbnails` に渡したときだけ使う Context です
- `src/index.ts`: `Thumbnails` を公開しました

## 原則への反映

反映なし。名前と、部品の独立の範囲についての決定で、見た目・構造は変えていません。

## 比較画像

比較画像はありません。名前と部品の切り分けについての決定で、見た目の比較はしていません。

決めた時点のコミットは `d58855f` です。
