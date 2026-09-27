'use client';

import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { type ComponentProps, type ReactNode, useId, useRef, useState } from 'react';

import { InspectorContext, useInspectorContext } from './inspector-context';
import { inspectorLayoutStyles } from './inspector-styles';

export interface InspectorLayoutProps extends Omit<ComponentProps<'div'>, 'children'> {
  /** 領域の中で開閉するパネル（Inspector） */
  inspector: ReactNode;
  /** 領域の上に置く帯。パネルを重ねても隠れないので、開閉のボタン（InspectorTrigger）はここに置けます。なくてもかまいません */
  header?: ReactNode;
  /** 本文。長いときは、ここだけスクロールします */
  children?: ReactNode;
  /** 開いているか（制御） */
  open?: boolean;
  /**
   * はじめに開いているか（非制御）
   * @default false
   */
  defaultOpen?: boolean;
  /** 開閉が変わるときに、次の値を渡して呼びます */
  onOpenChange?: (open: boolean) => void;
  /** いちばん外の要素（領域）に付きます。高さは、置く場所で決めます（親の高さいっぱいに広がります） */
  className?: string;
}

/**
 * 本文と Inspector を並べる領域。開閉の状態を持ち、パネルはこの領域の中だけで開閉します（画面の最上層には出ません）
 */
export function InspectorLayout({
  inspector,
  header,
  children,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  className,
  ...props
}: InspectorLayoutProps) {
  const [openState, setOpenState] = useState(defaultOpen);
  const open = openProp ?? openState;
  const panelId = useId();
  const triggerRef = useRef<HTMLElement | null>(null);
  const setOpen = (next: boolean) => {
    if (openProp === undefined) setOpenState(next);
    onOpenChange?.(next);
  };
  const rememberTrigger = (trigger: HTMLElement) => {
    triggerRef.current = trigger;
  };
  const s = inspectorLayoutStyles();
  return (
    <InspectorContext value={{ open, setOpen, panelId, triggerRef, rememberTrigger }}>
      <div
        {...props}
        data-slot="inspector-layout"
        data-open={open || undefined}
        className={s.root({ className })}
      >
        {header}
        <div data-slot="inspector-body" className={s.body()}>
          <div data-slot="inspector-main" className={s.main()}>
            {children}
          </div>
          {inspector}
        </div>
      </div>
    </InspectorContext>
  );
}

export type InspectorTriggerProps = useRender.ComponentProps<'button'>;

/**
 * 押すと Inspector を開け閉めする。Button などの要素を render に渡します。InspectorLayout の中（本文や帯）に置きます
 * 渡した要素には、開いているあいだ aria-expanded が付きます
 */
export function InspectorTrigger({ render, ...props }: InspectorTriggerProps) {
  const { open, setOpen, panelId, rememberTrigger } = useInspectorContext('InspectorTrigger');
  return useRender({
    defaultTagName: 'button',
    render,
    props: mergeProps<'button'>(
      render ? {} : { type: 'button' },
      {
        'aria-expanded': open,
        'aria-controls': panelId,
        onClick: (event) => {
          rememberTrigger(event.currentTarget);
          setOpen(!open);
        },
      },
      props
    ),
  });
}
