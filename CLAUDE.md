# CLAUDE.md

@kazuemon/ui は、かずえもんの UI コンポーネントライブラリです。デザインは、候補を並べてかずえもんが選ぶループで決めています。このファイルは、部品を作るエージェントと、そのループを回すエージェント向けの手引きです。

## 最初に読むもの

1. [`design/principles.md`](./design/principles.md): デザインをどう捉えているか。考えと、その結果どう見えるか
2. [`design/props.md`](./design/props.md): props の名前と渡し方
3. [`design/adr/README.md`](./design/adr/README.md): 決定の索引。個別の ADR は、関わる軸のものだけ読む
4. [`design/backlog.md`](./design/backlog.md): 決めていないこと・作っていないこと
5. [`design/tokens.css`](./design/tokens.css): 値。principles と ADR は役割トークン名で参照し、値はここにだけ書く

principles.md は毎回読み直さなくてよいよう短くしてあります。数値やトークン名は tokens.css と ADR にあります。

## ファイルの地図

| 場所                                   | 中身                                                                                                                                                               |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `design/principles.md`                 | 原則（考えと現れ方）                                                                                                                                               |
| `design/props.md`                      | props の名前と渡し方の決まり。語彙表と、色・variant・文字・イベント・渡し方・JSDoc の規則                                                                          |
| `design/tokens.css`                    | 現行版の値。`@theme` は公開（値・尺度・役割。Tailwind のクラスになる）、`:root` は部品の中だけ（ADR-0076）                                                         |
| `design/adr/NNNN-*.md`                 | 決定の記録。1 決定 1 本。比較画像は `design/adr/assets/`                                                                                                           |
| `design/backlog.md`                    | 未決事項。決まったら ADR を書いて消す                                                                                                                              |
| `design/review-checklist.md`           | AI が部品の PR をレビューするときの点検表（GitHub の自動化の側で書く）                                                                                             |
| `design/plans/`                        | まだ始めていない計画（ドキュメントサイトなど）                                                                                                                     |
| `design/references/`                   | 原則の出どころの参照画像                                                                                                                                           |
| `design/stories/axis-NN-*.stories.tsx` | 決めている途中の軸の比較ストーリー。枠は `Comparison.tsx`（1 行目が現行版、`pick` は「,」区切りで複数可）。決まったら消す                                          |
| `design/tools/`                        | 撮影・確かめのスクリプト。使い方は [`design/tools/README.md`](./design/tools/README.md)                                                                            |
| `src/index.ts`                         | 公開の入口。ここに並べたものだけを利用者に渡す                                                                                                                     |
| `src/components/<name>/`               | 部品 1 つにつき 1 フォルダ。部品・ストーリー・見た目の基準画像（`__screenshots__/`）と、その部品だけが使う部分                                                     |
| `src/internal/`                        | 2 つ以上の部品が使う、公開しない部分（`tv`・アイコン・フォーカスの線・Form との連携・Field・choice の見た目、読む部品と Prose が共有する見た目の `reading/` など） |
| `src/stories/`                         | ストーリーで共有する並べ方（`story-parts.tsx`・`story-states.ts`）と、部品をまたぐ一覧（押せない状態の一覧、部品の中で使っているアイコン）                         |
| `src/recipes/`                         | レシピ: 部品にせず、既存の部品を組み合わせて作るもの（Footer など）の見本のストーリー。公開の入口には足さない                                                      |
| `src/samples/`                         | 見本のページ: 部品を実際の画面（記事・ドキュメント・サインイン・設定・一覧・SNS）に並べたストーリー。Storybook では `Overview/見本` に並ぶ。公開の入口には足さない |
| `src/styles/`                          | `theme.css`（トークン・密度）、`tailwind.css`（Tailwind を使う利用者向け）、`fonts.css`・`ibm-plex-sans-jp.css`（フォント）、`globals.css`（Storybook 用）         |
| `scripts/`                             | 配布物を作る・確かめるスクリプト（`build-css.mjs`・`check-dist.mjs`）と、和文フォントの補正 CSS を作る `generate-fonts.mjs`                                        |
| `templates/component/`                 | 部品とストーリーの雛形                                                                                                                                             |
| `.storybook/visual-testing.md`         | 見た目の回帰テストの仕組みと落とし穴                                                                                                                               |

よく使うコマンド:

```sh
pnpm storybook                # ストーリーを開く（確かめはポート 6007 の dev server で）
pnpm typecheck
pnpm lint
pnpm format                   # 書式をそろえる（CI は pnpm format:check）
pnpm test                     # 全ストーリーを Vitest で描き、play の確かめと見た目の比較を走らせる
pnpm test src/components/tag  # 1 つの部品だけ
pnpm test -u src/components/tag  # 見た目の基準画像を撮り直す（意図して見た目を変えたとき。範囲を絞る）
pnpm build                    # 配布物（dist/: JS・型・CSS）を作る
pnpm check:dist               # 配布物を確かめる（'use client'・依存・ツリーシェイク）
pnpm run fonts                # 和文フォントの補正 CSS を作り直す
node design/tools/capture-story.mjs <story-id> --pick A --out design/adr/assets/NNNN-title.png
```

CI（`.github/workflows/ci.yml`）は、PR と main への push で typecheck・lint・format:check・build・check:dist・test を走らせます。

## 部品を作る

1. 関わる原則と ADR を読む。決まっていない見た目は backlog にあるかを確かめ、なければ「原則にない判断」としてメモする（あとでループで決める）
2. `templates/component/` を `src/components/<kebab-name>/` に写し、`Example` を部品の名前に置き換える。新しいファイルを作ったら `src/styles/globals.css` を touch する
3. 部品を書く
   - 振る舞い（キーボード・読み上げ・開閉）は、Base UI にある部品を土台にする
   - 見た目は `tv`（`src/internal/tv`）で書く。トークンは、役割（`@theme`）にあるものを先に使う。部品のトークン（`:root`）は、役割にない値か、部品の中で状態ごとに差し替える値のときだけ足し、生の値は尺度（`--spacing`・`--radius-*`・`--border-width-*`・`--duration-*`）を指す。`@theme` に名前を足したら `twMergeConfig` にも足す（`tv.test.ts` が確かめる）
   - 寸法は密度のトークン（`--spacing-control` など）で書く。フォーカスの線は `focusRing`、ラベル・キャプション・エラーの行は `internal/field` の `Field`、Form の送信中は `useFormSubmittingLock`・`useChoiceLock` を使う
   - props の説明と既定値（`@default`）は JSDoc に書く
   - props の名前と渡し方は `design/props.md` の語彙に寄せる。語彙にない名前が要るときはいちばん近い語に寄せ、別の語が適していそうならユーザーに確かめる
   - ブラウザが要るファイル（フック・Base UI・イベントのハンドラ・関数を渡す props）は、先頭に `'use client';` を置く。それを値として読むファイルにも要る（型だけの import と、再 export は伝播しない）。サーバーのまま描ける部品を減らさないよう、要らないファイルには付けない。付け忘れ・付けすぎは `src/internal/use-client.test.ts` が確かめる
   - 1 ファイルが大きくなったら、部品のフォルダの中で分ける（見た目の一部は `<Name>Part.tsx`、状態を持つ処理は `use-*.ts`、DOM を読むだけの計算は `*.ts`）。2 つ目の部品が使うようになったら `src/internal/` へ移す
4. ストーリーを書く（タイトルは `Components/<Name>`）
   - Docs の文は使い方だけ。開発の経緯や ADR の番号は書かない
   - 状態・色・密度の一覧には `tags: ['visual']` を付ける。操作しないと出ない状態は `statePseudo` で固定する。`Playground`（Controls で変わる）と動きの途中は撮らない
   - 読み上げや props の確かめは `play` に書く。`userEvent` は `storybook/test` から読む（LAN の IP で開くと、play の引数の `userEvent` が空になる）
5. `src/index.ts` に部品と props の型を足し、README の一覧にチェックを付ける
6. `pnpm typecheck`・`pnpm lint`・`pnpm format`・`pnpm test <フォルダ>` を通す。新しい `visual` のストーリーは、はじめの 1 回で基準画像が作られて落ちるので、画像を見てからもう一度流す

## ループの進め方

見た目を決めるときは、Storybook で 1 軸ずつ詰めます（前半の design キャンバスは 2026-09-12 に終わりました）。

1 ラウンドの手順:

- 1 軸につき 1 本のストーリーを `design/stories/axis-NN-*.stories.tsx` に置く。Storybook では `Design Review/NN 軸の名前` に並ぶ
- 現行版と候補を行に、状態（通常・フォーカス中など）を列に並べる
- 候補は `design/tokens.css` への上書き（CSS 変数）だけで作る。部品のコードは候補ごとに分けない。今のトークンで表せない案が要るときは、先に部品をトークンで表せる形に直す
- 全案（現行版を含む）で軸の値を明示する。比べるためだけに足した切り替えのトークン（0・1 の切り替えや、採らなかった形のための値）は、決まったら部品で決まった値に畳み、tokens.css から消す。決めたときの比較は、比較画像と ADR のコミットで再現する
- トークンの足し方は「部品を作る」と同じ
- 操作しないと出ない状態（hover、フォーカス）は `storybook-addon-pseudo-states` で固定する
- 密度はツールバーの「密度」で固定して比べる。密度の差は実機で指で押して詰める
- ユーザーはストーリーを開き、1 案を選んで一言添える。「X を既定にして、Y も選べる」という決め方が多いので、案を出すときはどれを既定にするかを尋ねる
- 決まったら、ストーリーの `pick` の既定値を採用した案にし、説明の先頭に決定と ADR の番号を書く。比較画像を撮り、ADR に決めた時点のコミット（sha）を書いたら、そのストーリーは消す。Storybook の Design Review には、まだ決めていない軸だけを残す

決まったあとに更新するもの（この順で、コミットの前にまとめて 1 回）:

1. ADR を書く。1 決定 1 本。前の決定を覆したら古い ADR を Superseded にする。「原則への反映」に、原則の文を書き換えたか、反映なしかを書く
2. tokens.css を更新する
3. principles.md を更新する。決定で原則が変わるなら、例外を足すのではなく原則の文を書き換える。書式は下の「principles.md の書き方」
4. backlog.md から決まったものを消し、新しく分かった未決事項を足す
5. ADR の索引（`design/adr/README.md`）に行を足す
6. 比較画像を撮る。ADR の画像は決めた時点の記録なので、あとで撮り直さない
7. 比較のストーリーを消し、ADR に決めた時点のコミット（sha）を書く。部品が変わると残したストーリーでは比較を再現できないので、記録は画像とコミットで残す（`git checkout <sha> && pnpm storybook` で、決めたときの部品のまま開ける）

## 作業ルール

1 つの直しに約 20 分かかっていた時期に集計したところ、時間の大半はモデルが考えて書く時間でした。次のルールで進めます。

- **確かめ方を、直した大きさに合わせる。** 小さな直しでは、直したところだけを確かめる。幅を何百通りも変える、0.25px ずつずらす、ADR の画像を全部撮り直す、といった確かめ方はしない。測るときは Chrome の起動を 1 回にまとめ、その中で必要なことを全部測る
- **小さな直しは、メインのセッションが自分で直す。** 値を 1 つ変える、文言を直す、といった直しはエージェントに任せない。任せると読み直しから始まって時間がかかる
- **記録はまとめて 1 回にする。** ADR・principles・索引・画像は、直すたびに仕上げない。途中は、決まったこととユーザーの返事の原文をメモに残すだけでよい
- **決まった作業は、軽いモデルで動かす。** ドキュメントの反映や画像の撮影のような決まった作業は、実装と同じ重いモデルで動かさない。Workflow の `agent()` なら `model` / `effort` で指定する
- **エージェントを並べるときは、別々のファイルを割り当てる。** 動いている Workflow のエージェントには SendMessage を送らない。届かず、2 つ目のコピーが立ち上がる
- **部品やストーリーのファイルを新しく作ったら、`src/styles/globals.css` を touch する。** dev server の Tailwind が、新しいファイルのクラスを拾わないことがある
- **動きの候補は、提示する前に自分で確かめる。** 目で見て違いが分かる候補だけを並べる

## principles.md の書き方

principles.md は、かずえもんがデザインをどう捉えているかを丸ごと書いた文書です。部品を使う人とエージェントの両方が読みます。

- 原則ごとに、考え（なぜそうするか）を段落で書き、その直後に「その結果どう見えるか」を箇条書きで置く。考えと現れ方を別の節に分けない
- 現れ方は定性的に書く（少し薄く、濃くする、色は合わせる）。数値、トークン名、props、ファイル名は書かない
- ユーザーのメモの引用、「以前は…」の履歴、【固定】【決定】の印、「一旦」は書かない。メモは理由として地の文に溶かし、原文は ADR の「理由」に置く
- 決定で原則が変わるときは、例外として追記せず、原則の文そのものを書き換える
- 原則の末尾に「経緯: ADR-NNNN、…」を 1 行だけ書く
- ですます調。毎行「だから、」や太字で始める型は避ける。書いたら `node design/tools/check-principles.mjs` で禁止語を確かめ、手元にある日本語の推敲スキルがあればそれで見直す

props・既定値・使い方の推奨は、部品の JSDoc と Storybook の Docs に書きます。

## コミット

- コミットと push は、頼まれたときだけ
- コミットメッセージには Co-Authored-By だけを残す。Claude-Session の行は付けない
- 履歴を書き換えるときは `--committer-date-is-author-date` を付ける
