import { byBreakpoint, type Breakpoint, type Responsive } from '../../internal/breakpoints';

/**
 * slidesPerView を、段ごとの 1 以上の整数にそろえる。小数は切り捨て、1 未満と数でない値の段は渡していないものとして扱う
 * （その段は 1 つ下の段の値を使う）。使える段が 1 つもなければ undefined（1 枚を幅いっぱいに見せる）
 */
export function perViewCounts(
  value: Responsive<number> | undefined
): Partial<Record<Breakpoint, number>> | undefined {
  const counts: Partial<Record<Breakpoint, number>> = {};
  for (const [bp, n] of Object.entries(byBreakpoint(value)) as [Breakpoint, number][]) {
    if (typeof n === 'number' && Number.isFinite(n) && n >= 1) counts[bp] = Math.floor(n);
  }
  return Object.keys(counts).length > 0 ? counts : undefined;
}
