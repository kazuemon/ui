// 配布物（dist/）を確かめる。pnpm build のあとに流す
//   pnpm check:dist
//
// 1. 'use client' が、ソースと同じファイルに残っている（ビルドで消えると、Server Components から読めなくなる）
// 2. dist の JS が読む npm のパッケージが、dependencies か peerDependencies にある（使う側で解決できる）
// 3. ツリーシェイクが効く: Button だけを import して Vite で束ねると、Dialog が入らない
//    ファイルごとに出すこと（unbundle）と package.json の sideEffects の、両方が要る
import {
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';
import { build } from 'vite';

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

// Button だけを import したアプリを束ねる。npm のパッケージは外に置き、dist の中のファイルだけを数える
const work = mkdtempSync(join(tmpdir(), 'kazuemon-ui-treeshake-'));
const entry = join(work, 'entry.js');
writeFileSync(
  entry,
  `import { Button } from ${JSON.stringify(join(DIST, 'index.js'))};\nconsole.log(Button);\n`
);
try {
  const result = await build({
    configFile: false,
    logLevel: 'silent',
    build: {
      write: false,
      minify: false,
      lib: { entry, formats: ['es'], fileName: 'entry' },
      rolldownOptions: { external: (id) => !/^[./\0]/.test(id) },
    },
  });
  const output = (Array.isArray(result) ? result : [result]).flatMap((r) => r.output);
  const modules = output.flatMap((chunk) => Object.keys(chunk.modules ?? {}));
  const included = modules.map((id) => relative(DIST, id)).filter((id) => !id.startsWith('..'));
  const size = output.reduce((sum, chunk) => sum + (chunk.code ?? '').length, 0);
  if (included.includes(join('components', 'dialog', 'Dialog.js'))) {
    problems.push('Button だけを import したのに、Dialog が束ねた中に入っています');
  }
  if (!included.includes(join('components', 'button', 'Button.js'))) {
    problems.push(
      'Button だけを import したのに、Button が束ねた中にありません（確かめ方が壊れています）'
    );
  }
  console.log(
    `Button だけを import: dist から ${included.length} ファイル、${(size / 1024).toFixed(1)} KB（minify なし）`
  );
} finally {
  rmSync(work, { recursive: true, force: true });
}

if (problems.length > 0) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`dist/ の ${files.length} ファイルを確かめました`);
