# 0244. 起きたことの通知は過去形（on<何>ed）。過去形は取り消せない

- ステータス: Accepted
- 日付: 2026-09-21
- ラウンド: ループ外（props の監査）

## 背景

props の命名監査（`naming-analysis.md` N-23）で、「もう起きたこと」を知らせるイベント名の時制・品詞が、過去形・現在形・動詞・名詞で混ざっていることが分かりました（A-6「起きたことの通知」の行）。

`naming-analysis.md` A-6 に挙がっていた名前を、この worktree の `src/` で 1 つずつ確かめました。公開の props（`src/index.ts` から出ている部品の props 型）だけを対象にしています。

| 名前               | 部品                       | 場所                                                                                                                                             | 時制・品詞     | 確かめた意味                                                                                                                                                                                                   |
| ------------------ | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `onCopied`         | CopyButton                 | `src/components/copy-button/CopyButton.tsx:90`                                                                                                   | 過去形         | コピーが成功したあとに呼ぶ（`:128` `ok ? onCopied?.(value) : …`）。すでに過去形                                                                                                                                |
| `onValueCommitted` | NumberField                | `src/components/number-field/NumberField.tsx:32`                                                                                                 | 過去形         | Base UI の `onValueCommitted` をそのまま通している。すでに過去形                                                                                                                                               |
| `onValueComplete`  | PinField                   | `src/components/pin-field/PinField.tsx:79`                                                                                                       | 形容詞         | 全桁を打ち終えたあとに呼ぶ                                                                                                                                                                                     |
| `onExitComplete`   | Transition                 | `src/components/transition/Transition.tsx:66`                                                                                                    | 形容詞         | 退場の動きが終わったあとに呼ぶ（`:104` で Base UI の `onExited` に橋渡し）                                                                                                                                     |
| `onParseFail`      | DateField・TimeField       | `src/components/date-field/DateField.tsx:66`／`src/components/time-field/TimeField.tsx:74`／`src/internal/date-segments/use-date-segments.ts:48` | 動詞（現在形） | 打った文字を解釈できなかったあとに呼ぶ                                                                                                                                                                         |
| `onCopyError`      | CopyButton                 | `src/components/copy-button/CopyButton.tsx:95`                                                                                                   | 名詞           | コピーに失敗したあとに呼ぶ（`:128`）                                                                                                                                                                           |
| `onClear`          | SearchField                | `src/components/search-field/SearchField.tsx:29`                                                                                                 | 動詞（現在形） | JSDoc「消去のボタンか Esc で値を消したとき。`onValueChange('')` の**あとに**呼ぶ」（`:76-78` `clear()` は `change('')` のあとに `onClear?.()`）。値が空になったことの通知で、取り消せない                      |
| `onClose`          | Notice                     | `src/components/notice/Notice.tsx:64`                                                                                                            | 動詞（現在形） | JSDoc「押してお知らせが消えたとき」。`Notice` 自身が閉じる・消えるのは内側の状態で、`onClose` はその後の通知。`open`／`onOpenChange` の三つ組は持たない                                                        |
| `onClose`          | ToastOptions（`useToast`） | `src/components/toast/Toast.tsx:408`                                                                                                             | 動詞（現在形） | JSDoc「閉じたときに呼ばれます」。トーストが消えたあとの通知                                                                                                                                                    |
| `onClose`          | MenuSurface（内部）        | `src/components/menu/Menu.tsx:312`                                                                                                               | —              | `MenuSurfaceProps` は `src/index.ts` に出ていない内部の型です。公開 props ではないので対象外です                                                                                                               |
| `onAction`         | AlertDialog                | `src/components/alert-dialog/AlertDialog.tsx:31`                                                                                                 | 名詞           | JSDoc「失敗した（Promise が reject された）ときは閉じずに残します」。呼んだ**あと**に成否が決まる、実行そのもの（`:87` `const result = onAction?.()`）。「起きたこと」の通知ではなく、実行する処理そのものです |
| `onRemove`         | Chip                       | `src/components/chip/Chip.tsx:101`                                                                                                               | 動詞（現在形） | `:136` `onClick={() => onRemove()}`。押した時点で呼び、実際に取り除くのは呼び出し側（親）の仕事です。まだ何も起きていない時点の、実行の依頼です                                                                |
| `onItemClick`      | TableOfContents            | `src/components/table-of-contents/TableOfContents.tsx:140`                                                                                       | 名詞＋動詞     | `:222` で `<a>` の `onClick` にそのまま渡す名前です。DOM の `onClick` と同じ性質です                                                                                                                           |

## 候補

| 案        | 内容                                                                                                                                                                                         |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 現行版    | 過去形（`onCopied`・`onValueCommitted`）・動詞（`onParseFail`・`onClear`・`onClose`）・名詞（`onCopyError`・`onAction`・`onItemClick`）・形容詞（`onValueComplete`・`onExitComplete`）が混在 |
| A（採用） | 「起きたことの通知」は過去形にそろえる。現在形（`onOpenChange` など）は制御した値を更新しないことで取り消せ、過去形は取り消せない、という 1 行の規約にする                                   |
| B         | `on<名詞>` に寄せる（`onCopy`・`onCopyError`・`onParseError`）                                                                                                                               |

## 決定

**起きたことの通知は過去形（`on<何>ed`）にそろえます。過去形は取り消せません。現在形（`onOpenChange` など）は、制御した値を更新しないことで取り消せます。DOM のイベント（`onClick`・`onSubmit`・`onLoad`・`onError`）はそのままです。**

改名するのは次の 6 件です。

| 部品                                                    | 旧名              | 新名               |
| ------------------------------------------------------- | ----------------- | ------------------ |
| PinField                                                | `onValueComplete` | `onValueCompleted` |
| Transition                                              | `onExitComplete`  | `onExited`         |
| DateField・TimeField（と内部の `use-date-segments.ts`） | `onParseFail`     | `onParseFailed`    |
| CopyButton                                              | `onCopyError`     | `onCopyFailed`     |
| SearchField                                             | `onClear`         | `onCleared`        |
| Notice・ToastOptions                                    | `onClose`         | `onClosed`         |

`onCopied`・`onValueCommitted` はすでに過去形なので、改名しません。

`onAction`（AlertDialog）・`onRemove`（Chip）・`onItemClick`（TableOfContents）は改名しません。呼ばれた時点でまだ結果が確定していない（`onAction`）か、呼ぶこと自体が実行の依頼（`onRemove`）か、DOM の `onClick` と同じ性質（`onItemClick`）で、「もう起きたこと」の通知ではないためです（下の「却下した案と理由」）。`MenuSurface` の `onClose` は内部の型で公開 props ではないため対象外です。

## 理由

ユーザーの一言の原文です。

> N-23「現在形のイベントはキャンセルできる、過去形のイベントはキャンセルできない、という形で揃えられそうですね。」

この一言は N-23（イベント名の時制の不一致そのもの）への返事で、`onClear`・`onClose`・`onAction`・`onRemove`・`onItemClick` の 1 件ずつへの返事ではありません。この ADR の表の分類（改名する／しない）は、この 1 行の規約（現在形＝取り消せる／過去形＝取り消せない）を、`src/` を読んで 1 件ずつ確かめた結果です。

## 却下した案と理由

- **`on<名詞>` に寄せる（`onCopy`・`onCopyError`・`onParseError`）**: `naming-analysis.md` の直し方の候補どおり、`onCopy` は React の `onCopy`（DOM のコピーイベント）と名前が衝突するため、採りませんでした
- **`onAction` を `onActed`／`onActioned` のような過去形にする**: 見送りました。`onAction` は「実行する処理そのもの」（戻り値・失敗判定を呼び出し側が持つ）で、呼んだ時点ではまだ何も終わっていません。過去形にすると「もう成功した」という意味に読めてしまいます
- **`onRemove` を `onRemoved` にする**: 見送りました。`Chip` 自身は消える処理を持たず、`onRemove` は「取り除いてください」という依頼です。過去形にすると、`Chip` がすでに消えたかのように読めます
- **`onItemClick` を過去形にする**: 見送りました。`<a>` の `onClick` へそのまま渡す名前（DOM のイベント）なので、この ADR の「DOM のイベントはそのまま」の例外に当たります

## 影響

- `src/components/pin-field/PinField.tsx`: `onValueComplete` → `onValueCompleted`
- `src/components/transition/Transition.tsx`: `onExitComplete` → `onExited`
- `src/components/date-field/DateField.tsx`・`src/components/time-field/TimeField.tsx`・`src/internal/date-segments/use-date-segments.ts`: `onParseFail` → `onParseFailed`
- `src/components/copy-button/CopyButton.tsx`: `onCopyError` → `onCopyFailed`
- `src/components/search-field/SearchField.tsx`: `onClear` → `onCleared`
- `src/components/notice/Notice.tsx`・`src/components/toast/Toast.tsx`（`ToastOptions`）: `onClose` → `onClosed`

古い名前は残さず置き換えます（ADR-0051 の「置き換える」の答えと同じ方針）。上のいずれの部品も、ストーリー・見本のコードの呼び出し側もあわせて直します。

## 原則への反映

反映なし。名前だけの決定で、見た目・構造は変えていません。

## 比較画像

なし。名前と API の決定で、見た目は変えていません（ADR-0013・ADR-0051 と同じ理由）。
