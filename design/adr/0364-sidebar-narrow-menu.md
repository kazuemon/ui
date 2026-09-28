# 0364. Sidebar の狭い画面は、Drawer に加えて Menu と同じシートも選べる

- ステータス: Accepted
- 日付: 2026-09-29
- ラウンド: 実装を見てもらった直し

## 背景

狭い画面の Sidebar は、Drawer と同じ挙動（左右か下から出て、後ろを暗くする）に切り替わります（[ADR-0351](./0351-sidebar-narrow.md)）。この形とは別に、Menu の下から出るシートのように、入れ子の行を押すと中身が横に滑って入れ替わる見せ方も欲しいという指示を受けました。比較のラウンドは組まず、実装を見てもらって直しました。

## 候補

比較のストーリーは作っていません。

| 案        | 内容                                                                                       |
| --------- | ------------------------------------------------------------------------------------------ |
| A（既定） | 現行の Drawer の挙動。指定した向き（`narrowSide`）から開閉し、入れ子はその場で開け閉めする |
| B         | Menu と同じ下からのシート。入れ子の行を押すと、シートの中身が横に滑って入れ替わる          |

## 決定

**`Sidebar` の `narrowPresentation`（`'drawer' | 'menu'`、既定 `'drawer'`）を公開します。** `'drawer'`（既定）は、これまで通り Drawer で出し、`narrowSide` に従います。`'menu'` は、Menu と同じ下からのシートで出し、`narrowSide` は使いません。節（`SidebarSection`）は Menu の見出し付きのまとまりに、入れ子を持つ行は Menu の submenu になり、押すと同じシートの中で子の行にスライドしながら変わります。

## 理由

ユーザーの返事の原文です。

> Drawer については現在の挙動に加えて、Menu のように下から出てきて押すと項目がスライドしながら変わる、という挙動も選べるようにしたいですね。

Sidebar の入れ子は、Menu の submenu と同じ「押すと中身が入れ替わる」構造を持っています。すでに Menu にある部品をそのまま使うことで、狭い画面でも同じ滑る動きと読み上げの挙動を得られ、Sidebar 側に新しい開閉の仕組みを作らずに済みます。深さによらず面は 1 つのままにする決まり（原則16）にも合います。

## 影響

- `src/components/sidebar/Sidebar.tsx`: `narrowPresentation`（`SidebarNarrowPresentation`。`'drawer' | 'menu'`、既定 `'drawer'`）を公開します。`'menu'` のときは `Menu`（`presentation="sheet"`）に切り替え、`SidebarItem`・`SidebarSection` は `SidebarNavContext` の `mode: 'flyout'` を読んで、`Menu` の項目（`MenuItem`・`MenuLinkItem`・`MenuSubmenu`・`MenuGroup`）として描きます
- `src/components/sidebar/SidebarItem.tsx`: `mode: 'flyout'` のとき、件数（count）はバッジではなく「（n）」の形でラベルの後ろに付けます（`FlyoutItem` の `text`）
- 比較画像は撮っていません

## 原則への反映

反映なし。原則16「重なる面は、指の動きで浮かべるかシートにする」の、シートの中では面を 1 つに保つ決まりの通りです。

決めた時点のコミットは `93d44f5` です。
