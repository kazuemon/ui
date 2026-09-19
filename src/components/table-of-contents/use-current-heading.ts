import { useEffect, useState } from 'react';

import { readCurrentHeading } from './current-heading';

/**
 * 今読んでいる見出しの id を追う。スクロール（どの枠のスクロールも捕まえる）と大きさの変化のたびに、
 * 次の描画の前に 1 回だけ読み直す。enabled が false のあいだは読まない（外から今の id を渡すとき）
 */
export function useCurrentHeading(
  ids: readonly string[],
  offset: number | undefined,
  enabled: boolean
): string | null {
  const [current, setCurrent] = useState<string | null>(null);
  // 配列は描くたびに新しくなるので、中身の文字で比べる
  const key = ids.join('\n');
  useEffect(() => {
    if (!enabled) return undefined;
    const list = key === '' ? [] : key.split('\n');
    let frame = 0;
    const update = () => {
      frame = 0;
      setCurrent(readCurrentHeading(list, offset));
    };
    const schedule = () => {
      if (frame === 0) frame = requestAnimationFrame(update);
    };
    schedule();
    // スクロールの出来事は親へ伝わらないので、捕まえる側（capture）で聞く。記事がどの枠の中にあっても届く
    document.addEventListener('scroll', schedule, { capture: true, passive: true });
    window.addEventListener('resize', schedule);
    // 文字の読み込みや画像で記事の高さが変わったときも読み直す
    const resize = new ResizeObserver(schedule);
    resize.observe(document.body);
    return () => {
      if (frame !== 0) cancelAnimationFrame(frame);
      document.removeEventListener('scroll', schedule, { capture: true });
      window.removeEventListener('resize', schedule);
      resize.disconnect();
    };
  }, [key, offset, enabled]);
  return enabled ? current : null;
}
