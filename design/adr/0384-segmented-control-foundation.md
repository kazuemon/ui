# 0384. SegmentedControl は ToggleGroup と別の部品にする（ラジオのグループ、空にならない、下地が滑る）

- ステータス: Accepted
- 日付: 2026-09-30
- ラウンド: 後半 ／ ループ外

## 背景

README の「つくりたいもの」にあった Segmented Control を作るにあたり、すでにある ToggleGroup（[ADR-0263](./0263-toggle-group-frame.md)）との役割分担を決める必要がありました。ToggleGroup は複数の Toggle（押す・外すボタン）をまとめたもので、1 つだけ選ぶ使い方（表示の切り替え）でも、選んでいるものをもう一度押すと空になります（backlog に残していた未決事項）。

## 候補

| 項目         | 候補                                                                                                                  |
| ------------ | --------------------------------------------------------------------------------------------------------------------- |
| 土台         | Base UI の RadioGroup・Radio（role="radiogroup"・"radio"、矢印キーで移り、移った項目を選ぶ）と、Toggle の集まりのまま |
| 空にする扱い | 必ずどれか 1 つを選び、もう一度押しても外れない部品にする案と、ToggleGroup に「空にしない指定」を足す案               |
| 選んだ印     | 選んだ項目の下地（つまみ）を 1 つの要素として測り、選んだ項目の位置へ滑らせる案（Tabs の印と同じ長さ・緩急）          |

## 決定

**ToggleGroup とは別の部品 `SegmentedControl` を作ります。** 振る舞いと読み上げは Base UI の RadioGroup・Radio を土台にし、必ずどれか 1 つを選びます。選んでいるものをもう一度押しても、値は空になりません。

- 見た目は、入力欄と同じグレーの溝に、選んだ項目の下地（つまみ）を 1 つだけ置き、選んだ項目へ滑らせます（[原則 14](../principles.md#14-動きは手応えと待ちを伝える)。Tabs の印と同じ長さ・緩急）
- つまみの位置は `use-segmented-knob.ts` が測って CSS 変数に書きます。測るまでは選んだ項目が自分で下地を塗ります
- 項目は平らな押すものです（[原則 3](../principles.md#3-hover-は手応え押すと沈む)）。選んでいない項目は hover で本文の色を淡く敷き、押すと沈みます。選んだ項目は押しても変わりません
- 見た目の軸（403〜407）は [ADR-0385](./0385-segmented-control-knob.md)〜[0389](./0389-segmented-control-divider.md) で決めました

## 理由

表示の切り替え（ボード・表・カレンダー）のように、必ずどれかが選ばれている必要がある場面で、ToggleGroup は「もう一度押すと空になる」ため、見本のページでは空の値を無視する対処が要りました（design/backlog.md の ToggleGroup の節）。この用途は、押す・外すボタンの集まり（ToggleGroup）ではなく、ラジオの性質（必ず 1 つ）を持つ別の部品として作るほうが、Base UI の役割どおりの読み上げも得られます。

## 却下した案と理由

- **ToggleGroup に「空にしない指定」を足す**: 採りませんでした。ToggleGroup は押す・外すボタンの集まりで、読み上げも `button`（`aria-pressed`）です。必ず 1 つを選ぶ動作は、ラジオの読み上げ（`radiogroup`・`radio`）のほうが実態に合います

## 影響

- `src/components/segmented-control/SegmentedControl.tsx`・`SegmentedControlItem`・`use-segmented-knob.ts`: 新設しました。`value`・`defaultValue`・`onValueChange` を持つ、Base UI の RadioGroup を土台にした部品です
- `src/index.ts`: `SegmentedControl`・`SegmentedControlItem` と props の型を公開しました
- backlog の ToggleGroup の「空にしない指定」の項目は、SegmentedControl で答えられる形になったので書き換えます（Docs で案内するかも一緒に書きます）

## 原則への反映

反映なし。項目が平らな押すものであること（原則 3）、選んでいる印が部品の色に従うこと（原則 6）、まっすぐ移る印は滑らせること（原則 14）は、いずれも既存の原則の範囲内です。部品の範囲・土台の決定で、見た目の比較はしていません。

## 比較画像

画像はありません。部品の範囲と土台の決定で、見た目の比較をしていないためです。
