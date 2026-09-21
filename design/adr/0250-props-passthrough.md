# 0250. 渡し方の規約: DOM を組む部品は rest を外側へ、Base UI を包む部品は手で選んだ props ＋ <部位>Props

- ステータス: Accepted
- 日付: 2026-09-21
- ラウンド: ループ外（props の監査）

## 背景

渡し方（passthrough）の監査（`passthrough.md`）で、118 部品の props の渡し方が 4 通りに分かれていて、どれを使うかを決めた規約がないことが分かりました（`passthrough.md` 18-40 行の「渡し方の型」）。

| #   | 型                                              | 件数 | 代表                                |
| --- | ----------------------------------------------- | ---: | ----------------------------------- |
| A   | rest → いちばん外の DOM 要素                    |   60 | Card・Notice・Table・Timeline       |
| B   | rest → 中の主役の要素（外側ではない）           |   20 | TextField 族・Figure・CardImage     |
| C   | 渡し方なし（閉じた部品）。手で選んだ props だけ |   29 | Dialog・Popover・Select・ScrollArea |
| D   | 型は閉じているのに runtime だけ rest が通る     |    1 | Select（`...rootProps`）            |

`xxxProps` という入れ子の props は 1 つもなく（全リポジトリ 0 件）、2 つ目以降の要素には `xxxClassName`（5 件）・`xxxRef`（1 件）で、class と ref しか渡せませんでした（`passthrough.md` 38 行）。

監査の途中で、**passthrough が原因の実バグが 4 件**見つかりました（P-02）。`Navbar`・`Tree`・`TableOfContents`・`TabList` は、props 型が `ComponentProps<'header'|'ul'|'nav'>` などを継承していて、React 19 では `ref` が props に含まれます。JSX では後に書いた属性が勝つので、内部の `ref` を先に書き、`{...props}` をあとに書くと、利用者が渡した `ref`（`props` に含まれる）が内部の `ref` を黙って上書きします。

- `src/components/navbar/Navbar.tsx:233` — `<header ref={rootRef} … {...props}>`（同じ行で `ref` のあとに `{...props}`）
- `src/components/tree/Tree.tsx:277,282` — `<ul ref={rootRef} … {...props}>`（**Tree はキーボードが死ぬバグ**。`rootRef.current` が null のままになり、最初の行に `tabIndex=0` が付かず、木全体が Tab で入れなくなります）
- `src/components/table-of-contents/TableOfContents.tsx:237,241` — `<nav ref={navRef} … {...props}>`（現在の見出しへの自動スクロールが効かなくなります）
- `src/components/tabs/Tabs.tsx:262` — `<BaseTabs.List ref={listRef} … {...props}>`（初期スクロールが効かなくなります）

`useRender` を通す部品（Card・LinkCard・Affix・AspectRatio・Stack・Container・Pager・Breadcrumb・Transition）は `useMergedRefs` で必ずマージされるため、この問題は起きません（`node_modules/@base-ui/react/internals/useRenderElement.js:74-79`）。素の JSX で `ref` を直書きしている、この 4 か所だけの問題です。

## 候補

3 つの案を検討しました（`passthrough.md` 467-517 行）。

| 案           | 決め方                                                                                                                                                                               | 良いところ                                                                                                                                                                                                                                                                                                                                                                                                                                                         | 悪いところ                                                                                                                                                                                                                                                                                                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 案 1（採用） | DOM を組む部品は rest をいちばん外へ（いまどおり）。Base UI を包む部品は rest を持たず、手で選んだ props ＋ `xxxProps` の逃げ道（部品ごと 1〜2 個まで）                              | 118 部品のうち 89 部品がすでに「rest → 外側（または主役）」、29 部品が「閉じている」形で、この 2 つをそのまま規約にするだけなので破壊的な書き換えが要らない。Docs サイトの props の表（JSDoc から自動生成）が Base UI の DOM 属性 280 行で埋まらずに済む。Base UI を上げても公開 API が勝手に変わらない（P-29）。既存の `xxxClassName` 5 個（P-25）をそのまま `xxxProps` に畳める。`ref` は `xxxProps.ref` として入るので、P-02 の上書きバグが構造的に起きなくなる | `className` と `xxxProps.className` のどちらが勝つかを、`tv`・`tailwind-merge` の設定で決める必要がある。1 個ずつ props を足す作業は続く                                                                                                                                                                                                                                         |
| 案 2         | rest と `className` はいつも「見た目の主役」（重なる部品では面、入力欄では `<input>`、Figure では画像）へ。Root に渡すもの（`open`・`modal`・`dismissible` など）は明示の props だけ | `TextField` 族・`Figure`・`CardImage` はすでにこの形。`className` の規則（P-24）が 1 行で言える。面への `data-testid`・`aria-labelledby`（P-15）が逃げ道の名前を覚えずに済む                                                                                                                                                                                                                                                                                       | 「主役」がどれかは部品ごとの判断で、外から見て分からない（Card の主役は外側、Figure の主役は画像、という説明が要る）。Positioner には手が届かないまま（P-09）。Docs サイトの表の問題（280 行）が重なる部品にも及ぶ                                                                                                                                                               |
| 案 3         | Base UI の props 名をそのまま使う（`disablePointerDismissal`・`initialFocus`・`sideOffset`…）。ライブラリはトークンと「砂糖」（`title`・`actions`・`presentation`）だけを足す        | 覚えることが 1 組で済み、Base UI のドキュメントがそのまま読める。P-01・P-08〜P-13 がまとめて消える                                                                                                                                                                                                                                                                                                                                                                 | `dismissible`・`closeOnEscape`・`container`・`side` という、すでに使われている改名を全部捨てることになる（破壊的）。`disablePointerDismissal` のような二重否定が公開 API に出て、原則の文体（読んで分かる）と合わない。Base UI を上げるたびに公開 API が動く。`DateField`・`TimeField`・`Calendar`・`Form` は Base UI に対応する部品がなく、この案は最初から全体に当てはまらない |

## 決定

**案 1 を採ります。** あわせて、次の 4 行を規約として決めます。

1. `className` は、その部品の見た目の主役に付きます（重なる部品なら面、入力欄なら欄の外枠、Figure なら画像）
2. `trigger`（開く口になる要素）と `render`（この部品を何で描くか）は名前を分けます。`render` に渡した要素の props を、部品が設定として読むことはしません（サーバーコンポーネントから渡すと読めないため）
3. Base UI を包む部品は、Base UI の props の型を継承しません。DOM の型だけを継承し、Base UI の props は明示で出します（Base UI を上げても公開の API が動かないようにするため）
4. `ref` を受ける部品は、内部の `ref` と必ずマージします（`useRender` を通すか `useMergedRefs` を使う）

`<部位>Props` は部品につき 1〜2 個までにします（`popupProps`・`positionerProps`・`inputProps`・`viewportProps`・`contentProps`・`panelProps`・`figureProps`・`frameProps`・`imageProps`・`fallbackProps`）。`<部位>ClassName`・`<部位>Ref` は新しく作らず、既存の 5 件（`xxxClassName`）・1 件（`xxxRef`）はこの形に畳みます。一覧型の部品（`Pagination`・`Pager`・`TableOfContents`・`TreeItem`）は、項目の外側の要素にも同じように rest を流します。

具体の直す一覧は `worklist.json`（P-00a）のとおりです。

| 順  | 部品                                                                                      | 直すこと                                                                                                                    | 元の所見               |
| --- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 1   | Navbar・Tree・TableOfContents・TabList                                                    | 内部の `ref` を `useMergedRefs` でマージする（Tree は `ref` を渡すとキーボードが死ぬバグ）                                  | P-02                   |
| 2   | Popover・Menu・Select・Combobox                                                           | `dismissible`・`closeOnEscape` を Dialog と同じ名前で足す                                                                   | P-01                   |
| 2   | Select                                                                                    | `name`・`form`・`multiple` を足し、`...rootProps` を消して明示で渡す                                                        | P-03・P-07             |
| 2   | NumberField・PinField・DateField・TimeField・Calendar                                     | `ref` を足す（DateField・TimeField は `id` も）                                                                             | P-05                   |
| 3   | Dialog・Drawer・Popover                                                                   | `modal` の値を 1 つの集合にそろえる（`true`・`false`・`'passive'`）。Popover にも `modal` を足す                            | P-08・P-16（M-23）     |
| 3   | Menu                                                                                      | `closeParentOnEsc`・`disabled`                                                                                              | P-12                   |
| 3   | Tooltip                                                                                   | `align`（Popover とそろえる）                                                                                               | P-13                   |
| 3   | 重なる部品すべて                                                                          | `onOpenChangeComplete` を足す。`actionsRef`・`keepMounted` は足さない                                                       | P-11                   |
| 3   | ToastProvider・useToast                                                                   | `toastManager`・`promise`                                                                                                   | P-14                   |
| 3   | Checkbox                                                                                  | `parent` を開ける                                                                                                           | P-23                   |
| 4   | 重なる部品すべて（Dialog・AlertDialog・Drawer・Popover・Menu・Tooltip・Select・Combobox） | `popupProps`・`positionerProps` を足す。`anchor`・`collisionAvoidance`・`id`・`data-*`・`aria-*` はここから                 | P-09・P-15             |
| 4   | 入力欄すべて                                                                              | `inputProps` を足す                                                                                                         | P-18                   |
| 4   | ScrollArea                                                                                | `onScroll`・`orientation`・`ref` を足し、`viewportRef`・`contentClassName` を `viewportProps`・`contentProps` に畳む        | P-06・P-25             |
| 4   | Accordion・Collapsible・Figure・Image                                                     | `panelClassName`・`figureClassName`・`frameClassName` を `panelProps`・`figureProps`・`frameProps` に畳む（旧名は残さない） | P-25・P-27             |
| 4   | Avatar                                                                                    | `imageProps`（`render` を含む）・`fallbackProps`（`delay`）                                                                 | P-21                   |
| 4   | Pagination・Pager・TableOfContents・TreeItem                                              | 項目の外側の要素へ rest（`id`・`data-*`・`aria-*`・`onClick`）を流す                                                        | P-19                   |
| 5   | Tabs・Radio・RadioGroup・Switch・Checkbox・CheckboxGroup                                  | Base UI の型の継承をやめ、DOM の型＋明示の props にする（通っていた Base UI の props は洗い出して明示に）                   | P-29                   |
| 5   | Switch                                                                                    | Field に載せて `error`・`warning`・`captionPlacement`                                                                       | P-22（M-14）           |
| 5   | Table・TableRow・TableCell                                                                | `verticalAlign`（子で上書き可）                                                                                             | P-20（M-01。ADR-0246） |
| 5   | Figure・Prose                                                                             | Image を案内し、飾りは Text の `as` で描く                                                                                  | P-26（M-09・M-10）     |
| 5   | SheetPopup（内部）                                                                        | `role` を足して `PopupRole` を消す                                                                                          | P-31                   |

## 理由

`decisions-memo.md` の判定です。一言はありませんでした。

> P-00 案 1 採用: DOM を組む部品は rest を外側へ。Base UI を包む部品は rest を持たず、手で選んだ props ＋ xxxProps（popupProps・positionerProps・inputProps・viewportProps・contentProps・panelProps・figureProps・frameProps・imageProps・fallbackProps）
> P-00a 直す一覧 採用（27 件の畳み込み。ADR の 4 行: className は主役に付く／trigger と render は別／Base UI の型を継承しない／ref は必ずマージ）

背景として、ui-A-line（見本のページを `apps/docs/examples` に移したセッション）の報告があります。`render` の `target` を部品が読む作りだと、サーバーコンポーネントから渡した要素の props を読めず hydration がずれる、というものです（`ui-a-line-notes.md`「不具合として見つけたもの」）。この報告を踏まえ、決定の 2 行目（`render` に渡した要素の props を部品が読まない）を明文化しました。

## 却下した案と理由

- **案 2（rest と className は主役へ）**: 採られませんでした。「主役」がどれかが部品ごとの判断になり、外から見て分からないためです。`Positioner` への手も届かないままでした
- **案 3（Base UI の名前を 1 対 1 で写す）**: 採られませんでした。`dismissible`・`closeOnEscape`・`container`・`side` という、すでに使われている改名を全部捨てる破壊的な変更になるうえ、`disablePointerDismissal` のような二重否定が公開 API に出て、原則の文体と合いません。`DateField`・`TimeField`・`Calendar`・`Form` には対応する Base UI の部品がなく、最初から全体には当てはまりませんでした

## 影響

`worklist.json`（P-00a）の一覧のとおり、ほぼ全部品に関わります。直します。

- **最優先（バグ）**: Navbar・Tree・TableOfContents・TabList の内部 `ref` を `useMergedRefs` でマージします（`Navbar.tsx:233`・`Tree.tsx:277`・`TableOfContents.tsx:237`・`Tabs.tsx:262`）
- 重なる部品（Dialog・AlertDialog・Drawer・Popover・Menu・Tooltip・Select・Combobox）に `dismissible`・`closeOnEscape`・`modal`・`popupProps`・`positionerProps` を足します
- Select に `name`・`form`・`multiple` を足し、`...rootProps`（暗黙の経路）を消します
- NumberField・PinField・DateField・TimeField・Calendar に `ref` を足します
- 入力欄すべてに `inputProps` を足します
- ScrollArea・Accordion・Collapsible・Figure・Image・Avatar の `xxxClassName`・`xxxRef` を `xxxProps` に畳みます（旧名は残しません）
- Table・TableRow・TableCell に `verticalAlign` を足します（ADR-0246 とあわせて直します）
- Tabs・Radio・RadioGroup・Switch・Checkbox・CheckboxGroup の Base UI 型の継承をやめ、DOM の型＋明示の props にします
- `design/props.md` の「渡し方」の節に、この ADR の 4 行の規約を反映します

## 原則への反映

反映なし。渡し方という API の規約の決定で、見た目・構造は変えていません。原則20（知らないことは決めず、使う側に渡す）の考え方に、`xxxProps` という名前の付いた口の形で当てはまります。

## 比較画像

なし。名前と API の決定で、見た目は変えていません（ADR-0013・ADR-0051 と同じ理由）。
