# 0245. 印の語は indicator・mark・markerType の 3 つ。アイコンは icon

- ステータス: Accepted
- 日付: 2026-09-21
- ラウンド: ループ外（props の監査）

## 背景

props の命名監査（`naming-analysis.md` N-11・N-12）で、「印」を表す語が `indicator`・`mark`・`marker` の 3 系統あり、使い分けの定義がないことが分かりました。

- `src/components/accordion/Accordion.tsx:66` — `indicator?: CollapsibleIndicator`（開閉の印の場所）
- `src/components/tabs/Tabs.tsx:181` 付近 — `indicator?: TabsIndicator`（選んだタブの線）
- `src/components/button/Button.tsx:295` 付近 — `loadingIndicator?: LoadingIndicator`（ADR-0051 で決定済み）
- `src/components/heading-anchor/HeadingAnchor.tsx:79` — `mark?: 'link' | 'hash'`
- `src/internal/field/FieldMark.tsx` — `requiredMark`／`optionalMark`
- `src/components/steps/Steps.tsx:155` — `marker?: StepsMarker`
- `src/components/timeline/Timeline.tsx:250,325` — `markerType?: TimelineMarkerType`（ADR-0207 で先に決定済み）
- `src/components/list/List.tsx:46` — `marker?: NonNullable<VariantProps<typeof list>['marker']>`

`Steps.marker` は Timeline の `markerType`（ADR-0207）と同じ意味・ほぼ同じ値なのに名前がそろっていません。`design/backlog.md:266` に「Steps の `marker` も `markerType` に、必要なら `line` も合わせて変えます」と、すでに未決事項として残っています。

## 候補

| 案        | 内容                                                                                                                                                                                                                                                                                |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 現行版    | `indicator`（状態を示す印）・`mark`（HeadingAnchor・FieldMark）・`marker`（Steps・List） の 3 語が、使い分けの定義なく混在。`Timeline` だけ ADR-0207 で `markerType` に決定済みだが `Steps` は未反映                                                                                |
| A（採用） | 3 語を定義で分ける：`indicator` ＝ 状態を示す印（開閉・選択中・待ち）、`mark` ＝ ラベルに添える小さな印、`markerType`／`markerSize` ＝ 並びの項目の頭の印。`Steps.marker` → `markerType` に改名し `List.marker` もそろえる。`HeadingAnchor.mark` はアイコンなので `icon` に改名する |
| B         | `indicator` に統一する（`requiredMark`・`optionalMark` が `requiredIndicator`・`optionalIndicator` になり長くなる。ADR-0051 の `loadingIndicator` とは整合する）                                                                                                                    |
| C         | 部品ごとに読みやすい語を選んでよいと決める（現状維持。エージェントは毎回 3 択で迷う）                                                                                                                                                                                               |

## 決定

**印の語は `indicator`・`mark`・`markerType`／`markerSize` の 3 つに定義で分けます。**

- `indicator` ＝ 状態を示す印（開閉・選択中）。いまの項目の印は `currentIndicator`、待ちの印は `loadingIndicator`
- `mark` ＝ ラベルに添える小さな印（`requiredMark`・`optionalMark`・`successMark`・`radioMark`）
- `markerType`／`markerSize` ＝ 並びの項目の頭に置く印（List・Steps・Timeline）

`Steps.marker` と `List.marker` を `markerType` に改名します。`HeadingAnchor.mark`（`'link' | 'hash'`）は、印ではなくどのアイコンを出すかの選択なので `icon` に改名します。

## 理由

ユーザーの一言の原文です。

> N-12「定義で分けるのは良さそうですが、HeadingAnchor については icon な気がします。radioMark, requiredMark は違和感がないです。」

N-11（`Steps.marker` → `markerType`）は `decisions-memo.md` で「採用」の判定のみで、一言はありませんでした。ADR-0207 がすでに Timeline 側で決めていた形を Steps へ広げるだけの決定です。

## 却下した案と理由

- **`indicator` に統一する**: 採られませんでした。`requiredMark`・`optionalMark`・`radioMark` は「違和感がない」という一言のとおり、いまの `mark` の使われ方は自然で、`indicator` に寄せると名前が長くなるだけです
- **部品ごとに読みやすい語を選んでよいと決める**: 採られませんでした。現状のまま定義を持たないと、エージェントが部品を作るたびに 3 択で迷います
- **`HeadingAnchor.mark` を `mark` のまま残す**: 採られませんでした。「HeadingAnchor については icon な気がします」という一言のとおり、`hash`／`link` は印というより見出しリンクに使う 2 種類のアイコンの選択なので、`icon` の語彙に合わせます
- **Timeline を `marker`／`markerSize` に戻す**: 検討していません。ADR-0207 を覆す提案で、`naming-analysis.md` の直し方の候補にはありますが、今回のユーザーの一言はこの案に触れていません

## 影響

- `src/components/steps/Steps.tsx`（`marker?: StepsMarker` → `markerType?: StepsMarkerType`）: 直します
- `src/components/list/List.tsx`（`marker?: … ` → `markerType?: …`）: 直します
- `src/components/heading-anchor/HeadingAnchor.tsx`（`mark?: 'link' | 'hash'` → `icon?: 'link' | 'hash'`）: 直します。JSDoc も「どのアイコンを出すか」に書き換えます
- `design/backlog.md:266` の「Steps の `marker` も `markerType` に」の未決事項は、この ADR で決着するので消します

## 原則への反映

反映なし。名前だけの決定で、見た目・構造は変えていません。

## 比較画像

なし。名前と API の決定で、見た目は変えていません（ADR-0013・ADR-0051 と同じ理由）。
