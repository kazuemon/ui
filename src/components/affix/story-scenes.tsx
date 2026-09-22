'use client';

import { type ReactNode, useCallback, useId, useRef } from 'react';

import { Button } from '../button/Button';
import { Container } from '../container/Container';
import { Heading } from '../heading/Heading';
import { Navbar, NavbarLink } from '../navbar/Navbar';
import { TableOfContents } from '../table-of-contents/TableOfContents';
import { Text } from '../text/Text';
import { Affix, type AffixProps } from './Affix';

// ストーリーで使う場面（部品ではない）。スクロールする枠の中に、貼り付けた Navbar と記事を置く

/** 枠のスクロールの位置。数は上からの px、end は下の端 */
export type SceneScroll = number | 'end';

// 描いたあと、決めた位置までスクロールしておく。文字の読み込みで高さが変わっても置き直す
function useScrollTo(scroll: SceneScroll) {
  const observer = useRef<ResizeObserver | null>(null);
  return useCallback(
    (frame: HTMLDivElement | null) => {
      observer.current?.disconnect();
      observer.current = null;
      // 上の端のままなら置き直さない（play でスクロールした位置を戻さないため）
      if (!frame || scroll === 0) return;
      const place = () => {
        frame.scrollTop = scroll === 'end' ? frame.scrollHeight : scroll;
      };
      place();
      requestAnimationFrame(place);
      observer.current = new ResizeObserver(() => requestAnimationFrame(place));
      for (const child of frame.children) observer.current.observe(child);
    },
    [scroll]
  );
}

const brand = (
  <a href="#top" className="flex items-center gap-2 text-fg no-underline">
    <span aria-hidden="true" className="size-6 rounded-lg bg-primary" />
    k6n
  </a>
);

const stop = (event: { preventDefault: () => void }) => event.preventDefault();

function Frame({
  scroll,
  width,
  height,
  children,
}: {
  scroll: SceneScroll;
  width: string;
  height: string;
  children: ReactNode;
}) {
  const ref = useScrollTo(scroll);
  return (
    <div
      ref={ref}
      data-slot="affix-scene"
      className={`${width} ${height} overflow-y-auto rounded-card border border-line bg-bg`}
    >
      <Navbar sticky brand={brand}>
        <NavbarLink href="#blog" current onClick={stop}>
          Blog
        </NavbarLink>
        <NavbarLink href="#works" onClick={stop}>
          Works
        </NavbarLink>
      </Navbar>
      {children}
    </div>
  );
}

const sections = [
  ['tokens', 'トークンの層'],
  ['density', '密度の切り替え'],
  ['motion', '動きの手応え'],
  ['reading', '読みやすさ'],
] as const;

const paragraph =
  '部品は自分がどこに置かれるかを知りません。知らないことは決めず、使う側に渡します。値は役割のトークンで持ち、部品の中だけで使う値は部品のトークンに分けます。';

// 見出しの id は場面ごとに変える（同じページに場面を 2 つ並べても、目次が隣の場面の見出しを読まないように）
function useSectionId() {
  const prefix = useId();
  return (id: string) => `${prefix}-${id}`;
}

function Sections({ sectionId }: { sectionId: (id: string) => string }) {
  return sections.map(([id, title]) => (
    <section key={id} id={sectionId(id)} className="flex flex-col gap-3">
      <Heading level={2} size={3}>
        {title}
      </Heading>
      <Text>{paragraph}</Text>
      <Text>{paragraph}</Text>
    </section>
  ));
}

/** 記事の横の目次。今の見出しはスクロールから求める */
function SceneToc({ sectionId }: { sectionId: (id: string) => string }) {
  return (
    <TableOfContents
      items={sections.map(([id, title]) => ({ id: sectionId(id), text: title, level: 2 }))}
    />
  );
}

interface SceneProps {
  scroll?: SceneScroll;
  width?: string;
  height?: string;
}

/**
 * 記事と、横に留まる目次、下に留まる「上へ戻る」。toc・backToTop に渡した props で、それぞれの Affix を変えられる
 */
export function ArticleScene({
  scroll = 0,
  width = 'w-[640px]',
  height = 'h-[360px]',
  toc = { belowNavbar: true },
  backToTop = true,
}: SceneProps & { toc?: AffixProps | false; backToTop?: boolean }) {
  const sectionId = useSectionId();
  return (
    <Frame scroll={scroll} width={width} height={height}>
      <Container>
        <div className={`grid ${toc ? 'grid-cols-[1fr_9rem]' : 'grid-cols-1'} gap-8 py-8`}>
          <article className="flex min-w-0 flex-col gap-8">
            <Heading level={1} size={2}>
              デザインの決め方
            </Heading>
            <Sections sectionId={sectionId} />
            {backToTop && (
              <Affix position="bottom" className="flex justify-end">
                <Button color="white" onClick={() => undefined}>
                  上へ戻る
                </Button>
              </Affix>
            )}
          </article>
          {toc && (
            <Affix render={<aside />} {...toc}>
              <SceneToc sectionId={sectionId} />
            </Affix>
          )}
        </div>
      </Container>
    </Frame>
  );
}

/**
 * 内容が下を通る帯（surface）。edge が top なら Navbar の下に、bottom なら画面の下に留める
 */
export function BarScene({
  scroll = 0,
  width = 'w-[640px]',
  height = 'h-[320px]',
  edge = 'top',
  surfaceEdge,
}: SceneProps & { edge?: 'top' | 'bottom'; surfaceEdge?: AffixProps['surfaceEdge'] }) {
  const sectionId = useSectionId();
  const bar = (
    <Affix surface surfaceEdge={surfaceEdge} position={edge} belowNavbar={edge === 'top'}>
      <Container>
        <div className="flex items-center justify-between gap-4 py-2">
          <span className="truncate text-sm font-bold text-fg">デザインの決め方</span>
          <Button variant="outline" onClick={() => undefined}>
            共有
          </Button>
        </div>
      </Container>
    </Affix>
  );
  return (
    <Frame scroll={scroll} width={width} height={height}>
      {edge === 'top' && bar}
      <Container>
        <div className="flex flex-col gap-8 py-8">
          <Sections sectionId={sectionId} />
        </div>
      </Container>
      {edge === 'bottom' && bar}
    </Frame>
  );
}
