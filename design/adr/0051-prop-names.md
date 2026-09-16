# 0051. 色と送信中の印の props の名前

- ステータス: Accepted
- 日付: 2026-09-13
- ラウンド: ループ外

## 背景

色を選ぶ props の名前が、部品によって違っていました。`Notice` は `tone`、ほかの色を持つ部品（`Button`・`Link`・`Tag`・`Switch` など）は `color` でした。同じ役割（原則6の「利用者が選ぶ色」「状態の色」）の props に2つの名前があると、部品ごとにどちらを使うか覚える必要があります。

送信中・読み込み中の印も、部品によって形が違いました。`Button` の `loadingIndicator` は `overlay`・`inline`・`bar`（[ADR-0034](./0034-loading.md)）で、`overlay` はラベルに回る円を重ね、`inline` はラベルの左に回る円を置く形でした。`TextField`・`Select` の読み込み中（[ADR-0042](./0042-field-loading.md)）は、これとは別の名前・形を持っていました。

`Button` の白いボタンの色は `color="surface"` という名前でした（[ADR-0024](./0024-neutral-button.md)・[0025](./0025-surface-button-line.md)）。

## 候補

見た目の比較はしていません（下の「比較画像」を参照）。名前だけを検討しました。

| 項目                     | 現行版                                          | 決定                                                             |
| ------------------------ | ------------------------------------------------ | ----------------------------------------------------------------- |
| Notice の色              | `tone`                                            | `color`（型は `NoticeColor`）                                     |
| 送信中・読み込み中の印   | `Button` は `overlay`・`inline`・`bar`            | 全部品で `loadingIndicator: 'spinner' \| 'bar'`。`Button` は `inlineSpinner` で回る円をラベルの左に出す（`bar` のときは使わない） |
| Button の白いボタンの色  | `color="surface"`                                 | `color="white"`                                                   |

## 決定

**色の props は `color` に統一します。送信中・読み込み中の印は `loadingIndicator: 'spinner' | 'bar'` に統一します。`Button` の白いボタンの色は `color="white"` にします。古い名前（`tone`・`overlay`・`inline`・`surface`）は残さず置き換えます。**

| 項目                    | 決定                                                                                                                                       |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `Notice` の色           | `tone` を `color` に変える。型は `NoticeColor`。状態の語（`error`・`warning`）と色の名前（`danger`）は分けたまま変えない                    |
| `loadingIndicator`      | 全部品で `'spinner' \| 'bar'` の2値にする。`Button` は `inlineSpinner`（真偽値）を足し、`true` で回る円をラベルの左に出す（`bar` のときは無視） |
| `Button` の白いボタン   | `color="white"`（旧 `color="surface"`）                                                                                                     |
| Tag の `color`          | 利用者が選ぶ色と状態の色を、そのまま同じ `color` に並べる                                                                                   |
| 古い名前                | `tone`・`overlay`・`inline`・`surface` は互換のために残さず、置き換える                                                                     |

## 理由

ユーザーのメモです。

> color と tone で使い分けするのは、どちらに何があったかを記憶する必要があるので、color に統一で良いかと思いました。

> error/warning と danger で分けるのは違和感がないです。

送信中・読み込み中の印については、次のメモです。

> インジケーター・ローダーは spinner, bar に統一で行きましょう。button の場合は spinner, bar として inlineSpinner をつけたらインラインになる（bar のときは無視）とかで良さそう。

`Button` の白いボタンの名前については、次のメモです。

> surface という名前が紛らわしいのかも。color="white" とかで

古い名前を互換のために残すかどうかを尋ねた質問への答えは「置き換える」でした。

## 却下した案と理由

- **`tone` と `color` を部品ごとに使い分けたまま残す**: 選ばれませんでした。「どちらに何があったかを記憶する必要がある」ため
- **`error`・`warning`・`danger` を1つの語にまとめる**: 検討されていません。「error/warning と danger で分けるのは違和感がない」ので、状態の語（error・warning）と色の名前（danger）を分けたままにしました
- **`overlay`・`inline`・`bar` をそのまま残す**: 選ばれませんでした。部品ごとに違う名前・形になるため
- **`color="surface"` のまま残す**: 選ばれませんでした。「紛らわしい」ため
- **古い名前を `@deprecated` として残す**: 選ばれませんでした。「置き換える」という答えのとおり、使う側のコードも合わせて書き換えました

## 影響

- `src/components/Notice.tsx`: `tone` props と `NoticeTone` 型を、`color` props と `NoticeColor` 型に変えました
- `src/components/Loading.tsx`: `LoadingIndicator` 型を `'spinner' | 'bar'` にしました
- `src/components/Button.tsx`: `loadingIndicator` を `'overlay' | 'inline' | 'bar'` から `'spinner' | 'bar'` に変え、`inlineSpinner`（既定 `false`）を足しました。`overlay` だった見た目（ラベルに重ねる）は `loadingIndicator="spinner"` かつ `inlineSpinner={false}`（既定）に、`inline` だった見た目は `inlineSpinner={true}` になります。`color="surface"` を `color="white"` にしました
- `src/components/TextField.tsx`・`src/components/Select.tsx`: 読み込み中の `loadingIndicator` を、`Button` と同じ `'spinner' | 'bar'` の型にそろえました
- 古い名前（`tone`・`overlay`・`inline`・`surface`）は、部品からも使う側のストーリー・比較のコードからも残さず置き換えました
- **分かっていること**: 警告の色のボタンは、まだ `color` に足していません。必要になったら足します（[ADR-0038](./0038-warning.md)）

## 原則への反映

反映なし。名前だけの決定で、見た目・構造は変わっていません。原則6（色は役割で持つ）の「利用者が選ぶ色」「状態の色」という区別、原則1（動いている印は薄くしない）の考え方は、そのまま当てはまります。

## 比較画像

見た目の比較はしていません。名前を変える決定で、見た目・構造は変えていないためです（[0013](./0013-secondary-color.md) と同じ理由）。
