# 0240. 文字の props は label・accessibleName と、語尾 Label・Name・Text・Title で分ける

- ステータス: Accepted
- 日付: 2026-09-21
- ラウンド: ループ外（props の監査）

## 背景

`label` が「画面に見える見出し」「読み上げだけの名前」「Menu の照合文字」の 3 つの意味を持っていました。差し替える文言の props も `*Label` と `*Text` で割れていて、見える／読み上げだけ、の区別と一致していませんでした。`CopyButton` の `errorLabel` と `CodeBlock`・`CodeGroup` の `copyErrorLabel` もそろっていませんでした。

## 候補

| 案     | 内容                                                                                                                                             |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| 現行版 | `label` が見出し・読み上げ専用・照合文字の 3 役。文言の props は `*Label`・`*Text` の 2 系統で不揃い                                             |
| A      | 読み上げ専用の `label` を廃し、素の `aria-label` に任せる                                                                                        |
| B      | 読み上げ専用は `accessibleName` に改名。文言は `Label`（画面に出る短い文字）・`Name`（読み上げだけ）・`Text`（文章）・`Title`（題） に振り分ける |
| C      | 差し替える文言をすべて `Label` に寄せる                                                                                                          |
| D      | 改名せず、JSDoc の 1 文目を「画面に出る／出ない」で始める規約にする                                                                              |

## 決定

**B を採用します。** `label` ＝ 画面に出る見出し（読み上げの名前にもなります）。`accessibleName` ＝ 画面に出ない、読み上げだけの名前（`label` があれば自動で継承し、指定すると読み上げだけ変わります）。`<何>Label` ＝ 画面に出る短い文字（別の要素の見出し、ボタン自身の文字）。`<何>Name` ＝ 読み上げだけの名前。`<何>Text` ＝ 文章（画面に出るものも、読み上げで知らせるものも）。`<何>Title` ＝ 題。振り分けの一覧は下の表のとおりです（案 b。`prevLabel`・`nextLabel`・`actionLabel`・`cancelLabel` は `Label` のままにします）。`CopyButton`・`CodeBlock`・`CodeGroup` の写せなかった文言は `copyErrorText` にそろえます。

| 部品                                                 | いま                                                           | 何か                                | 改名後                                                     |
| ---------------------------------------------------- | -------------------------------------------------------------- | ----------------------------------- | ---------------------------------------------------------- |
| Dialog・Drawer・Menu・Notice・Popover・ToastProvider | `closeLabel`                                                   | × の読み上げの名前                  | `closeName`                                                |
| Menu                                                 | `backLabel`                                                    | 戻るボタンの読み上げの名前          | `backName`                                                 |
| Combobox                                             | `clearLabel`・`chipsLabel`・`chipRemoveLabel`                  | 読み上げの名前                      | `clearName`・`chipsName`・`chipRemoveName`                 |
| Chip                                                 | `removeLabel`                                                  | × の読み上げの名前                  | `removeName`                                               |
| PasswordField                                        | `toggleLabel`                                                  | 切り替えボタンの読み上げの名前      | `toggleName`                                               |
| Pagination                                           | `ellipsisLabel`・`pageInputLabel`・`pageLabel`・`summaryLabel` | 読み上げの名前・文                  | `ellipsisName`・`pageInputName`・`pageName`・`summaryText` |
| PinField・NumberField                                | `slotLabel`・`stepperLabels`                                   | 読み上げの名前                      | `slotName`・`stepperNames`                                 |
| Stat                                                 | `deltaLabel`                                                   | 増減の読み上げの文                  | `deltaText`                                                |
| CodeBlock・CodeGroup                                 | `copyLabel`                                                    | コピーのボタンの読み上げの名前      | `copyName`                                                 |
| CodeBlock・CodeGroup・CopyButton                     | `copiedLabel`・`copyErrorLabel`・`errorLabel`                  | 画面に出て読み上げる文              | `copiedText`・`copyErrorText`                              |
| Pagination                                           | `prevLabel`・`nextLabel`                                       | ボタン自身の文字                    | そのまま（案 b。`Label` のまま）                           |
| AlertDialog                                          | `actionLabel`・`cancelLabel`                                   | ボタン自身の文字                    | そのまま（案 b。`Label` のまま）                           |
| Select・Combobox                                     | `loadingText`・`loadedText`・`emptyText`                       | 文章（`loadedText` は読み上げだけ） | そのまま                                                   |
| Image・Figure・CardImage・Combobox                   | `errorText`・`sheetCloseText`                                  | 画面に出る文                        | そのまま                                                   |
| Form                                                 | `errorSummaryTitle`                                            | 題                                  | そのまま                                                   |
| Navbar                                               | `menuLabel`                                                    | 読み上げの名前 兼 開いた面の題      | `menuTitle`                                                |
| Meter・Progress                                      | `getValueText`                                                 | 値の文字を作る関数                  | そのまま（Base UI の名前）                                 |

## 理由

ユーザーの返事の原文です。

> accessibleName がよさそう。label があればデフォルトで継承、label の無いものは accessibleName を指定

> 別の要素を説明するのは Label、単なる説明の文章やエラーの文章は Text、読み上げだけの役割は Name とするのはどうでしょうか。

振り分け方の案 a・b のどちらかについては、次の返事です。

> buttonText より buttonLabel の方が馴染みある気がするので、一旦 b とします。また、label が指定されている場合は自動で name に反映される認識です（name を指定すると、読み上げの名前だけ変わる）

`CopyButton`・`CodeBlock`・`CodeGroup` の文言については、次の返事です。

> 現状は label, copiedLabel, errorLabel になっているのですね。それならおすすめで OK です。

## 却下した案と理由

- **A（素の `aria-label` に任せる）**: 選ばれませんでした。「accessibleName がよさそう」という返事のとおり、名前のある props として残しました
- **C（すべて `Label` に寄せる）**: 選ばれませんでした。読み上げ専用の役割を `Name` として区別する返事だったため
- **振り分けの案 a（ボタン自身の文字も `Text` にする）**: 選ばれませんでした。「buttonText より buttonLabel の方が馴染みある」という返事で、案 b（ボタンの文字は `Label` のまま）を採りました
- **D（改名せず JSDoc の規約にする）**: 選ばれませんでした

## 影響

読み上げ専用の `label` を持つ 11 部品（`Tree`・`Navbar`・`Breadcrumb`・`Pagination`・`Pager`・`Table`・`ScrollArea`・`Icon`・`Spoiler`・`HeadingAnchor`・`Badge`）を `accessibleName` に直します。上の表の改名を直します。`Menu` の項目の `label`（照合文字）は別名を検討します（typeahead 用。Base UI の `label` と同じ意味なので残す案もあります。未決）。

## 原則への反映

反映なし。文言を渡す props の名前の整理で、読み上げの仕組みや見た目そのものは変えていません。

## 比較画像

なし。名前と API の決定で、見た目は変えていません（[0013](./0013-secondary-color.md)・[0051](./0051-prop-names.md) と同じ理由）。
