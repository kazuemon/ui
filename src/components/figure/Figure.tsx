'use client';

import type { ComponentProps, ReactNode } from 'react';

import { tv } from '../../internal/tv';
import { Image, type ImageProps } from '../image/Image';

// 画像とキャプション（軸 59）。画像の部分は Image（読み込み中の面・失敗の表示・render・ratio・hideOutline を持つ）
// キャプションは注記の大きさ・--color-fg-subtle。寄せは既定が中央で、captionAlign で左（start）・右（end）にも寄せられる
// キャプションを付けない画像は、Figure ではなく Image を使う（figure・figcaption を出さない）

const figure = tv({ base: 'm-0 flex flex-col gap-2' });

const figureCaption = tv({
  base: 'text-body-sm text-fg-subtle',
  variants: { align: { start: 'text-start', center: 'text-center', end: 'text-end' } },
  defaultVariants: { align: 'center' },
});

/** キャプションの寄せ */
export type FigureCaptionAlign = 'start' | 'center' | 'end';

/** 画像の下のキャプション（ImageZoom・Video・Gallery もキャプションを付けるときに使う）。寄せは中央 */
export const figureCaptionClass = figureCaption();

/** figure の要素に付けるクラス（ImageZoom もキャプションを付けるときに使う） */
export const figureClass = (className?: string) => figure({ className });

export interface FigureProps extends ImageProps {
  /** キャプション。画像の下に小さく出します。alt と同じ文にはしません */
  caption?: ReactNode;
  /**
   * キャプションの寄せ。center は画像の中央、start は画像の左端、end は右端にそろえます。
   * 本文の幅いっぱいの画像で、本文と左端をそろえたいときは start にします
   * @default 'center'
   */
  captionAlign?: FigureCaptionAlign;
  /** 外側の figure 要素に渡す props。className は画像の要素に付きます */
  figureProps?: ComponentProps<'figure'>;
  /** 画像の要素に付きます。figure に付けるクラスは figureProps の className に渡します */
  className?: string;
}

/**
 * 画像とキャプション
 *
 * 画像の props（`src`・`alt`・`render`・`ratio`・`hideOutline` など）は Image と同じです。
 * キャプションを付けない画像は、`figure` を出さない `Image` を使います。
 * Next.js の Image は `render` に渡します。Astro では `getImage()` で作った `src`・`srcSet` などを、そのまま Figure に渡します。
 */
export function Figure({ caption, captionAlign = 'center', figureProps, ...props }: FigureProps) {
  return (
    <figure {...figureProps} className={figureClass(figureProps?.className)}>
      <Image {...props} />
      {caption != null && (
        <figcaption className={figureCaption({ align: captionAlign })}>{caption}</figcaption>
      )}
    </figure>
  );
}
