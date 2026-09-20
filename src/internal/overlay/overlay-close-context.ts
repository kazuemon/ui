'use client';

import { createContext } from 'react';

// 重なる面（Dialog・Drawer・Popover）を閉じる。面の出し方（浮かぶ・シート）で Base UI の部品が変わっても、同じ部品で閉じられるよう、
// 面の側が閉じる関数を context で配る（OverlayClose が読む）
export const OverlayCloseContext = createContext<(() => void) | null>(null);
