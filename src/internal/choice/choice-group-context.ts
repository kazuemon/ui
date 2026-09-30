'use client';

import { createContext } from 'react';

import type { ChoiceColor } from './choice-styles';

/**
 * CheckboxGroup・RadioGroup が中の選択肢に渡すもの。null ならグループの外（1つだけ置いた Checkbox）
 * form: 中の箱の隠れた input が属するフォームの id（CheckboxGroup の form）
 */
export const ChoiceGroupContext = createContext<{
  color?: ChoiceColor;
  readOnly?: boolean;
  form?: string;
} | null>(null);
