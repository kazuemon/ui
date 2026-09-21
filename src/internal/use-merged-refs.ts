'use client';

import { type Ref, type RefCallback, useCallback } from 'react';

/** 1 つの ref に要素を渡す。関数の ref も、object の ref も受ける */
function assign<T>(ref: Ref<T> | undefined, node: T | null) {
  if (typeof ref === 'function') {
    ref(node);
    return;
  }
  // object の ref（useRef）に書き込む。引数そのものを書き換えないよう Object.assign で渡す
  if (ref) Object.assign(ref, { current: node });
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
    for (const ref of refs) assign(ref, node);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 可変長なので配列リテラルにできない。中身の ref で比べる
  }, refs);
}
