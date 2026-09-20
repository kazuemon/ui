'use client';

import { useLayoutEffect, useRef } from 'react';

import type { OverlayRole } from './overlay-role-context';

/**
 * 画面の下から出すシート（Base UI の Drawer）の面の役割を書き換える。シートの面は役割を props で受け取らないため、
 * 面の中身に置いた見えない要素から、いちばん近い面（role="dialog"）を探して書き換える
 * Base UI は面の role を毎回同じ値（dialog）で描くので、React が書き戻すことはない。面は閉じるたびに外され、開くたびにここも描き直す
 */
export function PopupRole({ role }: { role: OverlayRole }) {
  const ref = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    ref.current?.closest('[role="dialog"],[role="alertdialog"]')?.setAttribute('role', role);
  }, [role]);
  return <span ref={ref} hidden />;
}
