import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * 文字列をクリップボードに写し、写せたら duration のあいだ copied を true にする
 * 写せなかったとき（権限がない・安全でない接続）は copied を変えず、false を返す
 */
export function useCopy(duration: number) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        return false;
      }
      clearTimeout(timer.current);
      setCopied(true);
      timer.current = setTimeout(() => setCopied(false), duration);
      return true;
    },
    [duration]
  );
  return { copied, copy };
}
