'use client';

import { createContext } from 'react';

import type { FieldLabelLayoutProps } from './Field';

// 中の欄のラベルの置き方の既定（FieldGroup・Form が入れる）。欄の props が勝つ
export type FieldLayout = FieldLabelLayoutProps;

export const FieldLayoutContext = createContext<FieldLayout>({});
