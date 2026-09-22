# props の決まり

部品の props をどう名付け、どう渡すかの決まりです。部品を作るエージェントと、部品を使う人が読みます。見た目の考え方は [`principles.md`](./principles.md) に、値は [`tokens.css`](./tokens.css) にあります。決めた経緯は末尾の ADR にあります。

## 決め方

- 名前は、この文書の語彙に寄せます。同じ意味の props は、どの部品でも同じ名前・同じ値です
- 語彙にない名前が要るときは、いちばん近い語に寄せます。別の語のほうが適していそうなら、勝手に決めずにユーザーに確かめます
- 「使ってはいけない語」の一覧は持ちません。`tone` を使わないのは禁止だからではなく、色は `color` に寄せているからです
- 値の名前は、役割トークンの名前と同じ綴りにします（`color="primary"` は `--color-primary`、`radius="card"` は `--radius-card`）
- 素の HTML と同じ綴りの props は、同じ意味で使います（`disabled`・`readOnly`・`required`・`placeholder`）。`isDisabled` のような接頭辞は付けません

## 語彙

### 見た目の軸

| 名前      | 意味                                                                                                                                                                                                                                         | 値                                                                                          |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `color`   | 色。パレットの色と意味を持った色を 1 つの軸に並べます。部品はこのうち取れる値だけを型で絞ります                                                                                                                                              | `primary`・`secondary`・`neutral`・`brand`・`white`・`info`・`success`・`warning`・`danger` |
| `status`  | 意味を持った色しか受けない部品の色（Notice・Callout・Toast・MenuItem）                                                                                                                                                                       | `info`・`success`・`warning`・`danger`                                                      |
| `trend`   | 増減の良し悪し（Stat）。増えたことが良いか悪いかは場面で違うので、使う側が選びます                                                                                                                                                           | `positive`・`negative`・`neutral`                                                           |
| `variant` | その部品の見た目の型。面の見せ方（塗り・枠線・下線）、線の長さ、罫線、配色、隠し方、複数の軸をまとめた既定の組（Text の label・caption・濃さ）など、部品ごとに 1 つの軸にまとめます。値の意味は部品ごとで、型名 `<部品>Variant` で区別します | 部品ごと                                                                                    |
| `weight`  | 文字の太さ                                                                                                                                                                                                                                   | `normal`・`medium`・`bold`                                                                  |
| `size`    | 大きさの段。意味のある段はその名前で持ち（`prose`・`wide`・`full`、見出しの段）、ただの大小は Tailwind の尺度名で持ちます                                                                                                                    | `xs`〜`xl`、または意味のある名前                                                            |
| `shape`   | 輪郭の形                                                                                                                                                                                                                                     | `circle`・`square`                                                                          |
| `radius`  | 面の角丸                                                                                                                                                                                                                                     | `card`・`control`・`pill`・`none`                                                           |
| `density` | 入力方式で決まる詰め方。ThemeProvider だけが持ちます                                                                                                                                                                                         | `auto`・`coarse`・`fine`                                                                    |
| `frame`   | 選択肢の囲み方。値は部品ごとで、型名（`SwitchFrame`・`ChoiceFrame`）で区別します                                                                                                                                                             | 部品ごと                                                                                    |

### 状態

| 名前                                                     | 意味                                                                                                                                                   |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `disabled` / `readOnly` / `required`                     | 素の HTML と同じ                                                                                                                                       |
| `loading` / `loadingIndicator` / `loadingBehavior`       | 待っている状態、印の形（`spinner`・`bar`）、欄を止めるか（`blocking`・`non-blocking`）                                                                 |
| `submitting` / `submittingBehavior`                      | Form の送信中。送信は読み込みとは別の状態なので、Form だけこの名前です                                                                                 |
| `errorText` / `warningText` / `successText` / `infoText` | 欄の下に出す状態メッセージ。渡されていれば出します。エラーと警告は同時に出せます。真偽値は受けません                                                   |
| `show<何>` / `hide<何>`                                  | 出す／出さないの真偽値。既定と逆の語を使います（既定で出るものは `hide<何>`、出ないものは `show<何>`）。裸の名詞（`arrow`・`closeButton`）は使いません |

### 文字

| 名前             | 意味                                                                                                                                   |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `label`          | 画面に出る見出し。読み上げの名前にもなります                                                                                           |
| `accessibleName` | 画面に出ない、読み上げだけの名前。`label` があれば自動でそれが名前になるので、`label` のない部品や、読み上げだけ変えたいときに書きます |
| `title`          | 題。見出しの行に出ます                                                                                                                 |
| `caption`        | 本体の下に小さく添える文（ヘルプテキスト、図のキャプション）                                                                           |
| `description`    | 題に対する説明。`aria-describedby` になります                                                                                          |
| `placeholder`    | 空のときに薄く出る例                                                                                                                   |
| `<何>Label`      | 画面に出る短い文字。別の要素の見出しや、ボタン自身の文字（`prevLabel`・`actionLabel`・`cancelLabel`）                                  |
| `<何>Name`       | 画面に出ない、読み上げだけの名前（`closeName`・`clearName`・`pageName`）                                                               |
| `<何>Text`       | 文章。画面に出るもの（`errorText`・`emptyText`・`copiedText`）も、読み上げで知らせるもの（`loadedText`・`summaryText`）も              |
| `<何>Title`      | 題（`errorSummaryTitle`・`menuTitle`）                                                                                                 |

### 中身と印

| 名前                               | 意味                                                                                                                              |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `icon`                             | 出すアイコンそのもの（`ReactNode`）。出す／出さないは `show<何>Icon` / `hide<何>Icon` の真偽値で、`icon` に値の列挙は持たせません |
| `prefix` / `suffix` / `addonShape` | 本体の前後に付けるものと、その形                                                                                                  |
| `indicator`                        | 状態を示す印（開閉・選択中）。いまの項目の印は `currentIndicator`、待ちの印は `loadingIndicator`                                  |
| `mark`                             | ラベルに添える小さな印（`requiredMark`・`optionalMark`・`successMark`・`radioMark`）                                              |
| `markerType` / `markerSize`        | 並びの項目の頭に置く印（List・Steps・Timeline）の種類と大きさ                                                                     |
| `trigger`                          | 開く口になる要素                                                                                                                  |
| `actions`                          | 下にまとめて置くボタンの列                                                                                                        |

### 値とイベント

| 名前                                       | 意味                                                                                                                                                                      |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `value` / `defaultValue` / `onValueChange` | 制御・非制御・通知の三つ組。制御の口を持つ部品は、3 つとも自前で宣言します（HTML 属性任せにしません）                                                                     |
| `open` / `defaultOpen` / `onOpenChange`    | 開閉の三つ組                                                                                                                                                              |
| `on<何>Change`                             | 「何」は対になる props の名前（`page` → `onPageChange`、`checked` → `onCheckedChange`）。裸の `onChange` は使いません                                                     |
| `on<何>Change` の引数                      | `(値) => void` の 1 引数。意味のある情報が要る部品だけ、自前の型で第 2 引数を足します（MaskField の `{ unmasked, completed }`）。Base UI の `eventDetails` は公開しません |
| `on<何>ed`                                 | 起きたことの通知（`onCopied`・`onValueCommitted`・`onParseFailed`）。過去形は取り消せません。現在形（`onOpenChange`）は、制御した値を更新しないことで取り消せます         |
| `onClick`・`onSubmit`・`onLoad`・`onError` | DOM のイベントはそのままの名前                                                                                                                                            |

### 並べ方と差し替え

| 名前                            | 意味                                                                                                                                  | 値                                                          |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `side` / `align`                | 浮かぶものの辺と、その辺に沿った寄せ。表のセルの横の寄せも `align`                                                                    | `top`・`right`・`bottom`・`left` / `start`・`center`・`end` |
| `verticalAlign`                 | 表のセルの縦の寄せ。Table・TableRow・TableCell で持ち、子が上書きします                                                               | `top`・`middle`・`bottom`                                   |
| `<何>Placement`                 | ある部位の置き場所                                                                                                                    | `start`・`end`                                              |
| `direction` / `gap` / `justify` | 並べる向き・間隔・主軸の寄せ（Stack）                                                                                                 |                                                             |
| `render`                        | この部品をこの要素で描く                                                                                                              | `ReactElement`                                              |
| `renderPage`                    | 番号ごとに要素を作る（Pagination）。`href` が `(page) => string` なのと対                                                             | `(page) => ReactElement`                                    |
| `as`                            | 決まったタグ名の中から選ぶ。`render` との使い分けは未決                                                                               | タグ名の列挙                                                |
| `href`                          | リンクにする                                                                                                                          |                                                             |
| `container` / `portalContainer` | 浮かぶものを描く場所。Portal は `container`、Dialog などの部品と ThemeProvider は `portalContainer`（Container 部品と紛れないように） |                                                             |
| `detent` / `sheetDetent`        | シートの高さ。本体がシートの Drawer は `detent`、シートにもなる Select・Combobox は `sheet` の接頭辞                                  |                                                             |

## 見た目の軸の使い方

### 色

色は `color` の 1 本です。パレットの色（`primary`・`secondary`・`neutral`・`brand`・`white`）と意味を持った色（`info`・`success`・`warning`・`danger`）を同じ軸に並べ、部品はそのうち取れる値だけを型で絞ります。Tag・Badge・Chip は両方を取り、Button はパレットと `danger` を取ります。

意味を持った色しか受けない部品は `status` です。Notice・Callout・Toast・MenuItem がこれです。MenuItem の危険な項目は `status="danger"` で、真偽値の `danger` は持ちません。AlertDialog の実行ボタンは `primary` も取るので `color`（`danger`・`primary`、既定は `danger`）です。

Stat の増減の良し悪しは `trend` です。値の意味（増えたことが良いか悪いか）は使う側が選びます。矢印の向き（`up`・`down`・`flat`）は別の軸で、`deltaIndicator` です。

文字の濃さ（default・muted・subtle）は色の軸ではなく、Text の `variant` に入ります。

### variant

`variant` は、その部品の見た目の型です。1 つの部品に 1 つだけ持ち、次のどれかを表します。

- 面の見せ方: Button の `filled`・`outline`・`underline`、Notice の `soft`・`filled`・`outline`・`muted`、Link の `button`・`outline`・`text`・`underline`
- 部品ごとの見た目の型: Divider の線の長さ、Table の罫線、CodeBlock の配色、Spoiler の隠し方、Card の入れ子、Skeleton の `block`・`text`・`circle`
- 複数の軸をまとめた既定の組: Text の `body`・`muted`・`subtle`・`label`・`caption`

値の意味は部品ごとに違うので、型名は `<部品>Variant` にし、JSDoc に値ごとの意味を書きます。`appearance` は使いません。

### 大きさと形

`size` は、意味のある段はその名前で持ちます。Container・Navbar の `prose`・`default`・`wide`・`full` は中身の幅の上限、Heading・Stat の段は見出しの段です。ただの大小は Tailwind の尺度名（`xs`〜`xl`）です。小物（Tag・Badge・Chip）の大きさは 1 本の軸 `size`（`sm`・`md`・`lg`）で、周りの文字に従わせるときは `inherit` です。Combobox 系の `chipSize` も同じ段です。

`shape` は輪郭の形で、値は `circle`・`square` です。文字のあるボタンの `circle` は両端が丸い形（pill）です。

## 出す／出さないの真偽値

見た目の要素を出すかどうかは、既定と逆の語で書きます。既定で出るものは `hideOutline`・`hideCloseButton`・`hideSuccessMark`・`hideValue`・`hideTrack`、既定で出ないものは `showArrow`・`showDivider`・`showColumnDivider`・`showPageInput` です。書いてあれば既定と違う、と読めます。

どのアイコンかが名前から分かるようにします。`hideCaretOnDisabled`（押せないときの ▼）、`hideSearchIcon`（虫眼鏡）のように、部位の名前を入れます。

3 つ以上の値を持つもの（Combobox の ▼ の `always`・`never`・`empty-only`）と、動きの切り替え（`closeOnClick`・`keepMounted`・`ellipsisMenu`）は真偽値の規則の対象外です。

## 文字の 3 語

差し替える文言は、何かによって語尾を分けます。

- `<何>Label`: 画面に出る短い文字。別の要素の見出しにも、ボタン自身の文字にも使います
- `<何>Name`: 画面に出ない、読み上げだけの名前。`aria-label` になります。見える文字（`label`）があればそれが自動で名前になるので、`Name` は読み上げだけを変えたいときに書きます
- `<何>Text`: 文章。画面に出る文も、読み上げで知らせる文も `Text` です
- `<何>Title`: 題

## 渡し方

部品には 2 種類あります。DOM を自分で組む部品（Card・Table・Stack など）と、Base UI を包む部品（Dialog・Popover・Menu・Select・入力欄など）です。渡し方はこの 2 つで分けます。

- DOM を組む部品は、知らない props（`id`・`data-*`・`aria-*`・イベント）をいちばん外の要素へそのまま流します。props の型は `ComponentProps<'div'>` などを継承します。一覧型の部品（Pagination・Pager・TableOfContents・TreeItem）は、項目の外側の要素にも同じように流します
- Base UI を包む部品は、知らない props を流しません。使う props を手で選んで宣言し、届かない部位には部位の名前を付けた 1 つの口を置きます。口の名前は `<部位>Props` です（`popupProps`・`positionerProps`・`inputProps`・`viewportProps`・`contentProps`・`panelProps`・`figureProps`・`frameProps`・`imageProps`・`fallbackProps`）。口は部品につき 1〜2 個までにし、`<部位>ClassName`・`<部位>Ref` は作りません
- Base UI を包む部品は、Base UI の props の型を継承しません。DOM の型だけを継承し、Base UI の props は明示で出します。Base UI を上げても公開の API が動かないようにするためです
- `className` は、その部品の見た目の主役に付きます。重なる部品なら面、入力欄なら欄の外枠、Figure なら画像です。JSDoc の `className` の説明に、どこに付くかを 1 行書きます
- `trigger` は開く口になる要素、`render` はこの部品を何で描くかです。意味が違うので名前も分けます。`render` に渡した要素の props を、部品が設定として読むことはしません（サーバーコンポーネントから渡すと読めないため）
- `ref` を受ける部品は、内部の `ref` と必ずマージします（`useRender` を通すか `useMergedRefs` を使う）

Base UI の props のうち、名前を変えて出すものです。

| Base UI                          | この部品          | 意味                                                                                     |
| -------------------------------- | ----------------- | ---------------------------------------------------------------------------------------- |
| `disablePointerDismissal` の否定 | `dismissible`     | 外を押して閉じる                                                                         |
| `disableEscapeDismissal` の否定  | `closeOnEscape`   | Esc で閉じる                                                                             |
| `swipeToDismiss` 相当            | `closeOnSwipe`    | はじいて閉じる（シート）                                                                 |
| `modal`                          | `modal`           | 裏を止めるか。`true`・`false`・`'passive'`。`passive` は裏を止めず、外を押しても閉じない |
| `initialFocus`                   | `autoFocus`       | 開いた直後に焦点を当てる要素                                                             |
| `finalFocus`                     | `returnFocus`     | 閉じたあとに焦点を戻す要素                                                               |
| `container`                      | `portalContainer` | 浮かぶものを描く場所（Portal 部品だけ `container`）                                      |

重なる部品（Dialog・AlertDialog・Drawer・Popover・Menu・Tooltip・Select・Combobox）は、`dismissible`・`closeOnEscape`・`modal`・`autoFocus`・`returnFocus`・`onOpenChangeComplete`・`popupProps`・`positionerProps` のうち、土台が持つものを同じ名前・同じ型で持ちます（Menu は Base UI に `initialFocus` がないので `autoFocus` を持ちません。Tooltip は焦点を持たないので焦点の props を持ちません）。シートを開いたとき入力欄に焦点を当てるかは `focusInputOnOpen`（真偽値）で、`autoFocus` とは別です。

入力欄（TextField・Textarea・SearchField・PasswordField・MaskField・NumberField・PinField・DateField・TimeField・Select・Combobox・Checkbox・Radio・Switch）は `InputFieldProps` を継承し、`label`・`caption`・`captionPlacement`・`errorText`・`warningText`・`successText`・`infoText`・`loading`・`name`・`ref`・`inputProps`・`validate`・`validationMode` を同じ名前で持ちます（Select は Base UI に input の部位がないので `inputProps` の代わりに `inputRef` です）。1 つの部品だけ欠けているのは直します。Form は、欄の `name` に合わせて外から返すエラーを `errors` で、送信を通ったときの値を `onFormSubmit` で受けます（design/adr/0255）。

## props を足すか、className に任せるか

よくする調整は props にし、まれな調整は `className` に任せます。

- 見本のページやストーリーで同じ `className` が繰り返し出る調整は、props にします（表の縦そろえ、本文の余白、上下の余白）
- 用途が多すぎて 1 つの props に収まらない調整は、`className` のままにします（Skeleton の幅と高さ）
- 並べる間隔は部品に持たせず、`Stack` を子に入れて決めます。部品自身の内側の余白（Container の `py`、TabPanel の余白）は部品が持ちます
- 兄弟の部品（入力欄、選ぶ部品、リンク）は、同じ props を同じ名前で持ちます

## 型名

- props の型は `<部品名>Props` です。Button だけ `ButtonProps`・`ButtonIconOnlyProps` の 2 つです（ボタンの見た目のリンクは Link の `variant="button"` で、Button は `render` を持ちません）
- 軸の型は `<部品><軸>`（`TabsColor`・`SkeletonVariant`）です
- 共有の型（`NoticeColor`・`ChoiceColor`・`SheetDetent`・`LoadingIndicator`）はその名前のまま公開し、部品ごとの別名（`SelectColor = ListboxColor`）は作りません
- props に現れる型は、すべて `src/index.ts` から公開します

## JSDoc

- すべての props に 1 行の説明を書きます。何のための props かを書き、値ごとの意味が要るときは続けて書きます
- 既定値のある props には `@default` を書きます。値（または式）だけを書き、条件は本文に移します
- `children` は「何を入れるか」を書きます
- `open`・`defaultOpen`・`onOpenChange` のような三つ組は定型文を使います
- `presentation`・`portalContainer` のように ThemeProvider でまとめて決められる props は、その旨を 1 行足します
- `className` は、どの要素に付くかを書きます
- Button の `children` に生のアイコンを置かず `Icon` を使うこと、移動には Link を使うことのように、使い方の注意も JSDoc に書きます

## 未決

- `as` と `render` の使い分け（タグ名を選ぶだけなら `as`、部品を差し替えるなら `render`、という暗黙の線引き）
- 見本の入口（`@kazuemon/ui/samples`）
- `render` に渡した要素の `target` を部品が読む作り

## 経緯

2026-09-21 の props の監査で決めました。

- 色と variant: [ADR-0235](./adr/0235-color-status-trend.md)・[0236](./adr/0236-variant.md)・[0237](./adr/0237-size-scale.md)・[0238](./adr/0238-shape.md)・[0257](./adr/0257-frame.md)
- 真偽値と文字: [0239](./adr/0239-show-hide-booleans.md)・[0240](./adr/0240-label-name-text.md)・[0241](./adr/0241-caption-description.md)・[0242](./adr/0242-status-text-props.md)
- イベントと印: [0243](./adr/0243-on-change-events.md)・[0244](./adr/0244-past-tense-events.md)・[0245](./adr/0245-indicator-mark-marker.md)
- 並べ方と差し替え: [0246](./adr/0246-align-values.md)・[0247](./adr/0247-render-page.md)・[0248](./adr/0248-portal-container.md)・[0249](./adr/0249-detent.md)
- 渡し方: [0250](./adr/0250-props-passthrough.md)・[0251](./adr/0251-overlay-base-ui-props.md)・[0252](./adr/0252-public-types.md)・[0255](./adr/0255-form-on-base-ui.md)
- props を足す基準と JSDoc: [0253](./adr/0253-jsdoc.md)・[0254](./adr/0254-adding-props.md)・[0256](./adr/0256-loading-submitting.md)

以前の決定: 色の名前は [ADR-0051](./adr/0051-prop-names.md)、配置は [0049](./adr/0049-toggle-layout.md)、待ちの印は [0034](./adr/0034-loading.md)・[0042](./adr/0042-field-loading.md)。
