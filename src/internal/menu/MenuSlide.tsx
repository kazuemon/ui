'use client';

import { type KeyboardEvent, type ReactNode, useEffect, useState } from 'react';

import { MenuSlideContext, type MenuSlideState, useMenuSlide } from './use-menu-slide';

// 1 枚のシートの中で入れ子のメニューを滑らせる、舞台とパネル（仕組みは use-menu-slide.ts）
export type MenuSlidePosition = 'current' | 'before' | 'after';

// パネルの動き。左右へ滑る長さは舞台の幅（パネルの幅）いっぱい
//   いまのパネル: 流れの中に置く（舞台の高さの基準）。見えるようにするのは動きの始めに
//   ほかのパネル: 舞台の上に重ね、左（親）か右（まだ開いていない子）の外に出す。隠すのは動きの終わりに
//   動きを減らす設定では滑らせず、すぐに入れ替える
const panelBase =
  'w-full p-(--menu-popup-padding) pb-[max(var(--menu-popup-padding),env(safe-area-inset-bottom))] outline-none';
const panelPosition: Record<MenuSlidePosition, string> = {
  current: 'relative visible translate-x-0',
  before: 'absolute inset-x-0 top-0 invisible -translate-x-full rtl:translate-x-full',
  after: 'absolute inset-x-0 top-0 invisible translate-x-full rtl:-translate-x-full',
};
const panelMotion: Record<MenuSlidePosition, string> = {
  current:
    'motion-safe:[transition:translate_var(--duration-sheet)_var(--ease-sheet),visibility_0s]',
  before:
    'motion-safe:[transition:translate_var(--duration-sheet)_var(--ease-sheet),visibility_0s_linear_var(--duration-sheet)]',
  after:
    'motion-safe:[transition:translate_var(--duration-sheet)_var(--ease-sheet),visibility_0s_linear_var(--duration-sheet)]',
};

/** 1 枚のパネル。id は入れ子のメニューの id（親のメニューのパネルは省く） */
export function MenuSlidePanel({
  id,
  depth,
  position,
  label,
  children,
}: {
  id?: string;
  depth: number;
  position: MenuSlidePosition;
  /** 読み上げのまとまりの名前（入れ子のメニューの題） */
  label?: string;
  children: ReactNode;
}) {
  const slide = useMenuSlide();
  const [panel, setPanel] = useState<HTMLDivElement | null>(null);
  const current = position === 'current';
  const reportHeight = slide?.reportHeight;
  const root = depth === 0;
  // いまのパネルと親のメニューのパネルの高さを舞台へ（中身が変わったときも追う）
  useEffect(() => {
    if (!panel || !(current || root) || !reportHeight) return undefined;
    const observer = new ResizeObserver(() => reportHeight(panel.offsetHeight, current, root));
    observer.observe(panel);
    return () => observer.disconnect();
  }, [panel, current, root, reportHeight]);
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // 入れ子のパネルでは、← で親へ戻る（浮かべる形で入れ子の面を閉じるのと同じキー）
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
    if (depth > 0 && current && event.key === (rtl ? 'ArrowRight' : 'ArrowLeft')) {
      event.preventDefault();
      event.stopPropagation();
      slide?.back();
    }
  };
  return (
    <div
      ref={setPanel}
      role={depth > 0 ? 'group' : undefined}
      aria-label={depth > 0 ? label : undefined}
      tabIndex={-1}
      data-slot="menu-panel"
      data-panel-id={id}
      data-position={position}
      onKeyDown={onKeyDown}
      className={[panelBase, panelPosition[position], slide?.animated && panelMotion[position]]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}

/** 舞台。いまのパネルの高さを書き、その変化を動かす。はみ出したパネル（滑っている途中）は切る */
export function MenuSlideStage({
  slide,
  children,
}: {
  slide: MenuSlideState;
  children: ReactNode;
}) {
  const { setStage, animated, fixed, height, rootHeight, path } = slide;
  // fixed では親のパネルより低くしない（高さは動かさない）
  const stageHeight =
    fixed && rootHeight != null && height != null ? Math.max(height, rootHeight) : height;
  return (
    <MenuSlideContext value={{ ...slide, depth: 0 }}>
      <div
        ref={setStage}
        data-slot="menu-stage"
        className={[
          'relative overflow-clip',
          animated &&
            !fixed &&
            'motion-safe:[transition:height_var(--duration-sheet)_var(--ease-sheet)]',
        ]
          .filter(Boolean)
          .join(' ')}
        style={stageHeight != null ? { height: stageHeight } : undefined}
      >
        <MenuSlidePanel depth={0} position={path.length === 0 ? 'current' : 'before'}>
          {children}
        </MenuSlidePanel>
      </div>
    </MenuSlideContext>
  );
}
