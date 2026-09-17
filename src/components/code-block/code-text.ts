/**
 * 色分けした HTML から、コピーする文字列を取り出す
 * 行（.line）があるときは行ごとに改行でつなぎ、差分で消した行（.diff.remove）は除く。行がないときは code（なければ pre）の文字をそのまま使う
 * 行番号と差分の印は疑似要素（::before・::after）で描くので、textContent に入らない
 */
export function codeTextOf(container: HTMLElement): string {
  const code = container.querySelector('pre code') ?? container.querySelector('pre');
  if (!code) return '';
  const lines = code.querySelectorAll('.line');
  if (lines.length === 0) return code.textContent ?? '';
  return Array.from(lines)
    .filter((line) => !line.matches('.diff.remove'))
    .map((line) => line.textContent ?? '')
    .join('\n');
}
