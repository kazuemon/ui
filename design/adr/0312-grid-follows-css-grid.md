# 0312. Grid は、CSS Grid の動きに寄せる

- ステータス: Accepted
- 日付: 2026-09-24
- ラウンド: ループ外

## 背景

Grid で `columns` を渡さないとき、flexbox のように子が並んで折り返す動きにする案もありました。子の幅が中身で決まり、列がそろわない並びです。

## 決定

**Grid は CSS Grid の動きに寄せます。`columns` も `minColumnWidth` も渡さないときも、`minColumnWidth` の既定（240px）で列にそろえて並べ、flexbox のような流れにはしません。**

## 理由

ユーザーの返事の原文です。

> Grid は cssgrid の動きに寄せる前提で、一旦気にせずで OK です。

列がそろわない流れは、Stack（`direction` と折り返し）の仕事です。Grid は、行と列の格子に並べる部品として、子の高さのそろえ（[ADR-0308](./0308-grid-align.md)）・空いた列の残し方（[ADR-0309](./0309-grid-fill.md)）も CSS Grid の既定に揃えています。

## 影響

- `src/components/grid/Grid.tsx`: 列の数を入れ物の幅で決める形を既定にしています

## 原則への反映

反映なし。

## 比較画像

なし。
