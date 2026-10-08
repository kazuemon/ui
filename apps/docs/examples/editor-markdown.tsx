import { Fragment, type ReactNode } from 'react';

// エディタの見本のプレビュー用の、ごく簡単な Markdown の読み方
//   見出し（# 〜 ###）・段落・箇条書き（- と 1.）・引用（>）・コードブロック（```）・区切り線（---）と、
//   行の中の太字（**）・斜体（_）・取り消し線（~~）・コード（`）・リンク（[文字](URL)）だけを読む
//   HTML の文字列は作らず、React の要素で組む（書いた文がそのまま HTML として読まれないように）

const INLINE = /(\*\*[^*]+\*\*|_[^_]+_|~~[^~]+~~|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g;

function inline(text: string): ReactNode[] {
  return text.split(INLINE).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4)
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('~~') && part.endsWith('~~') && part.length > 4)
      return <del key={i}>{part.slice(2, -2)}</del>;
    if (part.startsWith('_') && part.endsWith('_') && part.length > 2)
      return <em key={i}>{part.slice(1, -1)}</em>;
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2)
      return <code key={i}>{part.slice(1, -1)}</code>;
    const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
    if (link) {
      // 見本なので、http(s) と # で始まる行き先だけをリンクにする
      const href = /^(https?:\/\/|#)/.test(link[2]) ? link[2] : undefined;
      return (
        <a key={i} href={href}>
          {link[1]}
        </a>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export function MarkdownPreview({ source }: { source: string }) {
  const lines = source.split('\n');
  const blocks: ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '') {
      i += 1;
      continue;
    }
    if (line.startsWith('```')) {
      const code: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].startsWith('```')) code.push(lines[i++]);
      i += 1;
      blocks.push(
        <pre key={blocks.length}>
          <code>{code.join('\n')}</code>
        </pre>
      );
      continue;
    }
    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    if (heading) {
      // 記事の題（h1）は本文の外に置くので、# も ## と同じ h2 にする
      //   読み上げでは、プレビューの題（3 段目）の下に来るよう 2 段下げる（見た目は記事の h2・h3 のまま）
      const level = Math.max(2, heading[1].length);
      const Tag = `h${level}` as 'h2' | 'h3';
      blocks.push(
        <Tag key={blocks.length} aria-level={level + 2}>
          {inline(heading[2])}
        </Tag>
      );
      i += 1;
      continue;
    }
    if (/^-{3,}$/.test(line.trim())) {
      blocks.push(<hr key={blocks.length} />);
      i += 1;
      continue;
    }
    if (/^(- |\d+\. )/.test(line)) {
      const ordered = /^\d+\. /.test(line);
      const items: string[] = [];
      while (i < lines.length && /^(- |\d+\. )/.test(lines[i]))
        items.push(lines[i++].replace(/^(- |\d+\. )/, ''));
      const List = ordered ? 'ol' : 'ul';
      blocks.push(
        <List key={blocks.length}>
          {items.map((item, j) => (
            <li key={j}>{inline(item)}</li>
          ))}
        </List>
      );
      continue;
    }
    if (line.startsWith('>')) {
      const quote: string[] = [];
      while (i < lines.length && lines[i].startsWith('>'))
        quote.push(lines[i++].replace(/^>\s?/, ''));
      blocks.push(
        <blockquote key={blocks.length}>
          <p>{inline(quote.join(' '))}</p>
        </blockquote>
      );
      continue;
    }
    // 1 行目は必ず取る（# だけの行など、上のどれにも当たらない行で止まらないように）
    const paragraph: string[] = [lines[i++]];
    while (i < lines.length && lines[i].trim() !== '' && !/^(#|```|- |\d+\. |>)/.test(lines[i]))
      paragraph.push(lines[i++]);
    blocks.push(<p key={blocks.length}>{inline(paragraph.join(' '))}</p>);
  }
  return <>{blocks}</>;
}
