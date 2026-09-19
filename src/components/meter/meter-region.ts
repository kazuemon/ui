// low・high・optimum から、値がどの範囲にあるかを決める。HTML の meter と同じ規則
//   範囲は 3 つ: low より下・low〜high・high より上
//   optimum のある範囲が「最適」。値が同じ範囲なら optimum、隣の範囲なら suboptimum、反対の端の範囲なら even-less-good
//   optimum が真ん中の範囲にあるときは、上下どちらに外れても suboptimum

export type MeterRegion = 'optimum' | 'suboptimum' | 'even-less-good';

export interface MeterBounds {
  value: number;
  min: number;
  max: number;
  low?: number;
  high?: number;
  optimum?: number;
}

const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), hi);

/** low・high のどちらも渡さないときは、範囲を分けない（undefined） */
export function meterRegion({
  value,
  min,
  max,
  low,
  high,
  optimum,
}: MeterBounds): MeterRegion | undefined {
  if (low === undefined && high === undefined) return undefined;
  if (!(max > min)) return undefined;
  const lo = clamp(low ?? min, min, max);
  const hi = clamp(high ?? max, lo, max);
  const opt = clamp(optimum ?? (min + max) / 2, min, max);
  const v = clamp(Number.isNaN(value) ? min : value, min, max);
  const side = (n: number) => (n < lo ? -1 : n > hi ? 1 : 0);
  const optSide = side(opt);
  const valueSide = side(v);
  if (valueSide === optSide) return 'optimum';
  if (optSide === 0 || valueSide === 0) return 'suboptimum';
  return 'even-less-good';
}
