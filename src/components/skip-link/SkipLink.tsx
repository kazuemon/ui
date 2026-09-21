'use client';

import { useRender } from '@base-ui/react/use-render';
import type { ComponentProps, ReactElement, ReactNode } from 'react';

import { focusRing } from '../../internal/focus-styles';
import { tv } from '../../internal/tv';

// 「本文へ移動」のリンク — 軸 99
//   ふだんは読み上げにだけ届け（VisuallyHidden と同じ sr-only）、フォーカスしたときだけ画面の上に重ねる
//   フォーカスしたときに、sr-only が付けた寸法・位置・切り抜きを focus: で上書きする。not-sr-only は位置を static にし、余白も 0 にするので使わない
//   not-focus:sr-only（:not(:focus)）にしないのは、storybook-addon-pseudo-states が :not の中を「:not(:focus), :not(.pseudo-focus)」に書き換え、
//     フォーカスしても隠れたままになるため
//   ページの上に重なる面なので、面・輪郭・影は浮かぶ面と同じ（原則1）。リンクの小物なので角は pill（原則5）
//   文字はリンクと同じ Primary の青と淡い下線。hover で下線だけ濃くする（design/adr/0030）
//   フォーカスの線は focusRing（design/adr/0031）。線の色は既定で Primary（--skip-link-focus-ring-color）
//   位置・角・面の色は --skip-link-*（design/tokens.css）
const skipLink = tv({
  base: [
    'sr-only',
    'focus:fixed focus:top-(--skip-link-top) focus:right-(--skip-link-right) focus:left-(--skip-link-left) focus:z-50',
    'focus:m-0 focus:h-auto focus:w-auto focus:overflow-visible focus:whitespace-normal focus:[clip-path:none]',
    'focus:flex focus:min-h-(--spacing-control) focus:items-center focus:border-(length:--border-width-thin) focus:px-(--spacing-control-x) focus:py-1',
    'rounded-(--skip-link-radius) border-(color:--skip-link-line) bg-(color:--skip-link-bg) shadow-(--skip-link-shadow)',
    'text-(length:--text-control) leading-(--leading-control) font-bold text-(color:--skip-link-fg)',
    'underline [text-decoration-color:var(--color-link-underline)] decoration-1 underline-offset-4 hover:[text-decoration-color:var(--color-link-underline-hover)]',
    '[--color-own-focus:var(--skip-link-focus-ring-color)] [--focus-ring-offset:var(--skip-link-focus-ring-offset)]',
    ...focusRing,
    '[transition:text-decoration-color_var(--link-underline-duration)_var(--link-underline-ease),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)]',
    'motion-reduce:[transition:none]',
  ],
});

export interface SkipLinkProps extends ComponentProps<'a'> {
  /**
   * 移り先。本文の要素（`<main id="main">` など）の id を `#` 付きで渡します
   * @default '#main'
   */
  href?: string;
  /** 描く要素（Base UI の render と同じ）。ルーターのリンクを渡すときに使います */
  render?: ReactElement;
  /**
   * リンクの文字
   * @default '本文へ移動'
   */
  children?: ReactNode;
  /** リンク（a）に付きます */
  className?: string;
}

/**
 * 本文へ移るリンク。ふだんは見えず、Tab でフォーカスしたときだけ画面の左上に出ます
 *
 * ページの最初（ヘッダーより前）に置き、移り先の要素に同じ id を付けます。
 */
export function SkipLink({
  href = '#main',
  children = '本文へ移動',
  className,
  render,
  ...props
}: SkipLinkProps) {
  return useRender({
    render,
    defaultTagName: 'a',
    props: {
      ...props,
      href,
      children,
      'data-slot': 'skip-link',
      className: skipLink({ className }),
    },
  });
}
