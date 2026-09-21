# 0253. JSDoc は全 props に 1 行、`@default` は値だけ、`children` は「何を入れるか」

- ステータス: Accepted
- 日付: 2026-09-21
- ラウンド: ループ外（props の監査）

## 背景

機械で数えたところ、JSDoc のない props が **94 件**ありました。`open`・`defaultOpen`・`onOpenChange` の三つ組（`Dialog`・`Drawer`・`AlertDialog`・`Popover`・`Menu`・`Tooltip`・`Collapsible` など）と `className` が、そのうち 30 件超を占めていました。`Select.label` のような必須 props にも説明がありませんでした（M-26）。既定値があるのに `@default` がない props が **4 件**（`SearchField.defaultValue`・`MaskField.defaultValue`・`PinField.slotLabel`・`PasswordField.toggleLabel`、M-27）、`@default` に日本語の説明や式が書かれたもの（`Link.tsx:174` の `@default 'round'（appearance="outline"）`、`Textarea.tsx:129` の `@default Math.ceil(...)` など、N-27）もありました。`children` だけが JSDoc を持たない props も複数の部品にありました（M-28）。

あわせて、見つけにくかった props も報告されていました。`presentation` は `ThemeProvider` でまとめて指定できますが、JSDoc からは分かりません（M-22）。`Button` の `render` は `@deprecated`（移動先は `Link`）なのに使われました（M-24）。`Button` の子に生のアイコンを置くと大きさが決まりません（M-25）。

## 候補

| 項目                                                  | 現行版                       | 候補                                                                                                                                                                                     |
| ----------------------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| JSDoc のない 94 件                                    | 部品ごとにばらつく           | a. `open`/`defaultOpen`/`onOpenChange` と `className` の定型文を決め、機械的に当てる ← 推奨／b. 必須の props（`Select.label` など）だけ先に埋める／c. 何もしない                         |
| `@default` の欠け 4 件・式や説明が書かれた `@default` | 揃っていない                 | a. `@default` は値（または式）だけを書き、条件は本文に移す ← 推奨／b. 条件付きの既定は `@default` を書かず、本文にだけ書く／c. 現状維持                                                  |
| `children` だけ JSDoc がない props                    | 未記載                       | a. 「何を入れるか」を 1 行書く ← 推奨                                                                                                                                                    |
| `presentation` の見つけにくさ                         | JSDoc に記載なし             | a. 各部品の `presentation` の JSDoc に「まとめて決めるときは `ThemeProvider` の `presentation`」を 1 行足す ← 推奨／b. `ThemeProvider` の Docs を「最初に読むもの」に置く／c. 何もしない |
| `Button` の `render`（`@deprecated`）                 | JSDoc に代わりの書き方がない | a. `ButtonProps.render` の JSDoc に代わりの書き方（`<Link appearance="button" render={<NextLink />}>`）を 1 行書く ← 推奨／b. 型として落とす（破壊的）／c. 何もしない                    |
| `Button` の子に生のアイコン                           | JSDoc に案内なし             | a. `children` の JSDoc に `Icon` で包むことを書く ← 推奨／b. `icon` prop を足す／c. 何もしない                                                                                           |

## 決定

**すべての props に 1 行の JSDoc を書きます。`@default` は値（または式）だけを書き、条件は本文へ移します。`children` は「何を入れるか」を書きます。`open`・`defaultOpen`・`onOpenChange` の三つ組は定型文にします。`ThemeProvider` でまとめて決められる props（`presentation` など）は、その旨を 1 行足します。`className` はどの要素に付くかを書きます。**

`Button` の `render` は、型からも落とします（`@deprecated` のまま残すのではなく削除し、JSDoc に「移動は Link」と書きます）。`Button` の `children` の JSDoc には、`Icon` の使い方（`<Icon icon={X} standalone />`）を書きます。

## 理由

M-24 のメモです。

> Button の説明に移動するものは Link を使ってね！と書いておくのがよさそうです。

M-26（94 件の定型文）・M-27（`@default` 4 件）・M-28（`children` の欠け）・N-27（`@default` の書き方）・M-22（`presentation` の 1 行）・M-25（`Icon` の案内）は、いずれも artifact の verdicts で「採用」として記録されており、これ以上の一言はありませんでした。

## 却下した案と理由

- **必須の props だけ先に埋める**（M-26 の b）: 選ばれませんでした。定型文で機械的に当てれば、94 件のうち 30 件超（三つ組と `className`）が一度に片付くため
- **条件付きの既定は `@default` を書かず、本文にだけ書く**（M-27・N-27 の b）: 選ばれませんでした。「値（または式）だけを書き、条件は本文へ移す」ほうが、Storybook の `argTypes` の `table.defaultValue` にそのまま入り、Docs の表にも既定が出ます
- **`Button` の `render` を `@deprecated` のまま残す**（M-24 の c）: 選ばれませんでした。型として落とし、JSDoc に移動先だけを書きます
- **`Button` に `icon` prop を足す**（M-25 の b）: 選ばれませんでした。`Tab` には `icon` がありますが、`Button` は JSDoc の案内で足りると判断しました

## 影響

- 全部品: JSDoc のない 94 件（`src/components/menu/MenuItem.tsx`・`src/components/select/Select.tsx`・`src/components/combobox/Combobox.tsx`・`src/components/number-field/NumberField.tsx`・`src/components/time-field/TimeField.tsx`・`src/components/date-field/DateField.tsx` などに集中）に、定型文または個別の 1 行を足します
- `SearchField.defaultValue`・`MaskField.defaultValue`・`PinField.slotLabel`・`PasswordField.toggleLabel`: `@default` を 1 行足します
- `Link.tsx`・`Textarea.tsx`・`NumberField.tsx`・`MenuItem.tsx` ほか（N-27 の 9 部品）: `@default` から条件・式を外し、値だけにします
- `PortalProps.children`・`ListItemProps.children`・`CardBodyProps.children`・`CalloutProps.children`・`ToastProviderProps.children`・`StepsProps.children`・`StepProps.children`・`TimelineProps.children`・`RadioGroupProps.children`・`FieldAddonButtonProps.children`・`ThemeProviderProps.children`・`RelativeTimeProps.children`: 「何を入れるか」を 1 行足します
- `presentation` を持つ部品（Dialog・AlertDialog・Drawer・Popover・Menu・Select・Combobox）: JSDoc に `ThemeProvider` でまとめて指定できる旨を 1 行足します
- `Button`: `render` を型から削除し、`children` の JSDoc に `Icon` の使い方を足します

## 原則への反映

反映なし。JSDoc の書き方だけの決定で、見た目・構造は変えていません（`Button.render` の型からの削除のみ、公開 API の変更を伴います）。

## 比較画像

比較画像はありません。JSDoc の書き方の決定で、見た目は変えていないためです（[0013](./0013-secondary-color.md)・[0051](./0051-prop-names.md)と同じ理由）。
