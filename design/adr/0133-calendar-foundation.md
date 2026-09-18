# 0133. Calendar の土台（react-day-picker と Temporal）

- ステータス: Accepted
- 日付: 2026-09-19
- ラウンド: ループ外

## 背景

Calendar（月の日を並べて、1 日か期間を選ぶ部品）を作ります。振る舞い（キーボードでの移動、読み上げ、範囲の選び方）をどのヘッドレスコンポーネントに載せるか、日付をどの型でやり取りするかを、見た目のラウンドに入る前に決める必要がありました。ほかの部品と同じく、振る舞いは Base UI にある部品を土台にする決まりですが（CLAUDE.md「部品を作る」）、Base UI 1.8 に Calendar はありません。

## 候補

| 案                         | 内容                                                                                                                     |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| react-day-picker           | v10（新しい名前 @daypicker/react）。日を Date で受け渡す。Popover・フォーカスの扱いは Base UI・うちの Field に任せられる |
| React Aria                 | Calendar・RangeCalendar を持つ。Popover とフォーカスの扱いを自前で持っており、Base UI・Field と二重になる                |
| 値: Temporal               | `Temporal.PlainDate`。temporal-polyfill を ponyfill として使い、ネイティブがあればそれを返す。@kazuemon/ui から再公開    |
| 値: Date                   | ブラウザ組み込みの `Date`。タイムゾーンと時刻を持つため、日だけを表すには余計な情報がある                                |
| 依存の持ち方: dependencies | react-day-picker・temporal-polyfill を dependencies に入れる                                                             |
| 依存の持ち方: peer         | 利用者に react-day-picker のバージョンを選ばせる（TanStack Table と同じ形）                                              |

## 決定

**react-day-picker（@daypicker/react）を dependencies で採用します。** 値は `Temporal.PlainDate` で受け渡し、react-day-picker との境界（`src/internal/date/plain-date.ts`）で `Date` に変換します。`Temporal` は temporal-polyfill から ponyfill として読み、ネイティブの実装があればそれを返します（グローバルは書き換えません）。`@kazuemon/ui` から `Temporal`・`PlainDate`・`PlainYearMonth` を再公開します。

日は部品の高さの正方形で、7 列並びます。入れ物が狭いときは正方形のまま縮み、広いときも広がりすぎません。週の始まりは `Intl.Locale` の週の情報から決め、読めないとき（Firefox）は日曜にします。

## 理由

ユーザーの返事の原文です。

> Calendar コンポーネントを作りたいです。ヘッドレスコンポーネントに載せた方がいいでしょうか？(相談)

> react-day-picker の方でお願いします。deps に入れちゃいましょう。日付の方は Temporal がよさそうですが、ブラウザのサポート体制としてはどうですか？Picker も見据えて作っていきたいです。日付を打ち込めるようにもしたいですね。そこもパースライブラリに依存してもいい気がしますが、あるんでしょうか。

> safari に対応していないコンポーネントライブラリだとなんかなあという気がしています。ライブラリで持っていてもいいような気がしますが、バンドルサイズ的にはどうですか？

> 良さそうです。画面の精査はしたいので、デザインについては storybook でのレビューをしたいです。

> 幅が狭いと日付が正方形じゃなくなるのが気になりますね、全体的に

- **react-day-picker**: 値を Date のまま持ち、境界で変換すれば、Base UI の Popover とうちの Field を組み合わせて DatePicker を作れます。React Aria は Popover とフォーカスの扱いを自前で持っているため、Base UI・Field と二重になります
- **dependencies**: peer にしたのは、利用者が本家の API を直接書く TanStack Table のような部品です。Calendar は props に包みきれるので、依存の中に隠せます
- **Temporal**: Safari（iOS を含む）が未対応（2026-09 時点で Technology Preview のみ、caniuse の利用率は約 71%）でも、ネイティブがあればそれを使い、なければ ponyfill で補うので、ライブラリとして Safari を切り捨てずに済みます。バンドルサイズは、temporal-polyfill が gzip 後で約 21KB、比較した @js-temporal/polyfill が約 47KB でした。react-day-picker 自体は約 24KB です
- **日の正方形**: 「幅が狭いと日付が正方形じゃなくなるのが気になりますね、全体的に」という返事どおり、日は部品の高さの正方形にし、入れ物が狭いときは正方形のまま縮めます（320px 幅で 41px）。広いときも 44px より大きくしません

## 却下した案と理由

- **React Aria**: 選ばれませんでした。Popover・フォーカスの扱いが Base UI・Field と二重になります
- **値を Date のまま持つ**: 選ばれませんでした。ユーザーが Temporal を希望し、日だけを表すには Date は時刻とタイムゾーンの情報が余計です
- **@js-temporal/polyfill**: 選ばれませんでした。temporal-polyfill よりバンドルサイズが大きく（約 47KB 対 約 21KB）、ネイティブを優先する ponyfill としての作りは同じです
- **依存を peer にする**: 選ばれませんでした。Calendar は react-day-picker の API を利用者に直接触らせず、props に包みきれます

## 影響

- `src/components/calendar/Calendar.tsx`: react-day-picker（`@daypicker/react`）を土台に実装しました。`mode`（`single` | `range`）、`value`・`defaultValue`・`onValueChange`、`min`・`max`・`isDateDisabled`、`month`・`defaultMonth`・`onMonthChange`、`locale`・`timeZone`・`today`、`labels`、`required` などの props を持ちます
- 期間の選び方は部品で決めます。react-day-picker は 1 回目に押した日を始まりと終わりの両方にし、両端が決まったあとに押すと期間を伸ばします。部品では、1 回目に押した日を始まり（終わりは `null`）、2 回目を終わり（前の日なら入れ替える）とし、両端が決まったあとに押すと、その日を始まりにして選び直します
- `src/internal/date/plain-date.ts`: `Temporal.PlainDate` ↔ `Date` の変換をここに集めました。ローカル時刻の正午で変換します（夏時間で 0 時がない地域があるため）
- `src/index.ts`: `Calendar` と型に加え、`Temporal`・`PlainDate`・`PlainYearMonth` を再公開しました
- `package.json` に react-day-picker（@daypicker/react）・temporal-polyfill を dependencies として足しました
- 日付の打ち込み（今後作る DatePicker で使う想定）は、決まった書式なら date-fns の `parse` か自前で足りますが、和暦や全角、「9月20日」のような日本語の書き方には chrono-node/ja が要ります。gzip 後のサイズは chrono-node/ja が約 16KB、date-fns の `parse` が約 9.5KB でした。どちらを使うかは DatePicker を作るときに決めます
- backlog に足す未決事項: 年と月を直接選ぶ機能（Select への差し替え、または月の一覧への切り替え）と、DatePicker・DateRangePicker 自体（[design/backlog.md](../backlog.md) に記載）

## 原則への反映

原則 3・原則 11 の文を書き換えました。原則 3 には、カレンダーの日は平らな押すものの仲間で、hover で文字の色を淡く敷き、押すと沈む、という一文を足しました（動きの詳細は [ADR-0142](./0142-calendar-month-motion.md)）。原則 11 には、押すものの大きさの決まり（部品の高さを保つ）に、日のような正方形の項目が並ぶときは、狭い入れ物でも正方形のまま縮む、という一文を足しました。

## 比較画像

この ADR は土台の技術選定で、見た目の候補を並べて比べていません。そのため比較画像はありません。

比較のストーリーは決めた時点のコミット 7688bba にあります。`git checkout 7688bba && pnpm storybook` で開けます。
