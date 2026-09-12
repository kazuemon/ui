# ADR（Architecture Decision Records）

デザインの決定を1つずつ記録します。原則（[`../principles.md`](../principles.md)）の各項目から、根拠としてここにリンクします。

## 書き方の規則

- **1決定につき1本**書きます。1ラウンドで3つ決まれば3本書きます
- **番号**は `NNNN`（4桁の連番）です。欠番は作りません
- **ファイル名**は `NNNN-kebab-title.md` です（例: `0005-disabled-expression.md`）
- **ステータス**は次のいずれかです
  - `Proposed`: 提案中
  - `Accepted`: 採用
  - `Superseded by NNNN`: 後の ADR で置き換えられた。古い ADR は消さずに残し、ステータスだけを変えます
- **全候補を却下したラウンド**も1本残します。「この方向は違うと分かった」ことを、反例を追加した決定として記録し、`principles.md` の「反例」にも追加します
- **比較画像**は `assets/NNNN-*.png` に、ADR 1本につき1枚置きます。全候補と現行版を1枚に並べ、採用した案に印を付けます
  - 例外: 色の使い方の決定など、見た目の比較をしていない ADR は画像なしでかまいません。その場合は「比較画像」の節に、画像がない理由を書きます（例: [0013](./0013-secondary-color.md)）
- 値は `tokens.css` に書き、ADR では役割トークン名で参照します。比較の記録として必要な場合は、候補ごとの値を書いてかまいません

## テンプレート

```markdown
# NNNN. タイトル

- ステータス: Accepted
- 日付: YYYY-MM-DD
- ラウンド: 前半 rNN ／ 後半 ／ ループ外

## 背景

何を決める必要があったか。どの原則・どの軸に関わるか。

## 候補

| 案     | 内容 |
| ------ | ---- |
| 現行版 | ...  |
| A      | ...  |

## 決定

何を採用したか。

## 理由

基準の言葉（軽い・やわらかい・整然・人懐っこい）のどれに近かったか。ユーザーの一言メモ。

## 却下した案と理由

- A: ...

## 影響

更新したトークン、原則の印、次のラウンドで振る軸。

## 比較画像

![比較](./assets/NNNN-kebab-title.png)
```

## 一覧

| 番号                                              | タイトル                                        | ステータス         |
| ------------------------------------------------- | ----------------------------------------------- | ------------------ |
| [0001](./0001-judgement-criteria.md)              | 判断の基準                                      | Accepted           |
| [0002](./0002-contrast-and-foreground-tokens.md)  | コントラスト基準と面用／前景用の2段             | Accepted           |
| [0003](./0003-token-layers.md)                    | トークンを値の層と役割の層に分ける              | Accepted           |
| [0004](./0004-density-and-structure-switching.md) | 密度は入力方式、構造は画面幅で切り替える        | Accepted           |
| [0005](./0005-neutral-and-background.md)          | 中立色と地                                      | Accepted           |
| [0006](./0006-button-shadow.md)                   | ボタンの影                                      | Accepted           |
| [0007](./0007-tag-color.md)                       | タグの色                                        | Accepted           |
| [0008](./0008-control-radius.md)                  | ボタンと入力欄の角丸                            | Accepted           |
| [0009](./0009-press-motion.md)                    | 押下の動き                                      | Accepted           |
| [0010](./0010-section-label.md)                   | セクションラベルの書式                          | Accepted           |
| [0011](./0011-switch-off-track.md)                | スイッチ OFF のトラック                         | Accepted           |
| [0012](./0012-primary-blue.md)                    | Primary の青                                    | Accepted           |
| [0013](./0013-secondary-color.md)                 | ピンクは用途を限定しない Secondary              | Accepted           |
| [0014](./0014-nested-card-inset.md)               | 入れ子の型のカードの余白                        | Accepted           |
| [0015](./0015-icon-weight.md)                     | アイコンの太さ                                  | Superseded by 0018 |
| [0016](./0016-card-radius.md)                     | カードの角丸                                    | Accepted           |
| [0017](./0017-card-media-aspect.md)               | カードの画像の比率                              | Accepted           |
| [0018](./0018-icon-weight-by-context.md)          | アイコンの太さを文脈で分ける                    | Accepted           |
| [0019](./0019-field-focus-change.md)              | 入力欄のフォーカス時の変化量                    | Accepted           |
| [0020](./0020-control-size-fine.md)               | マウス用の寸法                                  | Accepted           |
| [0021](./0021-field-error-fill.md)                | エラー時の入力欄の塗り                          | Accepted           |
| [0022](./0022-field-hover.md)                     | 入力欄の hover                                  | Accepted           |
| [0023](./0023-danger-color.md)                    | Danger と Secondary の区別                      | Accepted           |
| [0024](./0024-neutral-button.md)                  | グレーのボタンの塗り                            | Accepted           |
| [0025](./0025-surface-button-line.md)             | 白いボタンの輪郭                                | Accepted           |
| [0026](./0026-disabled.md)                        | Disabled の表し方                               | Accepted           |
| [0027](./0027-flat-press.md)                      | 平らなボタン・リンクの hover と押下             | Accepted           |
| [0028](./0028-default-color.md)                   | 各部品の既定の色                                | Accepted           |
| [0029](./0029-disabled-refine.md)                 | Disabled の詰め（トグルとグレーの枠線のボタン） | Accepted           |
| [0030](./0030-text-link.md)                       | 文字のリンクの下線と hover                      | Accepted           |
