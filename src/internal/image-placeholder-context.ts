'use client';

import { createContext } from 'react';

import type { skeletonMotion } from './skeleton-styles';

/**
 * Image の読み込むまでの面の動き。並べて置く部品（Gallery）が、中の Image に渡す（軸 411）
 * null なら、Image だけで置いたとき（面ごとの光。sweep）
 */
export const ImagePlaceholderAnimationContext = createContext<keyof typeof skeletonMotion | null>(
  null
);
