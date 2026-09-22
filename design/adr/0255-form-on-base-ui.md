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

実装しました（2026-09-22）。

- `src/internal/field/Field.tsx`: `FieldProps` に `name`・`validate`・`validationMode`・`validationDebounceTime` を足し、`BaseField.Root` に渡します。`FieldValidationMode`（`'onSubmit'|'onBlur'|'onChange'`）と `FieldValidate` の型をここで宣言し（ADR-0250 のとおり、Base UI の props の型は継がない）、`src/index.ts` から公開します。
  - 本体（`children`）と下の行（エラー・警告・成功・情報）は、`BaseField.Root` の子の `FieldBody` に移しました。`BaseField.Root` の中でだけ、公開の `BaseField.Validity`（render prop で欄の `validate`・ネイティブの制約の結果 `error`・`errors` を渡す）が使えるためです
  - Form の `errors[name]`（サーバーのエラーなど）は、`BaseField.Validity` の `error`・`errors` には合流しません（`getCombinedFieldValidityData` は `state.valid` だけを外の `invalid` と組み合わせ、文はそのまま。合流させているのは Base UI 自身の内部の `Field.Error` だけです）。公開の部位にこれを読む形がないため、`useFormFieldErrors`（`useFormContext().errors` を返すだけの薄い関数）だけ、内部の `@base-ui/react/internals/form-context` を読みます。ファイル先頭に「Base UI を上げるとき、この internals の形が変わっていないか確かめる」旨のコメントを置きました。`name`・`disabled` は呼び出し側の props をそのまま使うので、`@base-ui/react/internals/field-root-context` は読んでいません
  - `mergeBaseFieldError`（`useFormFieldErrors` の結果と `BaseField.Validity` の `validity`・呼び出し側の `name`・`disabled` を受け取る、フックではない純粋な関数）は、Form の `errors`（name で一致した文。優先）と、欄の `validate`・ネイティブの制約の結果を、Base UI の `Field.Error` と同じ順で 1 つの ReactNode にまとめます。フックでないので `BaseField.Validity` の render prop の中でも呼べます。これを `errorText`（`error` prop）と `??` で合わせ、既存のエラーの行（`FieldMessageLine`）にそのまま出します。行・読み上げ・動きは増やしていません
  - `Checkbox`（1 つだけ置くとき）・`Switch` は `Field` を通りませんが、同じく `BaseField.Root` を直に使っており、`required` などのネイティブの検証は Form の中で同じく効くため、`mergeBaseFieldError`・`useFormFieldErrors` をここでも使うよう直しました（`ChoiceSoloFields`・`SwitchErrorLine`）。`Checkbox` の `aria-describedby` は、Base UI が見つけたエラーの有無を見て組みます（`Switch` は `errorText` だけで組む、もとの形のままです）
- `src/internal/field/input-field-props.ts`: `InputFieldProps` に `validate`・`validationMode`・`validationDebounceTime` を足しました（`name` はもともと `ComponentProps<'input'>` などから継いでいたので、型の追加はなく、各部品で `BaseField.Root` まで届くようにしただけです）
- `src/components/form/Form.tsx`: `@base-ui/react/form` の `Form`（`BaseForm`）を土台に作り直しました。公開 props に `errors?: FormErrors`（`export type FormErrors = Record<string, string | string[]>`）・`onFormSubmit?: (values: Record<string, unknown>) => void`（1 引数。ADR-0243 のとおり `eventDetails` は渡しません）・`validationMode?: FieldValidationMode` を足しました。`onClearErrors`（Base UI の内部の `clearErrors` に相当するもの）は、Base UI 1.8 の `Form.Props` に存在しない（`FormContext.clearErrors` は内部専用で、`<Form>` の props からは渡せません）ため、足していません
  - `submitCount`・押した送信のボタン・フォーカスのあった場所は、`onSubmitCapture`（新しく足した）で数えます。Base UI 自身の検証（`required`・`validate`）は、送信のたびに `onSubmit`（Base UI が包むほう）より先に全欄を確かめ、正しくない欄があれば先にそこへフォーカスを移して `onSubmit`・`onFormSubmit` を呼ばずに止めるため、アプリの `onSubmit`（既存の DOM のイベント）だけを数える形だと、この場合に一覧やフォーカスの仕組みが動きませんでした。`onSubmitCapture` に移したことで、Base UI 自身が止めたときも、更新されたあとの行（欄の validate・ネイティブの制約の文を含む）から一覧を組み、フォーカスを移せます
  - 一覧（`showErrorSummary`）は、`design/adr/0044` のときと同じく `src/components/form/form-dom.ts` の DOM の読み取り（`collectErrors`）のままです。Base UI 自身が確かめた 1 欄ごとの結果（`formRef.current.fields` の `validityData`）は Base UI の内部の ref にあり、Form の外（利用者の Form コンポーネント）からは読めません。一方、`Field`/`Checkbox`/`Switch` の直しにより、Base UI が見つけたエラーはどれも `errorText` と同じ行（`data-slot="field-message"][data-kind="error"]`）に出るため、DOM の読み取りだけで `errorText`・`errors`・`validate`・ネイティブの制約の 4 つの発生源を一度に拾えます。データから組み直すより、この DOM の読み取りのほうが、Base UI が内部で持つ検証結果に依存しません
- `src/components/select/Select.tsx`・`src/components/combobox/Combobox.tsx`・`src/components/autocomplete/Autocomplete.tsx`・`src/components/tags-input/TagsInput.tsx`（`name` だけ。`validate` は部品にすでに同名の別の意味の prop があるため見送り）・`src/components/text-field/TextField.tsx`・`src/components/textarea/Textarea.tsx`・`src/components/number-field/NumberField.tsx`・`src/components/mask-field/MaskField.tsx`・`src/components/pin-field/PinField.tsx`・`src/components/date-field/DateField.tsx`・`src/components/time-field/TimeField.tsx`・`src/components/checkbox/CheckboxGroup.tsx`・`src/components/radio/Radio.tsx`（`RadioGroup`）: `Field` の新しい props を、渡された `name`・追加した `validate`・`validationMode`・`validationDebounceTime` として通します
- 分かったこと（実装で判明): `BaseField.Root` を使う部品（Field を通るかどうかによらず、Checkbox・Switch を含め既存のもの全部）は、`<Form>` の中に置かれると、`required` などのネイティブの制約も Base UI 自身が送信のたびに確かめるようになります。正しくない欄があれば、Base UI 自身が先にその欄へフォーカスを移し、アプリの `onSubmit`・`onFormSubmit` は呼ばれません。もとの実装（素の `<form noValidate>`）ではこの検証が効かず、「値を確かめるのはアプリ」（`onSubmit` の中で決める）が唯一の経路でしたが、Base UI の Form は、登録された欄をこの形で必ず検証します（欄ごとに外す設定はありません）。文はブラウザの既定（ローカライズされた `validationMessage`）になるので、アプリが決めた文を出したいときは、その欄に `validate` を渡してください（`required` は見た目の印と `aria-required` のためにそのまま残せます）。`src/stories/required-mark.stories.tsx`・`src/components/checkbox/Checkbox.stories.tsx` の該当するストーリーを、この挙動に合わせて直しました

## 原則への反映

反映なし。フォームの検証の土台を Base UI に寄せる決定で、原則の文は変えていません。

## 比較画像

比較画像はありません。フォームの土台の決定で、見た目の比較はしていないためです（[0013](./0013-secondary-color.md)・[0051](./0051-prop-names.md)と同じ理由）。
