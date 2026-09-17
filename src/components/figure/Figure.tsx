import { useRender } from '@base-ui/react/use-render';
import type { ComponentProps, ReactElement, ReactNode } from 'react';
import type { VariantProps } from 'tailwind-variants';

import { figureImage } from './figure-styles';

export interface FigureProps
  extends Omit<ComponentProps<'img'>, 'alt' | 'src'>, VariantProps<typeof figureImage> {
  /** 画像の URL。render を渡すときは、渡す要素に書きます */
  src?: string;
  /** 画像の代わりの文。飾りだけの画像は空文字にします。render を渡すときは、渡す要素に書きます */
  alt?: string;
  /**
   * 描く画像の要素（Base UI の render と同じ）。Next.js の Image などを渡すと、その要素に Figure の画像の見た目を重ねます。
   * src・alt・width などは渡す要素に書きます（例: `render={<Image src={photo} alt="…" />}`）
   * 渡さないときは `<img>` を描きます（src と alt は Figure に書きます）
   */
  render?: ReactElement;
  /** キャプション。画像の下の中央に小さく出します。alt と同じ文にはしません */
  caption?: ReactNode;
  /**
   * 細い輪郭を付けるか。白っぽい画像が白地に溶けないように付けます。写真のように縁がはっきりした画像では外せます
   * @default true
   */
  outline?: boolean;
  /** figure 要素に付けるクラス。className は画像の要素に付きます */
  figureClassName?: string;
}

/**
 * 画像とキャプション
 *
 * Next.js の Image は `render` に渡します。Astro では `getImage()` で作った `src`・`srcSet` などを、そのまま Figure に渡します。
 */
export function Figure({
  caption,
  outline,
  className,
  figureClassName,
  render,
  ...props
}: FigureProps) {
  // render を渡したときは、その要素の props（src・alt など）が勝ち、className はつなげる
  const image = useRender({
    render,
    defaultTagName: 'img',
    props: { ...props, className: figureImage({ outline, className }) },
  });
  return (
    <figure className={['m-0 flex flex-col gap-2', figureClassName].filter(Boolean).join(' ')}>
      {image}
      {caption != null && (
        <figcaption className="text-center text-body-sm text-fg-subtle">{caption}</figcaption>
      )}
    </figure>
  );
}
