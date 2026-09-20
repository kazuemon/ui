'use client';

import { type ReactNode, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { type DensityScope, readDensityScope } from '../../internal/density-scope';
import { usePortalContainer } from '../../internal/ui-config';

export interface PortalProps {
  /**
   * 描く場所。書かないときは ThemeProvider の portalContainer、それもなければ document.body です
   */
  container?: HTMLElement | null;
  children?: ReactNode;
}

/**
 * 中身を、書いた場所ではなく別の場所（既定は document.body）に描く
 *
 * Select・Dialog・Popover・Tooltip・Drawer は自分で描く場所を移すので、包まなくて構いません。
 * 自前の重なるもの（画面の下に貼り付く操作の帯、全画面の画像など）に使います。
 * 書いた場所の祖先の密度（data-density・coarse-large）を、描く場所でも引き継ぎます。
 */
export function Portal({ container, children }: PortalProps) {
  const target = usePortalContainer(container);
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [mounted, setMounted] = useState<{ node: HTMLElement; scope: DensityScope } | null>(null);
  // サーバーでは描かない。描いたあと、書いた場所の祖先の密度を読む
  useLayoutEffect(() => {
    setMounted({ node: target ?? document.body, scope: readDensityScope(anchorRef.current) });
  }, [target]);
  return (
    <>
      <span ref={anchorRef} hidden />
      {mounted &&
        createPortal(
          <div
            data-density={mounted.scope.density}
            className={mounted.scope.large ? 'coarse-large contents' : 'contents'}
          >
            {children}
          </div>,
          mounted.node
        )}
    </>
  );
}
