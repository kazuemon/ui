// 動きを減らす設定（prefers-reduced-motion: reduce）を読む。
// 動かす直前に 1 回読むときは prefersReducedMotion、描画を設定に合わせて変えるときは use-prefers-reduced-motion の
// usePrefersReducedMotion（設定の変化に追従する）を使う

export const reducedMotionQuery = '(prefers-reduced-motion: reduce)';

/** 動きを減らす設定か。サーバーでは false */
export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia(reducedMotionQuery).matches;
}
