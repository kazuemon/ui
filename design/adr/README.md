# ADR（Architecture Decision Records）

デザインの決定を1つずつ記録します。原則（[`../principles.md`](../principles.md)）は考えと現れ方だけを持ち、経緯・ユーザーのメモの原文・数値・却下した案はここにだけ書きます。原則の各項目の末尾から、「経緯: ADR-NNNN」として参照します。

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
  - 比較画像は、その軸を決めたときに撮った記録です。あとの決定（和文の縦位置の補正の [0032](./0032-text-offset.md)、ヘルプテキストとエラー・警告の並びの [0041](./0041-caption-and-message.md) など）は、前の画像には当て直しません。そのため、古い画像は今の見た目と違うことがあります。撮り直しはしません（ユーザーのメモは「とりなおしはおまかせします」）。今の見た目は、Storybook の Components のストーリーで確かめます
  - [0028](./0028-default-color.md) の画像は、いまのコードで撮った画面とも、画像を足したときのコミットのコードで撮った画面とも合いません（この2つは互いに合います）。色の移り変わり（動き）の途中で撮った可能性があります。これも撮り直していません
- **後半の比較のストーリー**（`design/stories/axis-NN-*.stories.tsx`）は、決まったら消します。部品が変わると、残したストーリーでも決めたときの比較を再現できないためです。記録は比較画像と、ADR に書いた決めた時点のコミット（sha）で残します。開き直すときは `git checkout <sha> && pnpm storybook` で、決めたときの部品のまま比較を見られます
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

更新したトークン、変えた部品、分かっていること、backlog に足した未決事項。

## 原則への反映

原則 N の文を書き換えた（何をどう変えたか）／反映なし（既存の原則の範囲内）。例外として追記する選択肢はない。決定で原則が変わるなら、原則の文そのものを書き換える。

## 比較画像

![比較](./assets/NNNN-kebab-title.png)
```

## 一覧

| 番号                                                     | タイトル                                                                 | ステータス         |
| -------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------ |
| [0001](./0001-judgement-criteria.md)                     | 判断の基準                                                               | Accepted           |
| [0002](./0002-contrast-and-foreground-tokens.md)         | コントラスト基準と面用／前景用の2段                                      | Accepted           |
| [0003](./0003-token-layers.md)                           | トークンを値の層と役割の層に分ける                                       | Accepted           |
| [0004](./0004-density-and-structure-switching.md)        | 密度は入力方式、構造は画面幅で切り替える                                 | Accepted           |
| [0005](./0005-neutral-and-background.md)                 | 中立色と地                                                               | Accepted           |
| [0006](./0006-button-shadow.md)                          | ボタンの影                                                               | Accepted           |
| [0007](./0007-tag-color.md)                              | タグの色                                                                 | Accepted           |
| [0008](./0008-control-radius.md)                         | ボタンと入力欄の角丸                                                     | Accepted           |
| [0009](./0009-press-motion.md)                           | 押下の動き                                                               | Accepted           |
| [0010](./0010-section-label.md)                          | セクションラベルの書式                                                   | Accepted           |
| [0011](./0011-switch-off-track.md)                       | スイッチ OFF のトラック                                                  | Accepted           |
| [0012](./0012-primary-blue.md)                           | Primary の青                                                             | Accepted           |
| [0013](./0013-secondary-color.md)                        | ピンクは用途を限定しない Secondary                                       | Accepted           |
| [0014](./0014-nested-card-inset.md)                      | 入れ子の型のカードの余白                                                 | Accepted           |
| [0015](./0015-icon-weight.md)                            | アイコンの太さ                                                           | Superseded by 0018 |
| [0016](./0016-card-radius.md)                            | カードの角丸                                                             | Accepted           |
| [0017](./0017-card-media-aspect.md)                      | カードの画像の比率                                                       | Accepted           |
| [0018](./0018-icon-weight-by-context.md)                 | アイコンの太さを文脈で分ける                                             | Accepted           |
| [0019](./0019-field-focus-change.md)                     | 入力欄のフォーカス時の変化量                                             | Accepted           |
| [0020](./0020-control-size-fine.md)                      | マウス用の寸法                                                           | Superseded by 0079 |
| [0021](./0021-field-error-fill.md)                       | エラー時の入力欄の塗り                                                   | Accepted           |
| [0022](./0022-field-hover.md)                            | 入力欄の hover                                                           | Accepted           |
| [0023](./0023-danger-color.md)                           | Danger と Secondary の区別                                               | Accepted           |
| [0024](./0024-neutral-button.md)                         | グレーのボタンの塗り                                                     | Accepted           |
| [0025](./0025-surface-button-line.md)                    | 白いボタンの輪郭                                                         | Accepted           |
| [0026](./0026-disabled.md)                               | Disabled の表し方                                                        | Accepted           |
| [0027](./0027-flat-press.md)                             | 平らなボタン・リンクの hover と押下                                      | Accepted           |
| [0028](./0028-default-color.md)                          | 各部品の既定の色                                                         | Accepted           |
| [0029](./0029-disabled-refine.md)                        | Disabled の詰め（トグルとグレーの枠線のボタン）                          | Accepted           |
| [0030](./0030-text-link.md)                              | 文字のリンクの下線と hover                                               | Accepted           |
| [0031](./0031-focus-visible.md)                          | キーボード操作時のフォーカス                                             | Accepted           |
| [0032](./0032-text-offset.md)                            | 和文の縦位置の補正                                                       | Accepted           |
| [0033](./0033-press-edge.md)                             | 塗りのボタンを押したときの縁                                             | Accepted           |
| [0034](./0034-loading.md)                                | ボタンの送信中（loading）                                                | Accepted           |
| [0035](./0035-field-addon.md)                            | 入力欄の prefix・suffix                                                  | Accepted           |
| [0036](./0036-select-popup.md)                           | Select の浮かぶ選択肢の見た目                                            | Accepted           |
| [0037](./0037-select-sheet.md)                           | Select のボトムシートと、長い選択肢の見せ方                              | Accepted           |
| [0038](./0038-warning.md)                                | Warning の扱い                                                           | Accepted           |
| [0039](./0039-link-size.md)                              | リンクの大きさ                                                           | Accepted           |
| [0040](./0040-field-addon-rest.md)                       | prefix・suffix の残り（ボタンのフォーカスと、文字の読み上げ）            | Accepted           |
| [0041](./0041-caption-and-message.md)                    | ヘルプテキストとエラー・警告を同時に出す                                 | Accepted           |
| [0042](./0042-field-loading.md)                          | 入力欄と Select の待っているあいだ（loading）と、動きを減らす設定        | Accepted           |
| [0043](./0043-notice.md)                                 | お知らせと状態の色                                                       | Accepted           |
| [0044](./0044-message-announce.md)                       | エラー・警告の知らせ方（読み上げ、下の内容の動き、シートと選択肢の文）   | Accepted           |
| [0045](./0045-coarse-size.md)                            | 指用の高さ                                                               | Accepted           |
| [0046](./0046-link-rest.md)                              | リンクの残り（幅いっぱいの枠線のリンクと、ボタンの見た目のリンク）       | Accepted           |
| [0047](./0047-principles-probe.md)                       | 原則の読まれ方の検証と、一覧の項目・チェックボックスの決まり             | Accepted           |
| [0048](./0048-hit-area.md)                               | 押せる範囲は見た目の範囲と一致させる                                     | Accepted           |
| [0049](./0049-toggle-layout.md)                          | トグルの並びと置き場所                                                   | Accepted           |
| [0050](./0050-notice-close.md)                           | お知らせの閉じるボタンの形                                               | Accepted           |
| [0051](./0051-prop-names.md)                             | 色と送信中の印の props の名前                                            | Accepted           |
| [0052](./0052-button-caption.md)                         | ボタンのキャプション                                                     | Accepted           |
| [0053](./0053-select-selected-item.md)                   | Select の選んだ項目の見た目                                              | Accepted           |
| [0054](./0054-select-popup-motion.md)                    | 浮かぶ選択肢の開閉の動き                                                 | Accepted           |
| [0055](./0055-sheet-loading-row.md)                      | ボトムシートの読み込み中の行と、読み込みの読み上げ                       | Accepted           |
| [0056](./0056-link-lead-icon.md)                         | 幅いっぱいの枠線のリンクの前のアイコン                                   | Accepted           |
| [0057](./0057-notice-warning-filled.md)                  | 黄色の塗りのお知らせ                                                     | Accepted           |
| [0058](./0058-field-success.md)                          | 入力欄の下の成功・情報の行                                               | Accepted           |
| [0059](./0059-form-submitting.md)                        | フォーム全体を送っているあいだ                                           | Accepted           |
| [0060](./0060-server-error-focus.md)                     | 送信のあとのサーバーのエラーとフォーカス                                 | Accepted           |
| [0061](./0061-badge.md)                                  | Badge（数と小さな状態の点）                                              | Accepted           |
| [0062](./0062-checkbox-radio.md)                         | チェックボックスとラジオ                                                 | Accepted           |
| [0063](./0063-choice-press.md)                           | チェックボックス・ラジオを押したときの動き                               | Accepted           |
| [0064](./0064-choice-group-frame.md)                     | 「すべて選ぶ」のグループの枠                                             | Accepted           |
| [0065](./0065-switch-coarse-size.md)                     | 指用と大きい指用のトグルの大きさ                                         | Accepted           |
| [0066](./0066-switch-row-frame.md)                       | トグルの行の形と押せる範囲                                               | Accepted           |
| [0067](./0067-switch-row-press.md)                       | トグルの行を押したときの塗りと、OFF・箱の色                              | Accepted           |
| [0068](./0068-switch-caption.md)                         | トグルとキャプションの置き方                                             | Accepted           |
| [0069](./0069-switch-disabled-knob.md)                   | 押せない OFF のノブ                                                      | Accepted           |
| [0070](./0070-choice-error-box.md)                       | チェックボックス・ラジオのエラーの箱                                     | Accepted           |
| [0071](./0071-focus-color.md)                            | フォーカスの色と部品の色                                                 | Accepted           |
| [0072](./0072-disabled-over-error.md)                    | エラーかつ押せないときは、押せない見た目を優先する                       | Accepted           |
| [0073](./0073-link-or-button.md)                         | リンクの作り分け（移動は Link、実行は Button）と押せないリンク           | Accepted           |
| [0074](./0074-a11y-review-deferred.md)                   | 2026-09-14 の a11y レビューのうち、据え置き・backlog にしたもの          | Accepted           |
| [0075](./0075-notice-region.md)                          | あとから出すお知らせの領域と、閉じるボタンの名前                         | Accepted           |
| [0076](./0076-token-structure.md)                        | トークンを尺度・役割・部品に分け、Tailwind の名前空間で公開する          | Accepted           |
| [0077](./0077-tailwind-merge-config.md)                  | tailwind-merge にライブラリのクラスの名前を知らせる                      | Accepted           |
| [0078](./0078-reading-type.md)                           | 読む文字の大きさ                                                         | Accepted           |
| [0079](./0079-control-type-and-height.md)                | 部品の文字と高さ・余白（入力方式で文字だけを変える）                     | Accepted           |
| [0080](./0080-icon-size.md)                              | アイコンの大きさ                                                         | Accepted           |
| [0081](./0081-inline-code.md)                            | 文中のコード                                                             | Accepted           |
| [0082](./0082-kbd.md)                                    | キー                                                                     | Accepted           |
| [0083](./0083-blockquote.md)                             | 引用                                                                     | Accepted           |
| [0084](./0084-callout.md)                                | 記事の中の囲みと、Callout・Notice の分け方                               | Accepted           |
| [0085](./0085-inline-emphasis.md)                        | 文字の飾り（strong・em・del・mark）                                      | Accepted           |
| [0086](./0086-divider.md)                                | 区切り線                                                                 | Accepted           |
| [0087](./0087-figure.md)                                 | 画像                                                                     | Accepted           |
| [0088](./0088-list.md)                                   | リスト                                                                   | Accepted           |
| [0089](./0089-footnote.md)                               | 脚注                                                                     | Accepted           |
| [0090](./0090-table.md)                                  | 表                                                                       | Accepted           |
| [0091](./0091-mark.md)                                   | 目立たせたい言葉（mark）                                                 | Accepted           |
| [0092](./0092-code-block-frame.md)                       | コードの外枠と題                                                         | Accepted           |
| [0093](./0093-code-block-line-decoration.md)             | コードの行の飾り                                                         | Accepted           |
| [0094](./0094-code-block-syntax-palette.md)              | 色分けの色とコードの色のパレット                                         | Accepted           |
| [0095](./0095-code-block-line-numbers.md)                | 行番号の濃さ                                                             | Accepted           |
| [0096](./0096-prose.md)                                  | Prose の作り                                                             | Accepted           |
| [0097](./0097-prose-spacing.md)                          | Prose の余白                                                             | Accepted           |
| [0098](./0098-link-size-outside-prose.md)                | 本文の外の文字のリンクの大きさ                                           | Accepted           |
| [0099](./0099-reading-round-deferred.md)                 | 後半ラウンド（本文の部品）で据え置きにしたこと                           | Accepted           |
| [0100](./0100-prose-after-heading.md)                    | Prose の見出しのすぐ後ろの余白                                           | Accepted           |
| [0101](./0101-choice-message-gap.md)                     | 選択肢とエラーの行のあいだ                                               | Accepted           |
| [0102](./0102-overlay-components.md)                     | 重なる面の作り（Dialog・Drawer・Popover・Tooltip）                       | Accepted           |
| [0103](./0103-overlay-title.md)                          | 重なる面の題と説明の大きさ                                               | Accepted           |
| [0104](./0104-dialog-shape.md)                           | Dialog の角と大きさ                                                      | Accepted           |
| [0105](./0105-overlay-actions.md)                        | 重なる面の下の操作の並べ方                                               | Accepted           |
| [0106](./0106-tooltip-surface.md)                        | Tooltip の面と、出るまでの時間                                           | Accepted           |
| [0107](./0107-popover-close-arrow.md)                    | Popover の × と矢印                                                      | Accepted           |
| [0108](./0108-drawer-side.md)                            | 横から出す Drawer の幅と影                                               | Accepted           |
| [0109](./0109-overlay-initial-focus.md)                  | 重なる面を開いた直後のフォーカス                                         | Accepted           |
| [0110](./0110-sheet-handle-and-long-press-side.md)       | シートのつまみは引ける印、Tooltip は長押しで上に出す                     | Accepted           |
| [0111](./0111-sheet-swipe-lock-and-close-fixes.md)       | シートの引く操作を止める仕組みと、閉じるときの影・× の場所               | Accepted           |
| [0112](./0112-fill-transition-by-registered-property.md) | 塗りの移り変わりは、登録した変数で動かす                                 | Accepted           |
| [0113](./0113-foundation-components.md)                  | 土台の部品（ThemeProvider・Portal・VisuallyHidden・AspectRatio）         | Accepted           |
| [0114](./0114-icon.md)                                   | Icon の大きさと線の太さ                                                  | Accepted           |
| [0115](./0115-skeleton.md)                               | 読み込み中の面（Skeleton）                                               | Accepted           |
| [0116](./0116-image.md)                                  | 画像の読み込み中と失敗（Image）                                          | Accepted           |
| [0117](./0117-collapsible.md)                            | 開閉（Collapsible）の見た目                                              | Accepted           |
| [0118](./0118-transition.md)                             | 出入りの動き（Transition）                                               | Accepted           |
| [0119](./0119-scroll-area.md)                            | スクロールする枠（ScrollArea）                                           | Accepted           |
| [0120](./0120-container.md)                              | ページの幅と左右の余白（Container）                                      | Accepted           |
| [0121](./0121-reading-datetime-number.md)                | 文字の部品（Mark・Time・RelativeTime・NumberFormat）と言語・タイムゾーン | Accepted           |
| [0122](./0122-accordion.md)                              | Accordion の既定の見た目と、項目のあいだ・一覧の上下の区切り             | Accepted           |
| [0123](./0123-alert-dialog.md)                           | AlertDialog の実行する側の色                                             | Accepted           |
| [0124](./0124-textarea.md)                               | 複数行の入力欄（Textarea）の高さ・余白と、文字数                         | Accepted           |
| [0125](./0125-skip-link.md)                              | 本文へ移るリンク（SkipLink）の出る位置と面                               | Accepted           |
| [0126](./0126-bleed.md)                                  | 本文の幅の外へ出す枠（Bleed）の広げ方                                    | Accepted           |
| [0127](./0127-icon-only-button-shape.md)                 | アイコンだけのボタンの形                                                 | Accepted           |
| [0128](./0128-copy-button.md)                            | CopyButton で写せたことをどう見せるか                                    | Accepted           |
| [0129](./0129-card-press.md)                             | 押せるカードの hover と押下                                              | Superseded by 0169 |
| [0130](./0130-navbar-current.md)                         | Navbar のいまいるページの印                                              | Accepted           |
| [0131](./0131-navbar-sticky.md)                          | Navbar を貼り付けたときの境目                                            | Accepted           |
| [0132](./0132-recipes.md)                                | レシピ（Footer を部品にせず組み合わせの見本にする）                      | Accepted           |
| [0133](./0133-calendar-foundation.md)                    | Calendar の土台（react-day-picker と Temporal）                          | Accepted           |
| [0134](./0134-calendar-selected-day.md)                  | Calendar の選んだ日の形と塗り                                            | Accepted           |
| [0135](./0135-calendar-today.md)                         | Calendar の今日の印                                                      | Accepted           |
| [0136](./0136-calendar-keyboard-focus.md)                | Calendar でキーボードで日を動かしたときの印                              | Accepted           |
| [0137](./0137-calendar-weekend-color.md)                 | Calendar の日曜・土曜の色                                                | Accepted           |
| [0138](./0138-calendar-navigation.md)                    | Calendar の月送りの置き方                                                | Accepted           |
| [0139](./0139-calendar-outside-days.md)                  | Calendar のほかの月の日                                                  | Accepted           |
| [0140](./0140-calendar-holiday.md)                       | Calendar の祝日                                                          | Accepted           |
| [0141](./0141-calendar-range-preview.md)                 | Calendar で期間を選んでいる途中の帯                                      | Accepted           |
| [0142](./0142-calendar-month-motion.md)                  | Calendar で月を送るときの動き                                            | Accepted           |
| [0143](./0143-link-card-layout.md)                       | LinkCard の画像の位置                                                    | Accepted           |
| [0144](./0144-link-card-site.md)                         | LinkCard のサイトの行                                                    | Accepted           |
| [0145](./0145-link-card-text.md)                         | LinkCard の題と説明の行数                                                | Accepted           |
| [0146](./0146-tabs-indicator.md)                         | Tabs の選んだタブの印                                                    | Accepted           |
| [0147](./0147-tabs-motion.md)                            | Tabs の印の動き                                                          | Accepted           |
| [0148](./0148-tabs-focus.md)                             | Tabs のフォーカスの線                                                    | Accepted           |
| [0149](./0149-menu-marks.md)                             | Menu のチェックとラジオの印                                              | Accepted           |
| [0150](./0150-menu-group-label.md)                       | Menu のグループの見出し                                                  | Accepted           |
| [0151](./0151-menu-shortcut.md)                          | Menu のショートカットの文字                                              | Accepted           |
| [0152](./0152-menu-submenu-sheet.md)                     | Menu の入れ子をシートで開く形と、つまみ                                  | Accepted           |
| [0153](./0153-nav-display-foundation.md)                 | 6 部品の土台（Avatar・Breadcrumb・Pager・CodeGroup・Toast・Tree）        | Accepted           |
| [0154](./0154-avatar-shape.md)                           | Avatar の形と輪郭                                                        | Accepted           |
| [0155](./0155-avatar-fallback.md)                        | Avatar の画像がないとき                                                  | Accepted           |
| [0156](./0156-breadcrumb-separator.md)                   | パンくずリストの区切りの印                                               | Accepted           |
| [0157](./0157-breadcrumb-link.md)                        | パンくずリストの行き先の見た目                                           | Accepted           |
| [0158](./0158-pager-look.md)                             | 前後の記事へ移るナビ（Pager）の見た目                                    | Accepted           |
| [0159](./0159-code-group-tabs.md)                        | コードのタブの見た目                                                     | Accepted           |
| [0160](./0160-toast-surface.md)                          | トーストの面                                                             | Accepted           |
| [0161](./0161-toast-placement.md)                        | トーストの出方（場所・積み方・消えるまで）                               | Accepted           |
| [0162](./0162-tree-guides.md)                            | 木の字下げと案内線                                                       | Accepted           |
| [0163](./0163-tree-current.md)                           | 木のいまいる行の印                                                       | Accepted           |
| [0164](./0164-principles-reorganization.md)              | 原則の整理（1〜12 を保ち、13〜21 を足す）                                | Accepted           |
| [0165](./0165-button-emphasis-levels.md)                 | 押すものの強さは 3 段（色の塗り・グレーの塗り・枠線）                    | Superseded by 0193 |
| [0166](./0166-press-sink-scope.md)                       | 押すと沈むものの範囲                                                     | Accepted           |
| [0167](./0167-pressable-card-floats.md)                  | 全体が押せるカードは、浮いた押すものにする                               | Accepted           |
| [0168](./0168-field-suffix-acts-on-value.md)             | 入力欄の suffix に入れるのは、値に作用するものだけ                       | Accepted           |
| [0169](./0169-pressable-card-shadow-hover.md)            | 押せるカードの影と hover                                                 | Accepted           |
| [0170](./0170-readonly-field.md)                         | 読み取り専用の欄の形                                                     | Accepted           |
| [0171](./0171-field-placeholder.md)                      | プレースホルダーの色と書き方                                             | Accepted           |
| [0172](./0172-steps-line.md)                             | 手順の段をつなぐ線                                                       | Accepted           |
| [0173](./0173-spoiler-conceal.md)                        | Spoiler の隠し方                                                         | Accepted           |
| [0174](./0174-spoiler-motion.md)                         | Spoiler の見せる動き                                                     | Accepted           |
| [0175](./0175-affix-surface-edge.md)                     | 帯として留める Affix の、下の内容との境目                                | Accepted           |
| [0176](./0176-affix-gap.md)                              | Affix が留まるときの端からの離れ                                         | Accepted           |
| [0177](./0177-pagination-current.md)                     | Pagination のいまのページの印                                            | Accepted           |
| [0178](./0178-pagination-shape.md)                       | Pagination の番号の形                                                    | Accepted           |
| [0179](./0179-meter-bar.md)                              | Meter のバーの太さ・角・地の色                                           | Accepted           |
| [0180](./0180-meter-region.md)                           | Meter の範囲による塗りの色                                               | Accepted           |
| [0181](./0181-steps-marker.md)                           | 手順の番号の印                                                           | Accepted           |
| [0182](./0182-spoiler-revealed.md)                       | Spoiler を見せたあとの残り方                                             | Accepted           |
| [0183](./0183-toc-current.md)                            | 目次のいまの見出しの印                                                   | Accepted           |
| [0184](./0184-toc-nesting.md)                            | 目次の入れ子の見せ方と行の高さ                                           | Accepted           |
| [0185](./0185-reading-progress.md)                       | 記事の読了のバー                                                         | Accepted           |
| [0186](./0186-progress-indeterminate.md)                 | 終わりの分からない Progress の動き                                       | Accepted           |
| [0187](./0187-typed-field-series.md)                     | 文字を打つ欄の系列（範囲と共通の仕組み）                                 | Accepted           |
| [0188](./0188-number-field-stepper.md)                   | NumberField の増減ボタン                                                 | Accepted           |
| [0189](./0189-pin-field-box.md)                          | PinField の桁の箱                                                        | Accepted           |
| [0190](./0190-field-addon-kinds.md)                      | 欄の端に付くものの 3 種                                                  | Accepted           |
| [0191](./0191-date-field-segment.md)                     | 日付の欄の区切り                                                         | Accepted           |
| [0192](./0192-mask-field-hint.md)                        | MaskField の残りの桁の見本                                               | Accepted           |
| [0193](./0193-underline-button.md)                       | いちばん軽い押すものは、文字に下線だけの形（4 段目）                     | Accepted           |
| [0194](./0194-required-mark.md)                          | 必須の印は「必須」の pill（アスタリスクと「任意」も選べる）              | Accepted           |
| [0195](./0195-copy-failure.md)                           | コピーできなかったときは、淡い赤の吹き出しで知らせる                     | Accepted           |
| [0196](./0196-choice-readonly.md)                        | 選ぶ部品の読み取り専用は、押せないときと同じ見た目にする                 | Accepted           |
| [0197](./0197-readonly-addon.md)                         | 読み取り専用の欄でも、端に付くボタンはグレー地を残す                     | Accepted           |
| [0198](./0198-pagination-compact.md)                     | Pagination のいちばん狭い形は「10 / 20」                                 | Accepted           |
| [0199](./0199-backlog-triage.md)                         | backlog の仕分け（原則と ADR から決めたこと）                            | Accepted           |
