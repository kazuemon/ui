# 0247. Pagination の関数の render は renderPage

- ステータス: Accepted
- 日付: 2026-09-21
- ラウンド: ループ外（props の監査）

## 背景

props の命名監査（`naming-analysis.md` N-15）で、`render` の契約が `Pagination` だけ違うことが分かりました。`render` は 20 部品（Affix・AspectRatio・Card・Container・Figure・Image・Link・Stack など）で「この要素に差し替える」（`ReactElement` を渡す）という 1 つの契約ですが、`Pagination` だけ `(page: number) => ReactElement` という関数を受けます。

- `src/components/pagination/Pagination.tsx:150` — `href?: (page: number) => string;`
- `src/components/pagination/Pagination.tsx:155` — `render?: (page: number) => ReactElement;`
- `src/components/affix/Affix.tsx:97` 付近 — `render?: ReactElement`（Base UI 流の要素の差し替え）
- `node_modules/@base-ui/react/use-render/useRender.d.mts:13` — `OverlayClose.render` は `ComponentRenderFn | ReactElement`（Base UI の完全な形）

## 候補

| 案        | 内容                                                                                                                                     |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 現行版    | `Pagination.render?: (page: number) => ReactElement`。他の 20 部品の `render?: ReactElement` と同じ名前で契約が違う                      |
| A（採用） | `Pagination` 側を `renderPage`（関数の契約のまま）に改名する。`href` が `(page: number) => string` なのと対になる                        |
| B         | `render` を「要素 または `(引数) => 要素`」と定義し直し、全部品で関数形も受ける（Base UI の `ComponentRenderFn` と同じ形。実装が増える） |
| C         | 現状維持（`Pagination` の Docs を読めば分かる、という立場。型は通るので誤用に気づきにくい）                                              |

## 決定

**`Pagination` の `render` を `renderPage` に改名します。関数は残り、名前だけ変わります（`(page: number) => ReactElement`）。`render` は「この要素に差し替える」の 1 語に固定します。**

## 理由

`decisions-memo.md` の判定は「採用」で、一言はありませんでした。かわりに、ユーザーからの質問への答えを経緯として残します。

> N-15 の候補を示したときのユーザーの質問「関数ごと使えなくなる認識ですか？」への答え: 関数（`(page: number) => ReactElement` の契約）はそのまま残り、名前だけ `render` から `renderPage` に変わります。

## 却下した案と理由

- **`render` を「要素 または 関数」と定義し直す**: 採られませんでした。全部品で関数形を受けられるようにする実装が増えるうえ、`render` を渡した要素の props を部品が読まないという ADR-0250 の方針（サーバーコンポーネントから渡すと読めない）とも噛み合いにくくなります
- **現状維持**: 採られませんでした。同じ名前で契約が違うと、型は通るのに誤用に気づけません

## 影響

- `src/components/pagination/Pagination.tsx`: `render` を `renderPage` に改名します（型・実装・JSDoc）。直します
- 呼び出し例（JSDoc・ストーリー）の `render={(page) => <NextLink …/>}` を `renderPage={(page) => <NextLink …/>}` に直します

## 原則への反映

反映なし。名前だけの決定で、見た目・構造は変えていません。

## 比較画像

なし。名前と API の決定で、見た目は変えていません（ADR-0013・ADR-0051 と同じ理由）。
