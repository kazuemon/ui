# 0379. TimePicker の形（刻みの一覧が既定、時・分の列も選べる）

- ステータス: Accepted
- 日付: 2026-09-30
- ラウンド: 後半 ／ ループ外

## 背景

TimePicker（時刻を選ぶ部品）を作るにあたり、見た目の軸（398〜401）を比べる前に、部品の形を決める必要がありました。打ち込みは [ADR-0187](./0187-typed-field-series.md) で決めた TimeField（区切りごとに打つ欄）がすでにあります。TimePicker では、これに面（刻みごとの一覧、または時・分の列）を組み合わせる形を決めました。

## 候補

| 項目                | 候補                                                                                                                               |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 面の形              | 刻みごと（15 分刻みなら 10:00・10:15・10:30…）の 1 列の一覧と、時・分（12 時間制では午前・午後、秒を出すときは秒も）を別々に選ぶ列 |
| `minuteStep` の粒度 | 1 列の一覧のまま細かい刻み（`minuteStep` を 1 などにする）を許す案と、細かい刻みは列の形（`variant="columns"`）を勧める案          |
| 面の浮かべ方        | DatePicker（[ADR-0373](./0373-date-picker-foundation.md)）と同じ、`src/internal/picker/PickerOverlay.tsx` の仕組みを共有する案     |

## 決定

**既定は刻みごとの 1 列の一覧（`variant="list"`）にします。** 時・分の列（`variant="columns"`）も選べます。`minuteStep` の既定は **15** です。面は DatePicker と同じ仕組み（`PickerOverlay`）を共有し、浮かべるときは Popover と同じ見た目、指で操作していて画面が狭いときはシートにします（[原則 16](../principles.md#16-重なる面は指の動きで浮かべるかシートにする)）。

- 1 列の一覧は `minuteStep` が小さいほど項目が増えます（1 分刻みで 1440 項目）。Docs では `variant="columns"` を勧め、開発中は `variant="list"` で `minuteStep` が 5 未満のとき警告を出します
- DatePicker と違い、面を開いてもフォーカスは欄に残したまま Base UI が項目へフォーカスを移します（`moveFocus`）。カレンダーは自分でフォーカスを動かすため、この違いは `PickerOverlay` の呼び出し側のオプションで吸収します

## 理由

1 列の一覧は、時刻を選ぶ体験として自然ですが、`minuteStep` を細かくすると仮想化なしでは重くなります。ユーザーの返事の原文です。

> TimePicker で minuteStep 1 にするとかなり重いですね。virtual list が必要だったりしますか？

これに対し、次の形に決まりました。

> minuteStep: B（Docs で columns を勧め、list で minuteStep < 5 なら開発中に警告）

仮想化は今回作らず、細かい刻みには時・分を別々に選ぶ列（項目数が時 24 × 分 60 のように積にならず、和で済む）を勧める形にしました。

## 却下した案と理由

- **1 列の一覧に仮想化を組み込む**: 採りませんでした。仮想化はスクロール位置の初期表示（[ADR-0380](./0380-time-picker-scroll.md)）や読み上げと合わせる作り込みが要り、今回の範囲を超えます。backlog に残します

## 影響

- `src/components/time-picker/TimePicker.tsx`: `variant`（`'list'`（既定）・`'columns'`）、`minuteStep`（既定 `15`）を持つ部品として新設しました
- `src/components/time-picker/TimeListbox.tsx`・`time-options.ts`: 1 列の一覧と、時・分・（12 時間制の午前午後・秒）の列の項目を作ります
- `src/internal/picker/PickerOverlay.tsx`: DatePicker と共有します（[ADR-0373](./0373-date-picker-foundation.md)）
- `src/index.ts`: `TimePicker` と props の型を公開しました
- 見た目の軸（398〜401）は [ADR-0380](./0380-time-picker-scroll.md)〜[0383](./0383-time-picker-popup-width.md) で決めました
- backlog に、細かい `minuteStep` のための仮想化を、まだ検討していないこととして足します

## 原則への反映

反映なし。TimeField・重なる面の判定（原則 16）を組み合わせる決定で、いずれも既存の原則の範囲内です。

## 比較画像

画像はありません。部品の形の決定で、見た目の比較をしていないためです。
