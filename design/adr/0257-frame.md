# 0257. `frame` は選択肢の囲み方で、値は部品ごと

- ステータス: Accepted
- 日付: 2026-09-21
- ラウンド: ループ外（props の監査）

## 背景

`frame` が、`Switch`（`'none' | 'card' | 'divided'`）と `CheckboxGroup`・`RadioGroup`（`ChoiceFrame` = `'none' | 'options' | 'notched' | 'all'`）で、別々の値の集合を指していました（N-24）。`CheckboxGroup` には `selectAllFrame` という 3 つめの `frame` もあります。組み直した論点（R-04）の表では、`appearance` を「面の見せ方」専用にしたときにほかの概念へ振り分ける議論とあわせて、`frame` の行も扱いました。

## 候補

| 案  | 内容                                                                                                                                                                  |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| a   | `frame` は「選択肢の囲み方」と定義し、値を `ChoiceFrame` に寄せる（`Switch` の `card`・`divided` を `options`・`all` に読み替えられるか、見た目を確かめてから決める） |
| b   | 部品ごとの値でよいと決め、型名（`SwitchFrame`・`ChoiceFrame`）で区別する                                                                                              |
| c   | `Switch` 側を `appearance` に寄せる                                                                                                                                   |

## 決定

**b を採用します。`frame` は「選択肢の囲み方」を表す名前のまま、値は部品ごとに持ちます。型名 `SwitchFrame`・`ChoiceFrame` で区別します。**

## 理由

R-04 の表で、`frame` の行の先頭の候補（推奨）どおりに決まりました。「frame のまま、値は部品ごと（型名 `SwitchFrame`・`ChoiceFrame` で区別）」が採用され、「値を group 側にそろえる」は採られませんでした。一言はありませんでした。

## 却下した案と理由

- **値を `ChoiceFrame` に寄せる**（a）: 選ばれませんでした。`Switch` の `card`・`divided` を `CheckboxGroup`・`RadioGroup` の `options`・`all` に読み替えられるかは、見た目を確かめてから決める必要があり、今回の監査の範囲では判断材料がありませんでした
- **`Switch` 側を `appearance` に寄せる**（c）: 選ばれませんでした。`appearance` ＝ 面の見せ方という定義（N-04）と衝突するため

## 影響

- 改名はありません。`Switch.frame`（型 `SwitchFrame`）、`CheckboxGroup.frame`・`RadioGroup.frame`（型 `ChoiceFrame`）は、いまの名前・値のままです

## 原則への反映

反映なし。名前を現状維持する決定で、見た目・構造は変えていません。

## 比較画像

比較画像はありません。名前を変えない決定で、見た目の比較はしていないためです（[0013](./0013-secondary-color.md)・[0051](./0051-prop-names.md)と同じ理由）。
