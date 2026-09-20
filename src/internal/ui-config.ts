'use client';

import { createContext, useContext } from 'react';

import type { OptionalMark, RequiredMark } from './field/FieldMark';
import type { OverlayPresentation } from './sheet/use-narrow-screen';

/** Transition の出方。preset を書かないときの既定を ThemeProvider で変えられる */
export type TransitionPreset = 'fade' | 'fade-up' | 'fade-down' | 'scale' | 'collapse';

// ThemeProvider が中の部品に渡す既定。部品の props は、いつもこちらより強い
export interface UIConfig {
  /** 浮かぶ UI（Select・Dialog・Popover）の出し方の既定 */
  presentation?: OverlayPresentation;
  /** 浮かぶ部分と Portal を描く場所の既定 */
  portalContainer?: HTMLElement | null;
  /** Transition の preset を書かないときの出方 */
  transitionPreset?: TransitionPreset;
  /** 日付・数を書く言語（Time・RelativeTime・NumberFormat） */
  locale?: string;
  /** 時刻を書くタイムゾーン（Time・RelativeTime） */
  timeZone?: string;
  /** 必須の欄のラベルに出す印の既定（Field を通る部品） */
  requiredMark?: RequiredMark;
  /** 任意の欄のラベルに出す印の既定（Field を通る部品） */
  optionalMark?: OptionalMark;
}

export const UIConfigContext = createContext<UIConfig>({});

export function useUIConfig() {
  return useContext(UIConfigContext);
}

/** 部品の container と ThemeProvider の portalContainer から、描く場所を決める。どちらもなければ undefined（document.body） */
export function usePortalContainer(container: HTMLElement | null | undefined) {
  const config = useUIConfig();
  return container ?? config.portalContainer ?? undefined;
}
