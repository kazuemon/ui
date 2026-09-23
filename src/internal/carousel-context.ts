'use client';

import { createContext } from 'react';

// Carousel が、中に置いた Thumbnails（thumbnails の口）へ渡す「いまの 1 枚」と切り替え
// Thumbnails は value・onValueChange を渡されなければ、これを読んで Carousel と組む
// Gallery など、1 つを選んで見せるほかの部品も、同じ形で Thumbnails と組める

export interface CarouselSelection {
  /** いまの 1 枚（0 から数える） */
  value: number;
  /** 切り替える */
  onValueChange: (value: number) => void;
  /** n 枚目のスライドの id（Thumbnails の aria-controls）。スライドを持たない部品は渡さない */
  slideId?: (index: number) => string;
}

export const CarouselSelectionContext = createContext<CarouselSelection | null>(null);
