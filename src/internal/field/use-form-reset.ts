'use client';

import { type RefCallback, useCallback, useEffect, useRef, useState } from 'react';

/**
 * 値を部品が持つ欄で、属する form が戻されたら（reset）知らせる。返す ref を欄の input に付ける
 * ブラウザは reset で input の文字だけを戻すので、部品が持つ値も onReset で戻す（MaskField と同じ考え方）
 */
export function useFormReset(onReset: () => void, enabled: boolean): RefCallback<HTMLInputElement> {
  const latest = useRef(onReset);
  useEffect(() => {
    latest.current = onReset;
  });
  const [form, setForm] = useState<HTMLFormElement | null>(null);
  const ref = useCallback((node: HTMLInputElement | null) => setForm(node?.form ?? null), []);
  useEffect(() => {
    if (!enabled || !form) return undefined;
    const reset = () => latest.current();
    form.addEventListener('reset', reset);
    return () => form.removeEventListener('reset', reset);
  }, [enabled, form]);
  return ref;
}
