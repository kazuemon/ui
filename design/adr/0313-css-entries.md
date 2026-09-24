# 0313. CSS の入口を Tailwind あり・なしで分け、クラス名に接頭辞を付けない

- ステータス: Accepted
- 日付: 2026-09-24
- ラウンド: ループ外

## 背景

公開に向けて、Tailwind を使うアプリと使わないアプリの両方で入れられるようにします（README の「つくりたい機能」の「Tailwind なしでの利用」「スタイルの衝突を避ける」）。

それまでの利用者向けの CSS（`src/styles/index.css`）には、次の問題がありました。

- 中で `@import 'tailwindcss'` をしていたので、Tailwind を使うアプリでは Tailwind の CSS（リセット・テーマ・クラス）が 2 回入り、使う側の CSS と順番がぶつかりました
- Tailwind を使わないアプリには、この CSS を処理するものがなく、使えませんでした
- 部品のクラスを探す場所を `src/` にしていましたが、公開するのは `dist/` だけなので、公開するとクラスが 1 つも作られませんでした
- 部品のクラスだけでなく、テストと見本（`src/samples/`）のクラスも拾っていました

## 候補

比較の候補はありません。形を 2 つ示し、選んでもらいました。

| 案                         | 形                                                                                                                                                                                                                              |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A. 接頭辞を付けない        | JS は 1 つ。CSS の入口を 2 つにする。Tailwind ありでは、使う側の Tailwind が部品のクラスも作る。Tailwind なしでは、ビルド済みの CSS を配る                                                                                      |
| B. 接頭辞（`ku:`）を付ける | 部品のクラスをすべて `ku:flex` のように書き換え、どちらの使い方でもビルド済みの CSS を配る。クラス名はぶつからないが、Tailwind ありでも CSS が二重になり、`@layer` の順番の指定と、`className` の上書きの仕組みの作り直しが要る |

## 決定

**A を採用します。**

| 入口                        | 使う人           | 中身                                                                                                                                                                                       |
| --------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `@kazuemon/ui/tailwind.css` | Tailwind v4 あり | テーマ（トークン・密度・`@property`・keyframes）と、部品の中だけのリセット（[0314](./0314-scoped-reset.md)）。Tailwind そのものは読み込まない。クラス名を探す場所は、配布する `dist` の JS |
| `@kazuemon/ui/styles.css`   | Tailwind なし    | 部品が使うクラスとテーマを、ビルドのときに Tailwind に通した CSS。ページ全体のリセット（preflight）は入れない。全体を `@layer kazuemon` に入れ、使う側の CSS が必ず勝つようにする          |

- Tailwind ありでは、使う側が `@import 'tailwindcss'` のあとに `tailwind.css` を読みます。部品のクラスは使う側の utilities の層に 1 回だけ作られ、`className` の上書きは tailwind-merge（[0077](./0077-tailwind-merge-config.md)）で効きます
- Tailwind v3 のアプリは、Tailwind なしと同じく `styles.css` を使います（部品は v4 の書き方を使っているため）
- JS は `pnpm build`（tsdown）で、ファイルを分けたまま `dist` に出します。`'use client'` をソースと同じファイルに残し、`sideEffects` を CSS だけにして、使わない部品が束ねられないようにしました（Button だけを import すると 14KB。`pnpm check:dist` が確かめる）
- workspace の中（Storybook・docs サイト）はソースを読み、公開するときだけ `publishConfig` の `exports` で `dist` を指します

## 理由

最初の依頼です。

> kazuemon/ui の公開に向けた準備をしていきたいです。tailwind なしでの利用と、tailwind ありでの利用にそれぞれ対応していきたいのですが、どのようにすればよいでしょうか。

A と B を示したときの答えです。

> Aでいいかなと思います。1から順にお願いします。

以下は、読み取れることです。

- **Tailwind ありが主な使い方**: README の「ベース: Tailwind CSS」と、docs サイトも Tailwind を使っていることから、Tailwind ありで二重にならず、`className` で素直に上書きできる形を優先します
- **Tailwind なしは、入れれば動くこと**: backlog（2026-09-20）の「入れていないときはビルド済みの CSS を配ります」のとおり、ビルド済みの CSS を配ります

## 却下した案と理由

- **B. 接頭辞を付ける**: クラス名の衝突はなくなりますが、全部品の書き換えが要り、Tailwind ありの使い方で CSS が二重になり、`className` の上書きが tailwind-merge でなく `@layer` の順番頼みになります。Tailwind ありを主な使い方にするので採りません。Tailwind なしで、使う側に同じ名前のクラス（Bootstrap の `.p-2` など）があるとぶつかる問題は、backlog に残しました
- **Tailwind ありでも、ビルド済みの CSS を使ってもらう**: Tailwind の CSS が二重になり、使う側の utilities と部品のクラスの勝ち負けが、読み込む順番で決まってしまいます

## 影響

- 追加: `tsdown.config.ts`・`scripts/build-css.mjs`・`scripts/check-dist.mjs`、`src/styles/tailwind.css`・`src/styles/standalone.css`（`styles.css` の元）。CI に `pnpm build`・`pnpm check:dist` を足しました
- 消した: `src/styles/index.css`
- package.json: `react`・`react-dom` を peerDependencies に移し（19 以上）、`tailwindcss`（^4.3）を任意の peerDependencies に足しました
- docs サイト: Tailwind ありの入れ方（`tailwind.css`）に切り替えました。作られる CSS は、テストと見本だけで使っていた 4 つのクラスが消えたほかは同じです
- 確かめたこと: `pnpm pack` した tarball を、Vite（Tailwind なし・Tailwind v4 あり）と Next.js（Server Components、Tailwind なし）のアプリに入れてビルドしました。Vite の 2 つでは、部品の位置と大きさが一致し、Select の選択肢は画素まで一致しました
- コミット: `5ae9026`（ビルド）、`25189a8`（ツリーシェイクの確かめ）、`0abc0cd`（CSS の入口）

## 原則への反映

反映なし。見え方は変わっていません。入れ方は README に書きます。

## 比較画像

画像はありません。配り方の決定で、見た目の比較をしていません。
