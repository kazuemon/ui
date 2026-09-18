# 0121. 文字の部品（Mark・Time・RelativeTime・NumberFormat）と、ThemeProvider の言語・タイムゾーンの既定

- ステータス: Accepted
- 日付: 2026-09-19
- ラウンド: 後半（ループ外）

## 背景

記事の外でも使える、文字まわりの小さな部品を作ります。目立たせたい言葉（Mark）は、これまで Prose が素の HTML の `<mark>` に当てる見た目だけを持ち（[ADR-0091](./0091-mark.md)）、部品としては存在していませんでした。日付・時刻（Time）、「3 日前」のような相対の日時（RelativeTime）、数・通貨・割合・単位（NumberFormat）は、どれも作っていませんでした。

見た目の比較ではなく、書き方（どんな文字列になるか）と、日時の既定の言語・タイムゾーンをどう持つかという設計の判断なので、比較のストーリーは作っていません。

## 候補

比較ではなく、ユーザーへの問いと答えです（ほかの軸とまとめて質問しました）。

| 問い                                   | 答え                                                                     |
| -------------------------------------- | ------------------------------------------------------------------------ |
| Time の既定の書き方                    | `YYYY/MM/DD`                                                             |
| 言語・タイムゾーンの既定と、上書きの口 | 既定は ja-JP・Asia/Tokyo にしつつ、Provider などで上書きできるようにする |
| 相対の日時は別の部品にするか           | 相対日付のコンポーネントとして作る                                       |
| 通貨（JPY）の書き方                    | Intl の既定でよい                                                        |

## 決定

- **Mark**: `<mark>` を描く部品にしました。見た目のクラス列は `src/internal/reading/mark.ts` に出し、Prose の `<mark>` と共有します。見た目そのものは [ADR-0091](./0091-mark.md) のままです
- **Time**: `<time dateTime>` を描き、読む文字は `Intl.DateTimeFormat` で書きます。既定は `YYYY/MM/DD`（ゼロ埋めの年/月/日。ja-JP で「2026/09/18」）です。`withTime` で時刻も付け（ja-JP で「2026/09/18 09:30」、24 時間）、`dateStyle`・`timeStyle`・`format` で Intl の書き方をそのまま渡せます。`YYYY-MM-DD` の文字列は、時刻を持たない暦の日付として扱い、どのタイムゾーンでも同じ日になるよう常に UTC で書きます。それ以外（Date・ISO 8601・ミリ秒）は `timeZone` の時刻で書きます
- **言語・タイムゾーンの既定**: `ja-JP`・`Asia/Tokyo` に固定します。ブラウザの既定の言語やタイムゾーンには従いません。サーバーで描いた文字と、閲覧者の画面で描き直した文字が食い違わないようにするためです。部品の `locale`・`timeZone` props と、ThemeProvider に足した `locale`・`timeZone` props で上書きできます（部品の props が勝ちます）
- **RelativeTime**: 「3 日前」「昨日」のように、今からの隔たりで書く別の部品にしました。今の時刻はブラウザでだけ読み、1 分ごとに書き直します。サーバーの HTML と hydration の最初の描画は、今の時刻を持たないので Time と同じふつうの日付にし、あとから相対の文字に描き直します。ふつうの日付は `title` に残します
- **NumberFormat**: `<data value>` を描き、`Intl.NumberFormat` で書きます。数・通貨・割合・単位（`unit`）を選べ、通貨の書き方（`currencyDisplay`）の既定は `symbol` です（ja-JP の JPY で「￥1,280」）。小数の桁数など、Intl が持つ既定のふるまいはそのまま使い、上書きしません
- **数字の幅**: 数字をそろえて表示する仕組み（tabular-nums 相当）は作っていません。欧文フォント（Mulish）の数字がもとから等幅で、比べても見た目の差が出なかったためです

## 理由

ユーザーの返事の原文です。

> 5: YYYY/MM/DD で

> 6: 言語の既定は ja-JP, Asia/Tokyo にしつつ、Provider などで上書きできますか？

> 7: 相対日付のコンポーネントとして作れますか？

> 8: オッケーです。

- **既定を固定する**: 6 の問いのとおり、既定は ja-JP・Asia/Tokyo に固定し、ThemeProvider から上書きできる形にしました。サーバーで生成する記事と、海外からの閲覧者がいる場面の両方を考えると、ブラウザの既定に任せるより固定するほうが表示が安定します
- **相対の日時は別部品**: 7 の問いのとおり、Time に相対表示のオプションを足すのではなく、RelativeTime という別の部品にしました。ふつうの日付と相対の日付は、サーバーとブラウザでの描き方（今の時刻を読むかどうか）が大きく違うためです
- **通貨は Intl の既定のまま**: 8 の返事のとおり、JPY の書き方を @kazuemon/ui 側で決め直すことはしませんでした

## 却下した案と理由

比較ではなく設計の判断なので、却下した案はありません。

## 影響

- `src/components/mark/Mark.tsx`・`src/components/time/Time.tsx`・`src/components/relative-time/RelativeTime.tsx`・`src/components/number-format/NumberFormat.tsx` を足しました
- `src/internal/reading/mark.ts`: Mark と Prose が共有する見た目のクラス列
- `src/internal/date/`: `format-date.ts`（日時の解釈と書き方の計算。DOM も React も使いません）・`time-text.ts`（Time・RelativeTime が共有する大きさ・濃さのクラス）・`use-locale.ts`（ThemeProvider の locale・timeZone を読む）・`use-now.ts`（RelativeTime がブラウザでだけ今の時刻を読み、1 分ごとに書き直す）
- `src/components/theme-provider/ThemeProvider.tsx`: `locale`（既定 `ja-JP`）・`timeZone`（既定 `Asia/Tokyo`）の props を足しました。内側の ThemeProvider が書いた値だけが外側より勝ちます
- `src/index.ts` に `Mark`・`MarkProps`・`Time`・`TimeProps`・`RelativeTime`・`RelativeTimeProps`・`NumberFormat`・`NumberFormatProps` を足しました
- backlog に足す未決事項: RelativeTime の「昨日」などの境界は UTC の 0 時で計算するため、端末の体感の「今日」とずれることがある。`Intl.RelativeTimeFormat`・`Intl.NumberFormat` の言い回しは ICU のバージョンでブラウザによって変わることがある。数字の幅をそろえるかは比べていない

## 原則への反映

反映なし。既存の原則の範囲内で、部品を足したものです。

## 比較画像

比較のストーリーを作っていないので、画像はありません。
