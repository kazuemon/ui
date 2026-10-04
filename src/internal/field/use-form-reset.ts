'use client';

import { type RefCallback, useCallback, useEffect, useRef, useState } from 'react';

/**
 * 値を部品が持つ欄で、属する form が戻されたら（reset）知らせる。返す ref を欄の input（textarea・隠れた input でもよい）に付ける
 * ブラウザは reset で input の文字だけを戻すので、部品が持つ値（文字数・書式・区切りの値など）も onReset で戻す。
 * 戻したことは onValueChange でも知らせる（ブラウザの reset は input の change を起こさない）
 */
export function useFormReset(
  onReset: () => void,
  enabled: boolean
): RefCallback<HTMLInputElement | HTMLTextAreaElement> {
  const latest = useRef(onReset);
  useEffect(() => {
    latest.current = onReset;
  });
  const [form, setForm] = useState<HTMLFormElement | null>(null);
  const ref = useCallback(
    (node: HTMLInputElement | HTMLTextAreaElement | null) => setForm(node?.form ?? null),
    []
  );
  useEffect(() => {
    if (!enabled || !form) return undefined;
    // reset はキャンセルできる（ほかの listener が preventDefault を呼ぶ）。全部の listener が済んでから確かめ、
    // キャンセルされなかったときだけ戻す
    const reset = (event: Event) => {
      setTimeout(() => {
        if (!event.defaultPrevented) latest.current();
      });
    };
    form.addEventListener('reset', reset);
    return () => form.removeEventListener('reset', reset);
  }, [enabled, form]);
  return ref;
}
