'use client';

import { useRender } from '@base-ui/react/use-render';
import type { ComponentProps, ReactElement } from 'react';

import { tv } from '../../internal/tv';

// 本文の幅と左右の余白を決める枠 — 軸 94
//   幅は中身の幅（余白を除く）で持ち、中央に寄せる。読みもの（prose）は 1 行の字数を抑えて読みやすさを優先する（原則11）
//   左右の余白は、画面の端に部品が付かないためのもの。押すものではないので入力方式では変えず、置いた場所の幅に比例させる（--container-gutter-size）
//   遊び（背景の大きな文字など）は Container の外側に置く（原則9）。Container は幅と余白だけを持ち、見た目を持たない
const container = tv({
  base: [
    'mx-auto w-full max-w-[calc(var(--container-width)+var(--container-gutter)*2)]',
    // 左右の余白。中の要素も --container-gutter で読める（% を含むので、読む要素の親の幅で解決される点に注意）
    'px-(--container-gutter) [--container-gutter:var(--container-gutter-size)]',
  ],
  variants: {
    // 幅の上限は、中身の幅に左右の余白を足したもの。いまの中身の幅の上限を --container-width で中に渡す
    size: {
      prose: '[--container-width:var(--container-width-prose)]',
      default: '[--container-width:var(--container-width-default)]',
      wide: '[--container-width:var(--container-width-wide)]',
      full: 'max-w-none [--container-width:none]',
    },
  },
  defaultVariants: { size: 'default' },
});

export type ContainerSize = 'prose' | 'default' | 'wide' | 'full';

export interface ContainerProps extends ComponentProps<'div'> {
  /**
   * 中身の幅の上限。prose は記事のような読みもの、default はカードの一覧や設定の画面、wide は表や画像を大きく並べる画面、
   * full は上限なし（左右の余白だけ）です。画面がそれより狭いときは、画面の幅から左右の余白を引いた幅になります
   * @default 'default'
   */
  size?: ContainerSize;
  /** 描く要素（Base UI の render と同じ）。main・section などにするときは `render={<main />}` を渡します */
  render?: ReactElement;
}

/**
 * ページの本文の幅と左右の余白を決める枠。中央に寄せ、画面の端に部品が付かないよう左右を空けます
 */
export function Container({ size, className, render, ...props }: ContainerProps) {
  return useRender({
    render,
    defaultTagName: 'div',
    props: { ...props, 'data-slot': 'container', className: container({ size, className }) },
  });
}
