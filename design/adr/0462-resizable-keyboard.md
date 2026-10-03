# 0462. Inspector と表の列の resizable。キーボードと読み上げ

- ステータス: Accepted
- 日付: 2026-10-02
- ラウンド: 後半（トリアージ F46・F110）

## 背景

Inspector の幅と表の列の幅を、ユーザーが変えられるようにします（`resizable`）。操作と読み上げの形を Sidebar（[ADR-0362](./0362-sidebar-resize.md)）にそろえました。

## 決定

- **キーボード**: つまみにフォーカスして ← → で 16px ずつ、Home・End で最小・最大にします（表の列は上限を渡したときだけ End）。ダブルクリックではじめの幅に戻します
- **読み上げ**: `role="separator"`（縦）で、名前・いまの幅（`aria-valuenow`）・最小・最大を読みます
- **共有**: Sidebar のつまみを `src/internal/resize-handle` へ移し、Sidebar・Inspector・DataTable の列で同じつまみを使います。見た目は [ADR-0461](./0461-resize-handle.md) です

## 理由

ユーザーの返事の原文です（F110）。

> 幅をユーザーが変えられる、とかも実装したいですね。

## 影響

- `src/internal/resize-handle/ResizeHandle.tsx`、`src/components/inspector/Inspector.tsx`、`src/components/data-table/DataTableHeader.tsx`
- 変えた幅は部品の中では覚えません。使う側が `onWidthChange` などで保存します
- 表の列で幅を外で持つ（数の `width` を渡す）ときは、ダブルクリックで戻す先として `defaultWidth` も渡します。渡さないと、ダブルクリックしても幅は変わりません。`onWidthChange(undefined)` で「既定に戻す」を伝える案は、受ける側がみな undefined を扱うことになるので採りませんでした（レビューで「お勧めで」）

## 原則への反映

反映なし。操作と読み上げは、Sidebar の決定の範囲です。

決めた時点のコミットは、実装が `83ce491`（共有の移動は `94a28a0`）です。
