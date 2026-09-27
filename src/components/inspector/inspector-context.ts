'use client';

import { createContext, type RefObject, use } from 'react';

// InspectorLayout が持つ開閉の状態を、Inspector（パネル）と InspectorTrigger（開閉のボタン）に配る
export interface InspectorContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  /** パネルの id（InspectorTrigger の aria-controls） */
  panelId: string;
  /** 最後に押した開閉のボタン。パネルの中にフォーカスがあるまま閉じたときに、ここへ戻す */
  triggerRef: RefObject<HTMLElement | null>;
  /** 押した開閉のボタンを覚える（InspectorTrigger が呼ぶ） */
  rememberTrigger: (trigger: HTMLElement) => void;
}

export const InspectorContext = createContext<InspectorContextValue | null>(null);

export function useInspectorContext(part: string) {
  const context = use(InspectorContext);
  if (!context) {
    throw new Error(`${part} は InspectorLayout の中に置いてください`);
  }
  return context;
}
