# 0249. シートの高さは、Drawer は detent、Select・Combobox は sheetDetent

- ステータス: Accepted
- 日付: 2026-09-21
- ラウンド: ループ外（props の監査）

## 背景

props の命名監査（`naming-analysis.md` N-19）で、シートの高さという同じ概念に 2 つの名前があることが分かりました。

- `src/components/drawer/Drawer.tsx:42` — `detent?: DrawerDetent;`
- `src/components/select/Select.tsx:154` — `sheetDetent?: SheetDetent;`
- `src/components/combobox/Combobox.tsx:291` — `sheetDetent?: SheetDetent;`
- `src/components/autocomplete/Autocomplete.tsx:313` — `sheetDetent?: SheetDetent;`
- `src/components/tags-input/TagsInput.tsx:316` — `sheetDetent?: SheetDetent;`

`Drawer` は本体がつねにシートです。`Select`・`Combobox`・`Autocomplete`・`TagsInput` は、浮かべる選択肢（popover）とシートの 2 つの形態を持ち、シートはそのうちの片方です。`Combobox` にはほかにも `sheetInput`（`Combobox.tsx:263`）・`sheetAutoFocus`（`:270`）・`sheetCloseText`（`:283`）と、`sheet` を接頭辞にした props がすでにあります。

## 候補

| 案                | 内容                                                                                                                           |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 現行版            | `Drawer` は `detent`、`Select`・`Combobox`・`Autocomplete`・`TagsInput` は `sheetDetent`                                       |
| A（採用＝現行版） | 現行版のまま。「その部品自体の軸は裸、内側に持つシートの軸は `sheet` 接頭辞」という一般則として明文化する                      |
| B                 | すべて `detent` にそろえる（`Select`・`Combobox` には浮かべる選択肢とシートの 2 形態があるので、どちらの高さか分からなくなる） |
| C                 | すべて `sheetDetent` にそろえる（`Drawer` は必ずシートなので冗長になる）                                                       |

## 決定

**現行版のまま採用します。本体がシートの `Drawer` は `detent`、シートにもなる `Select`・`Combobox`・`Autocomplete`・`TagsInput` は `sheet` を接頭辞にした `sheetDetent` です。**

「その部品自体の軸は裸の名前、内側に持つシートだけの軸は `sheet` 接頭辞」を一般則として明文化します。`Combobox` の `sheetInput`・`sheetAutoFocus`・`sheetCloseText` も同じ理屈で説明が付きます。

## 理由

`decisions-memo.md` の判定は「採用」で、一言はありませんでした。`naming-analysis.md` の直し方の候補のうち、【おすすめ】として示されていた案（現行版のまま、一般則として説明を付ける）がそのまま採られています。

## 却下した案と理由

- **すべて `detent` にそろえる**: 検討されていません（一言なし）。`naming-analysis.md` の直し方の候補にある理由（`Select`・`Combobox` は浮かべる選択肢とシートの 2 形態を持つため、`detent` だけでは指している高さが読めない）がそのまま残ります
- **すべて `sheetDetent` にそろえる**: 検討されていません（一言なし）。`Drawer` は必ずシートなので、`sheet` を付けると冗長になります

## 影響

改名はありません。`design/props.md` の語彙表に「`detent`／`sheetDetent`: シートの高さ。本体がシートの `Drawer` は `detent`、シートにもなる `Select`・`Combobox` は `sheet` の接頭辞」という一般則を明文化します。

## 原則への反映

反映なし。すでにある命名を追認しただけの決定で、見た目・構造は変えていません。

## 比較画像

なし。名前の決定で、見た目は変えていません（ADR-0013・ADR-0051 と同じ理由）。
