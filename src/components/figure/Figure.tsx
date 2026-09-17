import type { ComponentProps, ReactNode } from 'react';
import type { VariantProps } from 'tailwind-variants';

import { figureImage } from './figure-styles';

export interface FigureProps
  extends Omit<ComponentProps<'img'>, 'alt' | 'src'>, VariantProps<typeof figureImage> {
  /** 画像の URL */
  src: string;
  /** 画像の代わりの文。飾りだけの画像は空文字にします */
  alt: string;
  /** キャプション。画像の下の中央に小さく出します。alt と同じ文にはしません */
  caption?: ReactNode;
  /**
   * 細い輪郭を付けるか。白っぽい画像が白地に溶けないように付けます。写真のように縁がはっきりした画像では外せます
   * @default true
   */
  outline?: boolean;
  /** figure 要素に付けるクラス。className は img に付きます */
  figureClassName?: string;
}

/**
 * 画像とキャプション
 */
export function Figure({
  src,
  alt,
  caption,
  outline,
  className,
  figureClassName,
  ...props
}: FigureProps) {
  return (
    <figure className={['m-0 flex flex-col gap-2', figureClassName].filter(Boolean).join(' ')}>
      <img src={src} alt={alt} className={figureImage({ outline, className })} {...props} />
      {caption != null && (
        <figcaption className="text-center text-body-sm text-fg-subtle">{caption}</figcaption>
      )}
    </figure>
  );
}
