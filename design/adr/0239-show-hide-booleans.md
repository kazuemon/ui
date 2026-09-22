# 0239. 出す／出さないの真偽値は、既定と逆の語で show<何>・hide<何>

- ステータス: Accepted
- 日付: 2026-09-21
- ラウンド: ループ外（props の監査）

## 背景

「出すかどうか」を表す props が、裸の名詞（`arrow`・`track`・`closeButton` など 15）・`show*`（4）・`hide*`（1）の 3 系統で書かれていて、真偽値だと推測しにくくなっていました。`icon`・`chevron`・`disabledIcon` は、値の列挙で出す／出さないを表していました。

## 候補

| 案     | 内容                                                                        |
| ------ | --------------------------------------------------------------------------- |
| 現行版 | 裸の名詞（15）・`show*`（4）・`hide*`（1）の 3 系統が混在                   |
| A      | 表のとおり改名する（既定と逆の語で `show<何>`・`hide<何>`。旧名は残さない） |
| B      | すべて `show<何>` にそろえ、既定値で出る／出ないを表す                      |
| C      | 現状維持                                                                    |

## 決定

**A を採用します。** 既定で出るものは `hide<何>`、既定で出ないものは `show<何>` にします。裸の名詞は使いません。どのアイコンかが名前から分かるようにします。3 値のもの（`Combobox` の `chevron`）と動きの切り替え（`closeOnClick`・`keepMounted`・`ellipsisMenu`）は、真偽値の規則の対象外です。

改名の一覧です。

| 部品                                 | いま                                        | 既定   | 改名後                                                                          |
| ------------------------------------ | ------------------------------------------- | ------ | ------------------------------------------------------------------------------- |
| Avatar・Figure・Image・ToastProvider | `outline`                                   | 出る   | `hideOutline`                                                                   |
| Pagination                           | `outline`                                   | 出ない | `showOutline`                                                                   |
| CodeBlock・CodeGroup                 | `copyButton`                                | 出る   | `hideCopyButton`                                                                |
| Dialog・Drawer                       | `closeButton`                               | 出る   | `hideCloseButton`                                                               |
| TextField ほか入力欄 10 部品         | `successMark`                               | 出る   | `hideSuccessMark`                                                               |
| Meter・Progress                      | `showValue`                                 | 出る   | `hideValue`                                                                     |
| Progress・TableOfContents            | `track`                                     | 出る   | `hideTrack`                                                                     |
| Tree                                 | `guides`                                    | 出る   | `hideGuides`                                                                    |
| TableOfContents                      | `guides`                                    | 出ない | `showGuides`                                                                    |
| ScrollArea                           | `edgeShadow`                                | 出る   | `hideEdgeShadow`                                                                |
| Tooltip                              | `shadow`                                    | 出る   | `hideShadow`                                                                    |
| Stat                                 | `deltaIcon`                                 | 出る   | `hideDeltaIcon`                                                                 |
| Calendar                             | `showOutsideDays`                           | 出る   | `hideOutsideDays`                                                               |
| Popover                              | `arrow`                                     | 出ない | `showArrow`                                                                     |
| Popover                              | `titleHidden`                               | 出る   | `hideTitle`                                                                     |
| Combobox                             | `groupSeparator`                            | 出ない | `showGroupSeparator`                                                            |
| Form                                 | `errorSummary`                              | 出ない | `showErrorSummary`                                                              |
| Pagination                           | `pageInput`                                 | 出ない | `showPageInput`                                                                 |
| PinField                             | `emptyDots`                                 | 出ない | `showEmptyDots`                                                                 |
| Stack                                | `divider`                                   | 出ない | `showDivider`                                                                   |
| Table                                | `columnLines`                               | 出ない | `showColumnDivider`（ユーザーの指定。おすすめの `showColumnLines` から変更）    |
| Select・Combobox                     | `disabledIcon: 'hide' \| 'show'`            | 出る   | `hideCaretOnDisabled`（ユーザーの指定。おすすめの `hideDisabledIcon` から変更） |
| SearchField                          | `icon: 'inline' \| 'none'`                  | 出る   | `hideSearchIcon`（ユーザーの指定。おすすめの `hideIcon` から変更）              |
| Combobox                             | `chevron: 'show' \| 'hide' \| 'empty-only'` | 出る   | 3 値なので真偽値にしない。`chevron: 'always' \| 'never' \| 'empty-only'` に     |
| TableOfContents・Textarea・TimeField | `hideLabel`・`showCount`・`showSeconds`     | —      | そのまま（規則どおり）                                                          |
| Pagination                           | `ellipsisMenu`                              | 出ない | 対象外（… をメニューにする動きの切り替え）                                      |

## 理由

ユーザーの返事の原文です。

> デフォルトと異なる場合のみ、その逆の show/hide であることが望ましいです。show** または hide** ではない命名は boolean であると推測が難しいです。

> hide or show は showDisabledIcon という形で boolean の値にしたいですね

3 件の名前について、続けて次の返事でした。

> Table.showColumnLines -> showColumnDivider。Select・Combobox.hideDisabledIcon -> hideCaretOnDisabled とかにしたいかもです。disabledIcon だと無効になっているアイコン？となって、どこのアイコンかイメージできないためです。SearchField.hideIcon -> hideSearchIcon

## 却下した案と理由

- **B（すべて `show<何>` にそろえる）**: 選ばれませんでした。既定と逆の語のほうが「書いてあれば既定と違う」と読めるため
- **C（現状維持）**: 選ばれませんでした。「show\*\* または hide\*\* ではない命名は boolean であると推測が難しい」ため

## 影響

上の表の改名を直します。旧名（裸の名詞、現行の `show*`・`hide*`）は残しません。

## 原則への反映

反映なし。props の名前の規則の整理で、見た目・振る舞いは変えていません。

## 比較画像

なし。名前の決定で、見た目は変えていません（[0013](./0013-secondary-color.md)・[0051](./0051-prop-names.md) と同じ理由）。
