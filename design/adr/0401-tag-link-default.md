# 0401. Tag の link の既定は href != null。リンクかどうかは render だけで判断しない

- ステータス: Accepted
- 日付: 2026-10-01
- ラウンド: 後半 軸 417（に伴う）

## 背景

Tag をリンクの見た目にするかを、何で決めるかを決めました。`render` にルーターのリンク（Next.js の Link など）を渡す使い方があり、部品からは `render` がリンクかどうか分かりません。

## 決定

**Tag の `link` の既定は `href != null` です。** `href` があれば既定でリンクの見た目になり、`link` で上書きできます。`render` にリンクを渡すときは、`link` を明示します。

- Card と同じ決まりです（`src/internal/link-parts.ts` の `resolveLink`、ADR-0471）
- `link={false}` のときは、`href` を渡していてもリンクにしません。`a` にせず（`span` か `render` の要素）、`href`・`target`・`rel` などリンクだけの属性を描く要素に渡しません
- `link` を付けたのに `href` も `render` もないときは、開発時に警告します

## 理由

ユーザーの返事（F41・F97）の原文です。

> render だけで判断するのはうーんという感じです。断定できないためですね。link かどうかを明示する props をつける（href があるならデフォルト true で上書き可能）かなーと思います。

## 却下した案と理由

- `render` の有無でリンクと判断する: `render` にリンクでないものも渡せるので、断定できない

## 影響

- `src/components/tag/Tag.tsx`: `link?: boolean`（既定は `href != null`）を持ちます（実装のコミット `8351dfd`）
- `link={false}` の扱いと開発時の警告は、main に載せ直したあとに Card にそろえました（`resolveLink`・`withoutLinkAttributes`・`warnOnce`）

## 原則への反映

反映なし。props の決まりで、見た目の原則は変わりません。

決めた時点のコミットは `8351dfd` です。
