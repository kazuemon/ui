# 0314. フォントを別の入口にし、和文フォントは同梱しない

- ステータス: Accepted
- 日付: 2026-09-24
- ラウンド: ループ外

## 背景

テーマ（`src/styles/theme.css`）が、Mulish・Geist Mono と、縦の寸法を補正した IBM Plex Sans JP（[0032](./0032-text-offset.md)）の `@font-face` を読み込んでいました。そのため、利用者向けの CSS を読むと、必ずフォントも読み込まれていました。

IBM Plex Sans JP の @fontsource のパッケージは 40MB あり、依存に入れると、使う側のインストールも重くなります。

## 候補

比較の候補はありません。

## 決定

- フォントをテーマから分け、別の入口にします
  - `@kazuemon/ui/fonts.css`: Mulish と Geist Mono。@fontsource のパッケージは、これまでどおり依存に入れます
  - `@kazuemon/ui/fonts-ja.css`: 縦の寸法を補正した IBM Plex Sans JP。フォントのファイルは、使う側が入れた `@fontsource/ibm-plex-sans-jp` を指します（`url(@fontsource/ibm-plex-sans-jp/files/…)`）
- `@fontsource/ibm-plex-sans-jp` は、任意の peerDependencies にします
- フォントを読み込まないときは、フォントの指定の続き（`ui-sans-serif, system-ui, sans-serif` など）で描かれます

## 理由

backlog（2026-09-20）に置いていた方針です。

> 和文フォントは重いので、ライブラリには同梱せず、使う側で別に読み込んでもらう形を推奨にします

以下は、読み取れることです。

- **読むかどうかを使う側が選べる**: 既に自分のフォントを配っているアプリや、日本語を出さないアプリでは読まずに済むようにします
- **補正は保つ**: `fonts-ja.css` を読めば、Storybook と同じ補正付きの和文フォントになります

## 却下した案と理由

- **和文フォントのファイルを dist に入れる**: 配布物が 40MB 近くになります
- **和文フォントの `@font-face` を配らず、使う側に @fontsource の CSS を直に読んでもらう**: 縦の寸法の補正（[0032](./0032-text-offset.md)）が効かなくなります

## 影響

- `src/styles/fonts.css` を足し、`theme.css` からフォントの読み込みを消しました。Storybook の `globals.css` と docs サイトは、フォントの入口を自分で読みます
- 使う側の `url()` がパッケージの名前から始まる書き方を、Vite と Next.js（Turbopack）がファイルとして解決することを確かめました
- `fonts-ja.css` は unicode-range の宣言だけで約 500KB あります（backlog に残しました）
- コミット: `319288a`

## 原則への反映

反映なし。見え方は変わっていません。

## 比較画像

画像はありません。配り方の決定で、見た目の比較をしていません。
