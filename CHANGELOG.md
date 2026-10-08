# Changelog

## [0.4.0](https://github.com/kazuemon/ui/compare/v0.3.0...v0.4.0) (2026-10-08)


### ⚠ BREAKING CHANGES

* Select・Combobox・TagsInput の popoverMoreCue を外しました。影を消す指定（'none'）はなくなり、続きがある端にはいつも内側の影を出します。
* useToast が知らせの一覧を購読せず、呼んだ部品を描き直さないようにする ([#159](https://github.com/kazuemon/ui/issues/159))

### 新しくできること

* CommandPalette・Popconfirm・DateRangePicker・FileInput・Editable・LoadingOverlay を足す（ADR-0496〜0514） ([#164](https://github.com/kazuemon/ui/issues/164)) ([d9987c0](https://github.com/kazuemon/ui/commit/d9987c0c51959f7fc40ae2144c6ec32f408b529e))
* ContextMenu を足す（軸 531・532 の比較つき） ([072dced](https://github.com/kazuemon/ui/commit/072dcede1f741c90f2785ed5b76e0afd147a91a3))
* ContextMenu・Menubar・Toolbar・NavigationMenu・PreviewCard を足す（ADR-0476〜0491） ([#161](https://github.com/kazuemon/ui/issues/161)) ([c2e151a](https://github.com/kazuemon/ui/commit/c2e151aac497e89f1fbbdc5b3355c0d9e7176e3e))
* Menu の項目に iconVariant を足し、NavigationMenuLink と箱を共有する ([a85d64d](https://github.com/kazuemon/ui/commit/a85d64d50024d4e730f5a71a40813ba81c063d4f))
* Menubar を足す（軸 541〜543 の比較つき） ([b0ff049](https://github.com/kazuemon/ui/commit/b0ff049d6686925de8ee95d0cc44648028b69f5a))
* NavigationMenu を足す（軸 561〜564 の比較つき） ([e122851](https://github.com/kazuemon/ui/commit/e122851d2c63b95fca52d27684564afb859cc899))
* PreviewCard を足す（軸 571・572 の比較つき） ([6a36f3b](https://github.com/kazuemon/ui/commit/6a36f3b688854fe29f0d4dc97acb2d7e9d918798))
* Table は外観ごと横にスクロールし、マウスで引っぱって動かせる。CodeBlock の横のスクロールも ScrollArea の見た目にする（軸 582） ([4d986c6](https://github.com/kazuemon/ui/commit/4d986c6a4c8d9f936bdc3c107250b80a6742579f))
* Toggle と ToggleGroup に size を足す ([#163](https://github.com/kazuemon/ui/issues/163)) ([7c8ea8e](https://github.com/kazuemon/ui/commit/7c8ea8e046b887d7ad50ef429df591c14307f51a))
* Toolbar を足す（軸 551〜554 の比較つき） ([7239964](https://github.com/kazuemon/ui/commit/72399642a238836bdabfea82a1d5be1b5c4ac077))


### 直したこと

* Inspector の autoFocus が、開いた直後の描き直しで取りやめられないようにする ([#157](https://github.com/kazuemon/ui/issues/157)) ([19b08ca](https://github.com/kazuemon/ui/commit/19b08cadb4ea94028bb61053ad64dd76369ac14c))
* Menu の modal を既定値を置かずに Base UI へ渡し、Menubar の中で警告を出さないようにする ([fb25b0a](https://github.com/kazuemon/ui/commit/fb25b0a50c3283d701c39c555e71910566c30540))
* Toast の残り時間の線が、面の角丸からはみ出さないようにする ([#155](https://github.com/kazuemon/ui/issues/155)) ([af4a477](https://github.com/kazuemon/ui/commit/af4a4777ad8ee1bcc4fedcfe45e895789917c94e))
* useToast が知らせの一覧を購読せず、呼んだ部品を描き直さないようにする ([#159](https://github.com/kazuemon/ui/issues/159)) ([b8b2e57](https://github.com/kazuemon/ui/commit/b8b2e57b50f59f05e0c2547fec231202af8b0002))
* ホバー時にちらつく問題の修正をパーツ全体で統一適用 ([#168](https://github.com/kazuemon/ui/issues/168)) ([37a3e88](https://github.com/kazuemon/ui/commit/37a3e88afca2670e3276d0b9db63eb6ac883f949))
* 浮かぶ一覧の余白や見出しを押しても、フォーカスが欄から抜けないようにする ([e9bf4e4](https://github.com/kazuemon/ui/commit/e9bf4e471e1c32ece3c751271c3d0549fc89f3ac))
* 表の外で離したとき、表を引っぱる動きが残らないようにする ([344d5f6](https://github.com/kazuemon/ui/commit/344d5f69941363be08a68dd77fab1946e41e13cb))


### 見た目

* Autocomplete の一覧をほかの選択肢と同じ枠で描き、つまみの型を ScrollAreaScrollbar にそろえる ([9c5af6a](https://github.com/kazuemon/ui/commit/9c5af6a216aed98fc87e8f6ccd6c188d8824e9e2))
* Avatar に tile を足し、Tag・Chip の四角いアバターの置き方を決める（ADR-0474・0475） ([#160](https://github.com/kazuemon/ui/issues/160)) ([c7d4d6f](https://github.com/kazuemon/ui/commit/c7d4d6fba4099d828bcc40590f66dd9697484431))
* ContextMenu に軸 531・532 の決定を反映する（ADR-0476・0477） ([adbd88d](https://github.com/kazuemon/ui/commit/adbd88dd8595453e105d7a4924e94a73d79fb55f))
* Menubar に軸 541〜543 の決定を反映する（ADR-0478〜0480） ([5bd38c0](https://github.com/kazuemon/ui/commit/5bd38c0f7095a02acffaccf8675c8bcee8c1053b))
* NavigationMenu に軸 561〜564 の決定を反映する（ADR-0485〜0488） ([e5579ad](https://github.com/kazuemon/ui/commit/e5579ad13f5d3be45afa4b1d9c71a91bef61a061))
* PreviewCard に軸 571・572 の決定を反映し、画像の置き方を Card と同じ cardVariant にする（ADR-0489・0490） ([bdf907f](https://github.com/kazuemon/ui/commit/bdf907f963f1ea950a9e4739b88f05423ffbadd0))
* Select・Combobox・TagsInput の popoverMoreCue を外し、popoverScrollbar を足す（軸 580） ([a01a4ad](https://github.com/kazuemon/ui/commit/a01a4ad626f478ac1b0b3e897d5a587ad3bcbd52))
* Toolbar に軸 551〜554 の決定を反映する（ADR-0481〜0484） ([41b98d0](https://github.com/kazuemon/ui/commit/41b98d0ef03fa5bcd8bafcfa796d4fc699f2973f))
* 止まった行のアイコンの箱の比較（軸 565） ([0ec855d](https://github.com/kazuemon/ui/commit/0ec855d50415280b8904267fabe204b7b021fe59))
* 止まった行のアイコンの箱を 1 段濃いグレーにする（ADR-0491） ([aa0b29c](https://github.com/kazuemon/ui/commit/aa0b29cce15aac73e18442c56522afad27f3c5e2))
* 浮かぶ一覧とシート・Dialog の中身のスクロールを ScrollArea のつまみにそろえる（軸 580・581） ([5d589e2](https://github.com/kazuemon/ui/commit/5d589e2a83e591855dfb4d55da48f48e0d85d093))
* 表とコードの横のスクロールを ScrollFrame で包み、続きの見せ方の比較を足す（軸 582） ([c35b1b7](https://github.com/kazuemon/ui/commit/c35b1b7beae8ad23ce65efa2219be5cb4cf8fe98))
* 見本を 1 見本 1 ページにまとめ直し、使っていなかった部品を入れる ([#165](https://github.com/kazuemon/ui/issues/165)) ([5c1ecc0](https://github.com/kazuemon/ui/commit/5c1ecc0c2b5cf3ccfaa239e4c04aec75ca3b2b55))
* 軸 580・581 の比較ストーリーを置く ([fea855f](https://github.com/kazuemon/ui/commit/fea855ffde40f8f66612db0acf01f5da6b834e05))

## [0.3.0](https://github.com/kazuemon/ui/compare/v0.2.0...v0.3.0) (2026-10-04)


### ⚠ BREAKING CHANGES

* PinField の inputProps から id と ref を外す ([#129](https://github.com/kazuemon/ui/issues/129)) ([494f028](https://github.com/kazuemon/ui/commit/494f028edae467e5fe34ceaae9e5fc5303ace799))
* 表示・レイアウトの部品に、props の穴のトリアージで見つけた口を足す ([#108](https://github.com/kazuemon/ui/issues/108)) ([f08601a](https://github.com/kazuemon/ui/commit/f08601afe80dd1d7bd3b9d862f3da9b0244f6d44))
* Card にリンクにするかを決める link を、Link に ↗ を上書きする newTabIcon を足す ([#106](https://github.com/kazuemon/ui/issues/106)) ([8c478fd](https://github.com/kazuemon/ui/commit/8c478fd595d77df4b53eb50f203f58932a057adf))
* Select・Combobox の型引数に、値の型 Value を先頭に足した。 `SelectValue<Multiple>`・`SelectProps<Multiple>`・`SelectBaseProps<Multiple>`・ `SelectControlProps<Multiple>`・`ComboboxValue<Multiple>`・`ComboboxProps<Multiple>`・ `ComboboxBaseProps<Multiple>`・`ComboboxControlProps<Multiple>`、`<Combobox<boolean>>` のように 型引数を直に書いていたところは、`<string, boolean>` のように値の型を先に書く。 ListboxItems・ListboxGroup の items は読み取り専用の配列（readonly）になった。 Storybook で `Meta<typeof Select>` から args の型を読むときは、`component: Select<string, boolean>` のように 値の型を決めて渡す。
* TagsInput の validate（タグ 1 つずつを確かめる関数）は validateTag に名前を変えた。validate は欄全体（string[]）を確かめる関数になった。
* Navbar の children に NavbarLink を直に並べる書き方は使えなくなりました。NavbarLink は NavbarLinks の中に並べます（<Navbar><NavbarLinks><NavbarLink …/></NavbarLinks></Navbar>）。
* 重なる面・ナビゲーションの部品に、外から開閉する props や状態の上書きを足す ([#101](https://github.com/kazuemon/ui/issues/101)) ([119ca2d](https://github.com/kazuemon/ui/commit/119ca2dfa46d651a4901bb3c91aa4fcfe5151090))
* CodeGroup のタブを名前で決め、Dialog・Drawer の題の省略、SegmentedControl の未選択、DataTable の列の幅を足す ([#100](https://github.com/kazuemon/ui/issues/100)) ([96b9c3e](https://github.com/kazuemon/ui/commit/96b9c3ecf8eb3793632e951ff5d61a7a745c6e28))
* TextField・MaskField の size は、input の文字数（数値）ではなく大きさの段（'md' | 'sm'）になりました。文字数は inputProps={{ size }} で渡します。
* DropzoneFileList の onRemove・removeName は File ではなく DropzoneFileEntry を受ける

### 新しいコンポーネント

* DatePicker: 日付を選ぶ欄 ([#95](https://github.com/kazuemon/ui/issues/95)) ([03af00f](https://github.com/kazuemon/ui/commit/03af00f990145979e5178724c99cbf4cead886bc), [df9e11d](https://github.com/kazuemon/ui/commit/df9e11de24f3da03b19920e7d114dc91a44dcb5b))
* MeterGroup: 内訳を分けて塗るバー ([#112](https://github.com/kazuemon/ui/issues/112))
* SegmentedControl: 少ない選択肢から 1 つを選ぶ切り替え ([#95](https://github.com/kazuemon/ui/issues/95)) ([03af00f](https://github.com/kazuemon/ui/commit/03af00f990145979e5178724c99cbf4cead886bc), [df9e11d](https://github.com/kazuemon/ui/commit/df9e11de24f3da03b19920e7d114dc91a44dcb5b))
* TimePicker: 時刻を選ぶ欄 ([#95](https://github.com/kazuemon/ui/issues/95)) ([03af00f](https://github.com/kazuemon/ui/commit/03af00f990145979e5178724c99cbf4cead886bc), [df9e11d](https://github.com/kazuemon/ui/commit/df9e11de24f3da03b19920e7d114dc91a44dcb5b))


### 新しくできること

* AlertDialog に size・scrollBehavior を足す ([713c7b7](https://github.com/kazuemon/ui/commit/713c7b7ff8c03cc6d0c37c87048ccacc8cc23987))
* Button の size="sm"・focusableWhenDisabled、Tooltip の showArrow、Avatar の xs、Stepper の size と dot を足す ([#115](https://github.com/kazuemon/ui/issues/115)) ([b86cb8d](https://github.com/kazuemon/ui/commit/b86cb8d54324793a601f1eca69855247c2281b91), [e4e0e63](https://github.com/kazuemon/ui/commit/e4e0e637ee3b7af358c2eb9c5ca7a4d6bfec786e), [f2fb844](https://github.com/kazuemon/ui/commit/f2fb844733a5191e1c53717a173c0defc646278e))
* Calendar の日ごとの印の意味を、getDayContentLabel で日のボタンの読み上げに入れる ([785715a](https://github.com/kazuemon/ui/commit/785715a1322e6b6254dbf58f93fac5a06750bab5))
* Calendar の日ごとの印は、月のすべての日の数字を印の分ずらし、今日の下線を数字と印のあいだに引く ([ea0adf7](https://github.com/kazuemon/ui/commit/ea0adf74d52793c46bfc8fb45a9941b6baf52505))
* Calendar の週の始まり・期間の制約・日ごとの印、Form の formErrorText、ListItem の status・icon・trailing を足す ([#116](https://github.com/kazuemon/ui/issues/116)) ([f563762](https://github.com/kazuemon/ui/commit/f5637625a96aca93a365faa7b26297f7ebea4449), [3f07e42](https://github.com/kazuemon/ui/commit/3f07e42fd4985be182a3814dc87e1597eb7a4c66), [aa4e7ee](https://github.com/kazuemon/ui/commit/aa4e7ee1bb5590260002da33677a822273ff80cf), [77fb4e3](https://github.com/kazuemon/ui/commit/77fb4e3a1b29bb1f394e0997b9788ce8fcbb9b52), [1a1df19](https://github.com/kazuemon/ui/commit/1a1df1902448439f2ff2fb41f7b30ac8c5113b3d))
* Card に余白の段・押すカード・選んでいる見た目・頭の帯と題・強調の形を、Collapsible・Accordion に枠付きのカードの形を足す ([#109](https://github.com/kazuemon/ui/issues/109)) ([6bfe263](https://github.com/kazuemon/ui/commit/6bfe2635c6de25ed5f16e77affae022e217eb50f), [0e4a8c9](https://github.com/kazuemon/ui/commit/0e4a8c9643324ffafec456c6364344aff447bc83), [7474672](https://github.com/kazuemon/ui/commit/7474672ea588df45c5b55e783f1b39dc0314fb92), [e3f28a0](https://github.com/kazuemon/ui/commit/e3f28a0b3414ebe9f71840c46bed4c4a3da2dc94), [1635ed8](https://github.com/kazuemon/ui/commit/1635ed8fe823328bba3d785dff4017d1b3f7828f))
* Carousel の自動の送り・端でつなぐ・複数枚・Thumbnails を横に置く形、Thumbnails の縦向き、Tree の子をあとから読み込む行、Timeline の点のアイコンと状態の色を足す ([#114](https://github.com/kazuemon/ui/issues/114)) ([fa2b46e](https://github.com/kazuemon/ui/commit/fa2b46e96589f0a44503d33494a475e8e17a4eaa), [6b6421e](https://github.com/kazuemon/ui/commit/6b6421ec1cdfaa8ace341e9cb3d66325699000c2), [9ea39c9](https://github.com/kazuemon/ui/commit/9ea39c9787e0d619453e6faac05d2deb86cfd987), [e822295](https://github.com/kazuemon/ui/commit/e82229522419f4e4e81b9143ca5966238d3fb682))
* CodeBlock の言語のラベル・最大の高さ・折り返し、Callout の畳める形と見出しの段、Figure のキャプションの寄せ、Text の意味の色、Link の下線の出し方と周りの色、Badge の 0 と右下に重ねる形を足す ([#111](https://github.com/kazuemon/ui/issues/111)) ([2fa9b63](https://github.com/kazuemon/ui/commit/2fa9b632db4e1cb60ac32a5773b8ed870a5542a2), [554c1c0](https://github.com/kazuemon/ui/commit/554c1c01438cf5de68fee4c831fdc00b7776a1ec), [fee413b](https://github.com/kazuemon/ui/commit/fee413b328540244a535f62d770df330867b958b))
* DatePicker に組み立て用の DatePickerControl と positionerProps を足し、開けない欄では開かない ([bc42f45](https://github.com/kazuemon/ui/commit/bc42f45b0ce66e41ea2fc60c3e858a4c8bb20604))
* Dialog の幅の段・中身だけのスクロール、上から出す Drawer、幅を変えるつまみを Inspector・表の列に足す ([#120](https://github.com/kazuemon/ui/issues/120)) ([4e9b2d2](https://github.com/kazuemon/ui/commit/4e9b2d2e2d8d0a3e4d7327353e2816c6cae66557), [285c576](https://github.com/kazuemon/ui/commit/285c5760528175bfa1d670b3cb44664701ade663), [ec5558e](https://github.com/kazuemon/ui/commit/ec5558e00beaa331f41fa87aa5f878e24efea10a), [c58d7de](https://github.com/kazuemon/ui/commit/c58d7deb4eee72f3fee52d005da796bd9a2c8656))
* Dialog・AlertDialog・Drawer・Inspector の下の操作を、中身に置ける帯（DialogActions など）にする ([#102](https://github.com/kazuemon/ui/issues/102)) ([18ce89a](https://github.com/kazuemon/ui/commit/18ce89a76d189aa161588cceb28a074625327b25))
* DropzoneFileList に保存済みのファイル（name・size・url）を並べられるようにし、Image に仮画像（placeholder）と代わりの画像（fallbackSrc）を足す ([41b9f19](https://github.com/kazuemon/ui/commit/41b9f199492ede41175cd12a8ff36b51f2e72561))
* DropzoneFileList の onRemove・removeName が受け取る値を、File から項目（DropzoneFileEntry）に変えたことを JSDoc に書く ([0099c81](https://github.com/kazuemon/ui/commit/0099c813c16d9ca0d13785b6b709c25e186155e3))
* Gallery の画像に loading・decoding・fetchPriority を渡せるようにする ([eb4115f](https://github.com/kazuemon/ui/commit/eb4115f9837163732e139ad023f799dca0ba90d6))
* Gallery の項目に、Image の仮画像（placeholder・placeholderBlur）と代わりの画像（fallbackSrc）を渡せるようにする ([f3135d9](https://github.com/kazuemon/ui/commit/f3135d9cd06191337816633b0c89ed70cbe9d260))
* Image と DropzoneFileList のストーリーに、仮画像・代わりの画像・保存済みのファイルの使い方を足す ([2afa197](https://github.com/kazuemon/ui/commit/2afa197b7d8bd2a07f7a5d7f00f96291e92a0abb))
* ListItem に、印のアイコンの色（iconColor）と文の色（color）を足す ([b4431ac](https://github.com/kazuemon/ui/commit/b4431ac2dfd91091cb0ad6328626c4ae59ca6694))
* Navbar にスクロールで隠す（stickyBehavior）と、いちばん上では透かす面（transparent-until-scroll）を足す ([#119](https://github.com/kazuemon/ui/issues/119)) ([b83e58f](https://github.com/kazuemon/ui/commit/b83e58facc9b0785f572807fb5efa067a07c772d), [dcbdd14](https://github.com/kazuemon/ui/commit/dcbdd14ebddfc6d4b4a22df5bd9ef5c20240cf3b))
* Navbar の中身を自由にし、行き先を NavbarLinks、ほかのものを NavbarGroup に入れて、狭いときの行き先を narrowPlacement で選べるようにする ([#103](https://github.com/kazuemon/ui/issues/103)) ([65b1ff3](https://github.com/kazuemon/ui/commit/65b1ff3d0b9f62df196bfa74345efbb99aabfe1b))
* Navbar の隠し方をスクロールに付いてくる形に決め、透かす帯の文字の守り方を transparentVariant で選べるようにする ([e19502e](https://github.com/kazuemon/ui/commit/e19502e026638056ec92460de38a3473733b1fb0))
* RadioGroup・CheckboxGroup の横並び、Divider のラベルと縦線、Gallery の読み込み中を足す ([#107](https://github.com/kazuemon/ui/issues/107)) ([ed6a16e](https://github.com/kazuemon/ui/commit/ed6a16e35ab69b6beac9e4bf0b7a05c5042f3439), [ad2da8c](https://github.com/kazuemon/ui/commit/ad2da8c741dd7c57a15069c7c180016fe950fc9a), [65b1c8f](https://github.com/kazuemon/ui/commit/65b1c8fb15e3e5daab312031f43666d92149dc21), [65da03e](https://github.com/kazuemon/ui/commit/65da03e292fe3407020bd6066f880f338e99e58e))
* Select・Combobox・Autocomplete の値を型引数で受け、items に値だけ（文字か数）も渡せるようにする ([#105](https://github.com/kazuemon/ui/issues/105)) ([aa22c6a](https://github.com/kazuemon/ui/commit/aa22c6a82e4dbd3e6da91cd9889419c7afae2b06))
* Sortable で表の行を並べ替え（SortableItem の render・SortableTableBody）、動かさない行（SortableSeparator）、︙ のメニューに足す項目・ほかのリストへの移動・入れ替えを足す ([#117](https://github.com/kazuemon/ui/issues/117)) ([4d081b2](https://github.com/kazuemon/ui/commit/4d081b213a8be102025a1f014f26f7fb02bbfad7), [c5fa0ff](https://github.com/kazuemon/ui/commit/c5fa0ffc642b3e21469dc61633ed7cb5cf6914c4), [5b3b0a1](https://github.com/kazuemon/ui/commit/5b3b0a1bd20a7925285a9590caa32f61e23b6645))
* Stat の読み込み中・Progress と Meter の成功と失敗の色・Spinner の大きさと読み上げの名前・Notice の操作を右に置く形を足す ([#112](https://github.com/kazuemon/ui/issues/112)) ([3630056](https://github.com/kazuemon/ui/commit/3630056455fb59e4b470e5a480f3c6b0b520f33f), [ff34c61](https://github.com/kazuemon/ui/commit/ff34c6166f46a03ae6d6075e34b577aaa6f74de1), [d91d94d](https://github.com/kazuemon/ui/commit/d91d94d369e7e73f813843a6de6784c53f8cef3e))
* Table に合計の行・詰めた余白・縞を、DataTable に行の状態・読み直し・開いた行・行のリンクを足す ([#113](https://github.com/kazuemon/ui/issues/113)) ([d8225f7](https://github.com/kazuemon/ui/commit/d8225f796dc242c808103896d938aef0e654b7ca), [fd82111](https://github.com/kazuemon/ui/commit/fd821118e03c0fd54159e2858ef8a1c204f504b1), [6e2384b](https://github.com/kazuemon/ui/commit/6e2384b1bbcf2d96283f71791e76f0ee4e371b4a), [d42626c](https://github.com/kazuemon/ui/commit/d42626cb8360606dae4a6c51d1ce756500febfb7))
* TableHeader の scope に colgroup・rowgroup を足す ([b3653e7](https://github.com/kazuemon/ui/commit/b3653e7869167a870d4ac3b5f8e486be71a281bd))
* Tag にリンク（href・render・link）・形（variant）・先頭のアイコンとアバターを足し、Chip にもアイコンとアバターを足す ([#110](https://github.com/kazuemon/ui/issues/110)) ([99839db](https://github.com/kazuemon/ui/commit/99839db9736ee571f0c90bedd1c72cc94d5e5eef), [cea9ee5](https://github.com/kazuemon/ui/commit/cea9ee5c55056870c1c640d066610edcd3cf9929))
* Tag のリンクの手応え・形（outline・surface・dashed）・先頭のアイコンとアバターを決めた値にし、Tag と Chip に iconColor を足す ([8351dfd](https://github.com/kazuemon/ui/commit/8351dfd9e2c0a5927c7718242c79910e2456ba9a))
* TextField・MaskField の size を、input の文字数の size ではなく大きさの段にする ([b167119](https://github.com/kazuemon/ui/commit/b16711914c57f8488129e594eefaf5dfaf0ffa4c))
* TimelineItem に iconName を足し、渡したときだけアイコンを画像として読み上げる（CodeRabbit） ([4c234d7](https://github.com/kazuemon/ui/commit/4c234d7bfdf495ad535cdca58263430078527bc8))
* 保存済みのファイルに添える文を項目の caption にし、仮画像はすぐ替えてぼかしの強さを placeholderBlur で選べるようにする ([7bb5dd9](https://github.com/kazuemon/ui/commit/7bb5dd9c9e81f132630c0e217d7335efb9196e85))
* 入力欄の props をそろえる, validate 周りの機能追加 ([#104](https://github.com/kazuemon/ui/issues/104)) ([3ec4e09](https://github.com/kazuemon/ui/commit/3ec4e09688f9b6623789215b07299843487c3013))
* 入力欄の size="sm"、Select の消すボタン、選択肢のアイコン、カードの形の Radio を足す ([#121](https://github.com/kazuemon/ui/issues/121)) ([25d647a](https://github.com/kazuemon/ui/commit/25d647a2fc645fe1abde31342b891cc1a874b86c), [719ede8](https://github.com/kazuemon/ui/commit/719ede8d7163e552026deab1c9edeec0b4fe4f75), [2e4100e](https://github.com/kazuemon/ui/commit/2e4100efdb4b854574c4f717ff8705c19e367136), [251e4fa](https://github.com/kazuemon/ui/commit/251e4fa2440731f6e9d16f171f38dce452e34467), [f8ea07f](https://github.com/kazuemon/ui/commit/f8ea07f0212117660581d58051bf41ae7ece990e), [fce31b3](https://github.com/kazuemon/ui/commit/fce31b32d9b64d04fca499bb86dab5d011c3ed65))
* 畳める Callout に、開いた題の行の下へ線を引く showDivider を足し、比べるためのトークンを畳む ([fad892a](https://github.com/kazuemon/ui/commit/fad892a9df7c28b84b8b1757cdbfdf6dddab8e45))
* 選択肢にアイコン（ListboxItem の icon）と、Select に選んだ値の見せ方（renderValue）を足す ([38244a5](https://github.com/kazuemon/ui/commit/38244a5af37606b73131c774571354bd0d98b37b))


### 直したこと

* Calendar の required の期間でも、始まりの日を押し直したら始まりを外す ([5e7ca91](https://github.com/kazuemon/ui/commit/5e7ca9101696709dd980b9ec22258464bb6a15a5))
* Calendar の最短の日数があるとき、始まりの日を押し直すと始まりを外す ([f239d76](https://github.com/kazuemon/ui/commit/f239d764e5394abe42273f5b0cab6b836d828fe7))
* Calendar の前後の月の日の印で数字をずらさず、遠くの押せない日をまたぐ終わりの日も選べなくする ([222d522](https://github.com/kazuemon/ui/commit/222d5222ae1db2f3cdf6d5b206d78cf07a7f7fa4))
* Callout の題が空の文字のときは畳める形にせず、数の 0 は題として扱う（CodeRabbit） ([b1bbae9](https://github.com/kazuemon/ui/commit/b1bbae9a9e7c3c6e4831c82150a3e78efb4248d9))
* Card の選んでいる線が、カードの切り取りで外側の 1px を欠かれ、灰色の輪郭と 1px の線に見えていたのを、2px の色の線にする ([cf56066](https://github.com/kazuemon/ui/commit/cf56066396741485d290f726909f8024757fbc7f))
* Carousel の loop では、外のエンジンが端と知らせても前後のボタンを押せるようにする（CodeRabbit） ([84fcca5](https://github.com/kazuemon/ui/commit/84fcca5a93abc9b24cb451356672f0d6b90798a3))
* Carousel の slidesPerView を、段ごとに 1 以上の整数にそろえる ([bb978cc](https://github.com/kazuemon/ui/commit/bb978ccf7ccc6f61cd79c93d44b80a1948633827))
* Carousel の並べる数を、1 枚の幅が変わったときも測り直す ([848e002](https://github.com/kazuemon/ui/commit/848e0027ee1dcc4d9e2e199147b84c9cb367b107))
* Carousel の自動の送りを始めるボタンを、載せたまま・フォーカスがあるままでも効かせ、使う側の onFocus などを消さない ([b974180](https://github.com/kazuemon/ui/commit/b974180c481010326147deca25c0b8641f4e26e5))
* CodeBlock の折り返しの字下げで、行頭の全角の空白も 2 桁として数える ([a470c1f](https://github.com/kazuemon/ui/commit/a470c1f2cc46e7fcf9840448cd93aa1f43a3b1d5))
* Collapsible のカードの形で行を中身の下に置いたとき、開いた行の角を上に置くときのまま丸めていたのを、下の角を丸めて上の中身とつなげる ([5cc4008](https://github.com/kazuemon/ui/commit/5cc4008d6f77b6670588c58c8b9590c6970fee74))
* DataTable の banded で貼り付いた見出しの帯の下の角を、スクロールした分だけ四角にし、影と合わせる ([d34e4cd](https://github.com/kazuemon/ui/commit/d34e4cdfc9d20fc7fdb7adf73f2d01463614fb4c))
* DataTable の banded で貼り付いた見出しの帯の角の外を、地の色で塞がない ([b0a774b](https://github.com/kazuemon/ui/commit/b0a774bb087520e761d80c8a2b40ce4996e1b5f6))
* DataTable の maxHeight で、縦のつまみの溝を貼り付いた見出しの行の下から始める ([13e6d68](https://github.com/kazuemon/ui/commit/13e6d68163aabb42a346462176e685267d8207d8))
* DataTableExpandRow の hidden と DataTableRowLink の data-slot を、使う側の props で上書きさせない（CodeRabbit） ([84dfaa1](https://github.com/kazuemon/ui/commit/84dfaa1f1d0831309a636bf6d4e115f16129992b))
* DataTableRow の行のリンクの行で、押した時点で開く行の中のメニューが開いている間も、行を濃くしない ([e201ed8](https://github.com/kazuemon/ui/commit/e201ed8b9c56d6980888e76701f09c50c58415dc))
* DataTableRow の行のリンクの行で、行の中のボタンなどを押している間は行を濃くしない ([9e00da7](https://github.com/kazuemon/ui/commit/9e00da77bebbfeb0cf5d8c9228e496985a86385a))
* DataTableRow の行のリンクの行を中ボタンで押したとき、行き先を新しいタブで開く ([96b1977](https://github.com/kazuemon/ui/commit/96b197780ca1eec81087714f7a2563faba263f54))
* DataTableRow の行のリンクを、portal で開いた面とスイッチ・ラジオなどの押下で動かさない ([b5915e0](https://github.com/kazuemon/ui/commit/b5915e0c853b15f0f1448aa9266d398e0e5ff615))
* Divider のラベルを狭い幅でも折り返し、空のラベルはラベルのない線として描く（CodeRabbit） ([8d2c5ee](https://github.com/kazuemon/ui/commit/8d2c5ee355f072860de59950c3dbc5ca92a96fc9))
* **docs:** DatePicker の日の書き方の例を足し、「今日」のボタンの見本を外す形にする ([981adc4](https://github.com/kazuemon/ui/commit/981adc41a3d625087a6ba23fd44bee03bc5ac01b))
* **docs:** 部品の中で使っているアイコンの一覧に CalendarBlankIcon を足す ([ac78998](https://github.com/kazuemon/ui/commit/ac78998663f4d53f978e0bc53a287ecc22abb7de))
* DropzoneFileList の thumbnail で、保存済みの data URL の画像を種類から画像として出す ([82f6832](https://github.com/kazuemon/ui/commit/82f6832c12d776022545627a6d4f5cb9d43454cc))
* DropzoneFileList の thumbnail で、保存済みの url の画像が読めないときは、画像でないファイルと同じアイコンのタイルにする ([5b56de7](https://github.com/kazuemon/ui/commit/5b56de701323c2386619b72ce003dcb9a57f0f0c))
* DropzoneFileList の thumbnail で、左上の札に添えた文の中のリンクのフォーカスの線が切れないようにする ([bf2d4f4](https://github.com/kazuemon/ui/commit/bf2d4f425a931e73cbb822ebf89852bfb4bee297))
* DropzoneFileList の保存済みファイルの名前を Link の文字のリンクで描く ([#142](https://github.com/kazuemon/ui/issues/142)) ([dad7a02](https://github.com/kazuemon/ui/commit/dad7a022884014c95ed869680056e7a0b225bf3b))
* Form でフォーカスを移さないときは、formErrorText の文を割り込みで知らせる ([3d77866](https://github.com/kazuemon/ui/commit/3d77866b03929314807cfabc59ab241c2c8e55fe))
* Form の送り直しで、前の送信の formErrorText へフォーカスを移さない ([f3c5dd0](https://github.com/kazuemon/ui/commit/f3c5dd0f5828176b953a95239f92503039f40b7e))
* Form の送信中は、エラーの一覧を含むお知らせや欄へフォーカスを移さない ([37cc245](https://github.com/kazuemon/ui/commit/37cc245b28d887f1545ffab0f2f0ebc5959c1bfe))
* Image の fallbackSrc に替えるとき srcSet・sizes を外し、srcSet があっても代わりの画像に替わるようにする ([565f6b6](https://github.com/kazuemon/ui/commit/565f6b680047e6056c9c22bd941dae0d8cda9a10))
* Image の代わりの画像を、srcSet だけのときと、読めなかったあとで fallbackSrc を渡したときにも使う（CodeRabbit） ([3fed79e](https://github.com/kazuemon/ui/commit/3fed79ed5306cdb1171e6bce052503e705d53d92))
* Inspector の幅を外で持つとき、defaultWidth がなくてもダブルクリックで部品の幅に戻す ([#132](https://github.com/kazuemon/ui/issues/132)) ([2c4a1e4](https://github.com/kazuemon/ui/commit/2c4a1e42fdf65f39c22076abc1c1dcbe54a2a613))
* ListItem の icon に描かれない値を渡したときは、既定の印を残す ([25625aa](https://github.com/kazuemon/ui/commit/25625aad8dc0259d7b573eb513e03b5eae3cb2e1))
* ListItem の末尾のある項目で、入れ子のリストと文の間を詰めない ([447e795](https://github.com/kazuemon/ui/commit/447e79502f4d6145a26c12a7105d227634b08779))
* Masonry で子を外す・並べ替えたときも、各子の行の数をその子の高さに合わせる ([#135](https://github.com/kazuemon/ui/issues/135)) ([1fc2e5d](https://github.com/kazuemon/ui/commit/1fc2e5d11098061104455b2892a91c3eb3b77040))
* MeterGroup の 0 の内訳に区切りを置かず、間が 2 つ並ばないようにする ([65b47a4](https://github.com/kazuemon/ui/commit/65b47a4311145ce716fe6c342e6a977f37ecf4df))
* Navbar の hide-on-scroll で、止まったあとの寄せがフォーカスやメニューを無視して隠すのと、隠れたあとに影が戻るのを直す ([495d767](https://github.com/kazuemon/ui/commit/495d767c9810320f6cc291652875027028c60698))
* Navbar・Sidebar の狭い画面を ThemeProvider に従わせ、Sidebar の props を落とさない ([#130](https://github.com/kazuemon/ui/issues/130)) ([c3ee651](https://github.com/kazuemon/ui/commit/c3ee6515fc7f6b4bb3e5199fda490ba235becd06))
* Notice の操作を狭くても右に置き続けるとき、操作の列が囲みからはみ出さないよう幅を止める（CodeRabbit） ([16f13bb](https://github.com/kazuemon/ui/commit/16f13bb8b596c4caf3fa3352b720acb718fbe407))
* Pager の prev・next に渡した className を項目に重ねる ([#131](https://github.com/kazuemon/ui/issues/131)) ([3af3b23](https://github.com/kazuemon/ui/commit/3af3b23704e81b761a72b84691f67d730d4049e3))
* PinField から入力欄の size を外し、Select の emitValue の説明を関数の上に戻す ([6a860ce](https://github.com/kazuemon/ui/commit/6a860ce451ec0549cd95a66e58c8068d37ebc7ec))
* Portal の JSDoc と Docs に、引き継ぐ密度は描いた時点のものだと書く ([#133](https://github.com/kazuemon/ui/issues/133)) ([3517d62](https://github.com/kazuemon/ui/commit/3517d622b3e1ecbd351554bc865c9db823c6b56a))
* SegmentedControl のつまみを、隠れた場所に置いたときと項目の増減でも正しく置く ([08f16f4](https://github.com/kazuemon/ui/commit/08f16f41a252d0414ba1a37af1b539fc06114cc6))
* SegmentedControl の読み取り専用・送信中で、項目も押せない見た目にする ([4575edf](https://github.com/kazuemon/ui/commit/4575edf696e4a4713666ac6ca8ae016379417574))
* Sortable の ︙ の既定の移す項目を、動かさない項目では押せなくする（CodeRabbit） ([ae690d1](https://github.com/kazuemon/ui/commit/ae690d147ece827e9cee5b4b5497f3a1d007f6e2))
* Sortable の区切りの行（SortableSeparator）を、何番目・何件中に数えない ([474b13d](https://github.com/kazuemon/ui/commit/474b13db79163b2b9ac9f8ae63c57ae238a80eea))
* Stat の読み込み中は、使う側が aria-busy を渡していても true にする（CodeRabbit） ([a60efdc](https://github.com/kazuemon/ui/commit/a60efdcde506d7882fcd5f0c698a7fa472c25555))
* Tag の link の判定を Card にそろえ、link={false} では href を渡していてもリンクにせず、link だけのときは警告する ([785a894](https://github.com/kazuemon/ui/commit/785a894884a4dc3c76802eba64b9355cb6f66ef4))
* Tag の target・rel を render の要素にも渡し、a でないときは新しいタブの読み上げを足さない ([26e6539](https://github.com/kazuemon/ui/commit/26e6539dd5a5d6e4d333d93815f85bd765305edb))
* Tag のリンクが新しいタブで開くときに、文字の後ろへ ↗ を付ける ([#134](https://github.com/kazuemon/ui/issues/134)) ([7926338](https://github.com/kazuemon/ui/commit/792633852d487b223a386149f64cba6f1a930442))
* TagsInput・Autocomplete・Combobox の inputProps が部品のハンドラーを上書きしない ([#126](https://github.com/kazuemon/ui/issues/126)) ([ce505d1](https://github.com/kazuemon/ui/commit/ce505d1c111493b10011286de4eddce7151d07da))
* TextField の Docs と required の JSDoc を、ブラウザの required を付けない実装に合わせる ([#127](https://github.com/kazuemon/ui/issues/127)) ([1e3b1b1](https://github.com/kazuemon/ui/commit/1e3b1b1afd3e85371aa4c2cdd52e2bdc16749552))
* Timeline の iconVariant="plain" から地の色の面を外す ([91d73ef](https://github.com/kazuemon/ui/commit/91d73ef2af602f390c22c4c6ad4778984a3a89ab))
* TimePicker の一覧で、範囲の外の値のフォーカスと PageUp・PageDown の行数を直す ([900f9b2](https://github.com/kazuemon/ui/commit/900f9b22c38b919af7ec060c521ff8c4ec6fd6a6))
* TimePicker の一覧で開いた直後に動かしたフォーカスが戻る競合を直し、CodeGroup の写せなかったときの画像を時間によらず撮る ([#137](https://github.com/kazuemon/ui/issues/137)) ([416dea3](https://github.com/kazuemon/ui/commit/416dea309491cdb9088e884da645d247e6282fb4))
* TimePicker の開く口の名前を triggerName にそろえ、closeName を足し、開けない欄では開かない ([1a122a2](https://github.com/kazuemon/ui/commit/1a122a2397f89baf6f22ad30d9b4313cb105b6e6))
* Toast の幅いっぱいの判定を下の中央に出す判定とそろえ、useToast の返り値を保つ ([#138](https://github.com/kazuemon/ui/issues/138)) ([3b378d5](https://github.com/kazuemon/ui/commit/3b378d582deb76a113c019426a857871e401026a))
* Tooltip の本体であることを、文脈ではなく本体の要素にだけ足す印で Button に伝える（自作の部品の中のボタンに効かせない） ([f3e992d](https://github.com/kazuemon/ui/commit/f3e992dcc7a3625ed5e8ec358483a759494343d1))
* Tooltip の本体の押せないボタンに、Tooltip の文を説明（aria-describedby）として結ぶ ([6d33264](https://github.com/kazuemon/ui/commit/6d332648ee4d605baf1745734ef03b139b978596))
* Tooltip の本体の押せないボタンの既定を、本体そのものにしたボタンだけに効かせる（入れ物の中のボタンは変えない） ([8601682](https://github.com/kazuemon/ui/commit/86016821dc49c95ffd505e7a8a25a745a657afa3))
* Tree の → で、子が届く前の行から次の兄弟の行へ移らない ([ee0138e](https://github.com/kazuemon/ui/commit/ee0138e686a190605492de5d0958397314218cc1))
* Tree の行の子の読み込みが始まったことを、木の status の箱で 1 回だけ知らせる（CodeRabbit） ([04c702c](https://github.com/kazuemon/ui/commit/04c702c90163fccdbf77c281fc523f1df36b3995))
* validate・Form の errors でエラーになった欄から data-success を外す ([#128](https://github.com/kazuemon/ui/issues/128)) ([2a235d0](https://github.com/kazuemon/ui/commit/2a235d07f700d2f9e8dab7ec6a550c4885739325))
* カードの形の Radio で、値段を説明として読み上げ、中のリンクを押せるようにし、読み取り専用では載せても塗らない ([a711e5b](https://github.com/kazuemon/ui/commit/a711e5b176708e7cd1feae7727de4ea71259dbc1))
* シートで開くとき、浮かべる面だけの余白・幅のクラスを Drawer に渡さない ([210a3a0](https://github.com/kazuemon/ui/commit/210a3a0b3fab5bdd37dbf135b1cba474008f4278))
* チェックリストの項目（ListItem の checked）でも末尾の枠（trailing）を出す ([9c6862d](https://github.com/kazuemon/ui/commit/9c6862d74a385bc28d73fcd895cca8acb60086eb))
* トリアージで見つけた不具合（Video の ref・NumberField・DateField・TimeField・List・AvatarGroup・ThemeProvider）をまとめて直す ([#97](https://github.com/kazuemon/ui/issues/97)) ([aef6aac](https://github.com/kazuemon/ui/commit/aef6aac45cc474103cd2e68b0d1064fec7773182))
* レシピで、︙ のメニューからほかのリストへ移したら、移した先の項目へフォーカスを移す ([517b6df](https://github.com/kazuemon/ui/commit/517b6dfcad34a83372c8bb1dde55c028feeeb18a))
* 上から出す Drawer の DrawerActions に、下の安全領域の余白を付けない ([0a9553c](https://github.com/kazuemon/ui/commit/0a9553c888902bc73f9b8dfcc85dfce83e8b1bad))
* 中央に出す Dialog が、狭い画面で画面からはみ出さないようにする ([#99](https://github.com/kazuemon/ui/issues/99)) ([73850d7](https://github.com/kazuemon/ui/commit/73850d735f86a99fadc59d9526975955524417e7))
* 中身だけスクロールする Dialog で、題と下の操作だけで画面より高いときは枠ごとスクロールする（CodeRabbit） ([48ff512](https://github.com/kazuemon/ui/commit/48ff512461e2a059b6cce973df03f6fc12cbefa1))
* 中身に貼り付けた操作の帯の下に、フォーカスした欄が隠れないようにする ([4a363fc](https://github.com/kazuemon/ui/commit/4a363fc97eaf97d71b431025be495e26fc5396ac))
* 保存済みの名前のリンクのフォーカスの線が切れないようにし、仮画像のぼかしの縁が透けないよう枠の外まで広げる ([9e5d70f](https://github.com/kazuemon/ui/commit/9e5d70fed870bd52f1559f8f4baaf2d0d17c7bc9))
* 内部のアイコン 9 つも、渡した className を捨てずに使う ([#140](https://github.com/kazuemon/ui/issues/140)) ([e1d3d2b](https://github.com/kazuemon/ui/commit/e1d3d2b02cd66a89649507178a3d214628c585ba))
* 動きを減らす設定のとき、Video に autoplay を付けない ([#136](https://github.com/kazuemon/ui/issues/136)) ([9164e04](https://github.com/kazuemon/ui/commit/9164e04c9a53b2617dc298598850c144b0bc84d5))
* 右から左へ書く向きで、幅を変えるつまみの線をつまみの真ん中に置く ([6b8a2a2](https://github.com/kazuemon/ui/commit/6b8a2a2097145a875e33667571253e88884b575d))
* 幅を変えるつまみで、キャプチャを失ったときと途中で外れたときにも動かし終わりにする（CodeRabbit） ([f181e91](https://github.com/kazuemon/ui/commit/f181e918a5038f2443f4f629f7fc24f1bf76b31a))
* 打つ欄で inputProps.ref を捨てず、form の reset ではじめの値に戻す ([#125](https://github.com/kazuemon/ui/issues/125)) ([147f8f7](https://github.com/kazuemon/ui/commit/147f8f7d07f5446b3076c3b7d5b044af6f94870e))
* 折り返さない横並びの選択肢を縮めず、ラベルを 1 行のまま並べる（CodeRabbit） ([da7b4e0](https://github.com/kazuemon/ui/commit/da7b4e0b6b865e54b7073c64b429bef5db71962c))
* 押す Card（onClick）を、カード全体の button ではなく、div の中の見えない button の押せる範囲を広げる形にし、名前を CardTitle か accessibleName で付ける ([47a2a0e](https://github.com/kazuemon/ui/commit/47a2a0e9657ec48e3510b701d92f6f6ce01f59c9))
* 押せる強調の Card（variant="emphasis"）で、フォーカスの線が淡い輪に重なっていたのを、輪の外に出す ([700e218](https://github.com/kazuemon/ui/commit/700e218ce7d97ead8bf62f4b875933ce13ab37ff))
* 止めた Tooltip（disabled）の本体では、押せないボタンをフォーカスできる形にしない ([ec9f311](https://github.com/kazuemon/ui/commit/ec9f31142e0ffef873493a49521f37bf194176c6))
* 浮かべた Menu の一覧から、開いたボタンの名前を消さない ([#124](https://github.com/kazuemon/ui/issues/124)) ([f229695](https://github.com/kazuemon/ui/commit/f2296958255d93c86edce46d23550f306e72bb6b))
* 畳める Callout の className を tailwind-merge で面のクラスに混ぜ、CodeBlock の折り返しの字下げは値が変わった行だけに書く ([2869617](https://github.com/kazuemon/ui/commit/286961706fc59690a3133ff4839e9379df12fd62))
* 行のリンクの行で、リンクへ転送した click が行へ戻ったときに行の onClick をもう一度呼ばない（CodeRabbit） ([f502f30](https://github.com/kazuemon/ui/commit/f502f30edd827368b5c2df328c0f5e04653812f3))
* 表の並べ替えの知らせを、Dialog など aria-modal の面の中では、その面の中に置く ([5458d90](https://github.com/kazuemon/ui/commit/5458d9090f98d0566b587ab0744b04b06086831f))
* 表の列のつまみを、後ろの見出しのセルに覆われた半分からもつかめるようにする ([976a662](https://github.com/kazuemon/ui/commit/976a6623f753ce882545263be7f1fc377085c6a8))
* 表の行を引いているときに大きくしないのを、外枠のある表（framed）の中だけにする ([d4f1b23](https://github.com/kazuemon/ui/commit/d4f1b2387ccf672523d38e438d335393d4faa440))
* 表の行を引いているときは、表の形によらず大きくしない ([76c0b73](https://github.com/kazuemon/ui/commit/76c0b73ca0eba9d944836ecd728912e5bdd19d15))
* 貼り付いた見出しの高さを、見出しがあとから描かれたり差し替わったりしても追う（CodeRabbit） ([594cf33](https://github.com/kazuemon/ui/commit/594cf3332d02cebaccdab9c49301caa8f06d0a89))
* 透かす Navbar で文字を白くしても、帯に置いた入力欄や塗りのボタンの中は元の色のままにする ([cc1ba2a](https://github.com/kazuemon/ui/commit/cc1ba2af26425494b4391f41e9d9bcc210470eac))
* 透かす Navbar で文字を白くするあいだは、帯の中のフォーカスの線も白にする ([2640a71](https://github.com/kazuemon/ui/commit/2640a7154b591e8f1e7980ca6194f6ff27e79ca4))
* 選択肢の icon に false を渡したとき（条件で出し分けたとき）は、アイコンの場所を空けない（CodeRabbit） ([2d7a79b](https://github.com/kazuemon/ui/commit/2d7a79b432a4cad7954f7f1ff59da50a965a65af))


### 見た目

* Image の placeholderBlur の段を Tailwind の blur の段（8・12・16px）にそろえる ([ca7914f](https://github.com/kazuemon/ui/commit/ca7914f975c4741536eb8e0322bc49375baa5dd4))
* List の trailing に文字だけを渡したときは、キャプションの大きさ・淡い色で描く ([4306f18](https://github.com/kazuemon/ui/commit/4306f185cec9547e092fefbd2722ea1bd3834186))
* 表の列のつまみの線を上下の線から離し、最後の列には出さず、showResizeLine で消せるようにする ([e63c979](https://github.com/kazuemon/ui/commit/e63c979b3c3c2b296a7b51ad75b68faea261f12b))

## [0.2.0](https://github.com/kazuemon/ui/compare/v0.1.1...v0.2.0) (2026-09-29)


### ⚠ BREAKING CHANGES

* Heading の size は数字（1〜4）から md〜5xl の名前に変わる（size={2} は size="xl"）。 Stat の size の値も変わる。トークン --text-heading-1〜4 は --text-heading-2xl・xl・lg・md になる。

### 新しいコンポーネント

* AvatarGroup ([#71](https://github.com/kazuemon/ui/issues/71)) ([52b673c](https://github.com/kazuemon/ui/commit/52b673c9efe32340645da8126a03a52e7e3204af))
* ButtonGroup ([#72](https://github.com/kazuemon/ui/issues/72)) ([032ec89](https://github.com/kazuemon/ui/commit/032ec89f32471a93a1b410205648253cfa3656a9))
* DataTable: データの表。TanStack Table でつなぐレシピ付き ([#85](https://github.com/kazuemon/ui/issues/85)) ([c2f33ee](https://github.com/kazuemon/ui/commit/c2f33ee743489f1194649526fdebd786eda9d189), [6dab745](https://github.com/kazuemon/ui/commit/6dab7450ee8173044b298e8f27489e9b9ffd32c3))
* Dropzone: ファイルを落として選ぶ欄と、選んだファイルの一覧 ([3a1ff10](https://github.com/kazuemon/ui/commit/3a1ff10e656f1bf75d7972919506a3ef499548e7))
* Fieldset: 欄のまとまり ([#91](https://github.com/kazuemon/ui/issues/91)) ([4137781](https://github.com/kazuemon/ui/commit/4137781954b9dd9cefd9acb989d51ae790da413a), [2383f80](https://github.com/kazuemon/ui/commit/2383f8066ba04909fd6422017fa7fc3170bc53c6))
* Inspector ([#77](https://github.com/kazuemon/ui/issues/77)) ([b33bde7](https://github.com/kazuemon/ui/commit/b33bde7d41f1d2bd0a10968d79737441c5f181bf), [176cf8d](https://github.com/kazuemon/ui/commit/176cf8d268c87f36ca85197bcb6d69fd85288d96))
* SearchFieldControl・PasswordFieldControl ([bdeaccb](https://github.com/kazuemon/ui/commit/bdeaccb2d6157fe48239302032f3bc996f259ff0))
* Sidebar: 押しのける列・rail・Drawer／Menu のシート ([19daaab](https://github.com/kazuemon/ui/commit/19daaab379a14c57f6fbccf792b96303856aaab5))
* Slider: 横向き・単一値 ([#70](https://github.com/kazuemon/ui/issues/70)) ([5bbf173](https://github.com/kazuemon/ui/commit/5bbf173e22b1bfda6f2d15d9539f98a89294175c), [d633c70](https://github.com/kazuemon/ui/commit/d633c7034ff432fbb7a4a026240036ad61fe5c10))
* Sortable: 並べ替えられるリスト。dnd-kit でつなぐレシピ付き ([435d0ab](https://github.com/kazuemon/ui/commit/435d0ab86af3fc5d4882c1fae236cf3645477b92))
* StatusPanel ([#78](https://github.com/kazuemon/ui/issues/78)) ([be8c3ca](https://github.com/kazuemon/ui/commit/be8c3cac7ed408dacb63610bc940931806fe7be5))
* Stepper ([#76](https://github.com/kazuemon/ui/issues/76)) ([5b11e73](https://github.com/kazuemon/ui/commit/5b11e73cdd5fc58afcc71be8f7972eebf04bf1df), [faddd0a](https://github.com/kazuemon/ui/commit/faddd0a9f7c54fe1074ebab9ce1b1262b1ee7f3f))


### 新しくできること

* **docs:** 見本のページを追加・細かい不具合を修正 ([#87](https://github.com/kazuemon/ui/issues/87)) ([5c33924](https://github.com/kazuemon/ui/commit/5c33924f63ec09218b07a77fde02bb0053918df3))
* **fieldset:** 見出しの大きさを Heading の段で選べる labelSize を足す ([b0beb74](https://github.com/kazuemon/ui/commit/b0beb745c069d5cf67cb145df4b9e796ec18da95))
* **sidebar:** 上下に固定する行・件数・行ごとの操作・列の地・幅を変えるつまみ・畳める節・Menu のシートを足す ([93d44f5](https://github.com/kazuemon/ui/commit/93d44f5966fcc2c8a2619131ecefb2a4c947ac8f))
* 入力欄のラベルを横に置く・出さない形と、Field で組み立てる形を足す ([#89](https://github.com/kazuemon/ui/issues/89)) ([6665fe5](https://github.com/kazuemon/ui/commit/6665fe5d400e3bf5cab774af7c3afac24b482984), [3309cf4](https://github.com/kazuemon/ui/commit/3309cf4407efb570215ef6c77e33be83f75ac7e3))
* 文字の大きさの段を xs〜5xl にし、見出しの大きい 3 段（Hero）を足す ([f7ae802](https://github.com/kazuemon/ui/commit/f7ae8028d563451d8a6b773be6bb06136867dadb))


### 直したこと

* **data-table:** レシピの「N 件を選択中」の読み上げの領域をいつも置く（CodeRabbit） ([23f08f5](https://github.com/kazuemon/ui/commit/23f08f5d30b40b32ab27c9a632ce0e1a4423a4da))
* **dropzone:** 1 つしか選べない欄の超過を知らせ、サムネイルの URL を effect の中で作る（CodeRabbit） ([d60d6fd](https://github.com/kazuemon/ui/commit/d60d6fd4be337c9853d3d0861f65d187c00c4068))
* **dropzone:** 値が外から変わったときも input.files を値に合わせる（CodeRabbit） ([8e00d3a](https://github.com/kazuemon/ui/commit/8e00d3a18e2ccc5e644f3f2f0fac24d333a3db2f))
* **dropzone:** 制御モードでは、受け取った直後も input.files を今の value に合わせる（CodeRabbit） ([3cc16a4](https://github.com/kazuemon/ui/commit/3cc16a46f18ab2b1bdb64e54f7887cc61aa46365))
* **fieldset:** サーバーで描いた HTML でもまとまりに名前を付け、隠れた欄にフォーカスを移さない（CodeRabbit） ([28dffb3](https://github.com/kazuemon/ui/commit/28dffb3aaf3be540899e2b44926b7ce639ada49c))
* **fieldset:** まとまりのエラーを Form の一覧・フォーカスと、1 つだけの Checkbox・Switch に届ける ([b9612ae](https://github.com/kazuemon/ui/commit/b9612ae9e8b7ebe5b5964b7001b230c1cb37f043))
* **fieldset:** まとまりのエラーを中の欄の説明の先頭にもつなぐ ([29ad90e](https://github.com/kazuemon/ui/commit/29ad90e867791d973ecc5290be52c70e78c44104))
* **inspector:** width の割合指定と、はじめから開いているときの autoFocus を直す ([71b6a4c](https://github.com/kazuemon/ui/commit/71b6a4cf2c396200637ead053dc971eed6592db8))
* PR 前のレビューの指摘を直す（Stat の大きい段の字間・Time などの size・見本） ([6cd164a](https://github.com/kazuemon/ui/commit/6cd164a2f82a15b7b882e02277eb2e2d249b8c95))
* **sidebar:** SidebarLayout の placement の値を under-header・full-height にする ([2cdf457](https://github.com/kazuemon/ui/commit/2cdf45722f90996383e143a5a209c2700c815b15))
* **sidebar:** レビューの指摘を直す ([30502a3](https://github.com/kazuemon/ui/commit/30502a3824107fc1769b8fe7e839a9084c8fcf21))
* **sidebar:** 狭い画面の Drawer を閉じたら開閉のボタンへ焦点を戻し、見本の試合をキーボードでも開けるようにする ([1429d58](https://github.com/kazuemon/ui/commit/1429d58794b5f6c4b53b187caaafff4640194090))
* **sidebar:** 畳んだ列から引き出して開き、アイコンの行を正方形にし、シートの区切り線と入れ子の題を足す ([42b5cc8](https://github.com/kazuemon/ui/commit/42b5cc8a8e732fa9c4183da5670d7233993b1d16))
* **sidebar:** 畳んでも行の縦の位置をそろえ、入れ子の行の塗りを案内線から離し、上下の行の props 名をそろえる ([ed86bb7](https://github.com/kazuemon/ui/commit/ed86bb7cfaec2ff220dfda2252c81840571095ae))
* **sidebar:** 行の札を badge オブジェクトにまとめ、行ごとに畳んだときの形を変えられるようにする ([ec0ea71](https://github.com/kazuemon/ui/commit/ec0ea711712131dc90f2ce1461d2ac25f5b3c36f))
* **sortable:** 動かせない項目をキーボードで動かさない、レシピの項目は初めの 1 回だけ読むと明示する（CodeRabbit） ([adf7781](https://github.com/kazuemon/ui/commit/adf7781069e40fe44bf63106169ffa21970d7e19))
* **sortable:** 純正のレシピでは、ドラッグしない並べ替えの ︙ メニューを置く（CodeRabbit） ([370bbe4](https://github.com/kazuemon/ui/commit/370bbe422cd208feab3dbe9c1f7d2c8962070618))
* **stepper:** CodeRabbit の指摘4件を直す（子要素の検証・状態の読み上げ・フォーカス・偽のボタン） ([1dd8b7a](https://github.com/kazuemon/ui/commit/1dd8b7ad8d84461dfb720cc86e5dbb56ce9d34fb))
* **stepper:** value を制御専用にし、クリックの通知を onStepClick に分ける ([6e31ddd](https://github.com/kazuemon/ui/commit/6e31ddd51746f78ac84039dcf19ae769ed74a33c))
* **stepper:** フォーカスの戻りを「押した」フラグで判定する（CodeRabbit） ([1fe9bf6](https://github.com/kazuemon/ui/commit/1fe9bf6a31cfb91de6787ceaf4aefac68d88c946))
* **toggle:** connected の見た目の2つの不具合を直す ([#74](https://github.com/kazuemon/ui/issues/74)) ([40a9bfd](https://github.com/kazuemon/ui/commit/40a9bfda383f748c01ee7f79d4fd6be319b93ebb))
* セルフレビューの指摘を直す（横のラベルの欄の潰れ・FieldGroup の子・型・部位の置き忘れ） ([dc012ba](https://github.com/kazuemon/ui/commit/dc012bace2aa9f734730deafa312d710a6bdb63e))
* 組み立てた TagsInput で validate の文も読み上げ、ストーリーと JSDoc の説明を直す（CodeRabbit） ([7ab8108](https://github.com/kazuemon/ui/commit/7ab8108bfb45019abd0582e50afb4b10f1883583))


### 見た目

* Field のラベルの置き場所・組み立て方・横のラベルの既定の比較（軸 385・386・388） ([341bb8d](https://github.com/kazuemon/ui/commit/341bb8d6f243b89e5d6ea59af0286458341bc905))
* Fieldset の囲み方・見出しの強さ・まとまりのエラーの比較（軸 389・390・391） ([5132b4b](https://github.com/kazuemon/ui/commit/5132b4b01946ba999aaa8dfc95e41a7cffba81ab))
* **inspector:** 軸 350〜355 の決定を反映する（ADR-0320〜0325） ([1b66f17](https://github.com/kazuemon/ui/commit/1b66f178a38174be2f42d6b40d48bf6f938d8874))
* Sidebar の比較ストーリー（軸 379〜384）と、比べるための部品の機能を置く ([2caa320](https://github.com/kazuemon/ui/commit/2caa320536b6fa3f418fd5498acbe163662ac439))
* **slider:** 押しているあいだの手応えを pressEffect で選べるようにする（ADR-0321） ([2e89942](https://github.com/kazuemon/ui/commit/2e89942e5b1d9859384656a8eb85d86e81ac3d86))
* **slider:** 軸 321 を押しているあいだの手応えの比較に作り直す ([2ef1963](https://github.com/kazuemon/ui/commit/2ef196312cbc4925e62f2a3fcbda674ac9d93e96))
* **stepper:** マーカーと向きの比較ストーリーを置く（軸340・341） ([7bb3cc1](https://github.com/kazuemon/ui/commit/7bb3cc19a9473958801bd26be3cae53a142ed432))
* 見出しの大きい段の比較（軸 387） ([fbc1e5c](https://github.com/kazuemon/ui/commit/fbc1e5cc2c3533ae3809baa92526cb7ab0097ba0))

## [0.1.1](https://github.com/kazuemon/ui/compare/v0.1.0...v0.1.1) (2026-09-24)


### 直したこと

* 公開する package.json に types と main を足す ([46d4364](https://github.com/kazuemon/ui/commit/46d4364756983e2c67eaca5b12311b95c6f28e05))
* 公開する package.json に types と main を足す ([574b531](https://github.com/kazuemon/ui/commit/574b531c00da0dd515752e5504dae374ff634cfa))

## [0.1.0](https://github.com/kazuemon/ui/compare/v0.0.1...v0.1.0) (2026-09-24)


### 新しくできること

* npm のパッケージに説明とリンクを足し、0.1.0 として公開する ([775dbf7](https://github.com/kazuemon/ui/commit/775dbf7dbbc979b8dbeb60637c269dcbdfeba2e9))
* npm のパッケージに説明とリンクを足し、0.1.0 として公開する ([e323647](https://github.com/kazuemon/ui/commit/e3236473bedf69421db52dd896578afcf21d0cf1))
