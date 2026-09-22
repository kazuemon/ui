# 0255. Form は Base UI の Form の上に作り直し、Field に `name`・`validate`・`validationMode` を通す

- ステータス: Accepted
- 日付: 2026-09-21
- ラウンド: ループ外（props の監査）

## 背景

`src/internal/field/Field.tsx` は `BaseField.Root` に `invalid`・`disabled`・`data-loading`・`data-success`・`className` しか渡しておらず、`name`・`validate`・`validationMode`・`validationDebounceTime` を 1 つも渡していませんでした。この `Field` を通る全部品が、同じ制約を継いでいます。`src/components/form/Form.tsx` は `@base-ui/react/form` を import しておらず、素の `<form>` のままでした（P-04）。サーバーのエラーを一括で流し込む口もなく、backlog には「`<Form>` は Base UI の Form を包まない自前の部品で、『一旦』の形です」とありました。Select には `name`・`form` もなく、素のフォームに値を出せません（P-03）。

## 候補

| 案  | 内容                                                                                                                                |
| --- | ----------------------------------------------------------------------------------------------------------------------------------- |
| a   | `Field` に `name`・`validate`・`validationMode` を通し、`Form` を Base UI の Form の上に作り直す（Select に `name`・`form` を足す） |
| b   | `Field` に `name`・`validate` だけ通す                                                                                              |
| c   | そのまま（エラーは各欄の `error` で受ける方針を ADR に書く）                                                                        |

## 決定

**a を採用します。`Field` に `name`・`validate`・`validationMode` を通し、`Form` を Base UI の Form の上に作り直します。Select に `name`・`form` を足します。**

## 理由

P-04 は採用（一言はありませんでした）。artifact の verdicts に「P-04 採用: Field に name・validate・validationMode を通し、Form を Base UI の Form の上に作り直す」として記録されています。

## 却下した案と理由

- **`Field` に `name`・`validate` だけ通す**（b）: 選ばれませんでした。`validationMode` を欠くと、欄ごとの検証のタイミング（`onBlur`・`onChange`・`onSubmit`）を選べないままになります
- **そのまま（エラーは各欄の `error` で受ける）**（c）: 選ばれませんでした。Base UI の宣言的なバリデーションが使えず、サーバーのエラーを Form に一括で流し込む口もない状態が残るため

## 影響

- `src/internal/field/Field.tsx`: `BaseField.Root` に `name`・`validate`・`validationMode`・`validationDebounceTime` を渡すよう直します
- `src/components/form/Form.tsx`: `@base-ui/react/form` の `Form` を土台に作り直します
- `src/components/select/Select.tsx`: `name`・`form` を明示 props として足します
- Form・Field を通る全入力欄（TextField・Textarea・NumberField・MaskField・PinField・DateField・TimeField・Select・Combobox・Checkbox・Radio 系・Switch）が影響を受けます
- 分かっていること: 設計を含む決定なので、実装は他の props の直しの最後に行います

## 原則への反映

反映なし。フォームの検証の土台を Base UI に寄せる決定で、原則の文は変えていません。

## 比較画像

比較画像はありません。フォームの土台の決定で、見た目の比較はしていないためです（[0013](./0013-secondary-color.md)・[0051](./0051-prop-names.md)と同じ理由）。
