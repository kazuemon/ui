// 公開する前に、pnpm pack で作ったパッケージ（.tgz）の中身を確かめる
// 使い方: pnpm pack --pack-destination .pack && node scripts/check-pack.mjs .pack/*.tgz（prepack がビルドする）
// 確かめること:
// - package.json の exports・main・module・types が指すファイルが、パッケージの中にある
// - JS の入口がビルド前の .ts・.tsx を指していない（型の .d.ts はよい）
// - 依存に workspace: が残っていない
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';

const tarball = process.argv[2];
if (!tarball || !existsSync(tarball)) {
  console.error('使い方: node scripts/check-pack.mjs <パッケージの .tgz>');
  process.exit(2);
}

const dir = mkdtempSync(join(tmpdir(), 'check-pack-'));
const errors = [];

try {
  execFileSync('tar', ['-xzf', tarball, '-C', dir]);
  const root = join(dir, 'package');
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  const files = listFiles(root).map((file) => relative(root, file));

  // exports の値を、条件（import・types など）ごとにたどって、指しているパスを集める
  const targets = [];
  const collect = (value, key) => {
    if (typeof value === 'string') targets.push({ key, path: value });
    else if (Array.isArray(value)) value.forEach((v) => collect(v, key));
    else if (value && typeof value === 'object') {
      for (const [k, v] of Object.entries(value)) collect(v, `${key} > ${k}`);
    }
  };
  collect(pkg.exports, 'exports');
  for (const field of ['main', 'module', 'types', 'typings']) collect(pkg[field], field);

  if (targets.length === 0) errors.push('exports・main・types のどれもありません');

  for (const { key, path } of targets) {
    const pattern = path.replace(/^\.\//, '');
    const matched = pattern.includes('*')
      ? files.some((file) => globToRegExp(pattern).test(file))
      : files.includes(pattern);
    if (!matched) errors.push(`${key}: ${path} がパッケージの中にありません`);
    if (/\.(ts|tsx|mts|cts)$/.test(path) && !/\.d\.(ts|mts|cts)$/.test(path)) {
      errors.push(`${key}: ${path} はビルド前のソースです`);
    }
  }

  for (const field of ['dependencies', 'peerDependencies', 'optionalDependencies']) {
    for (const [name, range] of Object.entries(pkg[field] ?? {})) {
      if (String(range).startsWith('workspace:')) {
        errors.push(`${field} の ${name} が ${range} のままです`);
      }
    }
  }

  if (errors.length > 0) {
    console.error(`${pkg.name}@${pkg.version} は公開できません:`);
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
  } else {
    console.log(`${pkg.name}@${pkg.version}: ${files.length} 個のファイル。入口はすべてあります`);
  }
} finally {
  rmSync(dir, { recursive: true, force: true });
}

function listFiles(parent) {
  return readdirSync(parent, { withFileTypes: true }).flatMap((entry) => {
    const path = join(parent, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  });
}

function globToRegExp(pattern) {
  const source = pattern
    .split('*')
    .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
    .join('.+');
  return new RegExp(`^${source}$`);
}
