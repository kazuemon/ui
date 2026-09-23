# 0305. ImageZoom の拡大した面は src/internal/image-zoom へ移し、Gallery と共有する

- ステータス: Accepted
- 日付: 2026-09-23
- ラウンド: 後半（軸外。Gallery の作りはじめに決まりました）

## 背景

ImageZoom を作ったとき（[ADR-0273](./0273-image-zoom-surface.md)〜[ADR-0281](./0281-image-zoom-caption-motion.md)）から、拡大した面（`ImageZoomViewer`。後ろの面・開閉の動き・閉じ方・キャプションの出方）は Gallery とも共有する前提で作ってあり（backlog にそのメモがありました）、`src/internal/` へ移すのは Gallery を作るときにする、としていました。Gallery を作る番になったので、実際に移しました。

## 候補

| 案                                             | 内容                                                                                           |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| src/internal/image-zoom へ移し共有する（採用） | ImageZoom・Gallery のどちらも同じ `ImageZoomViewer`・押す口の見た目（`zoom-trigger.ts`）を使う |
| ImageZoom の中に残し、Gallery は別に作る       | 2 つの部品で拡大した面の見た目が離れていくおそれがある                                         |

## 決定

**拡大した面一式（`ImageZoomViewer`・押す口の見た目・アイコン）を `src/internal/image-zoom/` へ移しました。ImageZoom はこの internal を使う薄い部品になり、Gallery も同じ internal を使って前後に送る機能を足します。ImageZoom 自体の見た目は変えていません。**

## 理由

Gallery は「画像を並べ、押すと拡大して見る」という点で ImageZoom と同じ土台を必要とし、違うのは「前後に送れること」「並べたときの間隔・比・列」だけです。後ろの面の色とぼかし（[ADR-0273](./0273-image-zoom-surface.md)）、開閉の動き（[ADR-0274](./0274-image-zoom-motion.md)）、閉じる × の形（[ADR-0275](./0275-image-zoom-close.md)）、キャプションの出方（[ADR-0281](./0281-image-zoom-caption-motion.md)）を 2 つの部品で別々に持つと、あとから一方だけ直して見た目がずれるおそれがあります。1 つの internal にまとめることで、ImageZoom で決めた見た目がそのまま Gallery にも引き継がれます。

## 影響

- `src/internal/image-zoom/ImageZoomViewer.tsx`・`zoom-trigger.ts`・`image-zoom-icons.tsx`・`slide-motion.ts`・`use-swipe-close.ts`・`zoom-geometry.ts`: `src/components/image-zoom/` から移しました
- `src/components/image-zoom/ImageZoom.tsx`: この internal を使う薄い部品になりました（見た目は変えていません）
- `src/components/gallery/Gallery.tsx`: 同じ `ImageZoomViewer` を使い、前後に送る機能（[ADR-0288](./0288-gallery-slide-motion.md)〜[ADR-0289](./0289-gallery-controls-position.md)）を足しました

## 原則への反映

反映なし。部品の内部の置き場所についての決定で、見た目・原則は変えていません。

## 比較画像

比較画像はありません。実装の置き場所についての決定で、見た目の比較はしていません。

決めた時点のコミットは `d58855f` です。
