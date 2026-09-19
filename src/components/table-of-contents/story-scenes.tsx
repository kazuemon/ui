import { type ReactNode, useCallback, useRef } from 'react';

import { Heading } from '../heading/Heading';
import { Text } from '../text/Text';
import type { SceneItem } from './story-items';

// ストーリーで使う場面（部品ではない）。スクロールする枠の中に、記事と、横に置く目次を並べる

const paragraph =
  '部品は自分がどこに置かれるかを知りません。知らないことは決めず、使う側に渡します。値は役割のトークンで持ち、部品の中だけで使う値は部品のトークンに分けます。';

const headingSize = { 2: 3, 3: 4, 4: 4 } as const;

/** 見出しと段落を並べた記事 */
export function Article({ items }: { items: SceneItem[] }) {
  return (
    <article className="flex min-w-0 flex-col gap-4">
      <Heading level={1} size={2}>
        デザインの決め方
      </Heading>
      {items.map((item) => (
        <div key={item.id} className="flex flex-col gap-3">
          <Heading id={item.id} level={item.level} size={headingSize[item.level]}>
            {item.text}
          </Heading>
          <Text>{paragraph}</Text>
        </div>
      ))}
    </article>
  );
}

/** 枠のスクロールの位置。数は上からの px、end は下の端 */
export type SceneScroll = number | 'end';

// 描いたあと、決めた位置までスクロールしておく。文字の読み込みで高さが変わっても置き直す
function useScrollTo(scroll: SceneScroll) {
  const observer = useRef<ResizeObserver | null>(null);
  return useCallback(
    (frame: HTMLDivElement | null) => {
      observer.current?.disconnect();
      observer.current = null;
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

/**
 * スクロールする枠。枠の高さは --scene-height で中身から読める（実際のページの 100dvh の代わり）
 */
export function SceneFrame({
  scroll = 0,
  width = 640,
  height = 360,
  children,
}: {
  scroll?: SceneScroll;
  width?: number;
  height?: number;
  children: ReactNode;
}) {
  const ref = useScrollTo(scroll);
  return (
    <div
      ref={ref}
      data-slot="toc-scene"
      className="max-w-full overflow-y-auto rounded-card border border-line bg-bg"
      style={{ width, height, ['--scene-height' as string]: `${height}px` }}
    >
      {/* 余白は中に置く（スクロールする枠に余白があると、留まる位置がその分ずれる） */}
      <div className="px-6 py-8">{children}</div>
    </div>
  );
}
