// 後半の ADR 用の比較画像を撮る。比較のストーリー（design/stories）をそのまま撮る。
//
//   node design/tools/capture-story.mjs design-review-01-focus--candidates \
//     --pick A --out design/adr/assets/NNNN-kebab-title.png
//
// Storybook をビルドしてローカルで配信し、ストーリーだけ（iframe.html）を撮る。
// --static-dir にビルド済みのディレクトリを渡すと、ビルドを省く。
//
// 既定では、動きを減らす設定（prefers-reduced-motion: reduce）をオンにして撮る（--motion reduce）。
// 移り変わりの途中で撮られて、状態の見た目が出ないことを防ぐため。
// ただし送信中の印は、この設定で形が変わる（design/adr/0042。線は幅いっぱいの明滅になる）。
// ふだんの動きの印を撮るときは --motion normal を渡す（移り変わりの途中で撮られないよう、撮る前に待つ時間はそのまま）。

import { execFile, execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { extname, join, normalize, resolve } from 'node:path';
import { parseArgs, promisify, styleText } from 'node:util';
import { CHROME } from './render.mjs';

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    out: { type: 'string' },
    pick: { type: 'string' }, // 採用した案の id。現行版は current
    density: { type: 'string' }, // coarse / fine。省略すると入力方式に合わせる（撮影環境ではマウス）
    motion: { type: 'string', default: 'reduce' }, // reduce / normal。動きを減らす設定をオンにして撮るか
    width: { type: 'string', default: '1320' },
    height: { type: 'string', default: '1500' },
    'static-dir': { type: 'string' },
  },
});

const storyId = positionals[0];
if (!storyId || !values.out) {
  console.error(
    '使い方: node design/tools/capture-story.mjs <story-id> --out <png> [--pick <id>] [--density coarse|fine] [--motion reduce|normal] [--width N] [--height N] [--static-dir <dir>]'
  );
  process.exit(1);
}
if (values.motion !== 'reduce' && values.motion !== 'normal') {
  console.error(`--motion は reduce か normal です（${values.motion}）`);
  process.exit(1);
}

const repoDir = resolve(import.meta.dirname, '../..');

// 1. ビルド
const built = !values['static-dir'];
const staticDir = built
  ? mkdtempSync(join(tmpdir(), 'kz-storybook-'))
  : resolve(values['static-dir']);
if (built) {
  console.log('Storybook をビルドしています…');
  execFileSync('pnpm', ['exec', 'storybook', 'build', '-o', staticDir, '--quiet'], {
    cwd: repoDir,
    stdio: 'ignore',
  });
}

// 2. 配信
const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};
const server = createServer((req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
  const file = join(staticDir, path === '/' ? 'index.html' : path);
  if (!file.startsWith(staticDir) || !existsSync(file) || statSync(file).isDirectory()) {
    res.writeHead(404).end();
    return;
  }
  res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
  res.end(readFileSync(file));
});
await new Promise((ok) => server.listen(0, '127.0.0.1', ok));

// 3. 撮影
const query = [`id=${storyId}`, 'viewMode=story'];
if (values.pick) query.push(`args=pick:${values.pick}`);
if (values.density) query.push(`globals=density:${values.density}`);
const url = `http://127.0.0.1:${server.address().port}/iframe.html?${query.join('&')}`;

try {
  await promisify(execFile)(CHROME, [
    '--headless',
    '--no-sandbox',
    '--hide-scrollbars',
    // 移り変わりの途中で撮られると、状態の見た目が出ないことがある（--motion normal のときはオンにしない）
    ...(values.motion === 'reduce' ? ['--force-prefers-reduced-motion'] : []),
    // headless は既定で「マウスなし」（hover: none）で、hover の見た目が出ない。
    // マウスで操作している環境（指の密度では指）として撮る
    values.density === 'coarse'
      ? '--blink-settings=primaryHoverType=1,availableHoverTypes=1,primaryPointerType=2,availablePointerTypes=2'
      : '--blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4',
    `--window-size=${values.width},${values.height}`,
    '--virtual-time-budget=8000',
    `--screenshot=${resolve(values.out)}`,
    url,
  ]);
} finally {
  server.closeAllConnections();
  server.close();
  if (built) rmSync(staticDir, { recursive: true, force: true });
}

console.log(
  `${styleText('green', '撮影しました')}: ${values.out}（${values.width}×${values.height}）`
);
console.log('下端が切れていないかを目視で確認してください');
