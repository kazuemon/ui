# design/

@kazuemon/ui のデザインを決めるための場所です。原則、値、決定の記録、比較の道具が入っています。

| パス            | 中身                                                                                            |
| --------------- | ----------------------------------------------------------------------------------------------- |
| `principles.md` | デザイン原則。かずえもんがデザインをどう捉えているかと、その結果どう見えるか                    |
| `tokens.css`    | 現行版の値。Tailwind v4 の `@theme` にそのまま取り込める形式                                    |
| `adr/`          | 決定の記録。1 決定につき 1 本。索引と書き方は [`adr/README.md`](./adr/README.md)                |
| `adr/assets/`   | ADR に添える比較画像。決めた時点の記録                                                          |
| `backlog.md`    | 決めていないこと・作っていないこと                                                              |
| `references/`   | 原則の出どころになった参照画像（一覧は [`principles.md`](./principles.md#参照画像)）            |
| `rounds/rNN/`   | 前半（design キャンバス）の候補定義。`rounds/p1-final/` は前半の最終版                          |
| `stories/`      | 後半（Storybook）の比較ストーリー。`Design Review/NN 軸の名前` に並ぶ                           |
| `tools/`        | 候補の生成、比較画像の撮影、文字の縦位置の測定。使い方は [`tools/README.md`](./tools/README.md) |

値は `tokens.css` の 1 か所だけに書きます。`principles.md` と ADR は、値ではなく役割トークン名で参照します。

決め方（ループの進め方、決まったあとに更新するもの）は、リポジトリ直下の [`CLAUDE.md`](../CLAUDE.md) にあります。
