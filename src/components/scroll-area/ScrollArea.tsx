'use client';

import { type ReactNode, type Ref, useImperativeHandle, useState } from 'react';

import { ScrollFrame } from '../../internal/ScrollFrame';

// スクロールする枠 — 軸 93。中身と見た目は internal/ScrollFrame.tsx・internal/scroll-area-styles.ts
//   （部品の中でスクロールさせる場所（TagsInput の欄・Autocomplete の候補）とも共有する）

export type ScrollAreaScrollbar = 'scroll' | 'always';

export interface ScrollAreaProps {
  /** 中身 */
  children?: ReactNode;
  /**
   * 枠に足すクラス。高さ（h-*・max-h-*）か幅を決めて、はみ出した分をスクロールさせます
   */
  className?: string;
  /** 中身を包む要素に足すクラス。内側の余白（p-*）はここに付けます */
  contentClassName?: string;
  /**
   * 続きがある端に、内側の影を落とします。false にすると影を出さず、代わりにつまみをいつも出します（`scrollbar` は効きません）
   * @default true
   */
  edgeShadow?: boolean;
  /**
   * つまみの出し方。scroll は枠にマウスを載せたとき・スクロールしているあいだ・キーボードで止まったときだけ、always はいつも出します。
   * `edgeShadow={false}` のときは、指定にかかわらずいつも出します
   * @default 'scroll'
   */
  scrollbar?: ScrollAreaScrollbar;
  /**
   * 枠の名前。キーボードで止まったときに読み上げられます。付けると、枠は名前付きの領域（region）になります
   */
  label?: string;
  /** スクロールする要素。スクロールの位置を読む・変えるときに使います */
  viewportRef?: Ref<HTMLDivElement>;
}

/**
 * 決まった大きさの枠の中で、中身をスクロールさせます。
 * 続きがあることは端の内側の影で見せ、つまみは枠に載せたときとスクロールしているあいだに出します
 */
export function ScrollArea({
  children,
  className,
  contentClassName,
  edgeShadow = true,
  scrollbar = 'scroll',
  label,
  viewportRef,
}: ScrollAreaProps) {
  // スクロールする要素を、使う側の viewportRef に渡す
  const [viewport, setViewport] = useState<HTMLDivElement | null>(null);
  useImperativeHandle<HTMLDivElement | null, HTMLDivElement | null>(viewportRef, () => viewport, [
    viewport,
  ]);
  return (
    <ScrollFrame
      className={className}
      contentClassName={contentClassName}
      edgeShadow={edgeShadow}
      // 影がないときは、つまみで続きを伝える
      scrollbar={edgeShadow ? scrollbar : 'always'}
      label={label}
      onViewport={setViewport}
    >
      {children}
    </ScrollFrame>
  );
}
