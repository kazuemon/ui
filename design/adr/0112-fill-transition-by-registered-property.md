# 0112. 塗りの移り変わりは、登録した変数で動かす

- ステータス: Accepted
- 日付: 2026-09-18
- ラウンド: ループ外

## 背景

> Switch コンポーネントについて、ラベルやスイッチ本体を押したときに色がちらつくときがあります。

> ちらつきは Switch 本体の背景色なので、ラベルは関係ないですね。

手元の headless Chrome では、マウス（速い連打・ランダムな位置・押しながら動かす・キーボードで先にフォーカス）でもタッチでも、トラックの背景色の計算値は単調に移り変わり、合成後の絵にも乱れが出ませんでした。そこで、見えている環境（Chrome 153、Windows、GPU あり）で画面を録画してもらい、229 フレーム（約 60fps）を 1 枚ずつ読みました。

| フレーム | トラックの色           | 意味                                               |
| -------- | ---------------------- | -------------------------------------------------- |
| 96〜100  | 225,227,228 → 81,92,96 | OFF → ON の移り変わり（100ms）                     |
| 101      | 224,226,227            | 終わりの 1 フレームだけ、動かす前の OFF の色に戻る |
| 102      | 81,92,96               | ON の色                                            |
| 105〜109 | 81,92,96 → 223,225,226 | ON → OFF の移り変わり                              |
| 110      | 82,92,96               | 終わりの 1 フレームだけ、動かす前の ON の色に戻る  |
| 111      | 225,227,228            | OFF の色                                           |

同じ形（移り変わりの最後の 1 フレームに、動かす前の色が出る）が 13 回の切り替えのうち 4 回にありました。押した瞬間ではなく、100ms の移り変わりが終わる瞬間です。計算値は戻らないので、CSS の値の問題ではなく描画の問題です。

Chrome は `background-color` の移り変わりを、条件がそろうとコンポジタ（GPU 側）で動かします。要素の絵は動かす前の色で描いておき、動いているあいだはコンポジタが色を差し替え、終わると主スレッドが最後の色で描き直します。この受け渡しがずれると、描き直しが届くまでの 1 フレームに、動かす前の色で描いた絵が見えます。録画の形はこれと一致します。手元の headless Chrome ではトラックはコンポジタで動かされず（合成の理由は「ノブの scale の移り変わり」だけ）、再現しませんでした。

`background-color` を transition で動かしている要素はトグルのほかにもあり、同じ条件で同じ取りこぼしが起きえます。

## 候補

比較のストーリーは作っていません。見た目（色・長さ・緩急）は変えず、動かし方だけを変えるので、言葉で決められるためです。

## 決定

塗りが動く要素は、`background-color` を transition で動かさない。`@property` で `<color>` として登録した変数を transition で動かし、`background-color` にはその変数を渡す（`bg-(color:--xxx)`）。状態ごとの塗りは `bg-*` ではなく変数の値で指定する。

| 変数                | 要素                                                                  | 動く場面                                        |
| ------------------- | --------------------------------------------------------------------- | ----------------------------------------------- |
| `--button-bg`       | Button（塗り・枠線、ボタンの見た目のリンク）                          | hover・押下・押せない・送信中                   |
| `--control-bg`      | 入力欄の本体（TextField・Select の controlBox）                       | hover・フォーカス・エラー・押せない・開いている |
| `--addon-bg`        | 入力欄の prefix・suffix のボタン                                      | hover・押下                                     |
| `--flat-bg`         | 平らなボタン（Notice の ×・Dialog/Drawer/Popover の ×・枠線のリンク） | hover・押下                                     |
| `--switch-track`    | トグルのトラック                                                      | OFF ↔ ON                                        |
| `--switch-row-fill` | 行全体を押せるトグルの行                                              | hover・押下                                     |

CodeBlock のコピーのボタンは、hover と押下を `background-image` で重ねていて `background-color` は動かないので、そのままです。チェックボックス・ラジオの箱は色を動かしていません。

## 理由

- **登録した変数の移り変わりは主スレッドで動く**: コンポジタが受け持つのは `background-color` などの決まった property の移り変わりで、変数の移り変わりは受け持ちません。変数を動かして `background-color` に渡せば、色はフレームごとに主スレッドが描き、受け渡しが起きません。補間の値は `background-color` を動かしたときと同じです（トグルのクリック後に 225,227,228 → 148,182,226 → 87,146,224 → … と同じ並び）
- **見た目の決まりは変えない**: 色・長さ・緩急は各 ADR（[ADR-0009](./0009-press-motion.md)・[ADR-0027](./0027-flat-press.md)・[ADR-0067](./0067-switch-row-press.md) など）のままです。全ストーリーの見た目の基準画像も変わりません
- **currentColor は登録した変数の中で補間できない**: 平らな要素の hover と押下の色（`--color-flat-hover`・`--color-flat-press`）は `currentColor` を混ぜた色で、登録した `<color>` の変数に入れると Chrome は currentColor を残したまま持つので、移り変わりが補間されず一瞬で切り替わります。そこで、混ぜる濃さを `--flat-hover-mix`・`--flat-press-mix`（tokens.css）に置き、変数で動かす要素は自分の文字の色の変数（Button は `--button-line`、リンクは `--link-color`、Notice の × は `--notice-fg`、シートの × は `--color-fg-muted`、prefix・suffix は `--addon-ink`）をその濃さで混ぜます。色は `--color-flat-*` と同じです
- **同じ書き方の要素にまとめて当てる**: 取りこぼしは要素ではなく `background-color` の transition の仕組みに付くので、動く塗りを持つ要素すべてを同じ形にそろえます。変数の名前は要素の役割ごとに分け、theme.css に一覧を置きます
- **tokens.css の上書きでは表せない**: コンポジタの受け持ちはブラウザが決めるので、部品の書き方で直します

## 影響

- `design/tokens.css`: `--flat-hover-mix`・`--flat-press-mix`（8%・16%）を足し、`--color-flat-hover`・`--color-flat-press` がそれを読む
- `src/styles/theme.css`: 6 つの `@property`（`<color>`、継承なし、初期値 transparent）と、どの要素が使うかの一覧
- `src/components/button/Button.tsx`: `bg-(color:--button-bg)` を base に置き、塗り・枠線・押せない・送信中・hover・押下の `bg-*` を `[--button-bg:…]` に置き換えた。transition は `--button-bg`
- `src/internal/field/field-styles.ts`・`src/components/select/Select.tsx`: controlBox の `bg-field*` を `[--control-bg:…]` に置き換えた。送信中の塗りの差し替え（`--color-field*` を上書き）はそのまま効く
- `src/components/field-addon/FieldAddon.tsx`: ボタンの hover・押下を `--addon-bg` に
- `src/components/notice/Notice.tsx`・`src/internal/sheet/sheet-styles.ts`・`src/components/link/Link.tsx`: hover・押下の `bg-flat-*` を `--flat-bg` に
- `src/components/switch/Switch.tsx`: トラックを `--switch-track`、行の塗りを `--switch-row-fill` に
- 見た目の基準画像は変えていない（全ストーリー 161 件が通る）
- 分かっていること: タッチでは Chrome が速く押すと `:active` を離したあと（切り替わったあと）に 100〜150ms 付けることがあり、トグルのノブが滑りながら縮んで戻る。別の直し（押下を pointer イベントで持つ）として切り出す（backlog）

## 原則への反映

反映なし。塗りの移り変わりの見え方は変わらず、Windows の GPU あり Chrome でもそのとおりに見えるようにしただけです。

## 比較画像

比較のストーリーを作っていないので、画像はありません。録画は手元の確認に使い、記録には残していません。
