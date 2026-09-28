# 0335. 実装の重い部品は見た目だけを持ち、外のヘッドレスとの統合はレシピで案内する

- ステータス: Accepted
- 日付: 2026-09-28
- ラウンド: 後半（軸外。DataTable・Sortable の作りはじめに決まりました）

## 背景

DataTable・仮想スクロール・並べ替え（Sortable）・Kanban のように、並べ替えのアルゴリズムや仮想化の計算そのものが重い部品は、2026-09-18 の時点で README に「TanStack Table・TanStack Virtual・dnd-kit に peer dependency で乗り、うちは見た目だけを持つ」と書いていました。このときは ADR を書いていませんでした。

2026-09-28、DataTable・Sortable を作りはじめる直前に、ユーザーから peer dependency の運び方そのものへの問い直しがありました。ヘッドレスライブラリを部品の内側に組み込むか、見た目だけを部品にして統合はユーザーが写すレシピにするかを、あらためて決める必要がありました。純正のヘッドレスとして何を採るか（並べ替えは dnd-kit か Pragmatic drag and drop か）も一緒に決めました。

## 候補

| 案                                                 | 内容                                                                                                                                                                                     |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-09-18 の方針（peer dependency）               | 部品自身が TanStack Table・TanStack Virtual・dnd-kit を import し、peer dependency にする。使う側はヘッドレスを入れるだけで動く                                                          |
| 採用: 見た目だけの部品 + レシピ（devDependencies） | 部品はヘッドレスを import しない。見た目（DataTable・Sortable・Dropzone の面）だけを持ち、実際の統合は `src/recipes` の見本コードとして案内する。ヘッドレスは devDependencies だけに置く |

## 決定

**DataTable・仮想スクロール・並べ替えのように実装の重い部品は、見た目だけを部品にします。ヘッドレスライブラリ（TanStack Table・TanStack Virtual・dnd-kit）は部品から import せず、peer dependency にもしません。実際の統合は `src/recipes` の見本コード（`sortable-dnd-kit.tsx` など）として案内し、使う側が自分のアプリに写して使います。** ヘッドレスは package.json の devDependencies だけに置きます（`@tanstack/react-table` ^9.2.4、`@dnd-kit/react`・`@dnd-kit/helpers`・`@dnd-kit/dom` ~0.5.0）。部品の props は、DOM の並びやページングのための独自の形を作らず、ヘッドレスのエンジンが持つ状態の形にそのまま合わせます。レシピが値を組み替える変換の層にならないようにするためです。

並べ替えの純正は **@dnd-kit/react** を採ります。旧版の `@dnd-kit/core` は 2024-12 から更新がなく、Pragmatic drag and drop（Atlassian）も候補にしましたが、周りの項目がずれて場所を空ける見た目と、キーボードでの並べ替えのしやすさで dnd-kit を選びました。DataTable の純正は **TanStack Table（v9）** です。Dropzone だけは、ファイルの受け取りと弾く理由の判定が自前で十分作れる範囲だったため、依存なしで自前実装にしました（[ADR-0329](./0329-dropzone-self-built.md)）。

## 理由

ユーザーの返事の原文です。

> ヘッドレスライブラリをはじめから組み込まず、見た目を用意しつつ、ヘッドレスライブラリに後から組み込む、とした方が良いのかなと思っていますが、どうでしょうか。純正としてどのヘッドレスライブラリを採用するかも検討したいです。

> 見た目だけ作って、実際の統合を recipe にするのはユーザー側の記述量が多すぎるでしょうか？バージョン対応などが煩雑になるかなと思いまして

> Components としては見た目のみ（DropZoneは自前実装とのことなので機能も）、Recipe として tanstack-table 統合と dnd-kit/react 統合を案内する形としたいです。

peer dependency にすると、ヘッドレスのメジャー版が上がるたびにこちらも対応した版を出す必要があり、まだ 0.x の dnd-kit の破壊的変更にも巻き込まれます。見た目だけを部品にして devDependencies に留めれば、うちの版を出さずに追従でき、レシピは `pnpm test` で描かれるので壊れたら気づけます。記述量が増える懸念については、props をエンジンの状態の形にそのまま合わせることで、レシピが値を組み替える変換の層にならないようにし、写す分量を最小限にしました。

## 影響

- `package.json`: `@tanstack/react-table`（^9.2.4）、`@dnd-kit/react`・`@dnd-kit/helpers`・`@dnd-kit/dom`（いずれも ~0.5.0）を devDependencies に足しました。dependencies・peerDependencies には足していません
- `README.md`: 「アプリの画面」の節の文を、peer dependency の方針からこの決定の文に書き換えました（「実装の重い部品（DataTable・VirtualList・Sortable・Kanban）は、見た目だけを部品にし、外のヘッドレス（TanStack Table・TanStack Virtual・dnd-kit）とのつなぎ方はレシピ（Storybook の Recipes）で案内します。ヘッドレスは依存に入れないので、使う人がアプリに入れて、レシピのコードを写して使います。」）
- `src/recipes/sortable-dnd-kit.tsx`・`src/recipes/Sortable.stories.tsx`: Sortable と dnd-kit をつなぐ見本を置きました。DataTable も同じ形で TanStack Table の見本を置きます
- backlog に足す未決事項: いくつかのアプリで同じレシピを写すようになったら、subpath の統合部品（`@kazuemon/ui/sortable-dnd-kit` など）へ格上げすることを検討します。まだ作っていません
- DataTable・Sortable の部品は、ヘッドレスの型を props にそのまま使うため、ヘッドレスの型定義に依存します（実行時の import はしません）

## 原則への反映

反映なし。部品の作り方（依存の持ち方、内部と外部の境界）についての決定で、見た目の原則は変えていません。[ADR-0298](./0298-carousel-scroll-snap-engine.md)（Carousel の送る仕組みを分けた決定）と同じ扱いです。

## 比較画像

比較画像はありません。実装方針についての決定で、見た目の比較はしていません。

決めた時点のコミットは `435d0ab` です。
