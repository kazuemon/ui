#!/usr/bin/env node
// design/principles.md に、原則に書かない種類の記述が混ざっていないかを確かめる。
// 書き方の決まりは CLAUDE.md の「principles.md の書き方」。
//
//   node design/tools/check-principles.mjs [path]
//
// 見つかったら行番号と理由を出して、終了コード 1 で終わる。

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const path = resolve(process.argv[2] ?? 'design/principles.md');
const lines = readFileSync(path, 'utf8').split('\n');

const rules = [
  { re: /ユーザーのメモ|ユーザーの発言|メモは「/, why: 'メモの引用は ADR の「理由」に置く' },
  { re: /【(固定|決定|前半の軸|後半の軸)】/, why: '印は使わない' },
  { re: /以前は|としていました/, why: '履歴は ADR の「影響」に置く' },
  { re: /一旦/, why: '「一旦」の決定は backlog に置く' },
  { re: /--[a-z][a-z0-9-]+/, why: 'トークン名は書かない（値は tokens.css）' },
  { re: /\d+(\.\d+)?\s?(px|ms|em|%|:1)/, why: '数値は書かない（ADR と tokens.css に置く）' },
  {
    re: /[a-zA-Z]+=["']|`[a-zA-Z]+(Placement|Behavior|Indicator|Align|Shape)`/,
    why: 'props は JSDoc に書く',
  },
  { re: /\.(tsx|ts|mjs)\b/, why: 'ファイル名は書かない（tokens.css と adr/ への案内は除く）' },
  { re: /^- だから、/, why: '「だから、」で始める型は避ける' },
];

let inCode = false;
const hits = [];
lines.forEach((line, i) => {
  if (line.startsWith('```')) inCode = !inCode;
  if (inCode) return;
  for (const rule of rules) {
    if (rule.re.test(line)) hits.push({ line: i + 1, why: rule.why, text: line.slice(0, 80) });
  }
});

if (hits.length === 0) {
  console.log(`ok: ${path}`);
  process.exit(0);
}
for (const h of hits) console.log(`${h.line}: ${h.why}\n    ${h.text}`);
console.log(`\n${hits.length} 件`);
process.exit(1);
