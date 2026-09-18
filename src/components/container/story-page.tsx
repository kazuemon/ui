import type { CSSProperties, ReactNode } from 'react';

import { Button } from '../button/Button';
import { Heading } from '../heading/Heading';
import { Link } from '../link/Link';
import { Prose } from '../prose/Prose';
import { Text } from '../text/Text';
import { Container, type ContainerSize } from './Container';

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

const posts = [
  ['部品の幅と余白を決める', '9月18日', 'Container の幅の段と、画面の端からの余白を選びました。'],
  ['スクロールする枠の影', '9月17日', '続きがあることを、端に落ちる内側の影で見せます。'],
  ['シートをはじいて閉じる', '9月16日', '指の速さで、閉じるか戻るかを決めます。'],
  ['Tooltip の面', '9月15日', '濃い面に白い文字で、短い説明を出します。'],
  ['Dialog の角と大きさ', '9月14日', '画面の幅に合わせて、角の丸みと余白を変えます。'],
  ['コードの色分け', '9月13日', '記事の中のコードを、落ち着いた色で分けます。'],
] as const;

/**
 * 画面の幅いっぱいに描く見本のページ。ヘッダー・見出し・記事（Prose）・カードの格子・Button・フッター
 * size を渡すと、すべての Container をその幅にする。渡さないときは、記事を prose、ほかを default にする
 * guides を付けると、Container の左右の余白をグレーに、中身の幅を破線で見せる
 */
export function SiteSamplePage({
  size,
  guides = false,
}: {
  size?: ContainerSize;
  guides?: boolean;
}) {
  const guide = guides
    ? 'bg-neutral [&>*]:bg-bg [&>*]:outline-1 [&>*]:outline-line-strong [&>*]:outline-dashed'
    : '';
  const article = size ?? 'prose';
  const main = size ?? 'default';
  return (
    <div className="flex min-h-screen flex-col bg-bg text-fg">
      <header className="border-b border-line">
        <Container size={main} className={`${guide} py-3`}>
          <div className="flex items-center justify-between gap-4">
            <Text as="span" className="font-heading text-fg-brand">
              kazuemon
            </Text>
            <nav className="flex gap-4">
              <Link href="#works">Works</Link>
              <Link href="#blog">Blog</Link>
              <Link href="#about">About</Link>
            </nav>
          </div>
        </Container>
      </header>
      <main className="flex flex-col gap-16 py-12">
        <Container size={article} className={guide}>
          <article className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Text size="sm" tone="subtle">
                2026年9月18日
              </Text>
              <Heading level={1}>部品の幅と余白を決める</Heading>
            </div>
            <Prose>
              <p>
                記事のような読みものは、1
                行の字数を抑えて読みやすさを優先します。画面が広くても本文は広げず、中央に寄せて左右を空けます。長い行は、次の行の頭を探す目の動きが大きくなり、読む速さが落ちます。
              </p>
              <h2>画面が狭いとき</h2>
              <p>
                画面が狭いときは、画面の幅から左右の余白を引いた幅になります。余白は、画面の端に部品が付かないためのものです。スマートフォンを片手で持つと、親指の付け根が画面の端にかかるので、端に近い文字は読みにくくなります。
              </p>
              <ul>
                <li>読みものは、1 行の字数を抑える</li>
                <li>カードの一覧は、少し広い幅で並べる</li>
                <li>表や画像は、さらに広い幅を使う</li>
              </ul>
              <blockquote>
                <p>余白は、中身を読むための間合いです。</p>
              </blockquote>
              <p>
                密度をマウスから指に切り替えると、左右の余白も変わります。ブラウザの幅を変えたり、スマートフォンで開いたりして、端からの距離を確かめてください。
              </p>
            </Prose>
            <div className="flex flex-wrap gap-3">
              <Button color="primary">記事をシェアする</Button>
              <Button appearance="outline">一覧に戻る</Button>
            </div>
          </article>
        </Container>
        <Container size={main} className={guide}>
          <section id="blog" className="flex flex-col gap-4">
            <SectionHeading label="Blog">最近の記事</SectionHeading>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,240px),1fr))] gap-4">
              {posts.map(([title, date, text]) => (
                <div
                  key={title}
                  className="flex flex-col gap-2 rounded-card border border-line bg-surface p-4"
                >
                  <Text size="sm" tone="subtle">
                    {date}
                  </Text>
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
          </section>
        </Container>
        <Container size={main} className={guide}>
          <section id="works" className="flex flex-col gap-4">
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
          </section>
        </Container>
      </main>
      <footer className="mt-auto border-t border-line">
        <Container size={main} className={`${guide} py-6`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Text size="sm" tone="subtle">
              © 2026 kazuemon
            </Text>
            <nav className="flex gap-4">
              <Link href="#rss">RSS</Link>
              <Link href="#github">GitHub</Link>
            </nav>
          </div>
        </Container>
      </footer>
    </div>
  );
}

/**
 * 画面の幅を固定した枠。Container は置いた場所の幅に従うので、ここで画面の幅を決める
 * scale で縮めて並べる（transform）。密度は外（ツールバーの「密度」か、比較の行）に従う
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
