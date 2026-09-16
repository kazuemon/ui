# design/tools

デザインの記録を作るための道具です。いまは、比較画像の撮影と、原則の書き方の確かめの2つを使います。

## 比較画像を撮る

ADR に添える比較画像は、比較のストーリーをそのまま撮ります。

```sh
node design/tools/capture-story.mjs design-review-NN-xxx--candidates \
  --pick A \
  --out design/adr/assets/NNNN-kebab-title.png
```

- Storybook をビルドし、ローカルで配信してストーリーだけを撮ります。ビルド済みのディレクトリがあれば、`--static-dir` で渡すとビルドを省きます（何枚も撮るときは、1回ビルドして使い回します）
- `--pick` で、採用した案に「採用」の印を付けます（現行版は `current`、複数は「,」区切り）。ストーリー側の `pick` の既定値でも同じことができます
- `--density coarse|fine` で密度を固定します。`--width`・`--height` で画像の大きさを決めます（既定は 1320×1500px）
- 高さは、撮る前にストーリーの中身の高さを測って渡すと、下が切れず、余白も残りません
- 動きを止めて撮ります（`prefers-reduced-motion`）。移り変わりの途中で撮られ、状態の見た目が出ないことがあるためです
- マウスで操作している環境（`hover: hover`、`pointer: fine`）として撮ります。撮影に使う headless Chrome は既定で「マウスなし」になり、hover の見た目が出ないためです。`--density coarse` のときは、指で操作している環境として撮ります
- 撮ったら、下端が切れていないかを目視で確認します

比較のストーリーは、決まったら消します（[`../adr/README.md`](../adr/README.md)）。画像と、ADR に書いた決めた時点のコミットが記録です。

## 原則の書き方を確かめる

`design/principles.md` に、原則に書かない種類の記述（数値・トークン名・props・メモの引用など）が混ざっていないかを調べます。書き方の決まりは `CLAUDE.md` の「principles.md の書き方」です。

```sh
pnpm check:principles
# または node design/tools/check-principles.mjs [path]
```

## color.mjs（共有モジュール）

コマンドではなく、色の計算をまとめたモジュールです。oklch への変換と、WCAG のコントラスト比を出せます（[ADR-0002](../adr/0002-contrast-and-foreground-tokens.md) の基準を確かめるときに使います）。

```sh
node -e "import('./design/tools/color.mjs').then(({ contrast }) => console.log(contrast('#2474df', '#ffffff')))"
```

## 前半（design キャンバス）の道具について

前半のラウンドで使った道具（`generate-round.mjs`・`compare.mjs`・`render.mjs`・`measure-text-offset.mjs`）と、候補の定義（`design/rounds/`）は消しました。前半は 2026-09-12 に終わっており、ADR の比較画像は決めた時点の記録として残すので、描き直す場面がないためです。

中身が要るときは、消す前のコミット `bcec65c` から取り出せます。

```sh
git show bcec65c:design/tools/compare.mjs
git checkout bcec65c -- design/rounds   # 一時的に戻す
```
