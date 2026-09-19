# 0153. 6 部品の土台（Avatar・Breadcrumb・Pager・CodeGroup・Toast・Tree）

- ステータス: Accepted
- 日付: 2026-09-19
- ラウンド: 後半 軸140〜150

## 背景

README の「つくりたいコンポーネント」から、次の 6 つを作りました。

> 次に CodeGroup, Pager, Toast, Avatar, Breadcrumb, Tree を作りたいです

どれも振る舞い（キーボード・読み上げ・開閉）を持つので、何に乗せるかを先に決める必要がありました。原則では決まらないので、部品ごとに土台を選び、見た目は軸 140〜150 で決めています。

## 決定

**振る舞いのある部品は Base UI に乗せ、Base UI にないもの（木）だけ自前で書きます。**

| 部品       | 土台                                                                             |
| ---------- | -------------------------------------------------------------------------------- |
| Avatar     | Base UI の `avatar`（Root・Image・Fallback）                                     |
| Breadcrumb | 素の `nav > ol > li`（振る舞いがないため）                                       |
| Pager      | 素の `nav`＋`useRender`（Next.js の Link などに差し替えられる）                  |
| CodeGroup  | Base UI の `tabs`＋内部の ScrollArea の見た目。Tabs 部品には乗せない（下の理由） |
| Toast      | Base UI の `toast`（Provider・Portal・Viewport・Root）＋お知らせの面（internal） |
| Tree       | 自前（Base UI に木がないため）。WAI-ARIA APG の Navigation Treeview にならう     |

**木（Tree）の作り**: `ul[role=tree] > li[role=none] > 行[role=treeitem] ＋ ul[role=group]`。並びは行の兄弟に置き、`aria-owns` では結びません（結ぶと、行の読み上げの名前に中の行き先が全部入ります）。Tab で入るのは 1 行だけ（roving tabindex）で、↑↓ で行を移り、→ で開いて中へ、← で閉じて親へ、Home・End で端へ移ります。開け閉ては Base UI の Collapsible に任せ、中身の高さを動かします（Accordion と同じ）。

**CodeGroup を Tabs 部品に乗せない**: 一度 Tabs 部品に乗せ替えましたが、コードの帯に収めるために Tabs の内部の変数と寸法を 6 か所で上書きすることになりました（印の太さ・印の色・フォーカスの線の色・選んでいないタブの文字と線の色・左右のはみ出しと上の余白・並びの線を消す）。自己完結に戻し、決まった見た目（pill の hover・内側に引くフォーカスの線・境目の線に重なる印）はトークンと決まりでそろえています。滑る印（Base UI の `Tabs.Indicator`）と、続きのぼかし（ScrollArea）は残しました。

**2 つ以上の部品が使う部分は internal へ**: コピーする文字列を取り出す関数を `src/components/code-block/code-text.ts` から `src/internal/reading/code-text.ts` へ移しました（CodeBlock と CodeGroup が使います）。

## 理由

ユーザーのメモです。

> 次に CodeGroup, Pager, Toast, Avatar, Breadcrumb, Tree を作りたいです
> worktree で作業して、worktree 用の storybook で見せてもらえますか？原則から判断できないことがあれば比較 story を作って提案してください。

CodeGroup を Tabs に乗せるかは、乗せ替えたあとに聞きました。

> そもそも Tabs に寄せないほうがシンプルに実装できたりしますか？（質問）

> C でお願いします。ScrollAreaと滑る挙動自体は維持したいです。

- **Base UI に乗せた理由**: 振る舞い（キーボード・読み上げ）を 1 か所に集めるためです。ほかの部品と同じ方針です（[ADR-0102](./0102-overlay-components.md)）
- **木を自前で書いた理由**: Base UI 1.8 に木がないためです。読み上げと操作は APG の書き方にそろえました
- **CodeGroup を自己完結にした理由**: 返事のとおりです。上書きが 6 か所になり、一般の部品を特別な場所に曲げる形になっていました。滑る印と続きのぼかしは、土台（Base UI の Tabs.Indicator・内部の ScrollArea）から直に使えば残せます

## 却下した案と理由

- **CodeGroup を Tabs 部品に乗せる**: 上書きが多く、見た目の食い違い（印の太さ・色・帯の高さ・続きのぼかしのはみ出し）を 1 つずつ直す必要がありました。Tabs 側の値が変わると、こちらも追随が要ります
- **木に `aria-owns` を使う**: 行の読み上げの名前に、中の行き先がすべて入ってしまいました

## 影響

- `src/components/avatar/`・`breadcrumb/`・`pager/`・`code-group/`・`toast/`・`tree/`（新規）
- `src/internal/reading/code-text.ts`（移動）、`src/internal/icons.tsx`（ArrowLeft・ArrowRight を追加）
- `src/index.ts`・README の一覧を更新
- **分かっていること**: Tree に型あたり（文字を打つとその行へ移る）はありません。Toast の中の操作は、出ているあいだ読み上げから外れます（Base UI の作り。F6 でトーストへ移ると操作できます）。どちらも `design/backlog.md` に残しました

## 原則への反映

反映なし。原則 1〜12 の文は変えていません（原則の書き直しは別セッションが受け持ちます）。

## 比較画像

比較の軸ではないので、画像はありません。決めた時点のコミットは `cdff792` です。
