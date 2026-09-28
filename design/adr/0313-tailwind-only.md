# 0313. 利用者は Tailwind v4 を入れている前提にし、部品のクラスは使う側の Tailwind が作る

- ステータス: Accepted
- 日付: 2026-09-24
- ラウンド: ループ外

## 背景

公開に向けて、利用者向けの CSS の入れ方を決めます。

それまでの利用者向けの CSS（`src/styles/index.css`）には、次の問題がありました。

- 中で `@import 'tailwindcss'` をしていたので、Tailwind を使うアプリでは Tailwind の CSS（リセット・テーマ・クラス）が 2 回入り、使う側の CSS と順番がぶつかりました
- 部品のクラスを探す場所を `src/` にしていましたが、公開するのは `dist/` だけなので、公開するとクラスが 1 つも作られませんでした
- 部品のクラスだけでなく、テストと見本（`src/samples/`）のクラスも拾っていました

## 候補

比較の候補はありません。次の 2 つの形を、それぞれ PR にして比べました。

| 案                            | 形                                                                                                                                                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tailwind あり・なしの両方     | Tailwind ありでは使う側の Tailwind が部品のクラスを作り、Tailwind なしではビルド済みの CSS を `@layer` に入れて配る。部品の要素に目印のクラスを付け、その中にだけ Tailwind のリセットを当てる（PR #62） |
| Tailwind ありだけ（この決定） | 使う側の Tailwind が部品のクラスを作る形だけにする                                                                                                                                                      |

## 決定

**利用者は Tailwind v4 を入れている前提にします。**

- 入口は `@kazuemon/ui/tailwind.css` です。テーマ（トークン・密度・`@property`・keyframes）を持ち、Tailwind そのものは読み込みません。使う側が `@import 'tailwindcss'` のあとに読みます
- クラス名を探す場所は、配布する `dist` の JS です。部品のクラスは、使う側の utilities の層に 1 回だけ作られ、`className` の上書きは tailwind-merge（[0077](./0077-tailwind-merge-config.md)）で効きます
- `tailwindcss`（^4.3）を peerDependencies にします
- JS は `pnpm build`（tsdown）で、ファイルを分けたまま `dist` に出します。`'use client'` をソースと同じファイルに残し、`sideEffects` を CSS だけにして、使わない部品が束ねられないようにしました（Button だけを import すると 14KB。`pnpm check:dist` が確かめる）
- workspace の中（Storybook・docs サイト）はソースを読み、公開するときだけ `publishConfig` の `exports` で `dist` を指します

## 理由

最初の依頼です。

> kazuemon/ui の公開に向けた準備をしていきたいです。tailwind なしでの利用と、tailwind ありでの利用にそれぞれ対応していきたいのですが、どのようにすればよいでしょうか。

両方に対応する PR を作ったあと、Tailwind を使った部品ライブラリ（shadcn/ui・daisyUI など）の多くが Tailwind を入れている前提だと話したときの依頼です。

> 一旦 tailwind を使っている前提だけの PR も作ってみてもらえますか？

以下は、読み取れることです。

- **よくある形にそろえる**: shadcn/ui・daisyUI・HeroUI などは、使う側の Tailwind に部品のクラスを作らせる形です。Tailwind なしで使えるライブラリ（Mantine・Radix Themes）は、最初から Tailwind に頼らない作りです
- **部品の書き方を変えない**: Tailwind なしに対応するには、部品の要素に目印のクラスを付ける決まりと、ビルド済みの CSS を保つ手間が加わります。まずは Tailwind ありだけで公開し、要るときに足します

## 却下した案と理由

- **Tailwind あり・なしの両方（PR #62）**: 動く形はできていますが、部品を作るたびに目印のクラスの決まりを守る必要があり、Tailwind なしでは使う側のクラス名（Bootstrap の `.p-2` など）とぶつかる余地も残ります。Tailwind なしの利用者が要るようになったら、この PR の形を足します
- **Tailwind ありでも、ビルド済みの CSS を使ってもらう**: Tailwind の CSS が二重になり、使う側の utilities と部品のクラスの勝ち負けが、読み込む順番で決まってしまいます

## 影響

- 追加: `tsdown.config.ts`・`scripts/build-css.mjs`・`scripts/check-dist.mjs`、`src/styles/tailwind.css`。CI に `pnpm build`・`pnpm check:dist` を足しました
- 消した: `src/styles/index.css`
- package.json: `react`・`react-dom` を peerDependencies に移しました（19 以上）
- docs サイト: 新しい入れ方（`tailwind.css`）に切り替えました。作られる CSS は、テストと見本だけで使っていた 4 つのクラスが消えたほかは同じです
- コミット: `69aae04`（ビルド）、`bc554aa`（ツリーシェイクの確かめ）、`319288a`（CSS の入口）

## 原則への反映

反映なし。見え方は変わっていません。入れ方は README に書きます。

## 比較画像

画像はありません。配り方の決定で、見た目の比較をしていません。
