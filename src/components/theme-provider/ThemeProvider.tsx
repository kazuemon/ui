import { type ReactNode, useContext, useMemo } from 'react';

import type { OverlayPresentation } from '../../internal/sheet/use-narrow-screen';
import { type TransitionPreset, UIConfigContext } from '../../internal/ui-config';

export interface ThemeProviderProps {
  /**
   * 中の部品の密度。auto は入力方式（マウスか指か）に合わせます。fine・coarse は、入力方式にかかわらずその密度に固定します
   * @default 'auto'
   */
  density?: 'auto' | 'fine' | 'coarse';
  /**
   * 浮かぶ UI（Select・Dialog・Popover）の出し方の既定。部品の presentation を書いたときは、そちらが勝ちます
   * @default 'auto'
   */
  presentation?: OverlayPresentation;
  /**
   * 浮かぶ部分（選択肢・Dialog・Popover・Tooltip・Drawer）と Portal を描く場所の既定。部品の container を書いたときは、そちらが勝ちます
   * @default document.body
   */
  portalContainer?: HTMLElement | null;
  /**
   * Transition の preset を書かないときの出方。書かないときは、浮かぶ面と同じ出方（下から上へ）です
   */
  transitionPreset?: TransitionPreset;
  /**
   * 日付と数を書く言語（Time・RelativeTime・NumberFormat）。部品の locale を書いたときは、そちらが勝ちます
   * @default 'ja-JP'
   */
  locale?: string;
  /**
   * 時刻を書くタイムゾーン（Time・RelativeTime）。部品の timeZone を書いたときは、そちらが勝ちます
   * @default 'Asia/Tokyo'
   */
  timeZone?: string;
  children?: ReactNode;
}

/**
 * 中の部品に、密度・浮かぶ UI の出し方・描く場所・言語とタイムゾーンの既定をまとめて渡す入口
 *
 * 入れ子にでき、内側の ThemeProvider が書いた値だけが外側より勝ちます。
 */
export function ThemeProvider({
  density = 'auto',
  presentation,
  portalContainer,
  transitionPreset,
  locale,
  timeZone,
  children,
}: ThemeProviderProps) {
  const outer = useContext(UIConfigContext);
  const value = useMemo(
    () => ({
      presentation: presentation ?? outer.presentation,
      portalContainer: portalContainer !== undefined ? portalContainer : outer.portalContainer,
      transitionPreset: transitionPreset ?? outer.transitionPreset,
      locale: locale ?? outer.locale,
      timeZone: timeZone ?? outer.timeZone,
    }),
    [presentation, portalContainer, transitionPreset, locale, timeZone, outer]
  );
  const content = <UIConfigContext value={value}>{children}</UIConfigContext>;
  if (density === 'auto') return content;
  // 密度は data-density の付いた要素で決まる（src/styles/theme.css）。並べ方に影響しないよう、箱を作らない要素に付ける
  // 浮かぶ部分は、開いたときにこの祖先の密度を写す
  return (
    <div data-density={density} className="contents">
      {content}
    </div>
  );
}
