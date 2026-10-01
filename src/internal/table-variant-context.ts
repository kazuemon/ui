'use client';

import { createContext } from 'react';

// Table・DataTable が、中に置いた部品へ渡す表の見た目（variant）
// SortableTableBody が読み、外枠のある表（framed）の中では、引いている行を大きくしない

/** 表の見た目。Table の TableVariant と同じ値 */
export type TableVariantValue = 'lines' | 'framed' | 'banded';

export const TableVariantContext = createContext<TableVariantValue | null>(null);
