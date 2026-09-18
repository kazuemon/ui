import type { ReactNode } from 'react';

import { Image, type ImageProps } from '../image/Image';

// 画像とキャプション（軸 59）。画像の部分は Image（読み込み中の面・失敗の表示・render・ratio・outline を持つ）
// キャプションは中央、注記の大きさ・--color-fg-subtle

export interface FigureProps extends ImageProps {
  /** キャプション。画像の下の中央に小さく出します。alt と同じ文にはしません */
  caption?: ReactNode;
  /** figure 要素に付けるクラス。className は画像の要素に付きます */
  figureClassName?: string;
}

/**
 * 画像とキャプション
 *
 * 画像の props（`src`・`alt`・`render`・`ratio`・`outline` など）は Image と同じです。
 * Next.js の Image は `render` に渡します。Astro では `getImage()` で作った `src`・`srcSet` などを、そのまま Figure に渡します。
 */
export function Figure({ caption, figureClassName, ...props }: FigureProps) {
  return (
    <figure className={['m-0 flex flex-col gap-2', figureClassName].filter(Boolean).join(' ')}>
      <Image {...props} />
      {caption != null && (
        <figcaption className="text-center text-body-sm text-fg-subtle">{caption}</figcaption>
      )}
    </figure>
  );
}
