'use client';

import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { use } from 'react';

import { OverlayCloseContext } from './overlay-close-context';

export type OverlayCloseProps = useRender.ComponentProps<'button'>;

/** 押すと、いちばん近い Dialog・Drawer・Popover を閉じる。Button などの要素を render に渡す */
export function OverlayClose({ render, ...props }: OverlayCloseProps) {
  const close = use(OverlayCloseContext);
  return useRender({
    defaultTagName: 'button',
    render,
    props: mergeProps<'button'>(
      render ? {} : { type: 'button' },
      { onClick: () => close?.() },
      props
    ),
  });
}
