# ドキュメントサイトの構築プラン（Next.js + Fumadocs）

@kazuemon/ui 単体のドキュメントサイトを、Next.js と Fumadocs で作る計画です。版と API は 2026-09-14 時点で確かめました。

## 目的と縛り

- 部品を使う人向けの公開ドキュメントです。いま GitHub Pages に出している Storybook を置き換えます
- **見た目は、すべて @kazuemon/ui の公開 export で作ります。** docs 側では、見た目を持つ部品も CSS も Tailwind のクラスも書きません
- 足りない部品があれば、docs 側で似たものを作らず、素の HTML 要素（ブラウザの既定の見た目）で済ませて backlog に積みます。ページの見た目が欠けていれば、それが次に作る部品の一覧になります
- 設計の記録（principles・ADR）も載せます。原本は `design/` に置いたままにし、docs はそれを読み込むだけにします

## 使うもの

| パッケージ            | 版    | 役目                                                                                                     |
| --------------------- | ----- | -------------------------------------------------------------------------------------------------------- |
| `next`                | 16.3  | App Router。`output: 'export'` で静的に書き出す                                                          |
| `fumadocs-mdx`        | 15.4  | MDX・Markdown を collection として読み込む（`source.config.ts` → `.source/` を生成）                     |
| `fumadocs-core`       | 16.15 | 見た目を持たない層。ページの木構造、目次、パンくず、前後のページ、検索、MDX のプラグイン（Shiki を含む） |
| `fumadocs-typescript` | 5.4   | props の表のデータを JSDoc から作る（`createGenerator`）。`./ui` の export は使わない                    |

**使わないもの:** `fumadocs-ui`（見た目を持つ層）。`fumadocs-typescript` の peer にありますが optional なので、入れなくて済みます。`lucide-react`（`fumadocs-core` の optional peer。アイコンは Phosphor を使います）。

## リポジトリの形

ライブラリはリポジトリ直下に置いたまま、`apps/docs` を workspace に足します。`packages/ui` に移す案は、`design/tools`・Storybook・vitest・CLAUDE.md のパスをすべて直すことになるので、今回はやりません。

```
/                              @kazuemon/ui（今のまま）
├─ src/
│  ├─ index.ts                 新規: 公開 export の入口
│  └─ styles/
│     ├─ index.css             新規: 利用者向けの CSS（Tailwind・tokens・フォント・密度）
│     └─ globals.css           Storybook 用。index.css を読み、design/stories を @source に足す
├─ design/                     原本（principles・ADR・画像）。docs が読み込む
├─ pnpm-workspace.yaml         packages: ['apps/*'] を足す
└─ apps/docs/
   ├─ package.json             "@kazuemon/ui": "workspace:*"
   ├─ next.config.mjs          createMDX（fumadocs-mdx/next）、output: 'export'、basePath
   ├─ source.config.ts         collection の定義（docs と design の 2 つ）
   ├─ lib/source.ts            loader（fumadocs-core/source）
   ├─ mdx-components.tsx       MDX の要素と部品の対応表。ライブラリの Prose から受け取るだけ
   ├─ app/
   │  ├─ layout.tsx            CSS・フォント・Provider
   │  ├─ globals.css           @import '@kazuemon/ui/styles.css' の 1 行だけ
   │  ├─ [[...slug]]/page.tsx  ページ
   │  └─ api/search/route.ts   検索の索引（staticGET）
   ├─ content/                 docs 用の MDX（はじめに、部品ごとのページ）
   ├─ examples/                動く例（1 例 1 ファイル）
   └─ scripts/check-no-style.mjs  縛りの確かめ（後述）
```

## フェーズ 0：ライブラリの入口を作る

docs が `@kazuemon/ui` をパッケージ名で読めるようにします。`src/` を直接読ませないのは、公開している export だけで組めるかも同時に確かめるためです。

1. `src/index.ts` を作り、部品を export する
2. `package.json` に `exports` と `files` を足す。開発中はソースを直接指し、Next の `transpilePackages: ['@kazuemon/ui']` で読ませる。配布用の `dist` は `publishConfig.exports` で別に書く（配布のビルドはこの計画の外）

   ```json
   "exports": {
     ".": "./src/index.ts",
     "./styles.css": "./src/styles/index.css"
   },
   "files": ["dist"]
   ```

3. CSS を分ける。今の `globals.css` は `@source '../../design/stories'` を含むので、利用者に渡すと design の比較ストーリーまで読みにいきます。`@source` を `src` だけにした `index.css` を切り出し、Storybook の `globals.css` はそれを読んだうえで `design/stories` を足します
4. Tailwind は docs 側で `@tailwindcss/postcss` を使ってビルドする。docs にはクラスを書かないので、`@source` はライブラリの `src` だけで足ります

**確かめること:** workspace のルートのパッケージを `workspace:*` で参照できるか。`ibm-plex-sans-jp.css` のフォントの URL を Next の CSS が解決できるか。

## フェーズ 1：骨組み（素の文字だけ）

1. `apps/docs` に Next.js を入れ、`fumadocs-mdx` と `fumadocs-core` を足す
2. `source.config.ts` に docs の collection を定義し、`lib/source.ts` で `loader()` に渡す。生成物は `.source/`（`server.ts`・`browser.ts`・`dynamic.ts`）で、`lib/source.ts` はそこから import する
3. `[[...slug]]/page.tsx` で `source.getPage(slug)` を引き、`page.data.body` を描く。`generateStaticParams` は `source.generateParams()`
4. ページは「トップ」「はじめに」「Button」の 3 枚から始める
5. `next build` で `out/` に静的に書き出せることを確かめる

この時点のサイドバーは、`source.pageTree` を素の `<ul>` と `<a>` で並べたものです。見た目がないのは想定どおりです。

## フェーズ 2：動く例と props の表

### 動く例

- 例は `examples/<部品>/<名前>.tsx` に 1 例 1 ファイルで書き、MDX からは `<Example name="button/basic" />` で呼ぶ
- `Example` はサーバー部品として、例を描いたうえで、そのファイルのソースを `fs` で読んで横に並べる。ビルド時に読むので、`?raw` の loader の設定は要らない
- `Example` の見た目は、ライブラリの部品（CodeBlock・枠）を組むだけにする。部品ができるまでは、例と素の `<pre>` を縦に並べる

### props の表

- `fumadocs-typescript` の `createGenerator()` の `generateDocumentation()` で、部品の props の型から `DocEntry`（`name`・`type`・`description`・`required`・`deprecated`・`tags`）を作る。既定値は JSDoc の `@default` タグから取る
- キャッシュは `createFileSystemGeneratorCache('.next/fumadocs-typescript')`
- 描くのはライブラリの Table。Table ができるまでは素の `<table>`
- `remarkAutoTypeTable` は fumadocs-ui の `TypeTable` を前提にしているので使わない

## フェーズ 3：ナビゲーションと検索

ページの枠に使う部品は、どれも `fumadocs-core` がデータと振る舞いを持っています。見た目はライブラリの部品で付けます。

| ページの要素 | fumadocs-core                                                                         | ライブラリの部品                   |
| ------------ | ------------------------------------------------------------------------------------- | ---------------------------------- |
| サイドバー   | `source.pageTree`。並びは各フォルダの `meta.json`                                     | Sidebar                            |
| 目次         | `page.data.toc`、`fumadocs-core/toc`（`AnchorProvider`・`ScrollProvider`・`TOCItem`） | TableOfContents                    |
| パンくず     | `fumadocs-core/breadcrumb`                                                            | Breadcrumb                         |
| 前後のページ | `findNeighbour(pageTree, url)`（`fumadocs-core/page-tree`）                           | Pager                              |
| 検索         | 下記                                                                                  | TextField と、重なるもの（Dialog） |
| リンク       | `fumadocs-core/link`                                                                  | Link                               |

### 検索

- サーバー側は `createFromSource(source)` の `staticGET` を `GET` として出し、`export const revalidate = false` を付ける。索引はビルド時に JSON になる
- ブラウザ側は `useDocsSearch({ client: staticClient() })`（`fumadocs-core/search/client` と `fumadocs-core/search/client/orama-static`）
- 既定の tokenizer は `multilingual` で、型の説明には「どの言語も設定なしで使える」とあります。**日本語の語で引けるかは実際に確かめます。** だめなら `fumadocs-core/search/flexsearch` の `cjk` に替えます
- Dialog ができるまでは、検索を 1 枚のページにします

## フェーズ 4：設計の記録を載せる

`design/` をもう 1 つの collection として読み込みます。原本は動かしません。

1. `source.config.ts` に `design` の collection を足す。`dir` は `../../design`、`files` は `principles.md` と `adr/*.md`
2. **frontmatter を足す。** 既定のスキーマ（`pageSchema`）では `title` が必須ですが、ADR には frontmatter がありません。ADR 冒頭の「ステータス・日付・ラウンド」の行を frontmatter に移すスクリプトを書き、1 回だけ流します。ADR の索引の表も frontmatter から作れるようになります
3. **リンクを直す。**
   - ADR どうしのリンク（`./0038-warning.md`）は、URL に書き換える remark プラグインを docs に置く
4. **画像:** `./assets/*.png` の相対パスは、fumadocs-mdx の remark-image が静的な import に変えます
5. H1 と frontmatter の `title` が重なるので、どちらかを描かない

**最初に試すこと:** `dir` にアプリの外（`../../design`）を指定して、読み込みと画像の解決が動くか。ドキュメントに明記がないので、フェーズ 4 の最初に小さく試します。動かなければ、ビルドの前に `design/` を `apps/docs/.design/` に写します。

## フェーズ 5：公開

- `.github/workflows/storybook.yml` を docs のビルドに置き換え、`apps/docs/out` を GitHub Pages に上げる
- リポジトリは `kazuemon/ui` なので、Pages の URL は `/ui` の下になります。`basePath: '/ui'` と `images: { unoptimized: true }` を設定する（独自ドメインにするなら `basePath` は要りません）
- Storybook は公開しない。play のテスト（vitest）と、決めている途中の軸の比較にだけ使う
- CI で `pnpm typecheck`・`pnpm test`・docs のビルド・縛りの確かめを走らせる

## 縛りを守る仕組み

`scripts/check-no-style.mjs` で、次のものを検出したら CI を落とします。

- `apps/docs/{app,content,examples}` の中の `className=` と `style=`
- `apps/docs` の中の、`app/globals.css` 以外の `.css`
- `@kazuemon/ui` 以外からの、見た目を持つ部品の import（`fumadocs-ui` など）

横に並べる、間を空ける、といった配置が要るときも、docs で書かずにライブラリの配置の部品（Container、並べる部品）として作ります。

## docs に要る部品と、今あるもの

README の「つくりたいコンポーネント」の上の方と、ほぼ同じ並びです。

| 使う場所             | 部品                                                              | いま                                          |
| -------------------- | ----------------------------------------------------------------- | --------------------------------------------- |
| 本文                 | Heading・Text・Code・Prose・CodeBlock                             | なし                                          |
| 本文                 | Table・Divider・Callout                                           | なし（Callout は Notice で代えられるか検討）  |
| ページの枠           | Container・Navbar・Sidebar・Footer                                | なし                                          |
| ナビゲーション       | TableOfContents・Breadcrumb・Pager                                | なし                                          |
| 検索                 | TextField                                                         | あり                                          |
| 検索                 | Dialog、Kbd                                                       | なし                                          |
| 小さい画面のメニュー | Menu またはシート                                                 | なし（Select のシートの形を流用できるか検討） |
| 例の中               | Button・Link・Select・Switch・Checkbox・Radio・Badge・Tag・Notice | あり                                          |

## 決めていないこと

- 例を Storybook と共有するか。共有するなら置き場所（`apps/docs/examples` を Storybook から読むか、ルートに `examples/` を置くか）
- 配布するときの CSS。ビルド済みの CSS を配るか、利用者の Tailwind でビルドしてもらうか
- ADR の frontmatter をどこまで持つか（ステータス・日付・ラウンド・関わる原則）。ADR の書き方（`design/adr/README.md`）もあわせて直す
- 英語版を作るか（作るなら `fumadocs-core/i18n`）
- 独自ドメインにするか
