# 実装とテストの落とし穴

部品を作ったり直したりするときに、これまで踏んだ落とし穴です。多くは、気づかないとテストが緑のまま見た目だけが崩れます。見た目のテストの仕組みそのものは [`.storybook/visual-testing.md`](../.storybook/visual-testing.md) にあります。

## Tailwind

- `tv` のクラスを template literal で組み立てない。Tailwind はソースの文字を読んでクラスを作るので、組み立てたクラスは CSS に出ません。クラスは文字のまま書きます
- `justify-[var(--x)]` はクラスとして拾われますが、CSS が作られません（`justify-content` の任意値にならない）。`[justify-content:var(--x)]` と書きます
- tailwind-merge は、`decoration-1` の隣の `decoration-(color:…)` や、`text-fg-subtle` の隣の `text-caption` を同じ種類とみなして消します。部品の中では `text-(length:--text-caption)`・`h-(--spacing-control)` のように種類が分かる形で書きます。`@theme` に名前を足したら `twMergeConfig` にも足します
- `src/styles/globals.css` は、Tailwind が読む場所を `src/` と `design/stories/` に絞っています。ほかの場所にクラスを書くなら `@source` を足します
- dev server が動いている間に作ったファイルのクラスは、拾われないことがあります。`src/styles/globals.css` を touch し、配信された CSS にクラスがあるかを確かめてから見てもらいます

## Base UI

- `render={<SheetCloseButton />}` のように、見た目を持つ部品を `render` に渡したうえで外から `className` を渡すと、部品の見た目のクラスが消えます
- Drawer の閉じる動きに、はじいた強さ（`--drawer-swipe-strength`）を掛けない。250ms が 25〜60ms になり、一瞬で消えます
- snap point があるとき、半分の段から閉じると transition が始まりません。その場合だけキーフレームで滑らせています
- snap point は controlled のまま保ちます。`undefined` と値を出し入れすると警告が出て段が空に戻るので、ないときは `null` を渡します
- snap point の基準は Viewport の要素の高さです。面の高さの上限も、画面ではなく枠に対する割合で書きます
- `initialFocus` に `true` を渡すと、既定（何も渡さない）とは違い、常に最初の要素にフォーカスします。指のシートでも × に線が出ます
- `autofocus` を読む仕組みはありません。開いた直後に面の中へフォーカスがあれば、それを返す形で拾っています（`src/internal/overlay/initial-focus.ts`）
- Tooltip は同時に 1 つしか開きません。並べて撮るストーリーでは `defaultOpen` ではなく `open` を渡します

## Storybook

- LAN の IP で開くと secure context ではないので、`navigator.clipboard` がなく、play の引数の `userEvent` も空になります。`userEvent` は `storybook/test` から読みます。localhost の headless では気づけないので、play は LAN の IP でも確かめます
- `storybook-addon-pseudo-states` は Tailwind の `group-hover` を再現しません。ストーリーでは変数を直接渡します
- 状態の一覧で「押せない」行と「フォーカス」列が交わると、pseudo-states が押せない欄にも見た目を当てます。対象の選び方に `src/stories/story-states.ts` の `enabledControl` を使います
- 動いている Storybook の下で部品のフォルダを消して入れ替えると、一覧が壊れます。止めてから入れ替えるか、上書きで直します
- `.storybook/main.ts` を変えたら dev server の再起動が要ります

## テスト

- `pnpm test -u` は、パスを渡しても全体の基準画像を撮り直すことがあり、直前の変更の前の見た目を書くこともあります。範囲を絞って撮り直すときは、その png を消して `pnpm exec vitest run <フォルダ>` を流し（新しい画像ができて 1 回落ちる）、画像を見てからもう一度流します。並べて動かしているエージェントには `-u` を使わせません
- 全体で流したときだけ落ちるストーリーがあります（負荷で揺れる）。そのストーリーだけを 3 回流して通るなら、変更のせいではありません。PR にはそう書きます
- `sed` で props の名前を置き換えると、ストーリーの export 名まで変わり、基準画像が新しく作られます
- 型の確かめは `pnpm typecheck` で行います。`tsc -p .` はストーリーを見ません
- 見た目のストーリーには、同梱していないフォントの文字（⌘・↗ など）、iframe の中の文字、`<video controls>` の時刻を写しません。OS ごとに字形が違い、CI で落ちます
- 撮るのは `tags: ['visual']` の付いたストーリーだけです。見た目を変えないはずのリファクタでは、一時的に全部のストーリーを撮ってくらべます。`.storybook/visual.setup.ts` の早期 return を `!import.meta.env.VITE_VISUAL_ALL` でも通るようにし、変更の前の状態で `VITE_VISUAL_ALL=1` を付けて基準画像を作り、変更のあとに同じ条件で流します。終わったら setup を戻し、増えた基準画像はコミットしません
- 並べたエージェントが同時にテストを流すと重くなり、揺れが増えます。`flock <ロックファイル> pnpm test …` で 1 つずつ流します
- `/tmp` が tmpfs だと、テストの一時ファイルや worktree の node_modules で埋まります。`TMPDIR` をディスクに向けます

## 動き

- 動きの候補は、提示する前に時間を追って測ります（押してから 0・60・120・200・300ms の transform・opacity を読む）。押す動きの easing は 60ms で 8 割ほど進むので、見せたい動きに使うと、ほかの案と見分けがつきません。見せる動きは 300〜400ms の ease-out にします
- 静止画は、繰り返す動きを 0 フレーム目で撮ります。「固定」の列では、負の `animation-delay` と `animation-play-state: paused` で代表のフレームに止めます
