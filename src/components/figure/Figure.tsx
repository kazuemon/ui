'use client';

import type { ComponentProps, ReactNode } from 'react';

import { tv } from '../../internal/tv';
import { Image, type ImageProps } from '../image/Image';

// 画像とキャプション（軸 59）。画像の部分は Image（読み込み中の面・失敗の表示・render・ratio・hideOutline を持つ）
// キャプションは中央、注記の大きさ・--color-fg-subtle
// キャプションを付けない画像は、Figure ではなく Image を使う（figure・figcaption を出さない）

const figure = tv({ base: 'm-0 flex flex-col gap-2' });

export interface FigureProps extends ImageProps {
  /** キャプション。画像の下の中央に小さく出します。alt と同じ文にはしません */
  caption?: ReactNode;
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
export function Figure({ caption, figureProps, ...props }: FigureProps) {
  return (
    <figure {...figureProps} className={figure({ className: figureProps?.className })}>
      <Image {...props} />
      {caption != null && (
        <figcaption className="text-center text-body-sm text-fg-subtle">{caption}</figcaption>
      )}
    </figure>
  );
}
