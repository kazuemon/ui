'use client';

import { createContext } from 'react';

/** 重なる面の読み上げの役割。alertdialog は、取り消せない操作の確かめ（AlertDialog） */
export type OverlayRole = 'dialog' | 'alertdialog';

// AlertDialog が Dialog を包んで、面の役割を alertdialog にする。Dialog は面を描いたあと、中身と下の操作には dialog を配り直す
// （中に置いた Dialog に alertdialog が写らないようにするため）
export const OverlayRoleContext = createContext<OverlayRole>('dialog');
