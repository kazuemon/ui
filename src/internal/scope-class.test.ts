import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from 'vitest';

// 部品の中だけに効くリセット（src/styles/reset.css）は、目印のクラス（SCOPE_CLASS）の要素とその中にだけ効く。
// tv で書いた部位には tv が足すが、Base UI の Portal（body の直下に出す包み）は tv を通らないので、自分で付ける。
// 付け忘れると、ポップアップの中身が Tailwind を使わないアプリで崩れる

const SRC = fileURLToPath(new URL('..', import.meta.url));

function walk(dir: string, out: string[] = []) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      if (entry !== '__screenshots__') walk(path, out);
    } else if (path.endsWith('.tsx') && !/\.stories\.|\.test\./.test(path)) {
      out.push(path);
    }
  }
  return out;
}

test('Base UI の Portal に目印のクラスを付けている', () => {
  const missing: string[] = [];
  for (const path of walk(SRC)) {
    const source = readFileSync(path, 'utf8');
    for (const [tag] of source.matchAll(/<Base\w*\.Portal\b[^>]*>/g)) {
      if (!tag.includes('className={SCOPE_CLASS}')) missing.push(`${relative(SRC, path)}: ${tag}`);
    }
  }
  expect(missing).toEqual([]);
});
