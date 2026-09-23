import type { RefCallback } from 'react';

// 「送る仕組み」のインターフェース。Carousel の見た目（CarouselBase.tsx の CarouselView: 枠・前へ・次へ・位置の印・Thumbnails の口）と、
// 送る仕組み（どの 1 枚を見せているか・その 1 枚へ送る・スクロールや指の動きとの同期）を分ける
//   いまの仕組みは scroll-snap（use-scroll-snap-engine.ts）。Embla Carousel などの外の仕組みも、同じ形の hook を書けば差し込める
//   いまの 1 枚（index）は useCarouselState が持つ（value・defaultValue・onValueChange）。仕組みは index を受けてその 1 枚へ送り、
//   指・ホイール・トラックパッドで動いたときは onIndexChange で知らせる

export interface CarouselEngineOptions {
  /** いまの 1 枚（0 から数える）。変わったら、その 1 枚へ送る */
  index: number;
  /** スライドの数 */
  count: number;
  /** 指・ホイール・トラックパッドなど、仕組みの側で動いたときに、止まる先の 1 枚を知らせる */
  onIndexChange: (index: number) => void;
}

export interface CarouselEngine {
  /**
   * 枠の動かし方。scroll は枠そのものが横にスクロールする（scroll-snap）。
   * transform は枠を切り取り、中の並びを仕組みが動かす（Embla など）
   */
  mode: 'scroll' | 'transform';
  /** 枠（並びを包む要素）に付ける ref（コールバック） */
  bindViewport: RefCallback<HTMLDivElement>;
  /** 前へ送れるか。書かないときは、いまの 1 枚が最初でなければ送れる（端でつながる仕組みは true を返す） */
  canPrev?: boolean;
  /** 次へ送れるか。書かないときは、いまの 1 枚が最後でなければ送れる */
  canNext?: boolean;
}

/** 送る仕組みの hook。Carousel（と、ほかの仕組みで組んだ Carousel）が、描くたびに 1 回呼ぶ */
export type UseCarouselEngine = (options: CarouselEngineOptions) => CarouselEngine;
