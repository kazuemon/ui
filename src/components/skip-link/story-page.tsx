import type { ReactNode } from 'react';

import { Container } from '../container/Container';
import { Heading } from '../heading/Heading';
import { Link } from '../link/Link';
import { Text } from '../text/Text';
import { SkipLink } from './SkipLink';

// ストーリーで使う見本のページ（部品ではない）。SkipLink の Docs と、比較のストーリーで共有する
// SkipLink は画面に固定して出るので、枠を位置の基準にする（transform）

/** 見本のページ。先頭に SkipLink、ヘッダー（ロゴとナビ）、本文。main の id は idPrefix で変える（1 画面に何枚も並べるため） */
export function SkipLinkPage({
  width = 560,
  idPrefix = 'page',
  density,
  label,
}: {
  width?: number;
  idPrefix?: string;
  density?: 'fine' | 'coarse';
  /** SkipLink の文字。渡さないときは部品の既定 */
  label?: ReactNode;
}) {
  const main = `${idPrefix}-main`;
  return (
    <div
      data-density={density}
      className="relative h-[220px] max-w-full [transform:translateZ(0)] overflow-clip rounded-card border border-line bg-bg text-fg"
      style={{ width }}
    >
      <SkipLink href={`#${main}`}>{label}</SkipLink>
      <header className="border-b border-line">
        <Container className="flex items-center justify-between gap-4 py-3">
          <Text as="span" className="font-heading text-fg-brand">
            kazuemon
          </Text>
          <nav className="flex gap-4">
            <Link href="#works">Works</Link>
            <Link href="#blog">Blog</Link>
          </nav>
        </Container>
      </header>
      <Container size="prose" render={<main id={main} />} className="py-6">
        <div className="flex flex-col gap-2">
          <Heading level={2}>部品の幅と余白を決める</Heading>
          <Text>
            本文です。キーボードで操作する人は、ヘッダーのリンクを飛ばしてここへ移れます。
          </Text>
        </div>
      </Container>
    </div>
  );
}
