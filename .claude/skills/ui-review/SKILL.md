---
name: ui-review
description: 部品の PR を design/review-checklist.md でレビューする。指摘には原則か ADR の番号を必ず付け、引けない指摘は「原則にない判断」の候補として出す（`/ui-review PR: 34 ROUND: 1 CHECKS: <ファイル> FINDINGS: <ファイル>`）
allowed-tools: Read, Glob, Grep, Write, Bash(gh pr view:*), Bash(gh pr diff:*), Bash(gh pr comment:*), Bash(git diff:*), Bash(git log:*), Bash(cat:*), mcp__github_inline_comment__create_inline_comment
---

# レビュー

引数: `PR: <番号> ROUND: <1 か 2> CHECKS: <CI の結果のファイル> FINDINGS: <指摘を書き出すファイル>`

`design/review-checklist.md` に沿って PR をレビューします。点検表の「使い方」と「指摘の書き方」がルールです。

## 読むもの

1. `design/review-checklist.md`
2. PR の本文とコメント（`gh pr view <番号> --comments`）。「原則にない判断」の一覧を控える
3. 差分（`gh pr diff <番号>`）と、変わったファイルの全体
4. `CHECKS` のファイル（typecheck・lint・format・test の出力）
5. `design/principles.md`。指摘に引く ADR は本文まで読む
6. 変わった `__screenshots__/` の画像。新しい画像は見た目が原則に沿うか、変わった画像は理由が本文にあるか

## 見ないもの

- 好みや一般論。このライブラリの決まり（原則・ADR・点検表・CLAUDE.md）だけを根拠にします
- トークンの値そのもの

## 書くこと

指摘を `FINDINGS` のファイルに、次の形で書き出します。修正役がこのファイルを読みます。

```
## 直す
- `<ファイル>:<行>` 原則 N（ADR-NNNN）: <何が反している>。<直し方>

## 聞く
- `<ファイル>:<行>` 原則 N: <2 つの読み方>

## 原則にない判断の候補（PR の一覧にないもの）
- <判断>。近い原則: <原則 N>

## CI
- typecheck: 通った / 落ちた（<要点>）
- lint / format / test: 同様
```

## 出し方

**ROUND が 1 のとき**: まとめのコメントを 1 つ投稿します。件数と、CI の結果と、原則にない判断の候補だけです。個々の指摘はファイルにだけ書きます（このあと修正役が直します）。

```sh
gh pr comment <番号> --body "..."
```

**ROUND が 2 のとき**: 残っている「直す」と「聞く」を、`mcp__github_inline_comment__create_inline_comment` で該当の行に付けます（`confirmed: true`）。1 件 1 コメント、点検表の「指摘の書き方」の形です。そのうえで、まとめのコメントを 1 つ投稿します。順は点検表の「まとめのコメント」のとおりです。

指摘が 0 件なら、まとめのコメントに「点検表の指摘はありません」と、原則にない判断の候補だけを書きます。
