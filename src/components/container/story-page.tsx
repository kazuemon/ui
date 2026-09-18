import type { CSSProperties, ReactNode } from 'react';

import { Button } from '../button/Button';
import { Heading } from '../heading/Heading';
import { Link } from '../link/Link';
import { Prose } from '../prose/Prose';
import { Text } from '../text/Text';
import { Container } from './Container';

// ストーリーで使う見本のページと、画面の幅を固定した枠（部品ではない）。Container の Docs と、比較のストーリーで共有する

/** 英語のセクションラベル（原則10）と日本語の見出し。レイアウト層で組む */
function SectionHeading({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-(length:--text-caption) leading-(--leading-caption) font-bold text-fg-brand uppercase">
        {label}
      </p>
      <Heading level={2}>{children}</Heading>
    </div>
  );
}

const works = [
  ['kazuemon-ui', '自分のための UI の部品'],
  ['k6n.jp', 'ポートフォリオとブログ'],
  ['slides', '発表の資料'],
] as const;

/**
 * 見本のページ。ヘッダー・記事（prose）・カードの格子（default）・フッター
 * guides を付けると、Container の左右の余白を破線で見せる
 */
export function SamplePage({ guides = false }: { guides?: boolean }) {
  // 余白を見せる: Container の内側（中身の幅）に破線を引き、余白の部分をグレーにする
  const guide = guides
    ? 'bg-neutral [background-clip:border-box] [&>*]:outline-1 [&>*]:outline-dashed [&>*]:outline-line-strong'
    : '';
  const inner = guides ? 'bg-bg' : '';
  return (
    <div className="flex min-h-full flex-col bg-bg text-fg">
      <header className="border-b border-line">
        <Container className={`${guide} py-3`}>
          <div className={`flex items-center justify-between gap-4 ${inner}`}>
            <Text as="span" className="font-heading text-fg-brand">
              kazuemon
            </Text>
            <nav className="flex gap-4">
              <Link href="#works">Works</Link>
              <Link href="#blog">Blog</Link>
            </nav>
          </div>
        </Container>
      </header>
      <main className="flex flex-col gap-12 py-10">
        <Container size="prose" className={guide}>
          <div className={`flex flex-col gap-4 ${inner}`}>
            <SectionHeading label="Blog">部品の幅と余白を決める</SectionHeading>
            <Prose>
              <p>
                記事のような読みものは、1
                行の字数を抑えて読みやすさを優先します。画面が広くても本文は広げず、中央に寄せて左右を空けます。
              </p>
              <p>
                画面が狭いときは、画面の幅から左右の余白を引いた幅になります。余白は、画面の端に部品が付かないためのものです。
              </p>
            </Prose>
          </div>
        </Container>
        <Container className={guide}>
          <div className={`flex flex-col gap-4 ${inner}`}>
            <SectionHeading label="Works">つくったもの</SectionHeading>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,240px),1fr))] gap-4">
              {works.map(([title, text]) => (
                <div
                  key={title}
                  className="flex flex-col gap-1 rounded-card border border-line bg-surface p-4"
                >
                  <Heading level={3} size={4}>
                    {title}
                  </Heading>
                  <Text size="sm" tone="muted">
                    {text}
                  </Text>
                </div>
              ))}
            </div>
            <div>
              <Button appearance="outline">もっと見る</Button>
            </div>
          </div>
        </Container>
      </main>
      <footer className="mt-auto border-t border-line">
        <Container className={`${guide} py-6`}>
          <div className={inner}>
            <Text size="sm" tone="subtle">
              © 2026 kazuemon
            </Text>
          </div>
        </Container>
      </footer>
    </div>
  );
}
/**
 * 画面の幅を固定した枠。Container は置いた場所の幅に従うので、ここで画面の幅を決める
 * scale で縮めて並べる（transform）。密度は外（ツールバーの「密度」）に従う
 */
export function ScreenOf({
  width,
  height,
  scale,
  style,
  children,
}: {
  width: number;
  height: number;
  scale: number;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div
      className="overflow-hidden rounded-control border border-line"
      style={{ width: width * scale, height: height * scale }}
    >
      <div
        className="overflow-hidden bg-bg"
        style={{
          width,
          height,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          ...style,
        }}
      >
        {children}
      </div>
    </div>
  );
}
