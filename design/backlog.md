# design/backlog

このファイルは、まだ決めていないこと・まだ作っていないものの一覧です。部品ごとに並べています。
決まったら ADR を書き、原則が変わるなら `principles.md` の文を書き換え、この一覧から該当する行を消します。
リンクは、いま分かっている土台の ADR です。

このファイルは「決めること」「レシピの案」「確かめること・既知の制約」の 3 部に分かれています。「決めること」は、まだ決めていない判断の一覧です。決まったら ADR を書き、この一覧から消します。「レシピの案」は、部品にせず組み合わせの見本として置くものの案です。「確かめること・既知の制約」は、実機で確かめることや Base UI 待ちなど、判断ではなく作業のメモで、確かめ終わったら消します。

## 決めること

### Button

- 押せない理由（キャプション）を Tab で移る人にも届けるには、押せないときもフォーカスできるボタン（aria-disabled。Base UI の `focusableWhenDisabled` に当たるもの）が要ります。いまの押せないボタンは Tab で止まりません。「Tab でのフォーカスは、今の時点では迷いがあります。」（2026-09-19）。原則 13 には、理由をそばに見える文で書くことだけを書きました。話した形（まだ決めていない）: 送信のボタンは押せなくせず、押したあとにステータスメッセージで伝える。並びの中の項目（メニュー、タブ、選択肢）は押せなくても矢印キーで止める。単独のボタンや欄を Tab で止めるかは、本物の読み上げソフトで試してから決める
- キャプションがボタンより長いときは、ボタンの幅で折り返します。和文が語の途中で折れる（「残/ります」）ので、文節で折る（`word-break: auto-phrase`。いまは Chrome だけ）かは決めていません
- キャプションのあるボタンとないボタンを横に並べるとき、`items-center` の並びでは、キャプションのないボタンが中央に寄ります。上端でそろえる決まりを使い方に書くかは決めていません
- 下線のボタンをアイコンだけにすると、下線も枠線も出ません（下線は文字にだけ引くため）。押せると分かるのか、アイコンだけのときは別の形にするかは決めていません（[ADR-0193](./adr/0193-underline-button.md)）
- いま枠線にしている場所のうち、どこを下線に落とすかは見ていません。部品と見本のページをまとめて監査します（[ADR-0193](./adr/0193-underline-button.md)）

### Link

- 下線のリンク（`appearance="underline"`）には、ボタンの見た目のリンクと同じく ↗ をいつも付けています。下線があるので文字のリンクに近く、新しいタブのときだけにするかは決めていません（[ADR-0193](./adr/0193-underline-button.md)、[ADR-0046](./adr/0046-link-rest.md)）
- 下線の太さと位置は、文字のリンクと同じ（太さ 1px・offset 4）です。太字で大きい部品の文字にも同じ値を使っているので、そろえたままでよいかは決めていません（[ADR-0193](./adr/0193-underline-button.md)）

### TextField

- 読み取り専用で値が空の欄には、いまはプレースホルダーを出しています。「なし」などの文字で値がないことを示すかは決めていません（[ADR-0171](./adr/0171-field-placeholder.md)）

### SearchField・PasswordField

2026-09-20 に作りました。決定は [ADR-0187](./adr/0187-typed-field-series.md)・[ADR-0190](./adr/0190-field-addon-kinds.md) です。

- 文字のボタン（「コピー」など。アイコンでないもの）に、グレー地を付けるかは決めていません。読み取り専用の欄でグレー地を残すのは、いまはアイコンだけのボタンの決まりです（[ADR-0190](./adr/0190-field-addon-kinds.md)、[ADR-0197](./adr/0197-readonly-addon.md)）
- 虫眼鏡のほかに、塗りのないアイコン（押せない意味の説明）をどんな場面で使うかは決めていません

### NumberField

2026-09-20 に作りました。決定は [ADR-0188](./adr/0188-number-field-stepper.md)・[ADR-0190](./adr/0190-field-addon-kinds.md) です。

- スマートフォンで数を選ぶ専用の入力（シートなど）を検討します

### PinField

2026-09-20 に作りました。決定は [ADR-0189](./adr/0189-pin-field-box.md) です。

- 伏せ字（`mask`）の ● が小さく見えます

### MaskField

2026-09-20 に作りました。決定は [ADR-0187](./adr/0187-typed-field-series.md)・[ADR-0192](./adr/0192-mask-field-hint.md) です。

- 英字の桁の見本を `A` にするか `a` にするかは、大文字のまま決めています。使ってみて見直すかもしれません
- 字間を空ける見本（`underscore`）は、打った値にも字間を当てるため、ほかの入力欄（TextField など）と値の見え方が違って見えます
- 書式付きの値（記号を含む文字列）をそのまま送る手段がありません。送る値から記号を除きたいときは、`onValueChange` の `unmasked` を使う前提です

### DateField・TimeField

2026-09-20 に作りました。決定は [ADR-0187](./adr/0187-typed-field-series.md)・[ADR-0191](./adr/0191-date-field-segment.md) です。

- `min`・`max` は、欄をエラーの見た目にするだけです。届かない値を打てなくする（区切りの増減を止める）形は作っていません
- 貼り付けた文字が日付・時刻として読めなかったときは、`onParseFail` を渡した側に伝えるだけです。決まった知らせ方（`info` に出すなど）はありません
- `ja-JP` の 12 時間制の時刻の見本は、区切りが詰まって見えます

### HeadingAnchor・DescriptionList・Stat・Timeline・Stack

2026-09-20 に作りました。決定は [ADR-0200](./adr/0200-heading-anchor-placement.md)〜[ADR-0213](./adr/0213-stack-horizontal.md) です。

- DescriptionList は、1 つの用語に複数の説明（`dd` を複数）を持たせる書き方を用意していません。1 つの `dd` の中に並べる形で足りるかは決めていません（[ADR-0202](./adr/0202-description-list-layout.md)）
- DescriptionList は、狭い画面で横から縦へ自動で切り替える形を入れていません。使う側が `layout` を切り替えます（[ADR-0202](./adr/0202-description-list-layout.md)）
- Timeline の畳むしきい値（入れ物 448px 未満）は、使う側が変えられません。props で変えられるようにするかは決めていません（[ADR-0211](./adr/0211-timeline-narrow-date.md)）

### Textarea

2026-09-19 に作りました。決定は [ADR-0124](./adr/0124-textarea.md) です。

- 読み取り専用（readOnly）の Textarea にも、右下の高さを変えるつまみが残ります。読み取り専用のときに外すかは決めていません（[ADR-0170](./adr/0170-readonly-field.md)）
- `loading`・`prefix`・`suffix` はまだありません

### CopyButton

2026-09-19 に作りました。決定は [ADR-0128](./adr/0128-copy-button.md)・[ADR-0195](./adr/0195-copy-failure.md) です。

- 写せなかったときの知らせの文言を渡す props の名前が、CopyButton（`errorLabel`）と CodeBlock・CodeGroup（`copyErrorLabel`）でそろっていません。どちらかにそろえるかは決めていません
- 失敗の知らせを出しておく長さは、「コピーしました」と同じ 2 秒です。読み落としやすいので長くするかは決めていません（[ADR-0195](./adr/0195-copy-failure.md)）
- 失敗の知らせは、いまの読み上げに割り込みません（原則15 で割り込むのは、あとから出た危険のお知らせだけ）。コピーの失敗を割り込ませるかは決めていません
- 貼り付けなど、コピー以外の失敗の知らせ方をそろえるかは決めていません
- CopyButton の既定の見た目は枠線です。下線（いちばん軽い形）に替えるかは決めていません（[ADR-0128](./adr/0128-copy-button.md)、[ADR-0193](./adr/0193-underline-button.md)）

### Card

2026-09-19 に作りました。決定は [ADR-0169](./adr/0169-pressable-card-shadow-hover.md) です（[ADR-0129](./adr/0129-card-press.md) を置き換えた）。

- Card の中にほかのリンクやボタンを置く形（題だけをリンクにして、カード全体を押せるように広げる）は用意していません

### LinkCard

2026-09-19 に作りました。決定は [ADR-0143](./adr/0143-link-card-layout.md)〜[ADR-0145](./adr/0145-link-card-text.md) です。

- `site={false}` でサイトの行を出さないときは、新しいタブの ↗ の置き場がありません。読み上げの「新しいタブで開きます」だけで伝わります
- 画像が右（既定）で文が長いレイアウトでは、画像が縦に伸びて大きく切れます。題の文字が入った OG 画像では、切れた分だけ読めなくなることがあります
- 押せない LinkCard（disabled）と、`href` を持たない LinkCard は用意していません

### Navbar

2026-09-19 に作りました。決定は [ADR-0130](./adr/0130-navbar-current.md)・[ADR-0131](./adr/0131-navbar-sticky.md) です。

- Navbar の行き先を、下に開くメニュー（NavigationMenu）にする形は決めていません
- Navbar のメニューを開いたとき、actions（Contact などのボタン）をメニューの中にも出すかは決めていません

### Tabs

2026-09-19 に作りました。決定は [ADR-0146](./adr/0146-tabs-indicator.md)〜[ADR-0148](./adr/0148-tabs-focus.md) です。

- 縦並び（vertical orientation）の Tabs は作っていません
- 並びを幅いっぱいにする `fullWidth` は作っていません
- 押せないタブは、Base UI の既定のまま矢印キーで止まります。読み上げでは「利用不可」と分かりますが、そろえるかは決めていません
- 別セッション（CodeGroup）から、Tabs に乗せ替えるときの要望が来ています。コードの題の帯に収まる高さ（`--spacing-control + 8px`）と、コードの面の色（`--cb-fg`・`--cb-muted`・`--cb-line`）に差し替えられる色の入り口です（暗い地のため）
- フォーカスの線の位置が、こちら（内側 4px）と CodeGroup 側（offset 0）で食い違っています。CodeGroup 側がユーザーに確認する予定です

### レシピ

2026-09-19 に決めました。決定は [ADR-0132](./adr/0132-recipes.md) です。

- レシピに回す部品の見直し（Sidebar が部品として要るか）は決めていません。Stack は部品にしました（[ADR-0212](./adr/0212-stack-gap.md)・[ADR-0213](./adr/0213-stack-horizontal.md)）

### Affix

2026-09-19 に作りました。決定は [ADR-0175](./adr/0175-affix-surface-edge.md)・[ADR-0176](./adr/0176-affix-gap.md) です。

- 貼り付けた Navbar の下に留めるのは `belowNavbar` で使う側が指定します。Navbar が貼り付いているかを部品が自分で読む形（Navbar が `data-sticky` を出し、`:has()` で読む）にするかは決めていません
- 留まった目次が画面より長いときの扱い（高さを画面に収めて中をスクロールさせるか）は、TableOfContents の側で決めます。上からの離れは `--affix-inset` で読めます
- 記事の横の列そのもの（目次を置く列）を部品にするか、レシピにするかは、上の Sidebar の見直しと一緒に決めます

### Calendar

2026-09-19 に作りました。決定は [ADR-0133](./adr/0133-calendar-foundation.md)〜[ADR-0142](./adr/0142-calendar-month-motion.md) です。

- 年と月を直接選ぶ機能は決めていません。月の名前を Select 2 つに替える案や、月の一覧に切り替える案があります。数を打ち込む形にするなら、NumberField を作ったあとで検討します
- DatePicker・DateRangePicker は作っていません。2 か月を並べて見せるか、「今日」に戻るボタンを持つか、日付を打ち込んだときのパース（決まった書式・和暦・全角・「9月20日」のような日本語の書き方）をどうするかを決めます（[ADR-0133](./adr/0133-calendar-foundation.md)）

### Avatar・Breadcrumb・Pager・CodeGroup・Toast・Tree

2026-09-19 に作りました。決定は [ADR-0153](./adr/0153-nav-display-foundation.md)〜[ADR-0163](./adr/0163-tree-current.md) です。

- **Breadcrumb**: 入りきらないときは折り返します。中間を「…」に畳む形（押すと全部出す）と、横にスクロールする形は決めていません。畳む形はメニュー（Menu）が要るので、Menu を作ったあとに検討します
- **Breadcrumb**: 1 段だけ（いまいるページだけ）のときも、そのまま出します。出すかどうかは使う側が決めます
- **Avatar**: 重ねて並べる形（AvatarGroup）は作っていません。縁の色や重なりの量を決めます
- **Toast**: 出ているあいだ、トーストの中の操作（× ・元に戻す）は読み上げから外れます（Base UI の作り。F6 でトーストへ移ると操作できます）。自前で読み上げに出すかは決めていません
- **Toast**: 残り時間の線は、消えるまでの時間を決めたときだけ出します。動きを減らす設定でも線は動かします（残り時間は情報なので、明滅に置き換えていません）

### Pagination

2026-09-19 に作りました。決定は [ADR-0177](./adr/0177-pagination-current.md)・[ADR-0178](./adr/0178-pagination-shape.md)・[ADR-0198](./adr/0198-pagination-compact.md) です。

- 省略（…）を押して開くメニューには、飛ばしたページをすべて並べます。ページ数が多いと項目が並びすぎます（240 ページの 120 ページ目では 117 項目）。畳み方（間引く、範囲で区切る、数を打つ欄に寄せる）は決めていません
- 数を打って移る欄（`pageInput`）と省略のメニュー（`ellipsisMenu`）を同時に付けたときの並びは決めていません。どちらも「間のページへ行く」ための口なので、重なって見えます（[ADR-0198](./adr/0198-pagination-compact.md)）
- 狭いところの切り替わる幅（32rem・28rem・24rem）は、部品の中の定数です。使う側が変えられるようにするかは決めていません

### TableOfContents

2026-09-19 に作りました。決定は [ADR-0183](./adr/0183-toc-current.md)・[ADR-0184](./adr/0184-toc-nesting.md) です。

- 目次が長いとき、画面に収めて中をスクロールさせるのは使う側（ScrollArea と `--affix-inset`）です。部品が自分で高さを収める形（`maxHeight` のような props）にするかは決めていません
- 狭い画面で記事の上に畳む形は、Collapsible と組み合わせる見本だけです。記事の上に貼り付ける帯（Affix の `surface`）の中で開く形は作っていません

### Mark・Time・RelativeTime・NumberFormat

2026-09-19 に作りました。決定は [ADR-0121](./adr/0121-reading-datetime-number.md) です。

- 数字の幅をそろえるか（tabular-nums 相当）は比べていません。欧文フォント（Mulish）の数字がもとから等幅で、見た目の差が出なかったためです

### Meter・Progress

2026-09-19 に Meter を作りました。決定は [ADR-0179](./adr/0179-meter-bar.md)・[ADR-0180](./adr/0180-meter-region.md) です。

- 2026-09-19 に Progress を作りました。バーの形・色・太さ・3 層の並びは `src/internal/bar/` で Meter と共有し、トークンも `--bar-*` にまとめました。範囲による色は Meter だけのものです。決定は [ADR-0185](./adr/0185-reading-progress.md)・[ADR-0186](./adr/0186-progress-indeterminate.md) です
- 原則にない判断: 終わった（`value` が `max`）ときも見た目は変えない（`data-complete` だけ付ける）。終わりの分からないときは値の文字も読み上げの値の文も出さない。読了のバーは読み上げから外す（`aria-hidden`。値が変わるたびに音で知らせる読み上げがあるため）
- 読んだ割合を計算するフック（`useReadingProgress`）は、いまはストーリーの見本だけにあります。ブログで使うときに公開するかを決めます

### Spoiler

2026-09-19 に作りました。決定は [ADR-0173](./adr/0173-spoiler-conceal.md)・[ADR-0174](./adr/0174-spoiler-motion.md)・[ADR-0182](./adr/0182-spoiler-revealed.md) です。

- 段落や画像のような大きなまとまりを隠す形（ぼかした面に「押して表示」を重ねる形）は作っていません。いまは Collapsible で「答えを見る」として置く案内にしています。ブログで要るようなら決めます

### Select

- 読み取り専用の Select は、押しても開きません。破線の輪郭と淡い ▼ から、開かないことを使う人が予想できるかは分かっていません。書き方（Docs）で補うかを決めます（[ADR-0196](./adr/0196-choice-readonly.md)）
- 選択肢の群（Base UI の `Select.Group`）の形は、Combobox の [ADR-0214](./adr/0214-combobox-scope.md) で決まりました。`items` に、`label` と `items` を持つまとまりの配列を渡す形です（children で組み立てて context でつなぐ形は採りません）。Select にはまだ足していません。同じ形で足します（[ADR-0037](./adr/0037-select-sheet.md)）
- Select の浮かぶ面と項目は、Combobox と同じ `src/internal/listbox` に乗せ替えました（見た目は変えていません）。`--select-popup-*` のトークン名を `--listbox-popup-*` に寄せるかは決めていません

### Combobox・Chip

2026-09-20・21 に作りました。決定は [ADR-0214](./adr/0214-combobox-scope.md)〜[ADR-0221](./adr/0221-combobox-sheet-close.md) です。

- Combobox に、新しい選択肢を作る形（creatable）・仮想化・`limit`・grid・inline は渡していません。文字を値にする形は Autocomplete、タグを作る形は TagsInput に分けました（[ADR-0222](./adr/0222-autocomplete-scope.md)・[ADR-0230](./adr/0230-tags-input-scope.md)）
- 複数選ぶ欄で、欄の先頭で ← を押すとチップへ移れることを伝える読み上げの文（`aria-description` の prop）は作っていません。変換中に先頭で ← を押したときにチップへ移ってしまうかは、実機で確かめていません
- 長いチップを、切らずに折り返して見せる形は決めていません（部品の直しが要ります）。省略は `chipMaxWidth` だけです
- Chip の押せる・選べる形（pressable・selected）は作っていません
- 読み取り専用の Chip（グレーの地）は「一旦」の見た目です。文字と面の比が 3.96:1 で、AA の 4.5:1 に届きません。見た目を確定するときに文字色を直します（[ADR-0219](./adr/0219-chip-look.md)）
- シートの閉じるの「完了」は、部品が持つ既定の文です（`sheetCloseText` で差し替えられます）。多言語の対応は決めていません
- シートを開いたあと、ヘルプ・エラーの行が出入りすると打つ欄が動きます。そのままにしています
- 選べない選択肢の理由・警告・欄のエラーの文の書き方は、Select と同じく、部品のドキュメントで示す前提です。まだ書いていません（[ADR-0044](./adr/0044-message-announce.md)）
- Autocomplete と TagsInput が使う分は `src/internal/` へ移しました（見た目は変えていません）。浮かぶ面とシートの外枠・キーボード用の見えない打つ欄・開閉のスクロールの戻し・シートの閉じるボタン・空の行・まとまりの描画は `src/internal/combobox-base/`、欄の中のチップ一式と入力欄型の本体のクラスも同じ場所、選択肢の形（`items`）・読み込みの知らせ・`sideOffset` の計算・`groupLabelStyle` の型は `src/internal/listbox/` です
- 欄の中のチップの大きさのトークン（`--combobox-chip-*`）は、TagsInput も使いますが名前は変えていません。`--select-popup-*` と同じで、名前を部品から切り離すかは色のばらつきを整えるときにまとめて決めます

### Autocomplete・TagsInput

2026-09-21 に作りました。決定は [ADR-0222](./adr/0222-autocomplete-scope.md)〜[ADR-0226](./adr/0226-autocomplete-list-scroll.md)、[ADR-0230](./adr/0230-tags-input-scope.md)〜[ADR-0234](./adr/0234-tags-input-pending.md) です。

- Autocomplete の `side`（候補を上に出す）は、入れていません。PC の IME の変換候補が入力欄の下に出て、候補と重なるためです。実機（Windows の IME）で兼ね合いを確かめてから決めます。TagsInput にも要るかは、同じときに決めます
- 候補を上に出すと、欄のラベルに重なる場合の扱いは決めていません（`side` を入れるとき）
- Autocomplete の候補の一覧は ScrollArea の見た目ですが、Select・Combobox の一覧には適用していません。適用するか、`popoverMoreCue` を外すかは決めていません（[ADR-0226](./adr/0226-autocomplete-list-scroll.md)）
- Autocomplete で、選んだ候補の印（完全一致のときだけチェック）は外しました。必要になったら再検討します（[ADR-0223](./adr/0223-autocomplete-filter.md)）
- TagsInput の、弾いた Chip の上・下にツールチップの見た目で文を出す案（[ADR-0232](./adr/0232-tags-input-reject.md) の F・G）は採っていません。live region とセットが要ること、上はラベルに、下は次の行の Chip に重なることが分かっています。文に名前を入れる方が、目でも耳でも同じ文になります
- TagsInput の、「、」を既定の区切りに入れるか（IME の変換で入るため）、`max` に達したときの見せ方、追加・弾いたことの読み上げ（`rejectMessage` は使う側が書く）は決めていません
- 実機で確かめていないもの: `enterKeyHint`（Android の「次へ」）、`side` の IME との兼ね合い（Windows）

### Menu

2026-09-19 に作りました。決定は [ADR-0149](./adr/0149-menu-marks.md)〜[ADR-0152](./adr/0152-menu-submenu-sheet.md) です。

- `MenuCheckboxItem`・`MenuRadioItem` は、選んだ行に面を敷きません（Select の選んだ項目は面を敷きます）

### 重なるもの（Dialog・Drawer・Popover・Tooltip）

2026-09-18 に作りました。決定は [ADR-0102](./adr/0102-overlay-components.md)〜[ADR-0110](./adr/0110-sheet-handle-and-long-press-side.md) です。ここに残るのは、まだ決めていないこと・確かめていないことだけです。

- Drawer の半分の段は、Base UI の snap points で面をずらして作っています。Select のシートと違い、つまみを押しても半分と高さいっぱいを切り替えません。はじいたとみなす速さも Base UI の値です。Select のシートの引く操作とそろえるかは決めていません
- 段（半分と高さいっぱい）があるシートでは、引いても後ろの暗さが変わりません。Base UI の引いた量が段の位置によらず 1 になるためです。閉じる方へ引くときだけ薄くするなら、引いた距離と面の高さから自分で割合を出す必要があります
- 面に渡したトークン（`--sheet-padding-x` など）は、浮かぶ部分が祖先の密度を写し直すので、使う側が祖先で上書きしても面の中に伝わりません。密度で変わる値を面の外から差し替える仕組みは決めていません

### Notice

- トースト（Toast）は 2026-09-19 に作りました。面はお知らせと同じで、ページの上に重なります。ページの流れの中に出すお知らせは、これまでどおり NoticeRegion の中に置きます

### Form・読み上げ

- `<Form>` は Base UI の Form を包まない自前の部品で、「一旦」の形です。サーバーのエラー（errors）をまとめて受け取る形を作るときに見直します（[ADR-0044](./adr/0044-message-announce.md)）
- 必須・任意の印の文言は「必須」「任意」で固定です（[ADR-0194](./adr/0194-required-mark.md)）。英語などに差し替える口（props やテーマ）を作るかは決めていません
- 1 つのフォームで、必須の印と任意の印を混ぜてよいかは決めていません。どちらか一方にそろえる勧め方を書くかも含めて決めます（[ADR-0194](./adr/0194-required-mark.md)）
- 赤い「\*」を選んだときに要る「\* は必須の項目です」の一文は、使う側が書く前提です。見本のページと Docs のどこに、どう置いて見せるかは決めていません

### Switch・Tag・Badge・Chip

- Chip は 2026-09-21 に Combobox と一緒に作りました（[ADR-0217](./adr/0217-combobox-chips.md)・[ADR-0219](./adr/0219-chip-look.md)）。残りは「Combobox・Chip」にあります
- Badge の数がその場で変わっても、読み上げでは知らせません。数がその場で増える通知のボタンを作るときに決めます
- 「99+」のような横長の Badge は、角を中心に左右へ伸びます。右寄せにして左へ伸ばすかは比べていません

### Checkbox・Radio

- グループの説明（エラー）は、読み上げソフトによっては、グループに入ったときに読まれません。送信時のグループのエラーの知らせ方は決めていません。案は、グループのエラーの行だけ送信時も polite で知らせる形と、エラーのあいだ各選択肢の aria-describedby にも行をつなぐ形です。本物の読み上げソフトで確かめてから決めます
- キーボードの Space で切り替えたときは、押したときの見た目（沈んで濃くなる）になりません。ボタンは Space でも出ます。そろえるかは決めていません
- 大きい指用（coarse-large）で、行の高さは 52px になりますが、箱の大きさは変えていません。トグルのように比例させるかは決めていません
- グループ（fieldset）には読み上げの必須を付けられないので、必須であることはキャプションの文でも書く必要が残ります。書き方を決まりにするかは決めていません（[ADR-0194](./adr/0194-required-mark.md)）
- 読み取り専用と押せないものは、見た目で見分けられません（[ADR-0196](./adr/0196-choice-readonly.md)）。使う人にどう伝えるか（どちらを選ぶかの目安を Docs に書く、読み取り専用の理由をキャプションに書かせる、など）は決めていません

### 色の面（Surface）

- 色の面とダークモードを ThemeProvider に入れるかは決めていません。名前は、いずれ色も渡す前提で ThemeProvider にしました（[ADR-0113](./adr/0113-foundation-components.md)）
- 濃紺・青などの色の面の上に部品を置く仕組みがありません。いまは、青いカードの上で青いフォーカスの線が地との比 1.00 で見えず、濃紺の上でも 3.05 です。「青のカードにおいても filled な notice と同じように白いフォーカスリングになるようにしたいですね。これは props で切り替えできるようなものですか？」「ユーザー側の任意コンポーネント内で利用するとしたときは props しかないかなと思っているのですが、2つの経路を作るのはいいと思いますか？」「kazuemon/ui で提供されるコンポーネント同士での親和性も維持できそうですね」
  - 話した形（まだ決めていない）: 仕組みは属性 `data-surface="primary"` などの1つにし、その中で差し替える値（フォーカスの線・リンクの色・Badge の縁・`--focus-follow-color` の戻しなど）を CSS の1か所に書く。入口は、部品 `Surface` の props（`color`、`render` でユーザーの要素に付けられる）と、属性を直接書く形（MDX・サーバーの HTML・CSS だけの場所）の2つ。CSS 変数そのものの上書きは公開の使い方にしない。部品ごとの props（ボタンに線の色を渡すなど）は作らない
  - 入れ子は近い指定が勝つ（白いカードを `data-surface="default"` で戻す）。浮かぶ選択肢は body に描くので引き継がない（選択肢は白い面なので、それで正しい）
  - 塗りのお知らせ（Notice の filled）が中でしている差し替え（`--color-focus-ring`・リンクの色 — ADR-0043）を、この仕組みで作り直せるか
  - 面の上で部品ごとに決めること: 面と同じ色のボタン・ON のトグル・選んだ箱が溶ける（白いボタンを使う決まりにするか、面で差し替えるか）、キャプションなどの薄い文字と境界線の色、入力欄の枠線（ADR-0071 の M で濃紺）、エラーの欄の外側の線（面では白になり「赤・白・白」）、「すべて選ぶ」の枠の文字の下の色（`--color-choice-frame-notch-bg`）
  - 濃紺・青・ピンクの面の上で比べる（フォーカスの色は ADR-0071 で決まった）
  - 入口の形は 2026-09-17 に合意しました。「変数を上書きさせるのではなく、パターンごとに data 属性での切り替えをあらかじめ用意しておくということですね。よさそう」。作るのは「あとからでも入れられそう」（[ADR-0076](./adr/0076-token-structure.md)）
  - 作るときの注意: CSS 変数は宣言した要素で解決されるので、ほかの役割を指す役割（`--color-fg-info: var(--color-on-primary-subtle)` など）は、入口のセレクター（`[data-surface]`）でも宣言し直します。`:root` だけに書くと、入口で根の役割を差し替えても伝わりません
  - ダークモード（[ADR-0003](./adr/0003-token-layers.md)）も、同じ入口の1つとして作れるかを見ます

### 密度・全体

- ページ全体の倍率（スケール）を持ちたい、という話が出ています。「大きい指用というよりも、web ページ全体のスケールとしてコントロールできると良さそう」。大きい指用（`coarse-large`）で文字も大きくしたいこと、`coarse-large` という名前が直感的でないこと（「coarse-large ってあまり直感的なクラス名ではないような気もします」）から出ました（[ADR-0045](./adr/0045-coarse-size.md)）
  - おすすめ（まだ決めていない）: 寸法のトークン（高さ・文字・行の高さ・余白・間・アイコン・トグル）を rem で書き、`round()` で整数の px に丸めます。全体の倍率は html の文字の大きさで決めます。線の太さ・影・角丸は px のままです（角丸は原則5 の「高さに比例させない」）。行の高さは、上下の余白を丸めて「高さ − 余白 × 2」で出し、高さとの差を偶数に保ちます（[ADR-0032](./adr/0032-text-offset.md)）。`coarse-large` はやめ、指のときだけ大きくしたいアプリは `@media (pointer: coarse) { html { font-size: 118.75% } }`（52px 相当）と書きます（ADR-0045 を置き換える）。Storybook のツールバーの「指用の高さ」は「全体の倍率」（100%・112.5%・125%・150%）にします
  - 選ばない形: CSS の `zoom`（ブラウザで挙動が違い、1px の線もぼやけ、Select の高さの計算など要素の大きさを測る処理がずれる）、倍率の変数だけ（ブラウザの既定の文字の大きさの設定に従えず、下の px と rem のちぐはぐが残る）
  - 分かっていること: `round()` は Chrome 125・Firefox 118・Safari 15.4 以降で使えます。rem と `round()` で、html の文字 16・18・20px に対して部品の高さが 44・50・56px になることを確かめました（Chromium 151）。行の高さを別に丸めると、18px のとき高さとの差が奇数（50 − 27）になります。ブラウザの拡大（Cmd/Ctrl ＋、ピンチ）は、どの形でも効きます。iPhone の Safari には既定の文字の大きさの設定がありません
  - 一部（section など）だけを大きくすることは、rem ではできません（rem はいつも html の文字の大きさが基準）。残すなら、倍率の変数を別に持ちます
  - 決めること: この形で進めるか、一部だけ大きくする仕組みを残すか、何を大きくするか（角丸と線はそのままでよいか）
- 大きい指用（`coarse-large`）で、左右の余白・並べる間を変えるかは比べていません。
- どんな場面で大きい指用を使うかは決めていません（[ADR-0045](./adr/0045-coarse-size.md)）

### トークン・テーマ

- ダークモードを、部品ではなくライブラリの機能として入れたいです（2026-09-20、「機能としてダークモードを実装したい、という気持ちなので、コンポーネントではないかも」）。役割のトークンのダーク版と、ThemeProvider（または属性）での切り替えの入口を決めます。入口は「色の面（Surface）」の仕組みと 1 つにできるかを見ます
- 色のばらつきを整える軸は、あとでやります（「色のばらつきは後からやりましょう」— [ADR-0076](./adr/0076-token-structure.md)）。パレットを OKLCH で測ると、同じ番号でも明度がそろわない（50 は 0.940〜0.970、700 は 0.499〜0.564）、番号の意味が族ごとに違う（pink-500 は中くらい、warning-500 は明るい）、ほぼ同じ色が別の名前で並ぶ（gray-100 と gray-150、gray-200 と gray-300）、薄い赤が 3 段で間が不ぞろい（red-50・red-75・red-100。色相も 23°・17°・26°）、グレーの色相が 197° と 229° で混ざる、が分かっています。ストーリーでパレットの表と部品の見本を候補ごとに並べ、グレー → 赤・ピンク → 青・水色 → 状態の色の順に1軸ずつ決める計画です
- 利用者向けの CSS（`src/styles/index.css`）は、Tailwind の既定の色と影を消していません（消すのは Storybook の `globals.css` だけ）。利用者にも役割の色だけを使わせるなら、`index.css` でも消します
- 部品の中を、名前付きのクラス（`h-(--spacing-control)` → `h-control`、`text-(length:--text-caption) leading-(--leading-caption)` → `text-caption`）で書き直すかは決めていません。tailwind-merge の設定（[ADR-0077](./adr/0077-tailwind-merge-config.md)）を入れたので、書き直しても `className` の上書きは効きます
- 尺度に乗らない値が残っています: チェックボックスの角（5px。角丸の尺度は 4px・6px）、浮かぶ選択肢が閉じる長さ（150ms）、トグルのトラックとノブの隙間（3px）
- 使っていないトークンがあります: ブランドの色の `--color-on-brand`、セクションラベル（`--label-*`）、palette の `blue-500`・`sky-600`・`info-50`・`info-500`・`mint-50`・`success-500`。部品を作るとき、色の軸で残すかを決めます

### 本文（Prose・CodeBlock など）

- スクロールの判定は `src/internal/use-scrollable.ts` にまとめ、横にはみ出しているあいだだけ Tab で止まるようにしました。CodeBlock のスクロールそのものを外側の包みに移すかは決めていません（いまはコードの要素がスクロールします）
- Steps: 段の間（32px）・題と本文の間（4px）・題の大きさ（見出しの段に従う）・印と文字の間（12px）は、原則にない判断として仮に置いています
- Steps と Timeline の点の props の名前をそろえます。Timeline は、点の props を `markerType`（点の種類）・`markerSize`（点の大きさ）にしました（`size` だと文字の大きさに読めるため）。Steps の `marker` も `markerType` に、必要なら `line` も合わせて変えます。Steps の `size` の扱い（見出しの段に従う）も、点の大きさとの関係を含めて決めます。Steps と Timeline は同時に変えます（2026-09-20）

### 機能（README の「つくりたい機能」）

- Tailwind を入れているときと、入れていないときの入れ方を、それぞれ書きます（2026-09-20）。入れていないときはビルド済みの CSS を配ります
- スタイルの衝突: 利用者向けの `src/styles/index.css` は中で `tailwindcss` を読み込んでいるので、使う側にも Tailwind があると Tailwind の CSS が 2 回入り、使う側の CSS と順番がぶつかります。Tailwind あり・なしのそれぞれで、CSS のレイヤー（`@layer`）に閉じ込めるなどの手当てを決めます
- フォントの読み込み: 部品は Mulish・IBM Plex Sans JP・Geist Mono を前提にしています。和文フォントは重いので、ライブラリには同梱せず、使う側で別に読み込んでもらう形を推奨にします（2026-09-20）。読み込み方の例と、読み込まないときに代わりに使われるフォントを書きます
- テーマの上書き: 使う側がブランドの色や角を差し替える公開の入口です。ダークモード・色の面と同じ仕組みで作れるかを見ます
- 対応環境: React のバージョンと、ブラウザの下限（Tailwind v4 は Safari 16.4 以降が前提）を決めて書きます
- ほかの候補: ハイコントラストモード（`forced-colors` で枠やフォーカスの線が消えないようにする）、アイコンの差し替え（部品の中のアイコンを使う側のセットに替える）
- 公開: npm に公開します（機能の一覧には置きません）。いまは package.json の `exports` がビルド前の `src/index.ts` を指し、`peerDependencies` に `react`・`react-dom` がありません。ビルドの手順（ESM と型）と一緒に整えます。ツリーシェイクと Server Components 対応は、ビルドのやり方と一緒に決めます

## レシピの案

- レシピは README の一覧に載せず、要るときに `src/recipes/` へ直接足します（2026-09-20）。いまの案:
  - PostCard・PostList: ブログの記事カードと一覧。Card・Time・Tag・Pagination を組み合わせる
  - ShareButtons: X への共有と URL のコピー。CopyButton と Link を組み合わせる
  - ダークモードの切り替え: 下の「トークン・テーマ」のダークモードができたら、Toggle か Menu で ThemeProvider を切り替える形にする

- ほかのライブラリと一緒に使うときの統合の見本も、レシピとして置きます（2026-09-20）。いまの案:
  - フォーム: react-hook-form・Zod（Field のエラーの行とのつなぎ方、送信中の固定）、Conform・Next.js の Server Actions（サーバーで検証したエラーを Field に出す）
  - MDX: @next/mdx・next-mdx-remote・Velite（h2・a・code などを部品に割り当てる。TableOfContents に渡す見出しを集める）
  - コード: Shiki（CodeBlock・CodeGroup に色付けしたコードを渡す）
  - ルーター: next/link・React Router・TanStack Router（Link・Navbar・Pagination・Breadcrumb に `render` でルーターのリンクを渡す）
  - 画像: next/image（Image・Figure・Gallery に渡す）
  - ダークモード: next-themes（機能のダークモードができたら）
  - 多言語: next-intl・react-i18next（機能の多言語ができたら）
  - データ取得: TanStack Query（読み込み中に Skeleton・Progress・Spinner、失敗したら Notice・Toast）
  - 日付: date-fns・Temporal（Calendar・Time・RelativeTime）

- 使う人がよく組むものも、レシピの案に置きます（2026-09-20）。src/samples の見本ページ（記事・ドキュメント・サインイン・設定・一覧・SNS）と重ならない、小さな組み合わせにします:
  - ページの見出し帯: 題・Breadcrumb・操作のボタンを 1 行に並べる
  - 記事のメタ行: 著者（Avatar）・公開日（Time）・読了時間・Tag
  - 関連記事・シリーズの案内: LinkCard・List・Pager
  - 作品カード・自己紹介・トップの見出し（Hero）: ポートフォリオのトップで使う Card・Image・Avatar・Button の組み方
  - お問い合わせフォーム: Form・TextField・Textarea で送り、結果を Toast で知らせる
  - 削除の確認: AlertDialog と送信中のボタン（非同期の確定）
  - 検索できる一覧: 検索の欄・List・Pagination と、結果がないときの表示
  - Stat を横に並べる並べ方（指標の行）: Stat と Stack（未着手）
  - 読み込み・空・失敗の 3 つの状態: Skeleton・StatusPanel・Notice の出し分け
  - 狭い画面のメニュー: Navbar と Drawer（Navbar が持っていない分）
  - 言語の切り替え: Menu で切り替える（機能の多言語ができたら）
  - Cookie の同意: Notice か Drawer で下に出す
  - 404・エラーのページ: StatusPanel と戻るリンク

## 確かめること・既知の制約

### Button・Link

- 下線のボタン（`appearance="underline"`）の押せる範囲は、枠線のボタンと同じ部品の大きさです。枠線がないので、押せる広さは hover の塗りでしか見えません。指で押して広すぎないかを実機で確かめます（[ADR-0193](./adr/0193-underline-button.md)）

### CopyButton・CodeBlock

- 写せなかったときの淡い赤の吹き出しが、暗い面（CodeBlock・CodeGroup の帯）の上でどう見えるかは実機で確かめていません（[ADR-0195](./adr/0195-copy-failure.md)）

### TextField

- 読み取り専用の欄がエラーになると、欄に淡い赤の塗りと赤い枠線が出ます。読み取り専用は塗りを持たない決まり（[ADR-0170](./adr/0170-readonly-field.md)）とぶつかります。ボタンの地はエラーのとき赤みにそろえました（2026-09-20）。欄そのものの塗りをどうするかは決めていません
- 読み取り専用でエラーの欄は、欄の地とボタンの地で赤みの強さがそろっているかを実機で見ます（[ADR-0197](./adr/0197-readonly-addon.md)）

### 調べている途中

- チェックボックスやスイッチを切り替えたときに色がちらつく件: スイッチのトラックは直しました（[ADR-0112](./adr/0112-fill-transition-by-registered-property.md)）。Windows の GPU あり Chrome 153 の録画で、`background-color` の 100ms の移り変わりの最後の 1 フレームに動かす前の色が出ていました（コンポジタで動かした色を主スレッドへ戻すときの取りこぼし）。`background-color` を transition で動かす要素はすべて、登録した変数を動かす形にしました。チェックボックスの箱は色を動かしていないので、チェックボックスで見えたものが同じ現象かは分かっていません（見えたら録画で確かめる）
- タッチで速く押すと、Chrome は `:active` を離したあと（切り替わったあと）に 100〜150ms 付けることがあり、トグルのノブが滑りながら縮んで戻ります。押下を `:active` ではなく pointer イベント（pointerdown〜pointerup）で持つ直しを、レンダリングの件とは別に出します。チェックボックス・ラジオ・ボタンの `:active` も同じ

### Link

- Chrome は、名前を付けていないリンクや aria-labelledby のリンクで、「リポジトリ （新しいタブで開きます）」のように文の前に空白を入れます（読み上げの文が絶対配置で、ブロック扱いになるため）。二重には読まれません

### 検索欄・パスワード・確認入力・型違いの欄・金額の欄（レシピに回したもの）

2026-09-20 に作る範囲を決めました（[ADR-0187](./adr/0187-typed-field-series.md)）。検索欄と外の検索ボタンの組み、パスワードと強さのメーター、確認入力、メール・URL・電話の欄、金額の欄は、部品にせずレシピに回します。

- まだレシピを書いていません

### SearchField・PasswordField

2026-09-20 に作りました。決定は [ADR-0187](./adr/0187-typed-field-series.md)・[ADR-0190](./adr/0190-field-addon-kinds.md) です。

- 押せない欄で、ボタンの塊の地がグレーの欄に溶けて見えるかは確かめていません

### NumberField

2026-09-20 に作りました。決定は [ADR-0188](./adr/0188-number-field-stepper.md)・[ADR-0190](./adr/0190-field-addon-kinds.md) です。

- 「円」「万」のような単位は打てません。数字だけを受け取ります
- 増減ボタンは Tab で止まりません
- `stepper="none"` のときのラベルを押したまま動かす操作（scrub）は、指で確かめていません
- `stepper="split"` で prefix・suffix の文字を値の横に置いたとき、値だけで文字（「円」など）がない欄でも、空の値が中央に出るかは確かめていません

### PinField

2026-09-20 に作りました。決定は [ADR-0189](./adr/0189-pin-field-box.md) です。

- 読み取り専用で、桁ぶんの破線の輪郭が並ぶと、うるさく見えないかは確かめていません

### MaskField

2026-09-20 に作りました。決定は [ADR-0187](./adr/0187-typed-field-series.md)・[ADR-0192](./adr/0192-mask-field-hint.md) です。

- 見本の層は、書式より長い値を渡すとずれる可能性があります。確かめていません

### DateField・TimeField

2026-09-20 に作りました。決定は [ADR-0187](./adr/0187-typed-field-series.md)・[ADR-0191](./adr/0191-date-field-segment.md) です。

- 区切りごとに Tab キーで止まりません。次の区切りへは、値を打ち終えたときの自動送りだけで移ります
- `color` を指定した欄で、フォーカスの枠線が実際にその色に従っているかは、Select にそろえた仕組み（[ADR-0071](./adr/0071-focus-color.md)）を使っているだけで、個別には確かめていません
- 色の型（Select の `SelectColor` と DateField・TimeField の `DateSegmentColor`）は、同じ形なので internal にまとめるかもしれません

### Textarea

2026-09-19 に作りました。決定は [ADR-0124](./adr/0124-textarea.md) です。

- 右下のつまみで一度高さを変えたあと、入力に合わせて伸びる動きへ戻す手段がありません
- iOS で右下のつまみがどう見える・操作できるかは実機で確認していません
- 高さの計算（`--textarea-min-height`・`--textarea-max-height` など）は欄の要素で密度のトークンを読むので、開いたあとに祖先の密度が変わっても再計算されるかは確認していません

### Accordion

2026-09-19 に作りました。決定は [ADR-0122](./adr/0122-accordion.md) です。

- 入れ子の Accordion（Accordion の中に Accordion）は確かめていません

### AlertDialog

2026-09-19 に作りました。決定は [ADR-0123](./adr/0123-alert-dialog.md) です。

- シートの面の読み上げの役割（`alertdialog`）は、`PopupRole` が DOM の `role` 属性を layout effect で書き換えるハックで付けています。Base UI の `SheetPopup` が role を props で受け取らないためで、`SheetPopup` に role を渡せるようにするのが本筋です

### LinkCard

2026-09-19 に作りました。決定は [ADR-0143](./adr/0143-link-card-layout.md)〜[ADR-0145](./adr/0145-link-card-text.md) です。

- Prose は中の `a` に `--color-own-focus` を primary で当てているため、LinkCard を Prose の中に置くとフォーカスの線が青くなる可能性があります。確かめていません
- 画像が読み込みに失敗すると、Image の失敗の見た目（アイコンだけ）になります

### Tabs

2026-09-19 に作りました。決定は [ADR-0146](./adr/0146-tabs-indicator.md)〜[ADR-0148](./adr/0148-tabs-focus.md) です。

- フォーカスの線が枠で切れないよう、並び（TabList）を外へ 4px 広げているので、左右に余白がない場所ではその分だけ枠をはみ出すことがあります

### Avatar・Breadcrumb・Pager・CodeGroup・Toast・Tree

2026-09-19 に作りました。決定は [ADR-0153](./adr/0153-nav-display-foundation.md)〜[ADR-0163](./adr/0163-tree-current.md) です。

- **Avatar**: 大きさの段（24/32/40/56px）と頭文字の大きさは提案のままです。使ってみて見直すかもしれません
- **Pager**: 縦に積む幅（28rem）は、コンテナクエリの条件に CSS 変数を書けないので、コード側の定数です（Navbar の 48rem と同じ扱い）
- **Tree**: 行の高さは部品の高さ（44px）のままです。ドキュメントのサイドバーで高く感じるかは、実機で確かめてから決めます
- **CodeGroup**: タブは Base UI の Tabs を直に使い、部品としての Tabs には乗せていません（[ADR-0153](./adr/0153-nav-display-foundation.md)）。見た目の決まり（pill の hover・内側のフォーカスの線・境目の線に重なる印・太字の写しで幅を取る）は Tabs とそろえてあるので、Tabs 側の値が変わったら合わせます

### Pagination

2026-09-19 に作りました。決定は [ADR-0177](./adr/0177-pagination-current.md)・[ADR-0178](./adr/0178-pagination-shape.md)・[ADR-0198](./adr/0198-pagination-compact.md) です。

- 狭いときの切り替え幅（28rem で左右の番号を省く・32rem で前へ・次へを矢印だけにする）は、コンテナクエリの条件に CSS 変数を書けないので、コード側の定数です
- 数を打って移る欄（`pageInput`）は、番号のリンクと違って移動をリンクで行いません。ルーターの `render` でリンクを差し替えている画面では、`onChange` も渡さないと移れません。使い方に書くかは、レシピを書くときに見ます
- 省略（…）のメニューと、数を打って移る欄は、指で確かめていません（メニューはシートで出るか、欄に打ったあと IME の確定で移れるか）（[ADR-0198](./adr/0198-pagination-compact.md)）

### TableOfContents

2026-09-19 に作りました。決定は [ADR-0183](./adr/0183-toc-current.md)・[ADR-0184](./adr/0184-toc-nesting.md) です。

- 今の見出しになる線（`offset`）の既定は、スクロールする枠の高さの 4 分の 1 です。見出しの `scroll-margin-top` があれば、それより手前にはしません。記事の書き方に合うかは使ってみて見直します

### Mark・Time・RelativeTime・NumberFormat

2026-09-19 に作りました。決定は [ADR-0121](./adr/0121-reading-datetime-number.md) です。

- `Intl.RelativeTimeFormat`・`Intl.NumberFormat` の言い回しは、ICU のバージョンでブラウザによって変わることがあります

### Meter・Progress

2026-09-19 に Meter を作りました。決定は [ADR-0179](./adr/0179-meter-bar.md)・[ADR-0180](./adr/0180-meter-region.md) です。

- 値の文字の置き場所（ラベルの行の右端、ラベルと同じ大きさで一段淡く）は比べていません。バーの下や右に置く形は、使ってみて要れば足します

### Spoiler

2026-09-19 に作りました。決定は [ADR-0173](./adr/0173-spoiler-conceal.md)・[ADR-0174](./adr/0174-spoiler-motion.md)・[ADR-0182](./adr/0182-spoiler-revealed.md) です。

- 見せたあと、フォーカスは同じ要素に残りますが、読み上げが出てきた中身を読み直すかは実機（VoiceOver・NVDA）で確かめていません
- 隠しているあいだも中身は DOM にあり、ページ内検索（inert なので Chrome では当たらない）以外の手段では読めます。本気で隠すものには使わない前提です

### Select

- 選べない理由・警告・欄のエラーの文の書き方は、部品のドキュメント（JSDoc・Storybook の Docs）で示す前提です。まだ書いていません（[ADR-0044](./adr/0044-message-announce.md)）
- 浮かぶ選択肢の項目の数の上限（10.5）は「一旦」の値です。使ってみて見直すかもしれません（[ADR-0037](./adr/0037-select-sheet.md)）
- シートをはじいたとみなす速さ（0.5px/ms）と、はじいて閉じる動きの長さ（速さによらず 250ms）は仮の値です。実機で詰めます
- 祖先の `data-density`・`coarse-large` は開くときに読んで写すので、開いたまま祖先の属性やクラスが変わっても写し直しません
- シートの読み込み中の行を、選択肢が 0 件のときだけ高くするかは比べていません
- 読み取り専用の Select では、右端の ▼ を一段淡くして残しました（[ADR-0196](./adr/0196-choice-readonly.md)）。押せそうに見えないか、使ってみて見直します

### Combobox

- キーボードとみなす縮みの下限（120px）は、画面の高さが小さい端末で足りるか分かっていません

### Menu

2026-09-19 に作りました。決定は [ADR-0149](./adr/0149-menu-marks.md)〜[ADR-0152](./adr/0152-menu-submenu-sheet.md) です。

- シートのスクロールバーが `ScrollArea` とそろっていません。ユーザーの返事は「スクロールバーは後から一気に修正でよさそう」で、まとめて直す予定です
- 開閉と入れ子の動きは、実機（タッチ操作）で確かめていません
- 比較のストーリー（複数の Menu を常に開いたまま並べるページ）では、各シートの高さを測る `ResizeObserver` が競合し、ページがまれに動くことがありました。実際の使い方では 1 つずつしか開かないため、部品自体の不具合ではないと考えていますが確かめていません

### 重なるもの（Dialog・Drawer・Popover・Tooltip）

2026-09-18 に作りました。決定は [ADR-0102](./adr/0102-overlay-components.md)〜[ADR-0110](./adr/0110-sheet-handle-and-long-press-side.md) です。ここに残るのは、まだ決めていないこと・確かめていないことだけです。

- Tooltip の長押し（500ms）を実機で確かめていません。iOS の Safari で文字の選択や長押しのメニューが出ないか、スクロールの始まりと取り違えないかを見ます
- はじいて閉じるときは、半分の段から閉じる動きだけキーフレームで書いています（Base UI が引く操作の transition を外すのと同じ瞬間に閉じた位置へ動かすため）。Base UI を上げたら要らなくなるかを見ます
- 横から出すパネルの幅と影の向きの違いは小さく、見た目の回帰テストでは差になりません（画素の比較のしきい値の中）。影の向きを変えるときは、目で確かめます
- 開いた Popover が、横スクロールする親の外に隠れると置き場所を探し続けます。Popover 側の問題です（[ADR-0119](./adr/0119-scroll-area.md)）
- Tooltip を長押しで出したあと、指を離さずに動かすと、Base UI の位置の追従で向きが変わることがあります。実機で見ます
- 半分の段のときに面へ足している下の余白は、Base UI が測る面の高さを増やし、中身が画面の 50〜85% のとき、面の高さが上限に達するまで数回往復します。上端の位置は保たれるので目には出にくいはずですが、開く途中で面の動きと高さの変化がずれないかを実機で見ます（[ADR-0111](./adr/0111-sheet-swipe-lock-and-close-fixes.md)）
- 段があり、はじいて閉じない設定のシートは、いちばん低い段から下へ引く動きだけ止められません（Base UI は上端の行き過ぎしか減衰しない）。離すと段に戻ります。Base UI を上げたら止められるかを見ます

### Form・読み上げ

- 読み上げは Chrome の AX とページの中で真似た記録で確かめただけです。本物の読み上げソフト（VoiceOver＋Safari、NVDA＋Chrome）で、ユーザーが次の順に試します（[ADR-0044](./adr/0044-message-announce.md)）
  1. URL の欄に Tab で入ったとき、名前・値・https://・キャプションが1回ずつ読まれるか（prefix・suffix の読み上げ順とつなぎ方）
  2. 前から順に読んだとき、https:// を2回読まないか
  3. 欄を離れたとき、次の欄の名前のあとにエラーが読まれるか（割り込まないか）
  4. 空のまま送信したとき、最初のエラーの欄へ移り、エラーの文が1回だけ読まれるか。サーバーから返ってきたエラーでも同じか
  5. エラーの一覧を出して送信したとき、題が読まれ、リンクで欄へ移れるか
  6. Select の選べない選択肢と2行目が読まれるか。選んで閉じたとき、説明を二重に読まないか。読み込み中に「読み込んでいます」「N 件の選択肢」が読まれるか
  7. 送っているあいだに、ボタンが送信中だと伝わるか、欄が「利用不可」と読まれるか
  8. チェックボックスとラジオのグループに入ったとき、見出しと説明（エラー）が読まれるか

### Checkbox・Radio・Switch

- 読み取り専用のチェックボックス・ラジオ・トグルは、指で確かめていません（押しても値が変わらないことが手応えで分かるか、横の文字を押したときにどう見えるか）（[ADR-0196](./adr/0196-choice-readonly.md)）

### Switch・Tag・Badge・Chip

- 重ねる Badge の縁は、置く面の色（白）です。灰色の面やカードの上では、その場所でトークンを上書きする前提です

### 密度・全体

- 余白（`gap-2`・`mt-1` など）と角丸のクラスは、tokens.css で Tailwind と同じ名前の px にしたので、部品のトークンと同じく px です（[ADR-0076](./adr/0076-token-structure.md)。前はクラスが rem で、html 20px のとき、お知らせの操作の間が 8→10px、上の余白が 4→5px になっていました）。文字の大きさのクラス（`text-xs` など）は Tailwind の既定の rem のままです

### HeadingAnchor・DescriptionList・Stat・Timeline・Stack

- HeadingAnchor の「指の入力ではいつも見せる」は、実機の指で確かめていません（[ADR-0200](./adr/0200-heading-anchor-placement.md)）。見出しの名前が「見出しの文字 + label」で読まれるかも、本物の読み上げソフトで確かめていません
- DescriptionList の leader 線（`divider="leader-dotted"`・`"leader-solid"`）を、実機（指の密度・狭い幅）で確かめていません（[ADR-0203](./adr/0203-description-list-divider.md)）
- Stack の間隔が入力方式（指・マウス）で変わらないことを、実機で確かめていません（[ADR-0212](./adr/0212-stack-gap.md)）

### 本文（Prose・CodeBlock など）

- Prose が想定する HTML の形（GFM の脚注、チェックリストの `li` の属性、Shiki の transformers のクラス）は、手で書いた見本で確かめただけです。ブログ側で実際の変換（remark-gfm・Shiki）を組んだら、出力と見た目が合うかを確かめます（[ADR-0096](./adr/0096-prose.md)）
- Prose の根には、部品と共有する見た目のクラスが数百並びます。HTML が重くなりすぎないかは、ブログに載せてから見ます（[ADR-0096](./adr/0096-prose.md)）
- Callout の `role="note"` が本物の読み上げソフトでどう読まれるかは確かめていません（下の「Form・読み上げ」の確かめに足す。[ADR-0084](./adr/0084-callout.md)）
- Steps: 印の番号は `content: counter(list-item) / ""` で読み上げから外しています。代わりの文の書き方を受け取らないブラウザ（Firefox 127 以前など）では、宣言ごと無視されて番号が出ません。本物の読み上げソフトで、`ol` の番号と題がどう読まれるかも確かめていません

### Overview/入力欄の一覧

- 状態（通常・hover・フォーカス・エラー・押せないなど）を並べたストーリーは、見た目の回帰テストの画面の幅では右側が切れます。幅を広げるか、並びを折り返すかは決めていません

### 土台の部品

2026-09-18 に作りました。決定は [ADR-0113](./adr/0113-foundation-components.md)〜[ADR-0120](./adr/0120-container.md) です。

- ScrollArea の左右の影の計算（`use-inline-cues` の CUE_RAMP）が、上下の `useMoreCues` と重複しています。横にも広げて internal にまとめるかを決めます。対象は ScrollArea・Select・シート・表・CodeBlock のスクロールです（[ADR-0119](./adr/0119-scroll-area.md)）
- Image の寸法のない画像は、読み込めたときに高さが変わって下の内容が動きます（[ADR-0116](./adr/0116-image.md)）
- Skeleton の `sweep-viewport` は、transform の付いた要素の中と iOS の Safari では面ごとの光になります（[ADR-0115](./adr/0115-skeleton.md)）
- 見た目のテスト（pixelmatch の既定のしきい値）は、背景に近い薄いグレーの変化を見落とします。Skeleton の色の変更のときに分かりました（[ADR-0115](./adr/0115-skeleton.md)）
- `pnpm test -u <パス>` が範囲を絞らず全体の基準画像を書き換えることがあります。`pnpm vitest run --project=storybook <パス>` なら絞れます
- `capture-story.mjs --pick A,B` のように採用の案を「,」区切りで渡すと、Storybook が URL の引数を安全でないとみなして捨て、採用の印が付きません。ストーリーの `pick` の既定値に書けば付きます
- ScrollArea のつまみ（ふだんは細い）がマウスで狙いにくくないか、実機で見ます（[ADR-0119](./adr/0119-scroll-area.md)）
