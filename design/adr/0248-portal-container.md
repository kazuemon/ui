# 0248. 浮かぶものを描く場所は、部品と ThemeProvider では portalContainer、Portal では container

- ステータス: Accepted
- 日付: 2026-09-21
- ラウンド: ループ外（props の監査）

## 背景

props の命名監査（`naming-analysis.md` N-14）で、「浮かぶものを描く場所」という同じ概念に 2 つの名前があることが分かりました。`container` は個々の部品が持ち、`ThemeProvider` だけ `portalContainer` という別名です。

- `src/components/theme-provider/ThemeProvider.tsx:24` — `portalContainer?: HTMLElement | null;`
- `src/components/portal/Portal.tsx:13` — `container?: HTMLElement | null;`（書かないときは `ThemeProvider` の `portalContainer` を使う）
- 次の 12 部品が `container?: HTMLElement | null;` を持ちます（`grep -rn "container?: HTMLElement" src/components`）: `src/components/alert-dialog/AlertDialog.tsx:58`・`src/components/dialog/Dialog.tsx:85`・`src/components/drawer/Drawer.tsx:89`・`src/components/popover/Popover.tsx:81`・`src/components/menu/Menu.tsx:155`・`src/components/tooltip/Tooltip.tsx:70`・`src/components/select/Select.tsx:139`・`src/components/combobox/Combobox.tsx:247`・`src/components/autocomplete/Autocomplete.tsx:273`・`src/components/tags-input/TagsInput.tsx:301`・`src/components/toast/Toast.tsx:258`（`ToastProvider`）・`src/components/navbar/Navbar.tsx:191`

`Container`（`src/components/container/`）という、幅を決めるまったく別の部品もすでに公開されています。`container` という名前は、この部品と紛れます。

## 候補

| 案        | 内容                                                                                                                                                                                                  |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 現行版    | 個々の部品は `container`、`ThemeProvider` だけ `portalContainer`（`Portal` 部品は `container`）                                                                                                       |
| A（採用） | `Dialog` などの部品と `ThemeProvider` を `portalContainer` にそろえる。`Portal` 部品だけ `container` のまま残す（`Container` 部品と紛れないため）                                                     |
| B         | `ThemeProvider` を `defaultContainer` にする（「既定を与える側」であることが名前に出るが、`ThemeProvider` の他の props（`requiredMark`・`presentation` など）には接頭辞がなく、そこだけ不揃いになる） |
| C         | 現状維持（JSDoc で相互参照しているので迷いにくい、という立場）                                                                                                                                        |

## 決定

**`Dialog`・`AlertDialog`・`Drawer`・`Popover`・`Menu`・`Tooltip`・`Select`・`Combobox`・`Autocomplete`・`TagsInput`・`ToastProvider`・`Navbar` の `container` を `portalContainer` に改名します。`Portal` 部品だけは `container` のまま残します（`Container` 部品と紛れないためです）。**

## 理由

ユーザーの一言の原文です。

> N-14「Container というコンポーネントがあるので、dialog, ThemeProvider においては portalContainer を、portal においては container とするのがいいかなと思いました。」

## 却下した案と理由

- **`ThemeProvider` を `defaultContainer` にする**: 検討していません。ユーザーの一言は「dialog, ThemeProvider においては portalContainer」と明確に `portalContainer` を指しています
- **現状維持**: 採られませんでした。`container` という同じ名前が、`Container` 部品・`Portal` の `container`・個々の部品の `container` の 3 つで別のものを指していて、読んで分かる名前ではありませんでした

## 影響

次の 12 部品の `container` を `portalContainer` に改名します。直します。

- `src/components/alert-dialog/AlertDialog.tsx`
- `src/components/dialog/Dialog.tsx`
- `src/components/drawer/Drawer.tsx`
- `src/components/popover/Popover.tsx`
- `src/components/menu/Menu.tsx`
- `src/components/tooltip/Tooltip.tsx`
- `src/components/select/Select.tsx`
- `src/components/combobox/Combobox.tsx`
- `src/components/autocomplete/Autocomplete.tsx`
- `src/components/tags-input/TagsInput.tsx`
- `src/components/toast/Toast.tsx`（`ToastProvider`）
- `src/components/navbar/Navbar.tsx`

`src/components/theme-provider/ThemeProvider.tsx` の `portalContainer` は名前を変えません。`src/components/portal/Portal.tsx` の `container` も名前を変えません。JSDoc の相互参照（「部品の `container` を書いたときは、そちらが勝ちます」のような文）も、新しい名前にあわせて書き直します。

## 原則への反映

反映なし。名前だけの決定で、見た目・構造は変えていません。

## 比較画像

なし。名前と API の決定で、見た目は変えていません（ADR-0013・ADR-0051 と同じ理由）。
