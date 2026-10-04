import { useState } from 'react';

/**
 * 値を外で持つ（制御）か、部品の中で持つ（非制御）かをまとめる。
 * value が undefined でないあいだは value に従い、undefined のあいだは中の値（はじめは defaultValue）を使う。
 * change は、非制御のときだけ中の値を変え、どちらのときも onChange を呼ぶ
 */
export function useControlled<T>(
  value: T | undefined,
  defaultValue: T | (() => T),
  onChange?: (next: T) => void
) {
  const [inner, setInner] = useState<T>(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? value : inner;
  const change = (next: T) => {
    if (!controlled) setInner(next);
    onChange?.(next);
  };
  return [current, change] as const;
}
