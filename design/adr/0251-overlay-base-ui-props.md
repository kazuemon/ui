# 0251. 重なる部品の Base UI の props の名前

- ステータス: Accepted
- 日付: 2026-09-21
- ラウンド: ループ外（props の監査）

## 背景

Popover・Menu・Select・Combobox には、Esc と外の押下を止める口がありませんでした（P-01）。Popover には `modal` がなく、中に入力やメニューを置いても焦点を閉じ込められません（P-08）。Drawer を「後ろを見せたまま開いたままにする」には `modal={false}` と `dismissible={false}` の 2 つを組む必要があり、片方だけでは触った瞬間に閉じます（P-16・M-23）。開いた直後に焦点を当てる `initialFocus` は内部固定で、閉じたあとの戻り先（`finalFocus`）がどこにもありません（P-10・M-19）。Dialog をシートで出すと、`dismissible` が「はじいて閉じる」まで兼ねてしまいます（P-30）。`initialFocus` に新しく付ける名前が、Combobox が既に持つ `sheetAutoFocus`（真偽値）と衝突します。

## 候補

| 項目                                                            | 現行版                                                 | 候補                                                                                                                                                         |
| --------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Popover・Menu・Select・Combobox の Esc・外の押下                | 止める口がない                                         | a. `onOpenChange` の第 2 引数に `{ reason, cancel() }` を足す／b. Dialog・Drawer と同じ `dismissible`・`closeOnEscape` を足す ← 推奨／c. 両方                |
| Popover の `modal`                                              | ない                                                   | a. `modal?: boolean \| 'trap-focus'` を足す ← 推奨／b. `modal` は Dialog の役目と割り切り、足さない                                                          |
| Drawer を後ろを見せたまま開く                                   | `modal={false}` と `dismissible={false}` の 2 つが要る | a. `mode?: 'modal' \| 'sticky' \| 'dismissible'` の 1 語にまとめる／b. `modal` に `'passive'`（裏を止めず、外を押しても閉じない）を足す／c. JSDoc に書くだけ |
| 閉じたあとの戻り先                                              | ない                                                   | a. `finalFocus` を Dialog・Drawer・Popover に足す ← 推奨／b. `initialFocus` も同じ形で開ける／c. そのまま                                                    |
| Dialog をシートで出したときの「外は押さないが、はじけば閉じる」 | `dismissible` が `closeOnSwipe` まで兼ねる             | a. このまま（意図した設計）と決めて ADR に書く ← 推奨／b. `closeOnSwipe` を Dialog にも足す                                                                  |
| 開いた直後に焦点を当てる要素の名前                              | 内部固定（`autofocus` 属性頼り）                       | a. `autoFocus` という名前にする／b. `initialFocus` のまま                                                                                                    |

## 決定

**重なる部品（Dialog・AlertDialog・Drawer・Popover・Menu・Tooltip・Select・Combobox）は、`dismissible`・`closeOnEscape`・`modal`・`autoFocus`・`returnFocus`・`onOpenChangeComplete`・`popupProps`・`positionerProps` を同じ名前・同じ型で持ちます。**

- `modal` は `true`・`false`・`'passive'` の 3 値です。`'passive'` は裏を止めず、外を押しても閉じません（Drawer の 2 props 問題は、この 1 値で解決します）
- Dialog に `closeOnSwipe` を足します（P-30 は「足す」を採用し、推奨の「このまま」は採りませんでした）
- 開いた直後に焦点を当てる要素は `autoFocus`（Base UI の `initialFocus` に相当）、閉じたあとの戻り先は `returnFocus`（`finalFocus` に相当）です
- Combobox の `sheetAutoFocus` は、新しい `autoFocus` と衝突するため `focusInputOnOpen` に改名します
- `actionsRef`・`keepMounted` は足しません

## 理由

M-19 のメモです。

> 名称は autoFocus にしたいです。

`autoFocus` を新しく置くと Combobox の `sheetAutoFocus` と衝突することを確かめたときの返事です。

> autoFocus: focusInputOnOpen でお願いします！

M-23（Drawer の `modal` を 1 つの値にする）と P-30（`closeOnSwipe` を Dialog にも足す）には、一言はありませんでした。artifact の verdicts では、M-23 は「Drawer は `modal="passive"` のような 1 つの値」、P-30 は「（おすすめと違う）`closeOnSwipe` を Dialog にも足す」として採用と記録されています。

## 却下した案と理由

- **`onOpenChange` の第 2 引数に `eventDetails` を足す**（P-01 の a）: 選ばれませんでした。Base UI の型をそのまま見せることになり、Docs の props の表に生の Base UI の形が出ます
- **Popover に `modal` を足さない**（P-08 の b）: 選ばれませんでした。中に入力やメニューを置く Popover が作れないままになります
- **Drawer の `mode` を 1 語にまとめる**（P-16 の a）: 選ばれませんでした。`modal` に `'passive'` を足す形（P-08 の候補と合流）で、新しい props 名を増やさずに解けます
- **`finalFocus` に加えて `initialFocus` も同じ形で開ける**（P-10 の b）: 選ばれませんでした。まず戻り先だけを足します
- **Dialog の `closeOnSwipe` はこのまま（意図した設計）**（P-30 の a、推奨）: 選ばれませんでした。「外は押さないが、はじけば閉じる」シートも作れるようにする方を採りました
- **`actionsRef`・`keepMounted` を足す**（P-11）: 決定の対象外としました。閉じる動きを外から待つ・面を残しておく需要は、今回の監査では見つかりませんでした

## 影響

- Dialog・AlertDialog・Drawer・Popover・Menu・Tooltip・Select・Combobox: `dismissible`・`closeOnEscape`・`modal`（`true`・`false`・`'passive'`）・`autoFocus`・`returnFocus`・`onOpenChangeComplete`・`popupProps`・`positionerProps` を直します
- Dialog: `closeOnSwipe` を足します
- Combobox: `sheetAutoFocus` を `focusInputOnOpen` に改名します
- 分かっていること: `actionsRef`・`keepMounted` は足しません

## 原則への反映

反映なし。[原則 15](../principles.md#15-読み上げは見た目の順フォーカスは次に触るものへ)（フォーカスは次に触るものへ）・[原則 16](../principles.md#16-重なる面は指の動きで浮かべるかシートにする)（重なる面は指の動きで浮かべるかシートにする）の文は変えていません。この決定は、その原則を実装する props の名前を揃えるものです。

## 比較画像

比較画像はありません。名前と API の決定で、見た目は変えていないためです（[0013](./0013-secondary-color.md)・[0051](./0051-prop-names.md)と同じ理由）。
