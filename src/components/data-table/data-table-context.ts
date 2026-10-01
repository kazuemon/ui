'use client';

import { createContext } from 'react';

import type { ChoiceColor } from '../../internal/choice/choice-styles';
import type { DataTableStatusIndicator } from './DataTable';

// DataTable が中の選択の箱と行に渡す、選ぶ箱の色と、行の状態の見せ方
export const DataTableContext = createContext<{
  color: ChoiceColor;
  statusIndicator: DataTableStatusIndicator;
}>({ color: 'neutral', statusIndicator: 'fill' });
