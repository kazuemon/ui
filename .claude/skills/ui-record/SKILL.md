---
name: ui-record
description: マージされた部品の Issue と PR から、ADR・原則・backlog・索引を書いて PR を開く（`/ui-record ISSUE: 12 BRANCH: claude/record-12`）
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(gh issue view:*), Bash(gh pr view:*), Bash(gh pr list:*), Bash(gh pr create:*), Bash(git:*), Bash(pnpm:*), Bash(node design/tools/check-principles.mjs:*), Bash(cat:*), Bash(ls:*)
---

# 記録

引数: `ISSUE: <番号> BRANCH: <ブランチ名>`

Issue と、それを閉じた PR から、決まったことを記録します。CLAUDE.md の「決まったあとに更新するもの」の 1〜5 を、GitHub 上で行います。ブランチはすでに作られ、チェックアウトされています。

## 読むもの

1. Issue の本文とコメント全部（`gh issue view <番号> --comments`）。かずえもんの返事の原文が ADR の「理由」になります
2. Issue を閉じた PR（`gh pr list --state merged --search "<番号>"` で探し、`gh pr view <PR 番号> --comments`）。本文の「原則にない判断」「backlog に足す未決事項」と、レビューのまとめの「原則にない判断の候補」
3. `CLAUDE.md` の「決まったあとに更新するもの」と「principles.md の書き方」
4. `design/adr/README.md`（索引と、直近の ADR の書式）と、直近の ADR 1 本
5. `design/principles.md`、`design/backlog.md`

## 書くもの

1. **ADR を 1 本**（`design/adr/NNNN-<slug>.md`。番号は索引の次）。書式は直近の ADR に合わせます。「理由」には、Issue のかずえもんの返事を原文のまま引用します。「比較画像」は、Storybook で比べていなければ「画像はありません」と書きます
   - Issue で決まったことと、PR の「原則にない判断」のうちかずえもんがレビューで受け入れたものが、決定です
   - 決まらなかった「原則にない判断」と「聞く」は、決定ではなく backlog に入れます
2. **principles.md**。決定で原則が変わるときだけ、原則の文そのものを書き換えます。例外は足しません。末尾の「経緯」に ADR の番号を足します。書式は CLAUDE.md の「principles.md の書き方」です
3. **backlog.md**。決まったものを消し、新しく分かった未決事項を足します
4. **索引**（`design/adr/README.md`）に行を足します
5. `node design/tools/check-principles.mjs` を通します

tokens.css は、PR ですでに変わっているはずなので触りません。比較画像も撮りません（Storybook で比べた軸があるときは、その画像は比べたときに撮られています）。

## コミットと PR

```sh
git add -A
git commit -m "docs: record <Name> decisions in ADR NNNN (#<番号>)"
git push -u origin <ブランチ名>
gh pr create --title "docs: ADR NNNN <題>" --body-file <本文>
```

コミットメッセージの末尾は `Co-Authored-By: Claude <noreply@anthropic.com>` の 1 行だけです。PR の本文には、決定の一覧と、backlog に足した未決事項を書きます。
