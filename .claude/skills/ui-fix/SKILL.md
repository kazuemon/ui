---
name: ui-fix
description: レビューの「直す」を PR のブランチに反映して push する（`/ui-fix PR: 34 FINDINGS: <ファイル>`）
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(gh pr view:*), Bash(gh pr edit:*), Bash(git:*), Bash(pnpm:*), Bash(touch:*), Bash(cat:*)
---

# 指摘を直す

引数: `PR: <番号> FINDINGS: <指摘のファイル>`

PR のブランチはチェックアウトされています。`FINDINGS` の「直す」だけを直し、push します。

## 決まり

- 「直す」は、書かれた直し方に従います。直し方が原則と食い違うと思ったときは、直さずに PR の本文の「原則にない判断」の一覧に 1 行足します（`gh pr edit <番号> --body-file`）
- 「聞く」は直しません。かずえもんが決めます
- 指摘にない箇所は変えません。整形（`pnpm format`）で変わる範囲は除きます
- 見た目が変わる直しでは、`pnpm test -u src/components/<kebab-name>` で基準画像を撮り直し、コミットに入れます
- 最後に `pnpm typecheck`・`pnpm lint`・`pnpm format`・`pnpm test` を通します

## コミット

```sh
git add -A
git commit -m "fix: apply review round 1 (#<番号>)"
git push
```

コミットメッセージの末尾は `Co-Authored-By: Claude <noreply@anthropic.com>` の 1 行だけです。直すものがなければ、コミットも push もしません。
