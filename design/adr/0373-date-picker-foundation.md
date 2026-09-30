# 0373. DatePicker の形（欄＋暦のボタン＋面が既定、ボタンだけの形も選べる）

- ステータス: Accepted
- 日付: 2026-09-30
- ラウンド: 後半 ／ ループ外

## 背景

DatePicker（カレンダーで日付を選ぶ部品）を作るにあたり、見た目の軸（392〜396）を比べる前に、部品の形そのものを決める必要がありました。打ち込みは [ADR-0187](./0187-typed-field-series.md) で決めた DateField（区切りごとに打つ欄）がすでにあり、カレンダーは [ADR-0133](./0133-calendar-foundation.md)〜[0142](./0142-calendar-month-motion.md) の Calendar がすでにあります。DatePicker では、この 2 つをどう組み合わせるか、面をどう浮かべるかを決めました。

## 候補

| 項目           | 候補                                                                                                                                 |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 部品の形       | DateField（打ち込める欄）の右端にカレンダーを開くボタンを付ける形と、打てない表示だけのボタンで押すとカレンダーが開く形              |
| 面の浮かべ方   | Select・Combobox と同じ、欄の左端にそろえて下に出す面（浮かべるときは Popover と同じ見た目、指で操作していて画面が狭いときはシート） |
| 面を開くボタン | 欄の値に作用する suffix のボタン（[ADR-0168](./0168-field-suffix-acts-on-value.md)）にする案と、欄の外に独立したボタンとして置く案   |

## 決定

**既定は、DateField の右端にカレンダーを開くボタンを付けた形（`variant="field"`）にします。** 打てない表示だけのボタン（`variant="button"`）も選べます。面は Select・Combobox と同じ判定（[原則 16](../principles.md#16-重なる面は指の動きで浮かべるかシートにする)）で、浮かべるときは Popover と同じ見た目、指で操作していて画面が狭いときはシート（Drawer）にします。

- カレンダーを開くボタンは、欄の値に作用する suffix のボタンです（[ADR-0168](./0168-field-suffix-acts-on-value.md)）。読み取り専用では出しません（値を変える操作のため）
- `variant="button"` は、Select のボタンと同じ見た目の欄です。打てないので、カレンダーで選ぶことだけができます
- 面が開いているあいだ、欄はフォーカス中と同じ見た目を保ちます（Select の開いているあいだと同じ）
- DatePicker・TimePicker（[ADR-0379](./0379-time-picker-foundation.md)）で、欄の右端のボタンから面を開く仕組みを共有します（`src/internal/picker/PickerOverlay.tsx`）

## 理由

打ち込みとカレンダーの両方を作った以上、両方を組み合わせた形が要ります。一方で、フィルターの絞り込みのように、打ち込みを許さずカレンダーだけで選ばせたい場面もあるため、表示だけのボタンも変えられる形にしました。面の浮かべ方は、Select・Combobox がすでに持つ「指で操作していて画面が狭いときだけシートにする」判定（[ADR-0220](./0220-combobox-sheet.md)）をそのまま使えば、DatePicker のためだけの新しい判定を作らずに済みます。

## 却下した案と理由

- **単一の文字列として打たせる形**: [ADR-0187](./0187-typed-field-series.md) ですでに区切りごとの欄（DateField）に決めており、蒸し返しません
- **面を開くボタンを欄の外に置く**: 欄の値に作用するボタンは suffix に置く決まり（[ADR-0168](./0168-field-suffix-acts-on-value.md)）と合わないため、候補から外しました

## 影響

- `src/components/date-picker/DatePicker.tsx`: `variant`（`'field'`（既定）・`'button'`）を持つ部品として新設しました。中は DateField（`variant="field"` のとき）または表示だけのボタン（`variant="button"`）です
- `src/internal/picker/PickerOverlay.tsx`: 欄の右端のボタンから面を開く仕組みを DatePicker・TimePicker で共有します（`PickerOverlay`・`PickerTriggerButton`・`pickerOpenLook`）
- `src/index.ts`: `DatePicker` と props の型を公開しました
- 見た目の軸（392〜396）は [ADR-0374](./0374-date-picker-clear-button.md)〜[0378](./0378-date-picker-button-icon.md) で決めました

## 原則への反映

反映なし。DateField・Calendar・重なる面の判定（原則 16）を組み合わせる決定で、いずれも既存の原則の範囲内です。

## 比較画像

画像はありません。部品の形の決定で、見た目の比較をしていないためです。
