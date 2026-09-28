'use client';

import { createContext } from 'react';

import type { ChoiceColor } from '../../internal/choice/choice-styles';

// DataTable が中の選択の箱に渡す色
export const DataTableContext = createContext<{ color: ChoiceColor }>({ color: 'neutral' });
