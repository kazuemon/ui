// 検証の比較（ui-probe-compare）が書いた図の HTML を、項目ごとの画像にする。
//
//   node design/tools/render-figures.mjs figures.html --out figures/
//
// figures.html は <section data-figure="q1" data-title="…"> を並べた断片（<html> や <body> は書かない）。
// section の中に <figure data-label="A: …"> を並べると、見出しと列の枠はこの道具が付ける。
// 見た目は Tailwind のクラスと tokens.css の CSS 変数で書く（theme.css を読んでビルドする）。
// section ごとに要素を撮り、<out>/<data-figure>.png に書く。
//
// 文字の描き方・hover・動きの条件は、見た目の回帰テスト（vitest.config.ts）とそろえる。
// HTML は Issue の本文から作られるので、JavaScript は切って描く。

import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';
import { parseArgs, styleText } from 'node:util';

import tailwindcss from '@tailwindcss/vite';
import { chromium } from 'playwright';
import { build } from 'vite';

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    out: { type: 'string' },
    density: { type: 'string', default: 'fine' }, // coarse / fine
    width: { type: 'string', default: '1200' },
  },
});

const input = positionals[0];
if (!input || !values.out) {
  console.error(
    '使い方: node design/tools/render-figures.mjs <figures.html> --out <dir> [--density coarse|fine] [--width N]'
  );
  process.exit(1);
}

const repoDir = resolve(import.meta.dirname, '../..');
const outDir = resolve(values.out);
const fragment = readFileSync(resolve(input), 'utf8');

// 1. ビルド。tailwindcss を解決できるよう、作業場所はリポジトリの node_modules の中に置く
const cacheDir = join(repoDir, 'node_modules/.cache');
mkdirSync(cacheDir, { recursive: true });
const workDir = mkdtempSync(join(cacheDir, 'figures-'));

writeFileSync(
  join(workDir, 'index.html'),
  `<!doctype html>
<html lang="ja" data-density="${values.density}">
  <head>
    <meta charset="utf-8" />
    <link rel="stylesheet" href="./style.css" />
  </head>
  <body class="bg-bg text-fg font-sans">
${fragment}
  </body>
</html>
`
);

// globals.css と同じく、Tailwind の既定の色と影を消してからトークンを読む
writeFileSync(
  join(workDir, 'style.css'),
  `@import 'tailwindcss' source(none);
@source './index.html';

@theme {
  --color-*: initial;
  --shadow-*: initial;
}

@import '${join(repoDir, 'src/styles/theme.css')}';

/* 動きは撮らない */
*,
*::before,
*::after {
  animation: none !important;
  transition: none !important;
}

@layer base {
  body {
    margin: 0;
    padding: 16px;
  }
  [data-figure] {
    display: flex;
    flex-wrap: wrap;
    gap: 16px 24px;
    padding: 24px;
    margin-bottom: 16px;
    background: var(--color-bg);
  }
  /* 見出しは 1 行を占め、figure は残りの行に横並びで等分する */
  [data-figure]::before {
    content: attr(data-title);
    flex-basis: 100%;
    font-weight: 700;
    font-size: 16px;
  }
  [data-figure] > figure {
    flex: 1 1 0;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin: 0;
    padding: 16px;
    border: 1px dashed var(--color-surface-line);
    border-radius: 8px;
  }
  [data-figure] figure::before {
    content: attr(data-label);
    font-size: 13px;
    font-weight: 600;
    color: var(--color-fg-subtle);
  }
}
`
);

let server;
let browser;
try {
  await build({
    root: workDir,
    base: './',
    logLevel: 'warn',
    configFile: false,
    plugins: [tailwindcss()],
    build: { outDir: join(workDir, 'dist'), emptyOutDir: true },
  });

  // 2. 配信。file:// ではフォントが読まれないので、ローカルで配る
  const distDir = join(workDir, 'dist');
  const TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
  };
  server = createServer((req, res) => {
    const path = normalize(decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    const file = join(distDir, path === '/' ? 'index.html' : path);
    if (!file.startsWith(distDir) || !existsSync(file) || statSync(file).isDirectory()) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
    res.end(readFileSync(file));
  });
  await new Promise((ok) => server.listen(0, '127.0.0.1', ok));

  // 3. 撮影
  browser = await chromium.launch({
    args: [
      '--font-render-hinting=none',
      '--disable-lcd-text',
      '--force-prefers-reduced-motion',
      values.density === 'coarse'
        ? '--blink-settings=primaryHoverType=1,availableHoverTypes=1,primaryPointerType=2,availablePointerTypes=2'
        : '--blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4',
    ],
  });
  const page = await browser.newPage({
    javaScriptEnabled: false,
    deviceScaleFactor: 2,
    viewport: { width: Number(values.width), height: 800 },
  });
  await page.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);

  mkdirSync(outDir, { recursive: true });
  const ids = await page
    .locator('[data-figure]')
    .evaluateAll((els) => els.map((el) => el.getAttribute('data-figure')));
  for (const id of ids) {
    if (!/^[\w-]+$/.test(id)) {
      console.warn(
        `data-figure の名前は英数字・「-」・「_」だけにしてください（${id}）。飛ばします`
      );
      continue;
    }
    await page.locator(`[data-figure="${id}"]`).screenshot({ path: join(outDir, `${id}.png`) });
    console.log(`${styleText('green', '撮影しました')}: ${join(outDir, `${id}.png`)}`);
  }
  if (ids.length === 0) console.warn('data-figure の付いた section がありません');
} finally {
  await browser?.close();
  if (server) {
    server.closeAllConnections();
    server.close();
  }
  rmSync(workDir, { recursive: true, force: true });
}
