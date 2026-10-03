'use client';

import { useRender } from '@base-ui/react/use-render';
import type { ComponentProps, ReactElement, ReactNode } from 'react';

/** 画像・動画の収め方。cover は枠に合わせてはみ出た分を切り、contain は切らずに枠へ収めて余白を残します */
export type MediaFit = 'cover' | 'contain';

export interface AspectRatioProps extends ComponentProps<'div'> {
  /**
   * 幅に対する高さの比。16 / 9 のような数か、'16 / 9' の文字で書きます
   * @default 16 / 9
   */
  ratio?: number | string;
  /**
   * 最初の子の画像・動画の収め方。cover ははみ出た分を切り、contain は切らずに収めて余白を残します
   * @default 'cover'
   */
  fit?: MediaFit;
  /** 描く要素（Base UI の render と同じ）。既定は div です */
  render?: ReactElement;
  /** 枠の中に入れるもの（画像・動画・埋め込み）。最初の子が枠いっぱいに広がります。2 つ目からの子（重ねる印など）は、置き方を自分で決めます */
  children?: ReactNode;
  /** 枠の要素（render を渡したときはその要素）に付きます */
  className?: string;
}

/**
 * 幅に合わせて、決まった比の高さを取る枠
 *
 * 最初の子の画像・動画・埋め込みを、枠いっぱいに広げます（画像ははみ出た分を切ります。fit で変えられます）。
 * 読み込む前から高さが決まるので、読み込んだときに下の内容が跳びません。
 */
export function AspectRatio({
  ratio = 16 / 9,
  fit = 'cover',
  className,
  style,
  render,
  ...props
}: AspectRatioProps) {
  return useRender({
    render,
    defaultTagName: 'div',
    props: {
      ...props,
      // 最初の子を枠いっぱいに広げる。2 つ目からの子（重ねる印・読み込み中の面）は、自分で置き方を決める
      // 詳細度は子の 1 クラスと同じ（:where）。ただし同じ詳細度では variant 付きのこのクラスが後に出て勝つので、
      // 子の側で変えるときは variant 付きのクラス（Image の group-data-natural のような）か style で上書きする
      className: [
        'relative w-full overflow-hidden [&>:where(:first-child)]:absolute [&>:where(:first-child)]:inset-0 [&>:where(:first-child)]:size-full',
        fit === 'contain'
          ? '[&>:where(:first-child)]:object-contain'
          : '[&>:where(:first-child)]:object-cover',
        className,
      ]
        .filter(Boolean)
        .join(' '),
      style: { aspectRatio: String(ratio), ...style },
    },
  });
}
