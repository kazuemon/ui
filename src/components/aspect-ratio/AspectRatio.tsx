'use client';

import { useRender } from '@base-ui/react/use-render';
import type { ComponentProps, ReactElement, ReactNode } from 'react';
import { SCOPE_CLASS } from '../../internal/tv';

export interface AspectRatioProps extends ComponentProps<'div'> {
  /**
   * 幅に対する高さの比。16 / 9 のような数か、'16 / 9' の文字で書きます
   * @default 16 / 9
   */
  ratio?: number | string;
  /** 描く要素（Base UI の render と同じ）。既定は div です */
  render?: ReactElement;
  /** 枠の中に入れるもの（画像・動画・埋め込み）。枠いっぱいに広がります */
  children?: ReactNode;
  /** 枠の要素（render を渡したときはその要素）に付きます */
  className?: string;
}

/**
 * 幅に合わせて、決まった比の高さを取る枠
 *
 * 中の画像・動画・埋め込みは、枠いっぱいに広げます（画像ははみ出た分を切ります）。
 * 読み込む前から高さが決まるので、読み込んだときに下の内容が跳びません。
 */
export function AspectRatio({
  ratio = 16 / 9,
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
      // 中身は枠いっぱい。img・video は切り取って埋める
      className: [
        SCOPE_CLASS,
        'relative w-full overflow-hidden *:absolute *:inset-0 *:size-full [&>img]:object-cover [&>video]:object-cover',
        className,
      ]
        .filter(Boolean)
        .join(' '),
      style: { aspectRatio: String(ratio), ...style },
    },
  });
}
