'use client';

import { useLayoutEffect, useRef, useState } from 'react';

// 本体の祖先に付いた密度（data-density）と大きい指用（coarse-large）。浮かぶ部分とシートは body の直下に出て、
// 途中の要素から引き継がないので、浮かぶ部分に写す。html に付いたものは body の直下にも効くので写さない
export interface DensityScope {
  density?: string;
  large: boolean;
}

export function readDensityScope(el: Element | null): DensityScope {
  if (!el) return { large: false };
  const root = el.ownerDocument.documentElement;
  const density = el.closest<HTMLElement>('[data-density]');
  const large = el.closest('.coarse-large');
  return {
    density: density && density !== root ? density.dataset.density : undefined,
    large: !!large && large !== root,
  };
}

// 開くたびに、基準の要素（本体・トリガー）の祖先の密度を読む。描く前（layout effect）に読むので、開いた最初の描画から同じ寸法になる
// 浮かぶ部分に data-density と coarse-large（densityScopeClass）を付けて使う
export function useDensityScope<T extends HTMLElement = HTMLButtonElement>(open: boolean) {
  const anchorRef = useRef<T | null>(null);
  const [scope, setScope] = useState<DensityScope>({ large: false });
  useLayoutEffect(() => {
    if (!open) return;
    const next = readDensityScope(anchorRef.current);
    setScope((prev) => (prev.density === next.density && prev.large === next.large ? prev : next));
  }, [open]);
  return { anchorRef, scope };
}
