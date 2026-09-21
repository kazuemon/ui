'use client';

import type { ComponentProps, ReactNode, Ref, UIEventHandler } from 'react';

import { ScrollFrame } from '../../internal/ScrollFrame';

// スクロールする枠 — 軸 93。中身と見た目は internal/ScrollFrame.tsx・internal/scroll-area-styles.ts
//   （部品の中でスクロールさせる場所（TagsInput の欄・Autocomplete の候補）とも共有する）

export type ScrollAreaScrollbar = 'scroll' | 'always';

/** つまみを出す向き。both は縦横、vertical は縦だけ、horizontal は横だけ */
export type ScrollAreaOrientation = 'both' | 'vertical' | 'horizontal';

export interface ScrollAreaProps {
  /** 枠の中に置く中身。はみ出した分がスクロールします */
  children?: ReactNode;
  /**
   * 枠（いちばん外の要素）に付きます。高さ（h-*・max-h-*）か幅を決めて、はみ出した分をスクロールさせます
   */
  className?: string;
  /**
   * 中身を包む要素に渡す props。内側の余白（p-*）は `contentProps` の className に付けます。
   * className は部品の見た目に重ねます
   */
  contentProps?: ComponentProps<'div'>;
  /**
   * スクロールする要素（Viewport）に渡す props。スクロールの位置を読む・変えるときは `viewportProps.ref` を使います。
   * className は部品の見た目に重ねます
   */
  viewportProps?: ComponentProps<'div'>;
  /**
   * 続きがある端の内側の影を消します。影を消すと、代わりにつまみをいつも出します（`scrollbar` は効きません）
   * @default false
   */
  hideEdgeShadow?: boolean;
  /**
   * つまみの出し方。scroll は枠にマウスを載せたとき・スクロールしているあいだ・キーボードで止まったときだけ、always はいつも出します。
   * `hideEdgeShadow` のときは、指定にかかわらずいつも出します
   * @default 'scroll'
   */
  scrollbar?: ScrollAreaScrollbar;
  /**
   * つまみを出す向き。both は縦横、vertical は縦だけ、horizontal は横だけです
   * @default 'both'
   */
  orientation?: ScrollAreaOrientation;
  /**
   * 枠の読み上げの名前。付けると、枠は名前付きの領域（region）になり、キーボードで止まったときに読み上げられます
   */
  accessibleName?: string;
  /** スクロールしたときに呼ばれます（スクロールする要素の onScroll） */
  onScroll?: UIEventHandler<HTMLDivElement>;
  /** 枠（いちばん外の要素）に付きます */
  ref?: Ref<HTMLDivElement>;
}

/**
 * 決まった大きさの枠の中で、中身をスクロールさせます。
 * 続きがあることは端の内側の影で見せ、つまみは枠に載せたときとスクロールしているあいだに出します
 */
export function ScrollArea({
  children,
  className,
  contentProps,
  viewportProps,
  hideEdgeShadow = false,
  scrollbar = 'scroll',
  orientation = 'both',
  accessibleName,
  onScroll,
  ref,
}: ScrollAreaProps) {
  return (
    <ScrollFrame
      ref={ref}
      className={className}
      contentProps={contentProps}
      viewportProps={onScroll ? { ...viewportProps, onScroll } : viewportProps}
      edgeShadow={!hideEdgeShadow}
      // 影がないときは、つまみで続きを伝える
      scrollbar={hideEdgeShadow ? 'always' : scrollbar}
      orientation={orientation}
      label={accessibleName}
    >
      {children}
    </ScrollFrame>
  );
}
