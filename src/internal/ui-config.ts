import { createContext, useContext } from 'react';

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
