# 0256. 待つ状態の語は `loading`、Form だけ `submitting`。値は `blocking`・`non-blocking` のまま

- ステータス: Accepted
- 日付: 2026-09-21
- ラウンド: ループ外（props の監査）

## 背景

「待っている」の語が 2 系統ありました。`loading`・`loadingIndicator`・`loadingBehavior`（ADR-0034・0042・0051）と、`Form` の `submitting`・`submittingBehavior` です。いまはどちらの `behavior` 系も値が `'blocking' | 'non-blocking'` で揃っています。ユーザーのメモには、react-query の `loading`（初回の読み込み）と `revalidating`（裏での再取得）のような分け方にしたい、`blocking`・`non-blocking` をそろえるかは再検討したい、とありました（N-21）。組み直した論点（R-08）では、値の名前をそのままにするか、肯定形（`lock`・`keep`）や真偽値（`lockWhileLoading`）にするかを比べました。

## 候補

| 案  | 内容                                                                                                            |
| --- | --------------------------------------------------------------------------------------------------------------- |
| a   | 値は `blocking`・`non-blocking` のまま、名前だけ `loadingBehavior`（欄）と `submittingBehavior`（Form）で分ける |
| b   | 値を `lock`・`keep` のような肯定形 2 語にする                                                                   |
| c   | 真偽値にする（`lockWhileLoading`・`lockWhileSubmitting`）                                                       |

## 決定

**a を採用します。「待っている」の語は `loading` に統一し、Form だけ `submitting`・`submittingBehavior` と明記します。送信は読み込みとは別の状態として扱います。値は `blocking`・`non-blocking` のまま変えません。**

## 理由

N-21 のメモです。

> react-query などで revalidating, loading が異なるのと同じような分け方としたいです。blocking, non-blocking をそろえるかは再検討したいです。

R-08 は、この a 案（値は現状維持、名前だけ Form を分ける）で採用されました。

## 却下した案と理由

- **値を `lock`・`keep` のような肯定形にする**（b）: 選ばれませんでした。否定形の `non-blocking` は消えますが、ADR-0042 で決めた語を変える理由がここでは見つからなかったため
- **真偽値にする（`lockWhileLoading`・`lockWhileSubmitting`）**（c）: 選ばれませんでした。[0239](./0239-show-hide-booleans.md)（出す／出さないの真偽値の規則）には乗りますが、既定がどちらかで名前が変わり、`loadingBehavior`・`submittingBehavior` という揃った形が崩れるため
- **Form も `loading`・`loadingBehavior` にそろえる**: 選ばれませんでした。「フォームが読み込み中」は誤読されやすいため

## 影響

- 改名はありません。`loading` 系（`Button`・`Select`・`Combobox`・`TextField`・`SearchField`・`PasswordField`・`MaskField`・`NumberField`・`PinField`・`DateField`・`TimeField`）と `Form` の `submitting`・`submittingBehavior` は、いまの名前・値のままです
- `design/review-checklist.md` に、「Form だけ `submitting`」の 1 行を足します

## 原則への反映

反映なし。名前を現状維持する決定で、見た目・構造は変えていません。

## 比較画像

比較画像はありません。名前を変えない決定で、見た目の比較はしていないためです（[0013](./0013-secondary-color.md)・[0051](./0051-prop-names.md)と同じ理由）。
