# 0336. Sortable のキーボードと読み上げは部品が持ち、dnd-kit にはポインタだけを任せる

- ステータス: Accepted
- 日付: 2026-09-28
- ラウンド: 後半（軸外。Sortable の作りはじめに決まりました）

## 背景

Sortable と、それを引く動きにつなぐ dnd-kit（[ADR-0335](./0335-headless-look-only-recipes.md)）の役割分担を決める必要がありました。dnd-kit は、並べ替えのキーボード操作と読み上げをまとめて面倒を見る `Accessibility` というプラグインを標準で持っています。これをそのまま使うか、部品側でキーボードと読み上げを持つかで、つまみに付く役割や読み上げの言語が変わります。

ユーザーから、旧版 dnd-kit のアクセシビリティ対応を扱った記事（[SmartHR のブログ](https://tech.smarthr.jp/entry/2026/02/17/183648)）が参考として示されました。ドラッグだけに頼る並べ替えは WCAG 2.2 の 2.5.7（Dragging Movements）を満たさず、代わりの操作を用意する必要があるという指摘です。

## 候補

| 案                                                                  | 内容                                                                                                                                                                                                                                                                              |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| dnd-kit の `Accessibility` プラグインに任せる                       | dnd-kit 標準の読み上げを使う。つまみに `draggable` の役割・`aria-pressed`・`aria-roledescription` が英語で付き、SmartHR の記事が指摘した問題がそのまま起きる                                                                                                                      |
| 採用: Sortable がキーボードと読み上げを持ち、dnd-kit はポインタだけ | `Sortable` がつまみのキーボード操作（上下の矢印キー）と読み上げ（読み上げの箱 1 つ）を持つ。レシピの dnd-kit は `PointerSensor` だけを使い、`Accessibility` プラグインを外す。ドラッグ以外の操作（`moveActions`）も部品側に持たせ、ポインタだけでも並べ替えを終えられるようにする |

## 決定

**Sortable は、つまみのキーボードでの並べ替えと、動かしたことの読み上げを自分で持ちます。レシピの dnd-kit には、ポインタで引く動きだけを任せます。** `PointerSensor` に 4px 動かしてから引き始める条件（`PointerActivationConstraints.Distance`）を付け、押しただけで持ち上げた写しがちらつかないようにします。dnd-kit の `Accessibility` プラグインは、`DragDropProvider` の `plugins` で既定の一覧から取り除きます。これらに使う `Accessibility`・`PointerActivationConstraints`・`PointerSensor` を読むため、`@dnd-kit/dom` を devDependencies に足します。

ドラッグだけでは 2.5.7 を満たさないため、押すだけで並べ替えを終えられる操作（`moveActions`）を軸 377 として新たに比較し、部品の props に持たせます（決定は [ADR-0342](./0342-sortable-move-actions.md)）。

## 理由

ユーザーの返事の原文です。

> dom + 377 よさそうです。その間に見ておきます。

（`@dnd-kit/dom` を devDependencies に足すことと、軸 377「ドラッグしない並べ替え」を足すことへの返事です。参考にした記事は SmartHR のブログ https://tech.smarthr.jp/entry/2026/02/17/183648 です。）

dnd-kit の `Accessibility` プラグインは、つまみに英語の役割と状態を付け、引いたときの読み上げも英語です。@kazuemon/ui の部品は日本語の文言を part の props（`movedText`・`instructionText` など）で持つ決まりなので、英語の読み上げが重なると原則15「読み上げは見た目の順、フォーカスは次に触るものへ」の「見えている文字を、二度読ませません」から外れます。キーボードと読み上げを部品側に一本化することで、`moveActions`（メニューやボタンでの並べ替え）と、上下矢印キーでの並べ替えが、同じ読み上げの文・同じフォーカスの戻し方を使えます。

## 影響

- `package.json`: `@dnd-kit/dom`（~0.5.0）を devDependencies に足しました
- `src/components/sortable/Sortable.tsx`・`SortableHandle`: 上下矢印キーでの並べ替えと、`role="status"` の読み上げの箱（`movedText`・`instructionText`）を持ちます
- `src/components/sortable/SortableMoveActions.tsx`: `moveActions`（`item-menu`・`buttons`）による、引かずに並べ替える操作を持ちます（[ADR-0342](./0342-sortable-move-actions.md)）
- `src/recipes/sortable-dnd-kit.tsx`: `sensors`（`PointerSensor` + 4px の `activationConstraints`）と、`plugins`（`Accessibility` を除く一覧）を渡します
- `src/recipes/Sortable.stories.tsx` の play で、dnd-kit の `Accessibility` を外したことにより、つまみに `aria-pressed`・`aria-roledescription` が付かないことを確かめています

## 原則への反映

反映なし。原則15「キーボードの振る舞いは、見た目ではなく働きに従う」・「見えている文字を、二度読ませません」の範囲内の決定です。

## 比較画像

比較画像はありません。役割分担についての決定で、見た目の比較はしていません。

決めた時点のコミットは `435d0ab` です。
