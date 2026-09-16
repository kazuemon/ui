# ビジュアルテスト（Storybook × Vitest）

Storybook のストーリーをそのままテストにしている仕組み（`@storybook/addon-vitest`）に、見た目の回帰（visual regression）を足しました。2026-09-16〜17 に入れ、CI（`.github/workflows/ci.yml`）でも走らせています。

## 決めたこと（2026-09-16）

| 決めごと   | 決めたこと                                                                            |
| ---------- | ------------------------------------------------------------------------------------- |
| 基準画像   | git に入れる。Linux で撮った基準に固定する                                            |
| 撮る対象   | 状態の一覧と、クリックで開いた状態。約 33 本                                          |
| 撮る仕組み | セットアップの `afterEach` で、`tags: ['visual']` の付いたストーリーだけ撮る          |
| CI         | PR と main への push で `pnpm test` を走らせ、落ちたら差分の png を artifact に上げる |

## 入れたもの

- `.storybook/visual.setup.ts`: `tags: ['visual']` の付いたストーリーを、play が終わったあとの姿で撮り、基準とくらべる
- `vitest.config.ts`: 撮影の条件（下記）と、食い違いを 1px も許さない設定
- `src/stories/story-states.ts`: `statePseudo` に `rootSelector: 'body'`
- `.storybook/main.ts`: stories の指定を、それぞれのディレクトリの直下だけに絞る
- 基準画像: `src/stories/__screenshots__/<テストファイル名>/<ストーリーID>-chromium-linux.png`
- 撮っているストーリー: 33 本（下表）。画像は合わせて約 2MB。ほとんどは 1200×900 ですが、縦に長いストーリーはその高さのまま撮れます（「押せない状態の一覧」は 1200×11458・348KB）

使い方:

```sh
pnpm test        # 見た目もくらべる。差があれば落ち、実物と差分の png が .vitest-attachments/ に出る
pnpm test -u     # 基準画像を撮り直す（意図して見た目を変えたとき）
```

## 実装で分かったこと（つまずいた順）

どれも「気づかないと、写っていないまま緑になる」ものです。

1. **状態を固定するアドオンは、そのままでは効かない。** `storybook-addon-pseudo-states` は Storybook の「描き終わった」の合図（`storyRendered`）でスタイルシートを `:hover` から `.pseudo-hover` へ書き換えますが、Vitest ではその合図が出ません。セットアップで合図を出しています。さらに、状態を当てる要素を探す起点が既定で `#storybook-root` で、テスト環境にはそれが無いので `rootSelector: 'body'` を足しました。両方そろって、hover・押下・フォーカスが写ります
2. **画面が 0.8 倍に縮む。** ストーリーを描く枠（1200×900）が窓（既定 1280×720）に収まらないと、Vitest が枠ごと縮めます。縮むと 1px のずれがふちのぼかしになり、pixelmatch がふちのぼかしを数えないので見のがします。`contextOptions.viewport` を枠より大きく取りました（`browser.viewport` は provider 側で無効化されていて効きません）
3. **許す幅は割合で持たない。** `allowedMismatchedPixelRatio: 0.002` では、全ボタンの角を 12px から 0px にしても 4 本中 3 本が通りました。`allowedMismatchedPixels: 0` にしています
4. **基準画像の置き場が Storybook を壊す。** 既定の置き場は `__screenshots__/Button.stories.tsx/` で、この**ディレクトリ名**が `../src/**/*.stories.tsx` に一致し、Storybook の索引作りが EISDIR で落ちて画面が真っ白になります。`screenshotDirectory` は何を渡してもテストファイルの隣に継ぎ足されるので（絶対パスも先頭の `/` が落ちる）、Storybook 側の指定を `**` から `*` に変えて、ディレクトリに降りないようにしました

## 撮影の条件（`vitest.config.ts`）

- **hover とポインタを固定する。** headless の既定は「マウスなし」で、`hover:` の見た目（Tailwind が `@media (hover: hover)` で包む）も、`@media (pointer: coarse)` で決まる密度も出ません。`--blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4`
- **動きを減らす設定で撮る。** `--force-prefers-reduced-motion`
- **動きそのものを止める。** 動きを減らす設定でも、回る円は3秒で1周し、流れる線は明滅し続けます。撮る直前に `animation: none; transition: none` を当てます（動きは回帰テストの対象外）
- **フォントの読み込みを待つ。** `document.fonts.ready`
- **CSS の 1px を画像の 1px で撮る。** `deviceScaleFactor: 1` と、枠より大きい `viewport`

## 確かめたこと

- トークンを 1px 変えると落ちる: `--radius-control` 12px→11px で 3 本、`--press-depth` 1px→2px（押下のときだけ沈む深さ）で 1 本が落ちました
- 変更なしで 3 回流して、いずれも 76 件すべて緑（揺れなし）
- 実物の Storybook（dev server）でも、状態の見た目はこれまでどおり出ます。撮った画像とも一致します

## 撮っているストーリー（33 本）

| 部品               | ストーリー                                                                         |
| ------------------ | ---------------------------------------------------------------------------------- |
| Button             | 色と見た目 / 状態 / 送信中 / 密度                                                  |
| Switch             | トラックの位置 / 色 / 状態 / 密度                                                  |
| TextField          | 状態 / キャプション・エラー・警告 / 密度                                           |
| Link               | 状態 / 枠線のリンク / ボタンの見た目                                               |
| Checkbox           | グループ / エラーと警告 / 密度                                                     |
| Radio              | エラー                                                                             |
| Select             | 開いた状態 / シート / キャプション・エラー・警告 / 押せない / 読み込んでいるあいだ |
| Notice             | 色と見た目                                                                         |
| Badge              | 色 / 点 / 密度                                                                     |
| Tag                | 色 / 密度                                                                          |
| Icons              | 一覧                                                                               |
| Form               | エラーの一覧 / 送っているあいだ                                                    |
| 押せない状態の一覧 | 一覧                                                                               |

- クリックした状態は、play が操作したあとの姿が撮れます（Select の「開いた状態」「シート」、Form の「エラーの一覧」「送っているあいだ」）
- 密度は `DensityPair` が 1 枚にマウス用と指用を並べるので、密度で撮影数を倍にしません
- 撮らないもの: `Playground`（Controls で変わる）、読み上げや props の確かめだけのもの、「シートをはじく」（動きの途中）

## 残る決めごと

- 許す幅の締め方（いまは 1px も許さない。CI で揺れたら見直す）
- macOS から触るようになったときの基準（ファイル名に platform が入るので、いまは Linux だけ）

## やらないこと

- Chromatic（Storybook 公式の SaaS）は使わない前提です
- `design/adr/assets` の比較画像は「決めた時点の記録」なので、回帰テストの対象にしません（撮り直さない決まりです）
- 動きそのもの（回る円の速さ、シートのはじき）は撮りません。動きは `pnpm storybook` で目で見て確かめます
