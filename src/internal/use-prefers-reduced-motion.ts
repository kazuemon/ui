'use client';

import { useSyncExternalStore } from 'react';

import { reducedMotionQuery } from './reduced-motion';

function subscribeReducedMotion(onChange: () => void) {
  const mql = window.matchMedia(reducedMotionQuery);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

/** 動きを減らす設定か。はじめの描画から同期で読み、設定の変化に追従する（サーバーでは false） */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(reducedMotionQuery).matches,
    () => false
  );
}
