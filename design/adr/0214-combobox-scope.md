# 0214. Combobox は、単数・複数・グループ・読み込み・空状態までを作り、骨格は Select と共有する

- ステータス: Accepted
- 日付: 2026-09-21
- ラウンド: 後半

## 背景

文字を打って選択肢を絞る欄（Combobox）を作るにあたり、どこまでを部品に入れるか、Chip を別の部品にするか、Select と共有する部分をどうするか、選択肢と値の形をどうするかを決める必要がありました。Select と同じく、選択肢を出す面（浮かぶ選択肢とシート）を持つ部品です。

## 決定

**範囲は、単数選択・複数選択（Chips）・グループ・読み込み・空状態までです。Chip は Combobox と同時に、独立した部品として作ります。**

- 含めないもの: 新しい選択肢をその場で作る形（Creatable）・仮想化・入力で絞らず候補を出すだけの形（Autocomplete）
- 選択肢を出す面と項目は、先に `src/internal/listbox` へ切り出し、Select も同じ部品に乗せ替えます。見た目は変えません。Select を描く 31 本のストーリーを、許容 0px で比べ、すべて一致しました
- 選択肢の形（`items`）は、平らな配列（`{ label, value, disabled?, note? }[]`）か、グループの配列（`{ label, items }[]`）です。子要素と context で組む形は採りません。Select の backlog にあった「グループの形」も、この形で決着します（Select にも同じ形で足す想定です）
- 値は文字列です（複数選択は文字列の配列）。Base UI の `createItems` で作った collection を渡します
- 部品は文を作りません。`emptyText`・`loadingText`・`loadedText`・`chipRemoveLabel` など、文は使う側が渡します。既定の文を持つのは、Select と揃えた読み込みの知らせだけです（[0055](./0055-sheet-loading-row.md)）

## 理由

ユーザーの選択の原文です。

> 単一＋複数（Chips）＋グループ＋読み込み＋空状態 (Recommended)

> Combobox と同時に、独立した部品として作る (Recommended)

> 先に internal へ切り出し、Select も乗せ替える (Recommended)

選択肢の一覧の形（`items` の形）は、提案者が決めて報告したもので、ユーザーの異議はありませんでした。

以下は、決めたときの考えです。

- **Chip を独立させる**: 押せる・消せる小物として、[0074](./0074-a11y-review-deferred.md) の T1 に「要るときに作る」と記録していました。Combobox の複数選択が、その「要るとき」です
- **面と項目を共有する**: 選択肢の面と項目は、Select で決めた見た目（[0036](./0036-select-popup.md)・[0053](./0053-select-selected-item.md)・[0054](./0054-select-popup-motion.md)）をそのまま使います。2 つの部品で別々に持つと、あとで見た目がずれます
- **文を持たない**: 部品は置かれる場所の言葉を知らないので、既定の文を持ちません（[原則 20](../principles.md#20-部品は知らないことを決めない)）

## 却下した案と理由

- **Creatable・仮想化・Autocomplete を入れる**: 範囲の選択で選ばれませんでした。要るときに足せる形にしておきます
- **子要素と context で選択肢を組む**: 配列で渡す形に絞りました。グループも同じ配列の形で表せます

## 影響

- `src/components/combobox/`: Combobox・`combobox-items.ts`（選択肢の形）を足しました
- `src/components/chip/`: Chip を足しました
- `src/internal/listbox/`: 選択肢の面と項目の見た目・並びの計算・読み込みの行を、Select から切り出しました
- `src/components/select/Select.tsx`: `src/internal/listbox` に乗せ替えました。見た目は変わりません
- `src/index.ts`: 部品と props の型を足しました
- backlog に、Select にグループの形を足すこと、Select の未決の一部を Combobox の決定に合わせて更新することを足します

## 原則への反映

反映なし。部品の範囲・items の形・値の型は原則の対象外です。「部品は文を作らない」は、原則 20 のとおりです。

## 比較画像

比較のストーリーはありません（チャットでの確認です）。決めた時点のコミット `b807ad3` の比較のストーリーで描きました。`git checkout b807ad3 && pnpm storybook` で、決めたときの部品のまま開けます。
