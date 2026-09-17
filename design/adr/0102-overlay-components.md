# 0102. 重なる面の作り（Dialog・Drawer・Popover・Tooltip）

- ステータス: Accepted
- 日付: 2026-09-18
- ラウンド: ループ外

## 背景

ページの上に重なる部品のうち、作ってあったのは Select の浮かぶ選択肢とボトムシート（[ADR-0036](./0036-select-popup.md)・[ADR-0037](./0037-select-sheet.md)）だけでした。README の「重なるもの」は 4 つとも空のままです。

> 次のコンポーネントを作成したいです。デザイン原則に従い、ローカルで開発を進めてください。
>
> - Dialog
> - Drawer
> - Popover
> - Tooltip

> Drawer については、既存の Select の Sheet も踏まえて検討したいです。

関わる原則は 1（影は重なりを表す）・5（角丸）・11（構造は指の動きで切り替える）です。原則11は「構造を変えてよいのは浮かぶ UI だけ。Select、Menu、Dialog、Tooltip、Popover」としており、どう切り替えるかは Select でしか決めていませんでした。backlog には「Menu・Popover・Tooltip など、ほかの浮かぶ UI でも同じ影・同じ動きのトークンを使うかは、それぞれを作るときに決めます」と残っていました。

## 候補

部品を作る決定なので、案を並べた比較のストーリーはありません。作る前に、原則からは決まらない分かれ目を 4 つ質問し、答えをもらっています。

| 問い                                             | 答え                                                                                              |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| Drawer はどの向きから出すか                      | 下を既定にし、左右も選べる                                                                        |
| Select のシートとどこまで共通にするか            | 見た目の部品を共有する（見出し・続きの印・トークン。引く操作は Select が自前、Drawer は Base UI） |
| 指で操作していて画面が狭いときの Dialog・Popover | 両方シートにする                                                                                  |
| 指で操作するときの Tooltip                       | 長押しで出す                                                                                      |

見た目そのもの（題の大きさ・角・下の操作の並べ方・Tooltip の面・Popover の矢印・横のパネルの幅と影・開いた直後のフォーカス）は、作ったあとに軸 81〜87 で 1 つずつ比べました（[ADR-0103](./0103-overlay-title.md)〜[ADR-0109](./0109-overlay-initial-focus.md)）。

## 決定

**4 つの部品を Base UI の上に作り、シートの見た目は Select と 1 つの部品で共有します。**

| 項目                         | 決定                                                                                                                                                                               |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 土台                         | Base UI の Dialog・Drawer・Popover・Tooltip。Drawer は Dialog に引く操作と段を足したもので、Close・Title・Description は Dialog のものと同じ                                       |
| Drawer の向き                | `side="bottom"`（既定）は画面の下から出すシート、`left`・`right` は画面の横から出すパネル。出した向きへはじくと閉じる                                                              |
| 共有する見た目               | 見出し（つまみ・題・説明・右上の ×）、続きの印、面・輪郭・影・後ろの暗さ・開閉の動きのトークン。`src/internal/sheet` に置く                                                        |
| Select との関係              | Select のシートは Select の浮かぶ部分で作ったまま、見出しと続きの印だけを共有する。Select の見出しの題は欄のラベルと同じ大きさのまま                                               |
| 出し方（presentation）       | Dialog・Popover も Select と同じ `auto`・`popover`・`sheet`。`auto` は、指で操作していて（`pointer: coarse`）縦長なら 768px・横長なら 1024px 未満のときシート                      |
| 閉じる手段                   | 右上の ×・Esc・後ろの画面を押す。`closeButton`・`closeOnEscape`・`dismissible` でそれぞれ止められる。3 つとも止めるときは、下の操作に閉じる手段を置く                              |
| シートの続きの印             | 上の区切り線は中身がスクロールできるときだけ出す。下の区切り線は、下に操作があり、下の影が出ているあいだだけ出す                                                                   |
| はじいて閉じる動き           | はじいた強さで長さを縮めず、いつもシートの長さ（250ms）で滑らせる。半分の段からはキーフレームで滑らせる                                                                            |
| 閉じる向きと反対へ引いたとき | 面と同じ色を画面の外へ伸ばしておき（`--sheet-bleed`）、面と 1px 重ねて継ぎ目を消す                                                                                                 |
| Drawer の半分の段            | 中身が画面の半分より長いときは、半分の高さで開いてつまみを出す。高さは Base UI の段（snap points）で変え、ずらした分だけ面の下に余白を足して、下の操作と続きの印が見えたままにする |
| Tooltip の長押し             | 指で 500ms 長押しすると出る。離したときの押下では本体を実行せず、ほかの場所に触れると閉じる                                                                                        |

## 理由

ユーザーのメモです（作る前の 4 つの答えと、作ったあとの指摘）。

> 下を既定、左右も選べる

> 見た目の部品を共有

> 両方シートにする

> 長押しで出す

> Dialog, Drawer, Sheet については esc でも閉じられないオプションが欲しいです。閉じるボタンなしも欲しいかも。

> Sheet について、内部が scrollable でない場合は見出しと内容の divider を非表示にしたいです。

> Drawer/長い中身について、影がある場合は下にも divider が欲しいです
> あと、スライドで閉じると一気に消えちゃいますね

> 横向きの Drawer について、ドラッグしながらスライドしたときに左に余白が出てくるのが気になります。

以下は、メモと作りながら分かったことです。

- **シートは 1 つの見た目にそろえる**: Select のシート、Drawer、狭い画面の Dialog と Popover は、どれも画面の下から出る同じ面です。見出しと続きの印を 1 つの部品にすると、どこから出しても同じ形になり、Select で決めたこと（[ADR-0037](./0037-select-sheet.md)）がそのまま効きます
- **引く操作だけは分ける**: Select のシートは Base UI の Select の浮かぶ部分を画面の下に固定して作っており、Base UI の Drawer には載せられません。見た目だけを共有し、引く操作は Select が自前、Drawer は Base UI の swipe と段を使います
- **閉じる手段は 3 つとも止められる**: 答えるまで閉じたくない場面（利用規約への同意など）があります。止めたときは、下の操作に閉じる手段を必ず置きます
- **区切り線は「切れている」ことの印**: スクロールできない中身に線を引くと、見出しと中身が別の面に見えます。線は続きがあるときだけ出します
- **はじいて閉じる動き**: Base UI の例は、はじいた強さで閉じる長さを縮めます。そのままだと 250ms が 58ms ほどになり、一瞬で消えて見えました。Select のシートと同じく、いつも同じ長さで滑らせます。半分の段から閉じるときは、Base UI が引く操作の `transition: none` を外すのと同じ瞬間に閉じた位置へ動かすため、移り変わりが始まりません。この場合だけ、離した位置から画面の下までをキーフレームで滑らせます
- **引いたときの隙間**: 閉じる向きと反対へ引くと、面が画面の端から離れて地が見えます。面と同じ色を画面の外へ伸ばしておくと、どれだけ引いても隙間が出ません

## 却下した案と理由

- **Drawer を横から出すパネルだけにする・下から出すシートだけにする**: 「下を既定、左右も選べる」
- **引く操作も 1 つに揃える（Drawer も Select の自前のフックを使う）**: 「見た目の部品を共有」。Base UI の swipe と段を捨てることになります
- **トークンだけ共有して部品のコードは別々に持つ**: 同上。見出しの形が Select と Drawer でずれていきます
- **Dialog は中央のまま、Popover だけシートにする・どちらも構造を変えない**: 「両方シートにする」
- **指では Tooltip を出さない・押すと出す**: 「長押しで出す」

## 影響

- `design/tokens.css`:
  - 役割に上げたもの: `--shadow-overlay`（重なる面のやわらかい影。`--shadow-select-popup` を改名）・`--shadow-sheet`（下から出すシートの上向きの影。`--shadow-select-sheet` を改名）・`--color-backdrop`（後ろの画面を暗くする色。`--color-select-sheet-backdrop` を改名）
  - 部品の層で共有にしたもの: 開閉の動き `--popup-duration-in`・`-out`・`--popup-ease`・`--popup-shift`（`--select-popup-*` を改名）、シート `--color-sheet-edge-shadow`・`--sheet-padding-x`・`--sheet-close-inset`・`--sheet-close-radius`・`--sheet-max-height`・`--sheet-bleed`・`--sheet-side-width`・`--shadow-sheet-left`・`--shadow-sheet-right`
  - 部品ごとに足したもの: `--dialog-width`・`--dialog-padding`・`--dialog-margin`、`--popover-padding`・`--popover-max-width`・`--popover-offset`、`--tooltip-padding-x`・`--tooltip-padding-y`・`--tooltip-max-width`・`--tooltip-offset`・`--shadow-tooltip`
- `src/internal/tv.ts`: `@theme` に足した影の名前（`overlay`・`sheet`）を tailwind-merge に知らせました（[ADR-0077](./0077-tailwind-merge-config.md)）
- `src/styles/theme.css`: はじいて閉じるときのキーフレーム `sheet-swipe-out-down` を足しました
- `src/internal/sheet/`: `SheetHeader.tsx`（つまみ・題・右上の ×）・`SheetMoreCue.tsx`（続きの印）・`SheetPopup.tsx`（Base UI の Drawer の上に作ったシートの本体）・`sheet-styles.ts`・`use-more-cues.ts`・`use-narrow-screen.ts`。Select から移したものは、`SelectSheetHeader.tsx` → `SheetHeader.tsx`、`SelectMoreCue.tsx` → `SheetMoreCue.tsx`、`use-narrow-screen.ts`
- `src/internal/overlay/`: `overlay-close.tsx`・`overlay-close-context.ts`（`OverlayClose`。浮かぶ形でもシートでも同じ書き方で閉じられる）・`popup-styles.ts`（浮かぶ面の見た目と開閉の動き）・`initial-focus.ts`
- `src/components/select/`: シートの見出しの題のまとまりを `SelectSheetTitle.tsx` に分け、共有の見出しに載せ替えました。見た目は変わっていません（見た目の回帰テストで確かめました）
- `src/components/{dialog,drawer,popover,tooltip}/`: 部品とストーリー、見た目の基準画像
- `src/index.ts`: `Dialog`・`Drawer`・`Popover`・`Tooltip`・`OverlayClose` と型を公開しました
- `README.md`: 「重なるもの」の 4 つにチェックを付けました
- **記録のコミットですること**: 比べるためだけに置いた切り替えのトークン（`--dialog-radius`・`--dialog-actions-*`・`--sheet-actions-*`・`--color-tooltip*`・`--popover-arrow-display`・`--popover-close-display`・`--popover-close-space`）を部品の決まった値に畳み、Popover の × と `initialFocus` の props を消します。比較のストーリー（`design/stories/axis-81-*`〜`axis-87-*`・`overlay-frame.tsx`）も消します
- **分かっていること**:
  - つまみを押しても、Select のシートのように半分と高さいっぱいを切り替えません。はじいたとみなす速さも Base UI の値です
  - Tooltip の長押し（500ms）は実機で確かめていません。iOS の Safari で文字の選択や端末のメニューが出ないか、スクロールの始まりと取り違えないかを見ます
  - 構造を固定する Provider（原則11 の「使う側が固定できる」）は、まだ部品ごとの `presentation` だけです
  - AlertDialog（外を押しても Esc でも閉じない確かめ）は部品として持たず、`dismissible`・`closeOnEscape`・`closeButton` の組み合わせで作ります

## 原則への反映

原則1・5・11 の文を書き換えます。

- 原則1: 重なるレイヤーに Popover・Tooltip・横から出すパネルを含めます。Tooltip は小さいので影も小さく淡くします
- 原則5: ダイアログは部品を包むので、カードと同じ一段大きい角です。浮かぶ面（選択肢・メニュー・Popover・Tooltip）は部品の角です
- 原則11: Dialog・Popover も Select と同じ判定（指で操作していて画面が狭い）でシートにします。Tooltip は指では長押しで出します

## 比較画像

画像はありません。部品を作る決定で、候補を並べて比べていないためです（[ADR-0013](./0013-secondary-color.md) と同じ扱い）。見た目は軸 81〜87 で 1 つずつ比べ、それぞれの ADR に画像を置いています。いまの見た目は、Storybook の `Components/Dialog`・`Components/Drawer`・`Components/Popover`・`Components/Tooltip` で確かめます。
