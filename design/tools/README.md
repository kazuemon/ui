# design/tools

`design/README.md` の「ツールの使い方」を移した節です。候補の生成、比較画像の撮影、和文の縦位置の計測に使うコマンドと、それらが使う共有モジュールをまとめます。

## ラウンドを始める

1. `design/tokens.css` を `design/rounds/rNN/base-tokens.css` にコピーして固定します。ラウンドの記録（候補の見た目や比較画像）を、後から同じ条件で再現するためです。以降、`tokens.css` を更新しても、そのラウンドの候補は `base-tokens.css` を土台に描かれます
2. `design/rounds/rNN/candidates.mjs` に候補を書きます。各候補は `base-tokens.css` への上書きとして定義します
3. 生成します

   ```sh
   node design/tools/generate-round.mjs design/rounds/rNN
   ```

   `design/rounds/rNN/build/` に、キャンバス用の artboard（`*.dc.html`）、`canvas.json`、ローカル確認用の `preview.html` が出力されます。コントラスト基準を満たさない候補があると、どの組み合わせが何対何で足りないかを表示して中止します

`candidates.mjs` の `candidates` を空にすると、現行版だけを描きます。前半の最終版（`rounds/p1-final/`）はこの形です。キャンバスの説明の付箋は、`spec.brief` で差し替えられます。

## 比較画像を撮る

ADR に添える比較画像は、次のコマンドで撮ります。現行版と全候補の同じ部品を横に並べ、`--pick` で指定した案に「採用」の印を付けます。

```sh
node design/tools/compare.mjs design/rounds/rNN \
  --parts <buttons|fields|switches|tags|card をカンマ区切り> \
  --pick <採用した案の ID> \
  --title "ADR-NNNN タイトル" \
  --out design/adr/assets/NNNN-kebab-title.png
```

- `--height` で画像の高さを調整します（既定は 640px）。部品が多いときは大きくします
- `--note` で副題を足せます
- 撮ったら、下端が切れていないかを目視で確認します

候補は `base-tokens.css` を土台に描かれるので、`tokens.css` を更新した後でも、そのラウンドの見た目で撮れます。

ラウンドの候補とは別の比較を ADR に添えたいときは、`--spec` で候補定義のファイルを差し替えます（既定は `<round>/candidates.mjs`）。例えば [ADR-0011](../adr/0011-switch-off-track.md) の画像は、スイッチ OFF の輪郭の有無だけを並べる定義 `design/rounds/r02/adr-0011-switch.mjs` で撮りました。

```sh
node design/tools/compare.mjs design/rounds/r02 \
  --spec design/rounds/r02/adr-0011-switch.mjs \
  --parts switches --pick 現行版 \
  --title "ADR-0011 スイッチ OFF のトラック" \
  --out design/adr/assets/0011-switch-off-track.png
```

## Storybook のストーリーを撮る（後半）

後半の ADR に添える比較画像は、比較のストーリーをそのまま撮ります。

```sh
node design/tools/capture-story.mjs design-review-01-focus--candidates \
  --pick A \
  --out design/adr/assets/NNNN-kebab-title.png
```

- Storybook をビルドし、ローカルで配信してストーリーだけを撮ります。ビルド済みのディレクトリがあれば、`--static-dir` で渡すとビルドを省きます
- `--pick` で、採用した案に「採用」の印を付けます（現行版は `current`）
- `--density coarse|fine` で密度を固定します。`--width`・`--height` で画像の大きさを調整します（既定は 1320×1500px）
- 動きを止めて撮ります（`prefers-reduced-motion`）。移り変わりの途中で撮られ、状態の見た目が出ないことがあるためです
- マウスで操作している環境（`hover: hover`、`pointer: fine`）として撮ります。撮影に使う headless Chrome は既定で「マウスなし」になり、hover の見た目が出ないためです。`--density coarse` のときは、指で操作している環境（`hover: none`、`pointer: coarse`）として撮ります
- 撮ったら、下端が切れていないかを目視で確認します

## 和文の縦位置を測る

入力欄の中で、文字のインクが上下どちらに寄っているかを画素で測ります（[ADR-0032](../adr/0032-text-offset.md)）。フォントの縦位置を補正したら、このコマンドで確かめます。

```sh
node design/tools/measure-text-offset.mjs
```

## color.mjs・render.mjs（共有モジュール）

この2つはコマンドではなく、`generate-round.mjs`・`compare.mjs` が読み込む共有モジュールです。直接実行しません。

- **`color.mjs`**: 色の計算（oklch 変換、WCAG のコントラスト比）をまとめたモジュールです。候補生成時のコントラスト制約（[ADR-0002](../adr/0002-contrast-and-foreground-tokens.md)）の検査にも使います
- **`render.mjs`**: 候補の描画に使う共有モジュールです。トークン表 → 部品テンプレート → HTML の順に組み立てます。すべての候補が同じテンプレートから描かれるので、構造の規則が候補間で必ず揃います
