# 0243. 変わる値の通知は on<何>Change、「何」は対になる props、引数は値だけ

- ステータス: Accepted
- 日付: 2026-09-21
- ラウンド: ループ外（props の監査）

## 背景

props の命名監査（`naming-analysis.md`）で、通知イベントの形に 3 つの不一致が見つかりました。

1. **N-07**: `Pagination` だけ `onChange(page: number)` で、他の全部品の `on<何>Change`（対になる props の名前を「何」に入れる形）から外れています。`page` という props と名前が対応していません
   - `src/components/pagination/Pagination.tsx:144` — `page: number`（制御の値。必須で、`defaultPage` がありません）
   - `src/components/pagination/Pagination.tsx:160` — `onChange?: (page: number) => void;`
   - `src/components/table-of-contents/TableOfContents.tsx:130,132` — `currentId?: string | null` と `onCurrentChange?: (id: string | null) => void`（同じ「いまどこ」の通知が `on<何>Change` の形を守っている例）
2. **N-08**: `onValueChange`（19 部品）の第 2 引数の有無が部品ごとに違います。`TextField`・`PasswordField`・`NumberField`・`Tabs`・`CheckboxGroup`・`RadioGroup`・`Checkbox`・`Switch` は、Base UI の `Root`／`Control` の props 型をそのまま継承しているため、Base UI の `eventDetails`（第 2 引数）が公開の型にそのまま漏れます
   - `src/components/text-field/TextField.tsx:11-14` — `TextFieldProps extends Omit<ComponentProps<typeof BaseField.Control>, …>, InputFieldProps {}`（`onValueChange` は継承経由）
   - `src/components/number-field/NumberField.tsx:30` — `onValueChange?: RootProps['onValueChange'];`
   - `src/components/tabs/Tabs.tsx:176` — `onValueChange?: BaseTabs.Root.Props['onValueChange'];`
   - `src/components/checkbox/Checkbox.tsx:58-61`／`src/components/switch/Switch.tsx:223-226`／`src/components/checkbox/CheckboxGroup.tsx:93-94`／`src/components/radio/Radio.tsx:85-86` — いずれも `Omit<ComponentProps<typeof BaseX.Root>, …>` で `onCheckedChange`／`onValueChange` を継承
   - 一方 `src/components/select/Select.tsx:129` 付近は `onValueChange: (value: string | null) => void`（1 引数で自前宣言）
3. **N-22**: 制御の三つ組（`x`／`defaultX`／`onXChange`）が欠けている部品があります。`Pagination` は `page` はあるが `defaultPage` がなく（非制御で使えない）、`TextField` 系は `value` を React の HTML 属性任せにしていて、Docs の props 表に出てきません

## 候補

### Pagination の通知の名前（N-07）

| 案        | 内容                                                                                                          |
| --------- | ------------------------------------------------------------------------------------------------------------- |
| 現行版    | `onChange?: (page: number) => void`（`page` という props と名前が対応しない）                                 |
| A（採用） | `onChange` → `onPageChange` に改名し、`defaultPage` を足して三つ組をそろえる                                  |
| B         | `value`／`onValueChange` に寄せる（Tabs・Select と同じ形になるが、ページ番号を `value` と呼ぶのは読みにくい） |

### `onValueChange` の第 2 引数（N-08）

| 案        | 内容                                                                                                                                                                                               |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 現行版    | 部品ごとに 0 個（Select）・Base UI の `eventDetails`（TextField・Tabs・Checkbox など）・独自の第 2 引数（MaskField・NumberField）が混在                                                            |
| A（採用） | 公開する形を `(value) => void` の 1 引数に統一する。意味のある情報が要る部品だけ、自前の型で第 2 引数を足す（MaskField の `{ unmasked, completed }` など）。Base UI の `eventDetails` は公開しない |
| B         | Base UI の `eventDetails` を「公開する」と決め、全部品の第 2 引数にそろえる（実装は楽だが、Base UI の型名が d.ts に出る）                                                                          |

### 制御の三つ組（N-22）

| 案        | 内容                                                                                                 |
| --------- | ---------------------------------------------------------------------------------------------------- |
| 現行版    | `Pagination` は `defaultPage` がない。`TextField` 系は `value` が HTML 属性任せで、型・Docs に出ない |
| A（採用） | 制御の口を持つ部品は `x`／`defaultX`／`onXChange` を必ず自前で宣言する。HTML 属性任せにしない        |
| B         | HTML 属性で足りるものは宣言しない（現状維持。エディタの補完には出るが、Docs の表には出ない）         |

## 決定

**「何」は対になる props の名前にします（`page` → `onPageChange`）。裸の `onChange` は使いません。引数は `(値) => void` の 1 引数です。意味のある情報が要る部品だけ、自前の型で第 2 引数を足します（Base UI の `eventDetails` は公開しません）。制御の口を持つ部品は `x`／`defaultX`／`onXChange` を必ず自前で宣言します。**

- `Pagination`: `onChange` → `onPageChange`、`defaultPage` を足す
- `TextField`・`PasswordField`・`NumberField`・`Tabs`・`CheckboxGroup`・`RadioGroup`・`Checkbox`・`Switch`: `onValueChange`／`onCheckedChange` の第 2 引数（Base UI の `eventDetails`）を型から落とす
- `MaskField`（`{ unmasked, completed }`）・`NumberField`（`{ reason }`）は自前の型で第 2 引数を残す

## 理由

N-07・N-08・N-22 はいずれも一言はありませんでした。`decisions-memo.md` の判定はどれも「採用」です。

> N-07 採用 onChange → onPageChange
> N-08 採用 (value) => void の 1 引数に統一、必要な部品だけ自前の第 2 引数
> N-22 採用 制御の三つ組を必ず自前で宣言

## 却下した案と理由

- **N-07 の B（`value`／`onValueChange` に寄せる）**: 採られませんでした。`naming-analysis.md` の直し方の候補どおり、ページ番号を `value` と呼ぶのは読みにくいためです
- **N-08 の B（Base UI の `eventDetails` を公開する）**: 採られませんでした。`NumberFieldRootChangeEventDetails` のような Base UI の型名が d.ts に出て、Base UI を上げるたびに公開 API が動くためです
- **N-22 の B（宣言しないまま）**: 採られませんでした。Docs の props 表（JSDoc から自動生成）に出ないままになるためです

## 影響

- `Pagination`（`src/components/pagination/Pagination.tsx`）: `onChange` → `onPageChange` に改名し、`defaultPage` を足します。直します
- `TextField`・`PasswordField`・`NumberField`・`Tabs`・`CheckboxGroup`・`RadioGroup`・`Checkbox`・`Switch`: `onValueChange`／`onCheckedChange` の型を `(value) => void` の 1 引数に直し、Base UI の `Root`／`Control` の props 型の継承をやめて明示の props にします（ADR-0250 の渡し方の規約とあわせて直します）。直します
- `MaskField`・`NumberField`: 自前の第 2 引数の型はそのまま残します

## 原則への反映

反映なし。名前と引数の形だけの決定で、見た目・構造は変えていません。

## 比較画像

なし。名前と API の決定で、見た目は変えていません（ADR-0013・ADR-0051 と同じ理由）。
