# CLAUDE.md

@kazuemon/ui は、かずえもんの UI コンポーネントライブラリです。デザインは、候補を並べてかずえもんが選ぶループで決めています。このファイルは、部品を作るエージェントと、そのループを回すエージェント向けの手引きです。

## 最初に読むもの

1. [`design/principles.md`](./design/principles.md): デザインをどう捉えているか。考えと、その結果どう見えるか
2. [`design/props.md`](./design/props.md): props の名前と渡し方
3. [`design/adr/README.md`](./design/adr/README.md): 決定の索引。個別の ADR は、関わる軸のものだけ読む
4. [`design/backlog.md`](./design/backlog.md): 決めていないこと・作っていないこと
5. [`design/tokens.css`](./design/tokens.css): 公開の値（値・尺度・役割）。principles と ADR は役割トークン名で参照する。部品の中だけの値は、部品のフォルダの `<name>.tokens.css` にある（作る部品のものだけ読む）

principles.md は毎回読み直さなくてよいよう短くしてあります。数値やトークン名は tokens.css と ADR にあります。

## ファイルの地図

| 場所                                   | 中身                                                                                                                                                                                                                                                                                  |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `design/principles.md`                 | 原則（考えと現れ方）                                                                                                                                                                                                                                                                  |
| `design/props.md`                      | props の名前と渡し方の決まり。語彙表と、色・variant・文字・イベント・渡し方・JSDoc の規則                                                                                                                                                                                             |
| `design/tokens.css`                    | 公開の値。`@theme`（値・尺度・役割。Tailwind のクラスになる）と、密度で変わる `@theme reference`（ADR-0076）                                                                                                                                                                          |
| `**/<name>.tokens.css`                 | 部品の層の値（`:root`。部品の中だけで使う）とキーフレーム。使う部品のフォルダに置き、`src/styles/component-tokens.css` が全部を読む                                                                                                                                                   |
| `design/adr/NNNN-*.md`                 | 決定の記録。1 決定 1 本。比較画像は `design/adr/assets/`                                                                                                                                                                                                                              |
| `design/roadmap.md`                    | 作りたい部品と、ライブラリとして要る機能の一覧と進み具合（チェックボックス）。レシピはここに載せず、案は backlog に置き、作るときは `src/recipes/` に直接足す                                                                                                                         |
| `design/backlog.md`                    | 未決事項。決まったら ADR を書いて消す                                                                                                                                                                                                                                                 |
| `design/review-checklist.md`           | 部品の PR のセルフレビューで使う点検表                                                                                                                                                                                                                                                |
| `design/pitfalls.md`                   | 実装とテストの落とし穴（Tailwind・Base UI・Storybook・テスト・動き）                                                                                                                                                                                                                  |
| `design/plans/`                        | まだ始めていない計画（ドキュメントサイトなど）                                                                                                                                                                                                                                        |
| `design/references/`                   | 原則の出どころの参照画像                                                                                                                                                                                                                                                              |
| `design/stories/axis-NN-*.stories.tsx` | 決めている途中の軸の比較ストーリー。枠は `Comparison.tsx`（1 行目が現行版、`pick` は「,」区切りで複数可）。決まったら消す                                                                                                                                                             |
| `design/tools/`                        | 撮影・確かめのスクリプト。使い方は [`design/tools/README.md`](./design/tools/README.md)                                                                                                                                                                                               |
| `src/index.ts`                         | 公開の入口。ここに並べたものだけを利用者に渡す                                                                                                                                                                                                                                        |
| `src/components/<name>/`               | 部品 1 つにつき 1 フォルダ。部品・ストーリー・見た目の基準画像（`__screenshots__/`）と、その部品だけが使う部分                                                                                                                                                                        |
| `src/internal/`                        | 2 つ以上の部品が使う、公開しない部分（`tv`・アイコン・フォーカスの線・Form との連携・Field・choice の見た目、読む部品と Prose が共有する見た目の `reading/` など）                                                                                                                    |
| `src/stories/`                         | ストーリーで共有する並べ方（`story-parts.tsx`・`story-states.ts`）と、部品をまたぐ一覧（押せない状態の一覧、部品の中で使っているアイコン）                                                                                                                                            |
| `src/recipes/`                         | レシピ: 部品にせず、既存の部品を組み合わせて作るもの（Footer など）と、外のヘッドレス（TanStack Table・dnd-kit）に部品をつなぐ見本のストーリー。公開の入口には足さない                                                                                                                |
| `src/samples/`                         | 見本のページ: 部品を実際の画面（記事・ドキュメント・サインイン・設定・一覧・SNS）に並べたストーリー。Storybook では `Overview/見本` に並ぶ。1 見本 1 ページ（画面の遷移がいるものを除く）で、`apps/docs/examples/` にも同じ見本を置く。文言は架空のものにする。公開の入口には足さない |
| `src/styles/`                          | `theme.css`（トークン・密度）、`tailwind.css`（Tailwind を使う利用者向け）、`fonts.css`・`ibm-plex-sans-jp.css`（フォント）、`globals.css`（Storybook 用）                                                                                                                            |
| `scripts/`                             | 配布物を作る・確かめるスクリプト（`build-css.mjs`・`check-dist.mjs`）と、和文フォントの補正 CSS を作る `generate-fonts.mjs`                                                                                                                                                           |
| `templates/component/`                 | 部品とストーリーの雛形                                                                                                                                                                                                                                                                |
| `.storybook/visual-testing.md`         | 見た目の回帰テストの仕組みと落とし穴                                                                                                                                                                                                                                                  |

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

CI（`.github/workflows/ci.yml`）は、PR と main への push で typecheck・lint・format:check・build・check:dist・test を走らせます。npm への公開は `.github/workflows/release.yml` です（下の「リリース」）。

## 部品を作る

1. 関わる原則と ADR を読む。決まっていない見た目は backlog にあるかを確かめ、なければ「原則にない判断」としてメモする（あとでループで決める）
2. `templates/component/` を `src/components/<kebab-name>/` に写し、`Example` を部品の名前に置き換える。新しいファイルを作ったら `src/styles/globals.css` を touch する
3. 部品を書く
   - 振る舞い（キーボード・読み上げ・開閉）は、Base UI にある部品を土台にする
   - 見た目は `tv`（`src/internal/tv`）で書く。トークンは、役割（`@theme`）にあるものを先に使う。部品のトークンは、役割にない値か、部品の中で状態ごとに差し替える値のときだけ、部品のフォルダの `<name>.tokens.css` の `:root` に足し（新しいファイルは `src/styles/component-tokens.css` に `@import` を足す。`component-tokens.test.ts` が確かめる）、役割を指すだけの別名は作らない。生の値は尺度（`--spacing`・`--radius-*`・`--border-width-*`・`--duration-*`）を指す。`@theme` に名前を足したら `twMergeConfig` にも足す（`tv.test.ts` が確かめる）
   - 寸法は密度のトークン（`--spacing-control` など）で書く。フォーカスの線は `focusRing`、ラベル・キャプション・エラーの行は `internal/field` の `Field`、Form の送信中は `useFormSubmittingLock`・`useChoiceLock` を使う
   - props の説明と既定値（`@default`）は JSDoc に書く
   - props の名前と渡し方は `design/props.md` の語彙に寄せる。足す前に props.md と似た部品を検索する。語彙にない名前が要るときはいちばん近い語に寄せ、別の語が適していそうならユーザーに確かめる
   - ブラウザが要るファイル（フック・Base UI・イベントのハンドラ・関数を渡す props）は、先頭に `'use client';` を置く。それを値として読むファイルにも要る（型だけの import と、再 export は伝播しない）。サーバーのまま描ける部品を減らさないよう、要らないファイルには付けない。付け忘れ・付けすぎは `src/internal/use-client.test.ts` が確かめる
   - Tailwind・Base UI の癖は `design/pitfalls.md` にある。書く前に、関わる節だけ読む
   - 1 ファイルが大きくなったら、部品のフォルダの中で分ける（見た目の一部は `<Name>Part.tsx`、状態を持つ処理は `use-*.ts`、DOM を読むだけの計算は `*.ts`）。2 つ目の部品が使うようになったら `src/internal/` へ移す
4. ストーリーを書く（タイトルは `Components/<Name>`）
   - Docs の文は使い方だけ。開発の経緯や ADR の番号は書かない
   - 状態・色・密度の一覧には `tags: ['visual']` を付ける。操作しないと出ない状態は `statePseudo` で固定する。`Playground`（Controls で変わる）と動きの途中は撮らない
   - 読み上げや props の確かめは `play` に書く。`userEvent` は `storybook/test` から読む（LAN の IP で開くと、play の引数の `userEvent` が空になる）
5. `src/index.ts` に部品と props の型を足し、`design/roadmap.md` の一覧にチェックを付ける
6. `pnpm typecheck`・`pnpm lint`・`pnpm format`・`pnpm test <フォルダ>` を通す。新しい `visual` のストーリーは、はじめの 1 回で基準画像が作られて落ちるので、画像を見てからもう一度流す。基準画像を撮り直すときは `-u` に頼らない（`design/pitfalls.md` の「テスト」）

## ループの進め方

見た目を決めるときは、Storybook で 1 軸ずつ詰めます（前半の design キャンバスは 2026-09-12 に終わりました）。

1 ラウンドの手順:

- 1 軸につき 1 本のストーリーを `design/stories/axis-NN-*.stories.tsx` に置く。Storybook では `Design Review/NN 軸の名前` に並ぶ
- 軸と ADR の番号は、並行して動くほかのセッションと同じ列で振る。main の最後の番号の次から振ると、まだマージされていない作業とぶつかる。振る前に `git worktree list` でほかの worktree の `design/stories`・`design/adr` を見て、動いているセッションがあれば最後に使う番号（予定を含む）を尋ねる。範囲を予約したら、終わったときに最後の番号を知らせる
- 現行版と候補を行に、状態（通常・フォーカス中など）を列に並べる
- 候補はトークン（CSS 変数）の上書きだけで作る。部品のコードは候補ごとに分けない。今のトークンで表せない案が要るときは、先に部品をトークンで表せる形に直す
- 全案（現行版を含む）で軸の値を明示する。比べるためだけに足した切り替えのトークン（0・1 の切り替えや、採らなかった形のための値）は、決まったら部品で決まった値に畳み、トークンのファイルから消す。決めたときの比較は、比較画像と ADR のコミットで再現する
- トークンの足し方は「部品を作る」と同じ
- 操作しないと出ない状態（hover、フォーカス）は `storybook-addon-pseudo-states` で固定する
- 密度はツールバーの「密度」で固定して比べる。密度の差は実機で指で押して詰める
- 動きや開閉が関わる軸は、固定の絵ではなく、触ると動く比較にする（変わったときの様子が分からないため）。メニューや面を開いたまま、ほかの行と見比べられるかも確かめる
- 案には、どれを推すかと、その理由を添える
- ユーザーはストーリーを開き、1 案を選んで一言添える。「X を既定にして、Y も選べる」という決め方が多いので、案を出すときはどれを既定にするかを尋ねる
- 返事が「選びました」だけで案を名指ししないときは、ストーリーのファイルを見る。Storybook で `pick` を保存すると、`args: { pick: "X" }` が書き込まれている
- 決まったら、ストーリーの `pick` の既定値を採用した案にし、説明の先頭に決定と ADR の番号を書く。比較画像を撮り、ADR に決めた時点のコミット（sha）を書いたら、そのストーリーは消す。Storybook の Design Review には、まだ決めていない軸だけを残す

決まったあとに更新するもの（この順で、コミットの前にまとめて 1 回）:

1. ADR を書く。1 決定 1 本。前の決定を覆したら古い ADR を Superseded にする。「原則への反映」に、原則の文を書き換えたか、反映なしかを書く
2. トークン（`design/tokens.css`・部品の `<name>.tokens.css`）を更新する
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

## 作業の場所と片付け

- メインの作業ツリー（clone したディレクトリ）では、ブランチを切り替えない。別のセッションが未コミットの変更を持っていることがある。作業は `git worktree add <場所> -b <ブランチ> origin/main` で切った worktree で行い、PR にする。マージはユーザーが行う
- worktree の node_modules は、メインへの symlink にしない（Vite が外のパスを配信できず、Storybook のテストが落ちる）。`pnpm install --prefer-offline --frozen-lockfile` で入れる
- worktree をいくつも作る作業は、`/tmp`（tmpfs で、再起動で消える）ではなくディスク上に置く。決まった単位（部品 1 つ、軸 1 本）ごとにコミットする（`wip:` でよい）。未コミットの変更は再起動で失われる
- 確かめ用の Storybook は、変更のある worktree から立てる
- 片付けでは `rm` を使わない。worktree は `git worktree remove`（`--force` なし）、ブランチは `git branch -d` で消す。どちらも、消してはいけない状態なら git が止める。main に入っていないブランチを `-D` で消すときは、先にユーザーに確かめる
- プロセスは、pid と cwd を確かめて 1 つずつ止める（グループごと止めない）。エージェントに測らせるときは「自分で立てた常駐のプロセス（Chrome・HTTP サーバーなど）を、終わる前に止める」と指示に書く

## 部品を並べて作る

いくつかの部品を同時に作るときの流れです。

1. 共有部分を先に変えるなら、1 つの worktree で変えてコミットし、そこから部品ごとに worktree とブランチを切る。軸の番号とポートは部品ごとに分けて割り当てる
2. 部品ごとのエージェントが、部品と比較のストーリーを作り、提示して止まる。共通の手順は 1 つのファイルに書いて読ませる（前のセッションのエージェントに SendMessage で再開を頼むより、新しいエージェントにそのファイルを読ませるほうが確か）
3. ユーザーが軸を選んだら、同じエージェントに反映させる。決めた状態のコミットが、ADR の引く sha になる
4. 部品のブランチを 1 本の review ブランチに `merge --no-ff` で集め、部品をまたいで重なった変更（同じ共有ファイルへの変更、内部に移すもの）をそろえる
5. 記録は、ADR の係と画像の係を並べる（軽いモデルでよい）。索引・backlog・principles のような共有のファイルは、メインのセッションが自分で当てる。画像は worktree 1 つで、決定のコミットを順に checkout して撮る
6. PR のブランチは最新の origin/main から切り、コミットを「feat（部品と比較のストーリー。ADR の引く sha）→ refactor → docs（ADR・画像・backlog・索引・比較のストーリーの削除）」に分ける

並べるときの注意:

- 1 つの worktree にエージェントを並べない。index を共有するので、`git rm`・`git mv` がほかの担当のコミットに混ざる
- 並べたエージェントには `pnpm test -u` を使わせない。テストは `flock` で 1 つずつ流させる

## PR とレビュー

- PR の前にセルフレビューをする。`/code-review`（正しさ）と、`design/review-checklist.md` を読むエージェント（揃い）を並べると、両方の指摘が出る
- PR を出したら CodeRabbit のコメントを見張り、直すか、直さない理由を返す。返信の本文の頭には `@coderabbitai` を付ける（付けないと読まれない）。base が main 以外の PR では自動でレビューされないので、`@coderabbitai review` とコメントする。差分の外への指摘は PR のコメントで返す
- 履歴を組み直して force push するのは、CodeRabbit のコメントが来なくなってから。途中の直しは `fixup!` のコミットで積み、静かになってから畳む
- ADR が決めた時点のコミット（sha）を引くので、その PR はマージコミットでマージしてもらう（squash すると sha が main から消える）。コミットを組み直して sha が変わったら、ADR の sha も書き換える
- 積んだ PR（Stack PR）の下の PR にコミットを足したら、上の PR へは rebase せず merge で伝える
- CI が落ちたら、まず落ちたストーリーだけを手元で 3 回流し、揺れか変更のせいかを分ける（`design/pitfalls.md` の「テスト」）

## principles.md の書き方

principles.md は、かずえもんがデザインをどう捉えているかを丸ごと書いた文書です。部品を使う人とエージェントの両方が読みます。

- 原則ごとに、考え（なぜそうするか）を段落で書き、その直後に「その結果どう見えるか」を箇条書きで置く。考えと現れ方を別の節に分けない
- 現れ方は定性的に書く（少し薄く、濃くする、色は合わせる）。数値、トークン名、props、ファイル名は書かない
- ユーザーのメモの引用、「以前は…」の履歴、【固定】【決定】の印、「一旦」は書かない。メモは理由として地の文に溶かし、原文は ADR の「理由」に置く
- 決定で原則が変わるときは、例外として追記せず、原則の文そのものを書き換える
- 原則の末尾に「経緯: ADR-NNNN、…」を 1 行だけ書く
- ですます調。毎行「だから、」や太字で始める型は避ける。書いたら `node design/tools/check-principles.mjs` で禁止語を確かめ、手元にある日本語の推敲スキルがあればそれで見直す

props・既定値・使い方の推奨は、部品の JSDoc と Storybook の Docs に書きます。

## リリース

npm への公開は release-please で回します。main に push されるたびに、release-please がコミットを読んで、次の版の「リリース PR」（`package.json` の version と `CHANGELOG.md`）を作り直します。リリース PR をマージすると、タグ（`v0.1.0` など）と GitHub Release ができ、そのタグからビルドして npm に公開します。設定は `release-please-config.json` です。

- 版はコミットの種類で決まります。`feat:` は minor、`fix:`・`design:`・`perf:`・`revert:` は patch を上げます。`feat!:` や `BREAKING CHANGE:` は、1.0.0 までは minor を上げます
- CHANGELOG に載るのは `feat`・`fix`・`design`・`perf`・`revert` だけです。`docs`・`refactor`・`style`・`test`・`chore`・`ci`・`build` は載らず、それだけでは版も上がりません。利用者に見える変更は、載る種類で書きます
- `apps/` だけを変えたコミットは、版に数えません
- 版を指定したいときは、載る種類のコミットの本文に `Release-As: 0.2.0` を書きます。release-please は変えたファイルでコミットを振り分けるので、ファイルを変えない空のコミットは数えられません
- `CHANGELOG.md` と `.release-please-manifest.json` は release-please が書くので、リリース PR の中では手で直しません（直しても main への push で作り直されて消えます）
- squash とマージコミットを併用しているので、リリースノートに同じ内容の行が混ざります。整えるのは頼まれたときだけです。そのときは GitHub Release の本文を `gh release edit` で書き換え、`CHANGELOG.md` は `docs:` の PR で同じ内容にします。整え方は次のとおりです
  - 同じ内容の行（マージコミットと中の feat）は 1 行にし、ハッシュを並べる
  - 新しく作った部品は「新しいコンポーネント」の節（BREAKING の直後）に「名前: ひとこと説明」で並べ、語尾の「足す」を外す
  - BREAKING と同じ内容の行は、ほかの節から消して BREAKING に寄せる
  - 取り消した試作は、元の行も取り消しの行も消す
  - 軸のコミット（「軸 NNN の比較を足す」）と「（軸 NNN）」の注記は外す。開発中に遡るためのもので、利用者向けではない
- 公開の前に `scripts/check-pack.mjs` が、`exports` などの指すファイルがパッケージの中にあるかを確かめます。手元では `pnpm pack --pack-destination .pack && node scripts/check-pack.mjs .pack/*.tgz`（`pack` の前に `prepack` がビルドします）

## コミット

- コミットと push は、頼まれたときだけ
- コミットメッセージには Co-Authored-By だけを残す。Claude-Session の行は付けない
- 履歴を書き換えるときは `--committer-date-is-author-date` を付ける
- ADR が引くコミットは squash しない。まとめ直すのは、そのあとの作業だけにする
