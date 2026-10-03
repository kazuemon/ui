import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { expect, test } from 'vitest';

// 部品の層のトークン（<name>.tokens.css）は、component-tokens.css が 1 つずつ読む。足し忘れると値が届かない

const SRC = join(import.meta.dirname, '..');

function tokenFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === '__screenshots__' ? [] : tokenFiles(path);
    return entry.name.endsWith('.tokens.css') ? [path] : [];
  });
}

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
