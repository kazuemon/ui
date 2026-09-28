'use client';

import { createContext } from 'react';

import type { FieldLabelLayoutProps } from './Field';

// 中の欄のラベルの置き方の既定（FieldGroup が入れる）。欄の props が勝つ
export interface FieldLayout extends FieldLabelLayoutProps {
  /** FieldGroup の中か。中では、見えるラベルのない欄も横の並べ方のまま（本体の列をそろえる） */
  group?: boolean;
}

export const FieldLayoutContext = createContext<FieldLayout>({});
