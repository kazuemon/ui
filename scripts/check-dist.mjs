// 配布物（dist/）を確かめる。pnpm build のあとに流す
//   pnpm check:dist
//
// 1. 'use client' が、ソースと同じファイルに残っている（ビルドで消えると、Server Components から読めなくなる）
// 2. dist の JS が読む npm のパッケージが、dependencies か peerDependencies にある（使う側で解決できる）
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const DIST = join(ROOT, 'dist');
const SRC = join(ROOT, 'src');

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) walk(path, out);
    else out.push(path);
  }
  return out;
}

const hasDirective = (source) => /^\s*['"]use client['"]/.test(source);

if (!existsSync(DIST)) {
  console.error('dist/ がありません。先に pnpm build を流してください');
  process.exit(1);
}

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const allowed = new Set([
  ...Object.keys(pkg.dependencies ?? {}),
  ...Object.keys(pkg.peerDependencies ?? {}),
]);
/** import の行き先から、パッケージの名前を取り出す（@scope/name/sub → @scope/name） */
const packageName = (specifier) =>
  specifier
    .split('/')
    .slice(0, specifier.startsWith('@') ? 2 : 1)
    .join('/');

const problems = [];
const files = walk(DIST).filter((path) => path.endsWith('.js'));

for (const path of files) {
  const source = readFileSync(path, 'utf8');
  const name = relative(DIST, path);
  const sourcePath = ['.tsx', '.ts']
    .map((extension) => join(SRC, name.replace(/\.js$/, extension)))
    .find((candidate) => existsSync(candidate));
  if (!sourcePath) {
    problems.push(`${name}: 対応するソースがありません`);
    continue;
  }
  const expected = hasDirective(readFileSync(sourcePath, 'utf8'));
  if (expected !== hasDirective(source)) {
    problems.push(`${name}: 'use client' が${expected ? '消えています' : '増えています'}`);
  }
  const imports = [
    ...source.matchAll(/^(?:import|export)\s[^'"]*?from\s*['"]([^'"]+)['"]/gm),
    ...source.matchAll(/^import\s*['"]([^'"]+)['"]/gm),
    ...source.matchAll(/\bimport\(\s*['"]([^'"]+)['"]\s*\)/g),
  ];
  for (const [, specifier] of imports) {
    if (specifier.startsWith('.')) continue;
    if (!allowed.has(packageName(specifier))) {
      problems.push(`${name}: ${specifier} を読んでいますが、package.json の依存にありません`);
    }
  }
}

if (problems.length > 0) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`dist/ の ${files.length} ファイルを確かめました`);
