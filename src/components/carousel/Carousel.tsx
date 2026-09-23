'use client';

import { type CarouselProps, CarouselView } from './CarouselBase';
import { useCarouselState } from './use-carousel-state';
import { useScrollSnapEngine } from './use-scroll-snap-engine';

export type { CarouselControlsPosition, CarouselIndicator, CarouselProps } from './CarouselBase';

/**
 * 横に送って 1 枚ずつ見せる並び。作品のスクリーンショットや、記事の中の数枚の画像に使います
 *
 * 並べた子の 1 つずつが 1 枚になります。指・トラックパッドの横スクロール、前へ・次へのボタン、
 * 枠にフォーカスしたときの ←→ で送ります。端でつながる送り方と、自動で送る動きは持ちません。
 * `thumbnails` に Thumbnails を渡すと、小さな画像の帯で、いまの 1 枚を示して切り替えられます。
 */
export function Carousel({
  children,
  value,
  defaultValue,
  onValueChange,
  ...props
}: CarouselProps) {
  const state = useCarouselState({ children, value, defaultValue, onValueChange });
  // 送る仕組みは scroll-snap。ほかの仕組み（Embla など）は、同じ形の hook を呼んで CarouselView に渡す
  const engine = useScrollSnapEngine({
    index: state.index,
    count: state.count,
    onIndexChange: state.change,
  });
  return <CarouselView {...props} state={state} engine={engine} />;
}
