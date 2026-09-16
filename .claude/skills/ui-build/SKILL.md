---
name: ui-build
description: Issue の決定に沿って部品の土台を作り、PR を開く。CLAUDE.md の「部品を作る」を GitHub 上で実行する（`/ui-build ISSUE: 12 BRANCH: claude/issue-12`）
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(gh issue view:*), Bash(gh pr create:*), Bash(gh pr view:*), Bash(git:*), Bash(pnpm:*), Bash(touch:*), Bash(ls:*), Bash(cat:*)
---

# 土台を作る

引数: `ISSUE: <番号> BRANCH: <ブランチ名>`

Issue で決まったことに沿って、部品の土台を 1 つ作り、PR を開きます。ブランチはすでに作られ、チェックアウトされています。main には push しません。

## 読むもの

1. Issue の本文とコメント全部（`gh issue view <番号> --comments`）。「検証の比較」に対するかずえもんの返事が決定です。返事がない質問は、比較で添えた「案」を採ります
2. `CLAUDE.md` の「部品を作る」。手順はここに従います
3. `design/principles.md`
4. `design/adr/README.md` と、Issue に挙がった ADR、関わる ADR の本文
5. `design/backlog.md` の、その部品の節
6. `design/review-checklist.md`。あとでこの表でレビューされます
7. `templates/component/` と、似た既存の部品 1 つ（`src/components/` の中）

## 作り方

CLAUDE.md の「部品を作る」の 1〜6 をそのまま実行します。加えて次を守ります。

- 迷ったところは「一旦」や TODO を残さず、決めた形で書き、**「原則にない判断」の一覧**に 1 行ずつ出します。何を決めたか、どの原則に近いか、代わりの案、の 3 つを書きます
- Issue の決定と原則がぶつかったときは、Issue の決定を採り、その旨を一覧に書きます
- 既存の部品は変えません。共有部分（`src/internal/`）を変える必要があるときは、最小限にし、PR の本文に理由を書きます
- 見た目の基準画像: `pnpm test src/components/<kebab-name>` を 2 回流します。1 回目で `__screenshots__/` に画像ができて落ち、2 回目で通ります。画像はコミットに入れます。既存の部品の画像が変わったら、その理由を PR の本文に書きます
- 最後に `pnpm typecheck`・`pnpm lint`・`pnpm format`・`pnpm test` を全体で通します。通らないまま PR を開くときは、何が落ちるかを本文に書きます

## コミットと PR

```sh
git add -A
git commit -m "add: <Name> component (issue #<番号>)"
git push -u origin <ブランチ名>
gh pr create --title "add: <Name>" --body-file <本文のファイル>
```

コミットメッセージの末尾は次の 1 行だけです。

```
Co-Authored-By: Claude <noreply@anthropic.com>
```

PR の本文は次の形です。

```
Closes #<番号>

## 何を作ったか
1〜3 文。

## Issue の決定をどう反映したか
- <決定>: <どこに反映したか>

## 原則にない判断
- <何を決めたか>。近い原則: <原則 N>。代わりの案: <案>
- …

## backlog に足す未決事項
- <作らなかった状態、比べていない候補>

## 確かめたこと
- typecheck / lint / format / test の結果
- 基準画像: 新しく N 枚。既存の変更: なし（あれば理由）
```
