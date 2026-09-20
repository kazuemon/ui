import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, normalize, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from 'vitest';

// React Server Components（Next.js の App Router）で使えるように、ブラウザが要るファイルの先頭に
// 'use client' があるかを確かめる。境界はファイル単位で、入口（src/index.ts）には付けない。
// 付ける相手は次の 2 つ（CLAUDE.md の「部品を作る」）:
//   1. ブラウザの合図を直接持つファイル（下の signals）
//   2. そういうファイルを「値として」読んでいるファイル。型だけの import と、再 export は伝播しない
// 逆に、合図を持たないファイルに付いていても落とす。サーバーのまま描ける部品を減らさないため

const SRC = fileURLToPath(new URL('..', import.meta.url));
const ROOT = fileURLToPath(new URL('../..', import.meta.url));
// ブラウザでしか動かない外の部品（Base UI は自分で 'use client' を持つが、読む側も client になる）
const CLIENT_PACKAGES = ['@base-ui/react', '@daypicker/react', 'maska'];
// ストーリーと、その中だけで使う道具。利用者には渡らない
const IGNORED = /\.stories\.|\.test\.|\.d\.ts$/;

function walk(dir: string, out: string[] = []) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      if (entry !== '__screenshots__') walk(path, out);
    } else if (/\.tsx?$/.test(path) && !IGNORED.test(path)) {
      out.push(path);
    }
  }
  return out;
}

/** コメントの中の言葉を合図と数えないよう、先に落とす */
function withoutComments(source: string) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
}

/** 値として読んでいる import の行き先。`import type` と、指定がすべて type の `{}` は数えない */
function valueImports(source: string) {
  const specifiers: string[] = [];
  for (const [, clause, specifier] of source.matchAll(/import\s+([\s\S]*?)\s*from\s*'([^']+)'/g)) {
    if (/^type\s/.test(clause)) continue;
    const named = clause.match(/\{([\s\S]*)\}/);
    if (named && !clause.replace(named[0], '').trim()) {
      const parts = named[1]
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (parts.length > 0 && parts.every((s) => /^type\s/.test(s))) continue;
    }
    specifiers.push(specifier);
  }
  for (const [, specifier] of source.matchAll(/^import\s+'([^']+)'/gm)) specifiers.push(specifier);
  return specifiers;
}

/** ブラウザが要る合図。1 つでもあれば、そのファイルは client */
function signals(source: string) {
  const found: string[] = [];
  const imports = valueImports(source);
  if (imports.some((s) => CLIENT_PACKAGES.some((p) => s === p || s.startsWith(`${p}/`)))) {
    found.push('ブラウザでしか動かない外の部品');
  }
  // フックの呼び出し（自分で書いた use-*.ts を呼ぶ側も含む）
  if (/\buse[A-Z]\w*\s*\(/.test(source)) found.push('フック');
  if (/\bcreateContext\s*[<(]/.test(source)) found.push('createContext');
  if (/\son[A-Z]\w*=\{/.test(source)) found.push('イベントのハンドラ');
  if (/\sref=\{/.test(source)) found.push('ref');
  // 関数を props で渡している（render など）。サーバーからは関数を渡せない
  if (/\s[a-zA-Z]\w*=\{\s*(\([^()]*\)|[a-zA-Z_$][\w$]*)\s*=>/.test(source))
    found.push('関数の props');
  return found;
}

function resolveLocal(from: string, specifier: string) {
  if (!specifier.startsWith('.')) return undefined;
  const base = normalize(join(dirname(from), specifier));
  return ['.ts', '.tsx', '/index.ts', '/index.tsx']
    .map((extension) => base + extension)
    .find((path) => existsSync(path));
}

function scan() {
  const files = walk(SRC).filter((f) => !/\/(samples|recipes|stories)\//.test(f));
  const parsed = new Map<string, { signals: string[]; deps: string[]; directive: boolean }>();
  for (const file of files) {
    const raw = readFileSync(file, 'utf8');
    const source = withoutComments(raw);
    parsed.set(file, {
      signals: signals(source),
      deps: valueImports(source)
        .map((specifier) => resolveLocal(file, specifier))
        .filter((path) => path !== undefined),
      directive: /^\s*'use client';/.test(raw),
    });
  }
  // 合図を持つファイルを読んでいるファイルも client（届かなくなるまで広げる）
  const client = new Set(files.filter((file) => parsed.get(file)!.signals.length > 0));
  for (let changed = true; changed;) {
    changed = false;
    for (const file of files) {
      if (client.has(file)) continue;
      if (parsed.get(file)!.deps.some((dep) => client.has(dep))) {
        client.add(file);
        changed = true;
      }
    }
  }
  return { files, parsed, client };
}

test("ブラウザが要るファイルに 'use client' がある", () => {
  const { files, parsed, client } = scan();
  const missing = files
    .filter((file) => client.has(file) && !parsed.get(file)!.directive)
    .map((file) => relative(ROOT, file));
  expect(missing, "先頭に 'use client'; を足す").toEqual([]);
});

test("サーバーでも描けるファイルに 'use client' がない", () => {
  const { files, parsed, client } = scan();
  const extra = files
    .filter((file) => !client.has(file) && parsed.get(file)!.directive)
    .map((file) => relative(ROOT, file));
  expect(extra, "先頭の 'use client'; を消す").toEqual([]);
});

test('入口はサーバーのまま（再 export は伝播しない）', () => {
  const index = readFileSync(join(SRC, 'index.ts'), 'utf8');
  expect(index).not.toMatch(/'use client'/);
});
