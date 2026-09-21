# 0252. 共有の型はその名前のまま公開し、部品ごとの別名を作らない

- ステータス: Accepted
- 日付: 2026-09-21
- ラウンド: ループ外（props の監査）

## 背景

`MeterColor`・`MeterSize`・`MeterRegionColor`・`BarColor`（Progress の `color`）・`TabsIndicator`・`TabsIndicatorMotion`・`Align`（`TableCell`）・`StepperLabels` などが `src/index.ts` から出ていませんでした（N-17）。`SelectColor = ListboxColor`・`DrawerSide`（実体は `SheetSide`）のように、公開名と d.ts に出る実体名が食い違う型もありました。`design/review-checklist.md:54` の「公開するものを `src/index.ts` に足す。部品と props の型の両方」は、決定済みなのに未反映のままでした。あわせて、`Field` そのもの（`src/internal/field/Field.tsx`・`input-field-props.ts`）も公開されておらず、自作の欄を同じラベル・キャプション・エラーの並びで作れませんでした（M-13）。

## 候補

| 項目                                                                          | 現行版                     | 候補                                                                                                                                                                                                                                       |
| ----------------------------------------------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 公開されていない型（`MeterColor`・`BarColor`・`TabsIndicator`・`Align` ほか） | 部品ごとに公開の有無が違う | a. すべて `<部品名><軸名>` の別名を公開する（いまの Select・Drawer 方式に寄せる）／b. 共有の型はその名前のまま公開し、部品ごとの別名を作らない ← 推奨／c. props に現れる型は必ず `index.ts` から出す、とだけ決める（名前はどちらでもよい） |
| `Field`（欄の土台）                                                           | 非公開                     | a. `Field` を公開し、自作の欄を包めるようにする／b. `InputFieldProps` の型だけを公開し、見た目は出さない ← 推奨／c. 出さない（自作の欄は `className` で組む）                                                                              |

## 決定

**共有の型（`ListboxColor`・`NoticeColor`・`ChoiceColor`・`SheetDetent`・`SheetSide`）は、その名前のまま公開します。部品ごとの別名（`SelectColor = ListboxColor`・`DrawerSide`）は作りません。props に現れる型は、すべて `src/index.ts` から公開します。**

`InputFieldProps` も型だけを公開します。`Field` 自体の公開は、Fieldset を作るときに検討します。

## 理由

N-17 は採用（一言はありませんでした）。artifact の verdicts に「N-17 採用 共有の型はその名前のまま公開、部品ごとの別名を作らない」として記録されています。

M-13 のメモです。

> 将来的には Fieldset を作るので、Field 自体の公開はその際に検討する。

## 却下した案と理由

- **すべて `<部品名><軸名>` の別名を公開する**: 選ばれませんでした。利用者から見て部品ごとに閉じますが、別名が 10 個以上増え、d.ts に出る名前と Docs の名前がまた食い違います
- **名前はどちらでもよいと決め、公開の有無だけをテストで確かめる**: 選ばれませんでした。名前の不一致（`SelectColor = ListboxColor` のような別名）が残ります
- **`Field` を公開し、自作の欄を包めるようにする**: 選ばれませんでした。見た目まで公開すると、いま決めていないこと（Fieldset の形）を先に決めることになります

## 影響

- `src/index.ts`: `MeterColor`・`MeterSize`・`MeterRegionColor`・`BarColor`・`TabsIndicator`・`TabsIndicatorMotion`・`Align`（`TableCell`）・`StepperLabels`・`MaskTokens`・`CollisionAvoidance`・`ListboxItem`・`InputFieldProps` を足します
- `Select`・`Drawer`・`DateField` ほか: `SelectColor = ListboxColor`・`DrawerSide`（実体 `SheetSide`）・`DateFieldColor`（実体 `DateSegmentColor`）のような別名を、実体の名前にそろえます
- 分かっていること: `Field` そのものの公開は、Fieldset を作るときに改めて検討します

## 原則への反映

反映なし。名前と公開範囲だけの決定で、見た目・構造は変えていません。

## 比較画像

比較画像はありません。名前と API の決定で、見た目は変えていないためです（[0013](./0013-secondary-color.md)・[0051](./0051-prop-names.md)と同じ理由）。
