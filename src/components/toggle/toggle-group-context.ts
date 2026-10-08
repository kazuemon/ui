'use client';

import { createContext } from 'react';

import type { ToggleColor, ToggleSize, ToggleVariant } from './Toggle';

/** ToggleGroup が中の Toggle に渡すもの。null ならグループの外（1つだけ置いた Toggle） */
export const ToggleGroupContext = createContext<{
  color?: ToggleColor;
  variant?: ToggleVariant;
  size?: ToggleSize;
} | null>(null);
