# Changelog

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
