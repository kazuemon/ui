'use client';

import { Children, type ReactNode, useState } from 'react';

import type { CarouselProps } from './CarouselBase';

// Carousel のいまの 1 枚（value・defaultValue・onValueChange）と、スライドの並び
// 送る仕組み（engine）はこの index を受けて動かし、指などで動いたら change で知らせる

const clamp = (value: number, count: number) =>
  Math.min(Math.max(value, 0), Math.max(count - 1, 0));

/** 空白だけの文字（MDX の改行など）はスライドにしない */
const isSlide = (child: ReactNode) => !(typeof child === 'string' && child.trim() === '');

export interface CarouselState {
  /** スライド（並べた子） */
  slides: ReactNode[];
  /** スライドの数 */
  count: number;
  /** いまの 1 枚（0 から数える） */
  index: number;
  /** いまの 1 枚を変える（範囲に収め、onValueChange を呼ぶ） */
  change: (next: number) => void;
}

/**
 * いまの 1 枚（value・defaultValue・onValueChange）を持つ。送る仕組み（engine）はこの値を受けて動かす
 */
export function useCarouselState({
  children,
  value,
  defaultValue = 0,
  onValueChange,
}: Pick<CarouselProps, 'children' | 'value' | 'defaultValue' | 'onValueChange'>): CarouselState {
  const slides = Children.toArray(children).filter(isSlide);
  const count = slides.length;
  const [state, setState] = useState(defaultValue);
  const index = clamp(value ?? state, count);
  const change = (next: number) => {
    const clamped = clamp(next, count);
    if (clamped === index) return;
    setState(clamped);
    onValueChange?.(clamped);
  };
  return { slides, count, index, change };
}
