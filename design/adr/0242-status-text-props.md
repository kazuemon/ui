# 0242. 欄の状態メッセージは errorText・warningText・successText・infoText。渡されていれば出す

- ステータス: Accepted
- 日付: 2026-09-21
- ラウンド: ループ外（props の監査）

## 背景

`error`・`warning`・`success`・`info` は文（`ReactNode`）を渡す props なのに真偽値に見え、`error={true}` が型を通って、文なしで赤枠になっていました。[ADR-0041](./0041-caption-and-message.md) は、エラーと警告の同時表示を決めています。

## 候補

| 案     | 内容                                                                                               |
| ------ | -------------------------------------------------------------------------------------------------- |
| 現行版 | `error`・`warning`・`success`・`info` が文を渡す props なのに真偽値に見える                        |
| A      | `status` ＋ `statusText` の 2 つにする                                                             |
| B      | `errorText`・`warningText`・`successText`・`infoText` に改名し、状態だけの口として `status` を足す |
| C      | 名前のまま、型で真偽値を弾く                                                                       |

## 決定

**B を土台に、`status` は足しません。** `errorText`・`warningText`・`successText`・`infoText` に改名します。渡されていれば出します（エラーと警告は同時に出せます）。状態だけの口（`status`）は足しません。真偽値は受けません。

## 理由

ユーザーの返事の原文です。

> status, statusText みたいな分け方もあるので、命名を練りたい。

> Text にするのはよいと思います！ただ、status テキストを同時に出す可能性が無いとは言えないので、status="error" についてはちょっと懐疑的ですね

続けて、次の返事で `status` を足さない形に決まりました。

> errorText があるなら表示する、という形にしてもらえますか？

## 却下した案と理由

- **A（`status` ＋ `statusText` の 2 つにする）**: 選ばれませんでした。4 つの状態メッセージを 1 つの列挙にまとめると、エラーと警告を同時に出せなくなるため
- **`status` を状態だけの口として足す（B のもう一方）**: 選ばれませんでした。「errorText があるなら表示する」という返事のとおり、`errorText` などの有無だけで出す／出さないを決める形にしました
- **C（名前は変えず、型で真偽値を弾く）**: 選ばれませんでした。名前だけでは文を渡す props だと読めないままのため

## 影響

`InputFieldProps`（`src/internal/field/input-field-props.ts`）を継ぐ 14 部品と `Switch` の `error`・`warning`・`success`・`info` を `errorText`・`warningText`・`successText`・`infoText` に直します。`Field.tsx` の `invalid` は内部のまま変えません。

## 原則への反映

反映なし。[原則 2](../principles.md#2-フォーカスとエラーは枠線で表す)（フォーカスとエラーは枠線で表す）の範囲内の、props の名前の整理です。

## 比較画像

なし。名前の決定で、見た目は変えていません（[0013](./0013-secondary-color.md)・[0051](./0051-prop-names.md) と同じ理由）。
