'use client';

import { type Ref, type RefCallback, useCallback } from 'react';

/**
 * 1 つの ref に要素を渡す。関数の ref も、object の ref も受ける
 * 関数の ref が片づけの関数を返したら、それを返す（React 19 は外すとき null の代わりにそれを呼ぶ）
 */
function assign<T>(ref: Ref<T> | undefined, node: T | null): (() => void) | undefined {
  if (typeof ref === 'function') {
    const cleanup: unknown = ref(node);
    return typeof cleanup === 'function' ? (cleanup as () => void) : undefined;
  }
  // object の ref（useRef）に書き込む。引数そのものを書き換えないよう Object.assign で渡す
  if (ref) Object.assign(ref, { current: node });
  return undefined;
}

/**
 * 部品が中で使う ref と、利用者が渡した ref をつなぐ（ADR-0250）
 * ref を受ける部品は、内部の ref と必ずマージする。JSX で `ref` のあとに `{...props}` を書くと、
 * 利用者の ref（React 19 では props に入る）が内部の ref を黙って上書きするため
 * 渡す数は 1 つ以上なら何個でもよい（利用者の ref だけを包むときは 1 つ）
 * 返す関数は、渡した ref が変わらないかぎり同じもの（描き直しのたびに ref を付け替えない）
 */
export function useMergedRefs<T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> {
  return useCallback((node: T | null) => {
    const cleanups = refs.map((ref) => assign(ref, node));
    // 片づけの関数を返す ref が 1 つでもあれば、React は外すとき null を渡さない。ほかの ref には自分で null を渡す
    if (!cleanups.some(Boolean)) return;
    return () => {
      refs.forEach((ref, index) => {
        const cleanup = cleanups[index];
        if (cleanup) cleanup();
        else assign(ref, null);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 可変長なので配列リテラルにできない。中身の ref で比べる
  }, refs);
}
