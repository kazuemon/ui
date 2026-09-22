'use client';

import { useRender } from '@base-ui/react/use-render';
import type { ComponentProps, ReactElement, ReactNode } from 'react';

import { tv } from '../../internal/tv';

// 画面には出さず、読み上げにだけ届ける。focusable は、キーボードでフォーカスが来たときだけ見せる（本文へ飛ぶリンクなど）
const visuallyHidden = tv({
  base: 'sr-only',
  variants: {
    focusable: {
      true: 'focus-visible:not-sr-only',
      false: '',
    },
  },
  defaultVariants: { focusable: false },
});

export interface VisuallyHiddenProps extends ComponentProps<'span'> {
  /**
   * キーボードでフォーカスが来たときだけ見せるか。本文へ飛ぶリンクのように、Tab で止まる要素を render に渡すときに使います
   * @default false
   */
  focusable?: boolean;
  /** 描く要素（Base UI の render と同じ）。既定は span です */
  render?: ReactElement;
  /** 読み上げにだけ届ける文字 */
  children?: ReactNode;
  /** 包む要素（span。render を渡したときはその要素）に付きます */
  className?: string;
}

/**
 * 画面には出さず、読み上げにだけ届ける文字
 *
 * アイコンだけのボタンの名前、表の見出しを持たない列の説明、「新しいタブで開きます」のような補足に使います。
 * 名前だけなら aria-label でも足ります。文の途中に補足を挟むときや、見えている文字に続けて読ませたいときに使います。
 */
export function VisuallyHidden({ focusable, className, render, ...props }: VisuallyHiddenProps) {
  return useRender({
    render,
    defaultTagName: 'span',
    props: { ...props, className: visuallyHidden({ focusable, className }) },
  });
}
