# 0375. DatePicker の面の内側の余白は、Popover と同じ 16px

- ステータス: Accepted
- 日付: 2026-09-30
- ラウンド: 後半 軸 393

## 背景

DatePicker（[ADR-0373](./0373-date-picker-foundation.md)）がカレンダーを浮かべる面の、内側の余白を決めました。面そのもの（白い面・細い輪郭・影）は Popover と同じです。

## 候補

比較は、決めた時点のコミット `df9e11d` の比較のストーリー（`design/stories/axis-393-date-picker-popup-padding.stories.tsx`）です。列は「開いた面（値あり）」「『今日』のボタンあり」です。

| 案              | 面の内側の余白                         |
| --------------- | -------------------------------------- |
| 現行版          | 8px（`--spacing` × 2）                 |
| A（採用・既定） | 16px（`--popover-padding` と同じ）     |
| B               | 4px（`--select-popup-padding` と同じ） |

## 決定

**A（16px。Popover と同じ余白）を既定にします。** 面そのものが Popover と同じ見た目なので、余白も Popover にそろえます。

## 理由

ユーザーの返事の原文です。

> 393 A でお願いします。一番余裕のある見た目だなと思いました。

## 却下した案と理由

- **現行版（8px）・B（4px。Select の一覧と同じ）**: 採りませんでした。月送りのボタンや日のマスが面の縁に近づきすぎ、Popover ほどの余裕が感じられませんでした

## 影響

- `design/tokens.css`: `--date-picker-popup-padding` を `var(--popover-padding)` にしました
- 比較のストーリーは消しました

## 原則への反映

反映なし。面の内側の余白の値の決定で、既存の面の余白（Popover）にそろえただけです。原則が新しく扱う対象は増えていません。

## 比較画像

![DatePicker の面の余白の比較。現行版・A・B を、開いた面（値あり）・「今日」のボタンありの 2 列で並べたもの。A に採用の印](./assets/0375-date-picker-popup-padding.png)

決めた時点のコミットは `df9e11d` です。`git checkout df9e11d && pnpm storybook` で、比較のストーリー（`Design Review/393 DatePicker の面の余白`）を決めたときの部品のまま開けます。
