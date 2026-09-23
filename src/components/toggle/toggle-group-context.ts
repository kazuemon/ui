'use client';

import { createContext } from 'react';

import type { ToggleColor, ToggleVariant } from './Toggle';

/** ToggleGroup が中の Toggle に渡すもの。null ならグループの外（1つだけ置いた Toggle） */
export const ToggleGroupContext = createContext<{
  color?: ToggleColor;
  variant?: ToggleVariant;
} | null>(null);
