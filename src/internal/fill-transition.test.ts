import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from 'vitest';

// 塗りの移り変わりは、background-color ではなく登録した変数で動かす（ADR-0112）
// GPU のある Chrome は background-color の移り変わりをコンポジタで動かし、終わりの 1 フレームに動かす前の色が見えることがある。
// 登録した変数の移り変わりは主スレッドで動くので、この受け渡しが起きない。ここでは次の 2 つを確かめる
//   1. クラスと CSS の transition に background-color（background・transition-colors・transition-all を含む）がない
//   2. transition で動かす変数は、theme.css で @property に登録してある（登録していない変数は移り変わらず、すぐ切り替わる）
//      登録は theme.css にまとめる（部品の <name>.tokens.css には置かない）

const SRC = fileURLToPath(new URL('..', import.meta.url));
const IGNORED = /\.stories\.|\.test\.|\.d\.ts$/;

// background を動かしてよいもの。理由を添える
const ALLOWED_BACKGROUND: Record<string, string> = {
  // 面の色は周りの文字の色（currentColor）から作り、登録した変数の中では補間できない。duration を渡したときだけ動く
  'components/spoiler/Spoiler.tsx': 'currentColor の面',
};

function walk(dir: string, out: string[] = []) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      if (entry !== '__screenshots__') walk(path, out);
    } else if (/\.(tsx?|css)$/.test(path) && !IGNORED.test(path)) {
      out.push(path);
    }
  }
  return out;
}

/** transition で動かす property の名前。クラス（transition-[…]・[transition:…]・[transition-property:…]）と CSS の宣言から拾う */
function transitionedProperties(source: string) {
  const lists: string[] = [];
  for (const [, list] of source.matchAll(/transition-\[([^\]\s'"]+)\]/g)) lists.push(list);
  for (const [, list] of source.matchAll(/\[transition(?:-property)?:([^\]\s'"]+)\]/g))
    lists.push(list);
  for (const [, list] of source.matchAll(/^\s*transition(?:-property)?:\s*([^;]+);/gm))
    lists.push(list);
  return lists.flatMap((list) =>
    list
      .split(',')
      .map((item) => item.trim().split(/[_\s]/)[0])
      .filter(Boolean)
  );
}

/** コメントの中の言葉を数えないよう、先に落とす */
function withoutComments(source: string) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
}

const files = walk(SRC).map((path) => ({
  path,
  name: relative(SRC, path),
  source: withoutComments(readFileSync(path, 'utf8')),
}));

test('塗りを background-color の transition で動かしていない', () => {
  const found: string[] = [];
  for (const { name, source } of files) {
    if (ALLOWED_BACKGROUND[name]) continue;
    const props = transitionedProperties(source).filter((p) =>
      /^(background(-color)?|all)$/.test(p)
    );
    // Tailwind の transition-colors・transition-all は background-color を含む
    const utilities = source.match(/(?<![\w[-])transition-(colors|all)(?![\w-])/g) ?? [];
    for (const p of [...props, ...utilities]) found.push(`${name}: ${p}`);
  }
  expect(found).toEqual([]);
});

test('transition で動かす変数は、theme.css で登録してある', () => {
  const theme = readFileSync(join(SRC, 'styles/theme.css'), 'utf8');
  const registered = new Set([...theme.matchAll(/@property\s+(--[\w-]+)/g)].map(([, n]) => n));
  const missing: string[] = [];
  for (const { name, source } of files) {
    for (const p of transitionedProperties(source)) {
      if (p.startsWith('--') && !registered.has(p)) missing.push(`${name}: ${p}`);
    }
  }
  expect(missing).toEqual([]);
});
