import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { expect, test } from 'vitest';

// 部品の層のトークン（<name>.tokens.css）は、component-tokens.css が 1 つずつ読む。足し忘れると値が届かない

const SRC = join(import.meta.dirname, '..');
const ROOT = join(SRC, '..');

function filesIn(dir: string, keep: (name: string) => boolean): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === '__screenshots__' ? [] : filesIn(path, keep);
    return keep(entry.name) ? [path] : [];
  });
}
const tokenFiles = (dir: string) => filesIn(dir, (name) => name.endsWith('.tokens.css'));

test('<name>.tokens.css をすべて component-tokens.css が読む', () => {
  const list = readFileSync(join(import.meta.dirname, 'component-tokens.css'), 'utf8');
  const imported = [...list.matchAll(/^@import '([^']+)';$/gm)].map(([, path]) =>
    join(import.meta.dirname, path)
  );
  const files = tokenFiles(SRC);
  expect(imported.map((path) => relative(SRC, path)).toSorted()).toEqual(
    files.map((path) => relative(SRC, path)).toSorted()
  );
});

// 部品のトークンは、役割にない値か、状態で差し替える値のときだけ足す（CLAUDE.md「部品を作る」）。
// 公開の役割・尺度を指すだけで、どこでも差し替えていない別名は、部品で役割を直接指す
test('役割を指すだけの部品のトークンがない', () => {
  const publicCss = readFileSync(join(ROOT, 'design/tokens.css'), 'utf8');
  const publicNames = new Set(
    [...publicCss.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gm)].map(([, n]) => n)
  );
  const sources = [
    ...filesIn(SRC, (name) => /\.(tsx?|css)$/.test(name)),
    ...filesIn(join(ROOT, 'design/stories'), (name) => /\.tsx?$/.test(name)),
  ].map((path) => readFileSync(path, 'utf8'));
  sources.push(publicCss);
  const declarations = (name: string) => {
    const n = name.replaceAll('-', '\\-');
    const re = new RegExp(`(?<![a-z0-9-])${n}\\s*:|\\[${n}:|['"]${n}['"]`, 'g');
    return sources.reduce((count, text) => count + (text.match(re)?.length ?? 0), 0);
  };
  const aliases = tokenFiles(SRC).flatMap((path) =>
    [...readFileSync(path, 'utf8').matchAll(/^\s*(--[a-z0-9-]+):\s*var\((--[a-z0-9-]+)\);/gm)]
      .filter(
        ([, name, target]) =>
          publicNames.has(target) && declarations(target) === 1 && declarations(name) === 1
      )
      .map(([, name, target]) => `${relative(SRC, path)}: ${name} → ${target}`)
  );
  expect(aliases).toEqual([]);
});
