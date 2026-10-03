# 0404. 選んでいる Card の色は color で選ぶ。neutral の線は strong の灰

- ステータス: Accepted
- 日付: 2026-10-01
- ラウンド: 後半 軸 413

## 背景

選んでいるカードの色の選び方を決めました（0403 の続き）。

## 候補

比較は 0403 と同じ比較のストーリーです。色の違いは、候補 D（濃紺の線だけ）が neutral の見え方の参考になります。

## 決定

**色は `color`（primary 既定・secondary・neutral）で選びます。** neutral の線は `--color-neutral-strong` にします。

- 線の色と淡い面の色は、`color` から部品が作ります
- neutral では、線は濃いグレー（墨）、面は淡いグレーになります
- 強調の形の輪（[ADR-0470](./0470-card-emphasis.md)）も、同じ `color` の色から作ります

## 理由

ユーザーの返事の原文です。

> 413 ユーザーの考え次第ですが、デフォAでCも選べる、色は primary など指定可能、かなと。

neutral の線に `--color-neutral-strong` を使うのは、係の判断です。ユーザーの返事に色の指定はなく、「色は primary など指定可能」を受けて、色を持つ部品の `color` の語彙（props.md）に合わせました。

既定を primary にしたのは、レビューでの確かめのあとのユーザーの判断です（「primary のままで」）。選ぶ部品（Checkbox・Radio・SegmentedControl・Switch・ToggleGroup・Tabs）の `color` の既定は neutral ですが、Card は比較で選んだ見た目（青い線と淡い青の面）をそのまま既定にしました。強調の輪も同じ `color` を使うので、既定は primary の淡い輪になります。

## 却下した案と理由

なし。

## 影響

- `src/components/card/Card.tsx`: `color`（`primary`・`secondary`・`neutral`、既定 `primary`）を持ちます

## 原則への反映

**原則 6 の「選んでいることを示す印」の項に、押して選ぶカードの文を足しました。** 既定は淡い面と線、線だけも選べ、色は使う側が選び、色がないときはグレーと墨です。例外としてではなく、選んでいる印の項の続きとして書いています。

## 比較画像

同じ軸の決定を記録した [0403](./0403-card-selected.md) と同じ比較です。画像は 0403 に 1 枚だけ置きました。

決めた時点のコミットは比較が `473bff0`、実装が `e3f28a0` です。`git checkout 473bff0 && pnpm storybook` で、比較のストーリー（`Design Review/413 押すカードと選んでいる見た目`）を決めたときの部品のまま開けます。
