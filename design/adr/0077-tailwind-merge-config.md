# 0077. tailwind-merge にライブラリのクラスの名前を知らせる

- ステータス: Accepted
- 日付: 2026-09-17
- ラウンド: ループ外

## 背景

[ADR-0076](./0076-token-structure.md) で、トークンを Tailwind の名前空間で公開し、`h-control`・`text-caption`・`rounded-control` などのクラスを使えるようにしました。部品は tailwind-variants（中で tailwind-merge を使う）で `className` をまとめていますが、tailwind-merge はこれらの名前を知りません。

- `h-control` に `h-full` を重ねても、両方が残り、上書きが効きません（`rounded-control`・`shadow-raised` も同じ。ADR-0076 より前からあった）
- `text-caption` は色のクラスとみなされ、`text-fg-subtle` と並べると消えます

ADR-0076 では、部品の中を `h-(--spacing-control)` の書き方にして避け、利用者向けの設定は backlog に置いていました。

## 候補

比較の候補はありません。対策の形を示しました。

| 案  | 内容                                                                                                        |
| --- | ----------------------------------------------------------------------------------------------------------- |
| 1   | 名前の一覧を1か所に置き、部品の `tv` をその設定で作る（tailwind-variants の `createTV` と `twMergeConfig`） |
| 2   | 部品の中を名前付きのクラス（`h-control`・`text-caption`）で書き直す                                         |
| 3   | 同じ設定を export し、利用者が自分の `cn()` で `extendTailwindMerge` に渡せるようにする                     |

## 決定

**1 と 3 を採用します。** 2 は今回は行いません。

- `src/components/tv.ts` に、tailwind-merge の設定 `twMergeConfig`（`extend.theme` に、余白・文字の大きさ・行の高さ・角丸・影・緩急・動き・太さの名前）と、その設定で作った `tv` を置きます。部品は `tailwind-variants` の `tv` ではなく、これを使います
- 色は並べません。tailwind-merge は知らない名前も色として扱うためです。角丸の `xs`〜`4xl` も、tailwind-merge が既に知っているので並べません
- 一覧は tokens.css の `@theme` と同じにします。`src/components/tv.test.ts` が、tokens.css から名前を拾って一覧と比べ、あわせて代表的な組み合わせのまとめ方を確かめます（Vitest の `unit` プロジェクト。Node で動く）

## 理由

ユーザーのメモです。

> tailwind-merge については何か対策はできないのですか？

> 設定して欲しいです。

以下は、メモから読み取れることです。

- **設定を入れる**: 対策の形（1〜3）を示したところ「設定して欲しい」だったので、設定そのもの（1）と、利用者が同じ設定を使える形（3）を入れました。部品の中の書き直し（2）は、設定があれば後からでもできるので、backlog に置きます

## 却下した案と理由

- **2（部品の中の書き直し）を今回行う**: 見送りました。設定を入れたことで、いつでも書き直せます。書き直すかは backlog で決めます

## 影響

- `src/components/tv.ts`（新規）: `twMergeConfig` と `tv`
- `src/components/*.tsx`・`field-styles.ts`: `tv` を `./tv` から読むようにしました
- `src/components/tv.test.ts`（新規）と `vitest.config.ts`: `unit` プロジェクトを足しました。Vitest は既定で CSS を空にするので、tokens.css だけは中身を読めるようにしています
- 見た目は変わりません（全ストーリーを撮って、変更の前と画素が一致することを確かめました）
- tokens.css の `@theme` に、Tailwind のクラスになる名前（余白・文字・行の高さ・角丸・影・緩急・動き・太さ）を足したときは、tv.ts の一覧にも足します。足し忘れると tv.test.ts が落ちます
- パッケージの入口（`src/index.ts`）はまだないので、`twMergeConfig` を利用者に出すのは、入口を作るときです

## 原則への反映

反映なし。部品の実装と、利用者向けの設定についての決定です。

## 比較画像

画像はありません。見た目を変えない設定です。
