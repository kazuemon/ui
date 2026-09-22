// CodeGroup の見本。CodeBlock の見本（../code-block/fixtures.ts）と同じ、Shiki で色分けしたあとの形の HTML
// 行: <pre class="shiki"><code><span class="line">…</span>\n…</code></pre>

const pre = (lines: string[]) =>
  `<pre class="shiki css-variables" style="background-color:var(--shiki-background);color:var(--shiki-foreground)" tabindex="0"><code>${lines
    .map((line) => `<span class="line">${line}</span>`)
    .join('\n')}</code></pre>`;

const fn = (text: string) => `<span style="color:var(--shiki-token-function)">${text}</span>`;
const str = (text: string) => `<span style="color:var(--shiki-token-string)">${text}</span>`;
const keyword = (text: string) => `<span style="color:var(--shiki-token-keyword)">${text}</span>`;
const constant = (text: string) => `<span style="color:var(--shiki-token-constant)">${text}</span>`;
const plain = (text: string) => `<span style="color:var(--shiki-foreground)">${text}</span>`;
const comment = (text: string) => `<span style="color:var(--shiki-token-comment)">${text}</span>`;

export const pnpmHtml = pre([
  fn('pnpm') + str(' add') + str(' @kazuemon/ui'),
  fn('pnpm') + str(' add') + str(' -D') + str(' tailwindcss') + str(' @tailwindcss/vite'),
]);

export const npmHtml = pre([
  fn('npm') + str(' install') + str(' @kazuemon/ui'),
  fn('npm') + str(' install') + str(' -D') + str(' tailwindcss') + str(' @tailwindcss/vite'),
]);

export const yarnHtml = pre([
  fn('yarn') + str(' add') + str(' @kazuemon/ui'),
  fn('yarn') + str(' add') + str(' -D') + str(' tailwindcss') + str(' @tailwindcss/vite'),
]);

export const bunHtml = pre([
  fn('bun') + str(' add') + str(' @kazuemon/ui'),
  fn('bun') + str(' add') + str(' -D') + str(' tailwindcss') + str(' @tailwindcss/vite'),
]);

export const tsxHtml = pre([
  keyword('import') + plain(' { Button } ') + keyword('from') + str(" '@kazuemon/ui'") + plain(';'),
  '',
  keyword('export') +
    keyword(' function') +
    fn(' Save') +
    plain('(props') +
    keyword(':') +
    fn(' Props') +
    plain(') {'),
  plain('  return ') +
    plain('&#x3C;') +
    fn('Button') +
    plain(' color="primary">保存&#x3C;/') +
    fn('Button') +
    plain('>;'),
  plain('}'),
]);

export const jsxHtml = pre([
  keyword('import') + plain(' { Button } ') + keyword('from') + str(" '@kazuemon/ui'") + plain(';'),
  '',
  keyword('export') + keyword(' function') + fn(' Save') + plain('(props) {'),
  plain('  return ') +
    plain('&#x3C;') +
    fn('Button') +
    plain(' color="primary">保存&#x3C;/') +
    fn('Button') +
    plain('>;'),
  plain('}'),
]);

export const configHtml = pre([
  comment('// 色分けはビルド時に済ませる'),
  keyword('export') +
    keyword(' default') +
    fn(' defineConfig') +
    plain('({ markdown') +
    keyword(':') +
    plain(' { shikiConfig') +
    keyword(':') +
    plain(' { theme') +
    keyword(':') +
    constant(' cssVariables') +
    plain(' } } });'),
]);
